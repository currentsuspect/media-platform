import { stat } from "node:fs/promises";
import type { LibraryScanSummary, ScanLibraryJobData } from "@media/types";
import { env } from "../config/env";
import { buildCatalogFromNormalizedItems } from "../modules/library/catalog-builder";
import { LibraryRepository } from "../modules/library/repository";
import { scanLibraryFiles } from "../modules/library/fs-scan";
import { normalizeMediaFiles } from "../modules/library/normalize-media";
import {
  buildMovieTmdbMatch,
  buildSeriesTmdbMatch
} from "../modules/metadata/tmdb-client";

export async function runScanLibraryJob(
  job: ScanLibraryJobData,
  libraryRepository: LibraryRepository
): Promise<LibraryScanSummary> {
  const library = await libraryRepository.findById(job.libraryId);

  if (!library) {
    throw new Error(`Library not found: ${job.libraryId}`);
  }

  await libraryRepository.updateStatus(job.libraryId, "scanning");

  try {
    const rootStats = await stat(library.path);

    if (!rootStats.isDirectory()) {
      throw new Error(`Library path is not a directory: ${library.path}`);
    }

    const scanResult = await scanLibraryFiles(job.libraryId, library.path);
    const persistedFiles = await libraryRepository.replaceMediaFiles(
      job.libraryId,
      scanResult.files
    );
    const normalizedItems = normalizeMediaFiles(persistedFiles);
    const persistedNormalizedItems =
      await libraryRepository.replaceNormalizedMediaItems(
        job.libraryId,
        normalizedItems
      );
    const catalog = buildCatalogFromNormalizedItems(persistedNormalizedItems);
    const persistedCatalog = await libraryRepository.replaceCatalog(
      job.libraryId,
      catalog
    );

    const warnings = scanResult.warnings.map(
      (warning) => `${warning.path}: ${warning.message}`
    );
    let providerMatches = 0;

    if (env.TMDB_API_KEY) {
      try {
        const seriesMatches = await Promise.all(
          persistedCatalog.series.map((item) =>
            buildSeriesTmdbMatch(env.TMDB_API_KEY!, item)
          )
        );
        const movieMatches = await Promise.all(
          persistedCatalog.movies.map((item) =>
            buildMovieTmdbMatch(env.TMDB_API_KEY!, item)
          )
        );
        const persistedMatches = await libraryRepository.replaceMetadataMatches(
          job.libraryId,
          [...seriesMatches, ...movieMatches].filter((item) => item !== null)
        );
        providerMatches = persistedMatches.length;
      } catch (error) {
        warnings.push(
          `tmdb: ${error instanceof Error ? error.message : "Provider enrichment failed"}`
        );
      }
    }

    await libraryRepository.updateStatus(job.libraryId, "ready");

    return {
      libraryId: job.libraryId,
      requestedAt: job.requestedAt,
      status: "ready",
      scannedAt: new Date().toISOString(),
      discoveredFiles: scanResult.files.length,
      persistedFiles: persistedFiles.length,
      normalizedItems: persistedNormalizedItems.length,
      catalogSeries: persistedCatalog.series.length,
      catalogEpisodes: persistedCatalog.episodes.length,
      catalogMovies: persistedCatalog.movies.length,
      providerMatches,
      warningCount: warnings.length,
      warnings
    };
  } catch (error) {
    await libraryRepository.updateStatus(job.libraryId, "error");
    throw error;
  }
}
