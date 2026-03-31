import type {
  CatalogEpisodeRecord,
  CatalogMovieRecord,
  CatalogSeasonRecord,
  CatalogSeriesRecord,
  NormalizedMediaItemRecord
} from "@media/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CatalogBuildResult {
  series: Array<Pick<CatalogSeriesRecord, "libraryId" | "sourceKey" | "title">>;
  seasons: Array<
    Pick<CatalogSeasonRecord, "libraryId" | "sourceKey" | "title" | "seasonNumber"> & {
      seriesSourceKey: string;
    }
  >;
  episodes: Array<
    Pick<
      CatalogEpisodeRecord,
      | "libraryId"
      | "sourceKey"
      | "mediaFileId"
      | "normalizedMediaItemId"
      | "title"
      | "episodeNumber"
      | "confidence"
    > & {
      seriesSourceKey: string;
      seasonSourceKey: string;
    }
  >;
  movies: Array<
    Pick<
      CatalogMovieRecord,
      | "libraryId"
      | "sourceKey"
      | "mediaFileId"
      | "normalizedMediaItemId"
      | "title"
      | "year"
      | "confidence"
    >
  >;
}

export function buildCatalogFromNormalizedItems(
  items: NormalizedMediaItemRecord[]
): CatalogBuildResult {
  const series = new Map<string, CatalogBuildResult["series"][number]>();
  const seasons = new Map<string, CatalogBuildResult["seasons"][number]>();
  const episodes: CatalogBuildResult["episodes"] = [];
  const movies: CatalogBuildResult["movies"] = [];

  for (const item of items) {
    if (item.kind === "episode" && item.seriesTitle && item.seasonNumber !== null) {
      const seriesSourceKey = slugify(item.seriesTitle);
      const seasonSourceKey = `${seriesSourceKey}:s${item.seasonNumber}`;
      const episodeNumber = item.episodeNumber ?? 0;

      series.set(seriesSourceKey, {
        libraryId: item.libraryId,
        sourceKey: seriesSourceKey,
        title: item.seriesTitle
      });

      seasons.set(seasonSourceKey, {
        libraryId: item.libraryId,
        sourceKey: seasonSourceKey,
        seriesSourceKey,
        seasonNumber: item.seasonNumber,
        title: `Season ${item.seasonNumber}`
      });

      episodes.push({
        libraryId: item.libraryId,
        sourceKey: `${seasonSourceKey}:e${episodeNumber}`,
        seriesSourceKey,
        seasonSourceKey,
        mediaFileId: item.mediaFileId,
        normalizedMediaItemId: item.id,
        title: item.title,
        episodeNumber,
        confidence: item.confidence
      });

      continue;
    }

    if (item.kind === "movie") {
      const yearPart = item.year ? `-${item.year}` : "";

      movies.push({
        libraryId: item.libraryId,
        sourceKey: `${slugify(item.title)}${yearPart}`,
        mediaFileId: item.mediaFileId,
        normalizedMediaItemId: item.id,
        title: item.title,
        year: item.year,
        confidence: item.confidence
      });
    }
  }

  return {
    series: Array.from(series.values()),
    seasons: Array.from(seasons.values()).sort(
      (left, right) => left.seasonNumber - right.seasonNumber
    ),
    episodes,
    movies
  };
}

