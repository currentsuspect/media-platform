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
