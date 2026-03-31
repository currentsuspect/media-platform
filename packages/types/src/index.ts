export type LibraryType = "shows" | "movies";

export type LibraryStatus = "pending-scan" | "scanning" | "ready" | "error";

export interface LibraryRecord {
  id: string;
  name: string;
  type: LibraryType;
  path: string;
  status: LibraryStatus;
  createdAt: string;
}

export interface ScanLibraryJob {
  id: string;
  type: "scan-library";
  libraryId: string;
}

export interface ScanLibraryJobData {
  libraryId: string;
  requestedAt: string;
}

export interface QueuedJobRecord {
  id: string;
  queue: string;
  status: "queued";
}

export interface PlaybackIntent {
  playableId: string;
  mediaFileId: string;
  mode: "direct-play" | "direct-stream" | "hls";
  url: string;
  subtitles: Array<{
    id: string;
    label: string;
    language: string;
  }>;
}

export interface MediaFileRecord {
  id: string;
  libraryId: string;
  relativePath: string;
  container: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export interface MediaFileUpsertInput {
  libraryId: string;
  relativePath: string;
  container: string | null;
  sizeBytes: number | null;
}

export type NormalizedMediaKind = "episode" | "movie";

export interface NormalizedMediaItemRecord {
  id: string;
  libraryId: string;
  mediaFileId: string;
  kind: NormalizedMediaKind;
  title: string;
  seriesTitle: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  year: number | null;
  confidence: number;
  source: "local-parser";
  createdAt: string;
}

export interface NormalizedMediaItemUpsertInput {
  libraryId: string;
  mediaFileId: string;
  kind: NormalizedMediaKind;
  title: string;
  seriesTitle: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  year: number | null;
  confidence: number;
  source: "local-parser";
}

export interface CatalogSeriesRecord {
  id: string;
  libraryId: string;
  sourceKey: string;
  title: string;
  createdAt: string;
}

export interface CatalogSeasonRecord {
  id: string;
  libraryId: string;
  sourceKey: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  createdAt: string;
}

export interface CatalogEpisodeRecord {
  id: string;
  libraryId: string;
  sourceKey: string;
  seriesId: string;
  seasonId: string;
  mediaFileId: string;
  normalizedMediaItemId: string;
  title: string;
  episodeNumber: number;
  confidence: number;
  createdAt: string;
}

export interface CatalogMovieRecord {
  id: string;
  libraryId: string;
  sourceKey: string;
  mediaFileId: string;
  normalizedMediaItemId: string;
  title: string;
  year: number | null;
  confidence: number;
  createdAt: string;
}

export type MetadataMatchEntityType = "series" | "movie";

export interface MetadataMatchRecord {
  id: string;
  libraryId: string;
  entityType: MetadataMatchEntityType;
  entityId: string;
  provider: "tmdb";
  providerId: string;
  title: string;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  confidence: number;
  status: "matched" | "manual" | "unmatched";
  isManual: boolean;
  createdAt: string;
}

export interface MetadataMatchUpsertInput {
  libraryId: string;
  entityType: MetadataMatchEntityType;
  entityId: string;
  provider: "tmdb";
  providerId: string;
  title: string;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  confidence: number;
  status: "matched" | "manual" | "unmatched";
  isManual: boolean;
  rawPayload: string;
}

export interface CatalogSeriesListItem {
  id: string;
  libraryId: string;
  title: string;
  seasonCount: number;
  episodeCount: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
}

export interface CatalogMovieListItem {
  id: string;
  libraryId: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
}

export interface CatalogEpisodeDetailItem {
  id: string;
  title: string;
  episodeNumber: number;
  mediaFileId: string;
}

export interface CatalogEpisodePlaybackDetail {
  id: string;
  libraryId: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  seriesId: string;
  seriesTitle: string;
  overview: string | null;
  backdropUrl: string | null;
  mediaFileId: string;
}

export interface CatalogSeasonDetailItem {
  id: string;
  title: string;
  seasonNumber: number;
  episodes: CatalogEpisodeDetailItem[];
}

export interface CatalogSeriesDetail {
  id: string;
  libraryId: string;
  title: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  seasons: CatalogSeasonDetailItem[];
}

export interface LibraryScanSummary {
  libraryId: string;
  requestedAt: string;
  status: "ready" | "error";
  scannedAt: string;
  discoveredFiles: number;
  persistedFiles: number;
  normalizedItems: number;
  catalogSeries: number;
  catalogEpisodes: number;
  catalogMovies: number;
  providerMatches: number;
  warningCount: number;
  warnings: string[];
}
