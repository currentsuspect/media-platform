import type { Pool } from "pg";
import type {
  CatalogEpisodePlaybackDetail,
  CatalogEpisodeDetailItem,
  CatalogMovieListItem,
  CatalogSeasonDetailItem,
  CatalogSeriesDetail,
  CatalogSeriesListItem
} from "@media/types";

function mapSeriesListRow(row: {
  id: string;
  library_id: string;
  title: string;
  season_count: string | number;
  episode_count: string | number;
  poster_url: string | null;
  backdrop_url: string | null;
  overview: string | null;
}): CatalogSeriesListItem {
  return {
    id: row.id,
    libraryId: row.library_id,
    title: row.title,
    seasonCount: Number(row.season_count),
    episodeCount: Number(row.episode_count),
    posterUrl: row.poster_url,
    backdropUrl: row.backdrop_url,
    overview: row.overview
  };
}

function mapMovieListRow(row: {
  id: string;
  library_id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  overview: string | null;
}): CatalogMovieListItem {
  return {
    id: row.id,
    libraryId: row.library_id,
    title: row.title,
    year: row.year,
    posterUrl: row.poster_url,
    backdropUrl: row.backdrop_url,
    overview: row.overview
  };
}

export class CatalogRepository {
  constructor(private readonly pool: Pool) {}

  async listSeries(): Promise<CatalogSeriesListItem[]> {
    const result = await this.pool.query(
      `
        select
          s.id,
          s.library_id,
          s.title,
          count(distinct seasons.id) as season_count,
          count(distinct episodes.id) as episode_count,
          matches.poster_url,
          matches.backdrop_url,
          matches.overview
        from catalog_series s
        left join catalog_seasons seasons on seasons.series_id = s.id
        left join catalog_episodes episodes on episodes.series_id = s.id
        left join metadata_matches matches
          on matches.entity_type = 'series'
          and matches.entity_id = s.id
          and matches.provider = 'tmdb'
        group by
          s.id,
          s.library_id,
          s.title,
          matches.poster_url,
          matches.backdrop_url,
          matches.overview
        order by s.title asc
      `
    );

    return result.rows.map((row) => mapSeriesListRow(row));
  }

  async listMovies(): Promise<CatalogMovieListItem[]> {
    const result = await this.pool.query(
      `
        select
          m.id,
          m.library_id,
          m.title,
          m.year,
          matches.poster_url,
          matches.backdrop_url,
          matches.overview
        from catalog_movies m
        left join metadata_matches matches
          on matches.entity_type = 'movie'
          and matches.entity_id = m.id
          and matches.provider = 'tmdb'
        order by m.title asc
      `
    );

    return result.rows.map((row) => mapMovieListRow(row));
  }

  async getSeriesDetail(id: string): Promise<CatalogSeriesDetail | null> {
    const seriesResult = await this.pool.query(
      `
        select
          s.id,
          s.library_id,
          s.title,
          matches.poster_url,
          matches.backdrop_url,
          matches.overview
        from catalog_series s
        left join metadata_matches matches
          on matches.entity_type = 'series'
          and matches.entity_id = s.id
          and matches.provider = 'tmdb'
        where s.id = $1
      `,
      [id]
    );

    if (seriesResult.rows.length === 0) {
      return null;
    }

    const seriesRow = seriesResult.rows[0] as {
      id: string;
      library_id: string;
      title: string;
      poster_url: string | null;
      backdrop_url: string | null;
      overview: string | null;
    };

    const seasonsResult = await this.pool.query(
      `
        select id, season_number, title
        from catalog_seasons
        where series_id = $1
        order by season_number asc
      `,
      [id]
    );

    const episodesResult = await this.pool.query(
      `
        select id, season_id, title, episode_number, media_file_id
        from catalog_episodes
        where series_id = $1
        order by episode_number asc
      `,
      [id]
    );

    const episodesBySeason = new Map<string, CatalogEpisodeDetailItem[]>();

    for (const row of episodesResult.rows as Array<{
      id: string;
      season_id: string;
      title: string;
      episode_number: number;
      media_file_id: string;
    }>) {
      const existing = episodesBySeason.get(row.season_id) ?? [];
      existing.push({
        id: row.id,
        title: row.title,
        episodeNumber: row.episode_number,
        mediaFileId: row.media_file_id
      });
      episodesBySeason.set(row.season_id, existing);
    }

    const seasons = (seasonsResult.rows as Array<{
      id: string;
      season_number: number;
      title: string;
    }>).map<CatalogSeasonDetailItem>((row) => ({
      id: row.id,
      title: row.title,
      seasonNumber: row.season_number,
      episodes: episodesBySeason.get(row.id) ?? []
    }));

    return {
      id: seriesRow.id,
      libraryId: seriesRow.library_id,
      title: seriesRow.title,
      posterUrl: seriesRow.poster_url,
      backdropUrl: seriesRow.backdrop_url,
      overview: seriesRow.overview,
      seasons
    };
  }

  async getEpisodePlaybackDetail(
    id: string
  ): Promise<CatalogEpisodePlaybackDetail | null> {
    const result = await this.pool.query(
      `
        select
          episodes.id,
          episodes.library_id,
          episodes.title,
          episodes.episode_number,
          episodes.media_file_id,
          seasons.season_number,
          series.id as series_id,
          series.title as series_title,
          matches.overview,
          matches.backdrop_url
        from catalog_episodes episodes
        inner join catalog_seasons seasons on seasons.id = episodes.season_id
        inner join catalog_series series on series.id = episodes.series_id
        left join metadata_matches matches
          on matches.entity_type = 'series'
          and matches.entity_id = series.id
          and matches.provider = 'tmdb'
        where episodes.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as {
      id: string;
      library_id: string;
      title: string;
      episode_number: number;
      media_file_id: string;
      season_number: number;
      series_id: string;
      series_title: string;
      overview: string | null;
      backdrop_url: string | null;
    };

    return {
      id: row.id,
      libraryId: row.library_id,
      title: row.title,
      episodeNumber: row.episode_number,
      seasonNumber: row.season_number,
      seriesId: row.series_id,
      seriesTitle: row.series_title,
      overview: row.overview,
      backdropUrl: row.backdrop_url,
      mediaFileId: row.media_file_id
    };
  }
}
