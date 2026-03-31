import type { Pool, PoolClient } from "pg";
import type {
  CatalogEpisodeRecord,
  CatalogMovieRecord,
  CatalogSeasonRecord,
  CatalogSeriesRecord,
  LibraryRecord,
  LibraryStatus,
  MediaFileRecord,
  MediaFileUpsertInput,
  MetadataMatchRecord,
  MetadataMatchUpsertInput,
  NormalizedMediaItemRecord,
  NormalizedMediaItemUpsertInput
} from "@media/types";

function mapLibraryRow(row: {
  id: string;
  name: string;
  type: LibraryRecord["type"];
  path: string;
  status: LibraryStatus;
  created_at: Date;
}): LibraryRecord {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    path: row.path,
    status: row.status,
    createdAt: row.created_at.toISOString()
  };
}

function mapMediaFileRow(row: {
  id: string;
  library_id: string;
  relative_path: string;
  container: string | null;
  size_bytes: string | number | null;
  created_at: Date;
}): MediaFileRecord {
  return {
    id: row.id,
    libraryId: row.library_id,
    relativePath: row.relative_path,
    container: row.container,
    sizeBytes:
      row.size_bytes === null ? null : Number.parseInt(String(row.size_bytes), 10),
    createdAt: row.created_at.toISOString()
  };
}

function mapNormalizedMediaItemRow(row: {
  id: string;
  library_id: string;
  media_file_id: string;
  kind: NormalizedMediaItemRecord["kind"];
  title: string;
  series_title: string | null;
  season_number: number | null;
  episode_number: number | null;
  year: number | null;
  confidence: number;
  source: "local-parser";
  created_at: Date;
}): NormalizedMediaItemRecord {
  return {
    id: row.id,
    libraryId: row.library_id,
    mediaFileId: row.media_file_id,
    kind: row.kind,
    title: row.title,
    seriesTitle: row.series_title,
    seasonNumber: row.season_number,
    episodeNumber: row.episode_number,
    year: row.year,
    confidence: row.confidence,
    source: row.source,
    createdAt: row.created_at.toISOString()
  };
}

function mapCatalogSeriesRow(row: {
  id: string;
  library_id: string;
  source_key: string;
  title: string;
  created_at: Date;
}): CatalogSeriesRecord {
  return {
    id: row.id,
    libraryId: row.library_id,
    sourceKey: row.source_key,
    title: row.title,
    createdAt: row.created_at.toISOString()
  };
}

function mapCatalogSeasonRow(row: {
  id: string;
  library_id: string;
  source_key: string;
  series_id: string;
  season_number: number;
  title: string;
  created_at: Date;
}): CatalogSeasonRecord {
  return {
    id: row.id,
    libraryId: row.library_id,
    sourceKey: row.source_key,
    seriesId: row.series_id,
    seasonNumber: row.season_number,
    title: row.title,
    createdAt: row.created_at.toISOString()
  };
}

function mapCatalogEpisodeRow(row: {
  id: string;
  library_id: string;
  source_key: string;
  series_id: string;
  season_id: string;
  media_file_id: string;
  normalized_media_item_id: string;
  title: string;
  episode_number: number;
  confidence: number;
  created_at: Date;
}): CatalogEpisodeRecord {
  return {
    id: row.id,
    libraryId: row.library_id,
    sourceKey: row.source_key,
    seriesId: row.series_id,
    seasonId: row.season_id,
    mediaFileId: row.media_file_id,
    normalizedMediaItemId: row.normalized_media_item_id,
    title: row.title,
    episodeNumber: row.episode_number,
    confidence: row.confidence,
    createdAt: row.created_at.toISOString()
  };
}

function mapCatalogMovieRow(row: {
  id: string;
  library_id: string;
  source_key: string;
  media_file_id: string;
  normalized_media_item_id: string;
  title: string;
  year: number | null;
  confidence: number;
  created_at: Date;
}): CatalogMovieRecord {
  return {
    id: row.id,
    libraryId: row.library_id,
    sourceKey: row.source_key,
    mediaFileId: row.media_file_id,
    normalizedMediaItemId: row.normalized_media_item_id,
    title: row.title,
    year: row.year,
    confidence: row.confidence,
    createdAt: row.created_at.toISOString()
  };
}

function mapMetadataMatchRow(row: {
  id: string;
  library_id: string;
  entity_type: MetadataMatchRecord["entityType"];
  entity_id: string;
  provider: "tmdb";
  provider_id: string;
  title: string;
  overview: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  release_date: string | null;
  confidence: number;
  status: MetadataMatchRecord["status"];
  is_manual: boolean;
  created_at: Date;
}): MetadataMatchRecord {
  return {
    id: row.id,
    libraryId: row.library_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    provider: row.provider,
    providerId: row.provider_id,
    title: row.title,
    overview: row.overview,
    posterUrl: row.poster_url,
    backdropUrl: row.backdrop_url,
    releaseDate: row.release_date,
    confidence: row.confidence,
    status: row.status,
    isManual: row.is_manual,
    createdAt: row.created_at.toISOString()
  };
}

export class LibraryRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<LibraryRecord | null> {
    const result = await this.pool.query(
      `
        select id, name, type, path, status, created_at
        from libraries
        where id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapLibraryRow(result.rows[0]);
  }

  async updateStatus(id: string, status: LibraryStatus): Promise<void> {
    await this.pool.query(
      `
        update libraries
        set status = $2, updated_at = now()
        where id = $1
      `,
      [id, status]
    );
  }

  async replaceMediaFiles(
    libraryId: string,
    files: MediaFileUpsertInput[]
  ): Promise<MediaFileRecord[]> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query("delete from media_files where library_id = $1", [libraryId]);

      const persisted: MediaFileRecord[] = [];

      for (const file of files) {
        const result = await client.query(
          `
            insert into media_files (library_id, relative_path, container, size_bytes)
            values ($1, $2, $3, $4)
            returning id, library_id, relative_path, container, size_bytes, created_at
          `,
          [file.libraryId, file.relativePath, file.container, file.sizeBytes]
        );

        persisted.push(mapMediaFileRow(result.rows[0]));
      }

      await client.query("commit");
      return persisted;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async replaceNormalizedMediaItems(
    libraryId: string,
    items: NormalizedMediaItemUpsertInput[]
  ): Promise<NormalizedMediaItemRecord[]> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query("delete from normalized_media_items where library_id = $1", [
        libraryId
      ]);

      const persisted: NormalizedMediaItemRecord[] = [];

      for (const item of items) {
        const result = await client.query(
          `
            insert into normalized_media_items (
              library_id,
              media_file_id,
              kind,
              title,
              series_title,
              season_number,
              episode_number,
              year,
              confidence,
              source
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            returning
              id,
              library_id,
              media_file_id,
              kind,
              title,
              series_title,
              season_number,
              episode_number,
              year,
              confidence,
              source,
              created_at
          `,
          [
            item.libraryId,
            item.mediaFileId,
            item.kind,
            item.title,
            item.seriesTitle,
            item.seasonNumber,
            item.episodeNumber,
            item.year,
            item.confidence,
            item.source
          ]
        );

        persisted.push(mapNormalizedMediaItemRow(result.rows[0]));
      }

      await client.query("commit");
      return persisted;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async replaceCatalog(
    libraryId: string,
    catalog: {
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
  ): Promise<{
    series: CatalogSeriesRecord[];
    seasons: CatalogSeasonRecord[];
    episodes: CatalogEpisodeRecord[];
    movies: CatalogMovieRecord[];
  }> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");

      const seriesMap = new Map<string, CatalogSeriesRecord>();
      for (const item of catalog.series) {
        const result = await client.query(
          `
            insert into catalog_series (library_id, source_key, title)
            values ($1, $2, $3)
            on conflict (library_id, source_key)
            do update set title = excluded.title, updated_at = now()
            returning id, library_id, source_key, title, created_at
          `,
          [item.libraryId, item.sourceKey, item.title]
        );
        const record = mapCatalogSeriesRow(result.rows[0]);
        seriesMap.set(record.sourceKey, record);
      }

      const seasonMap = new Map<string, CatalogSeasonRecord>();
      for (const item of catalog.seasons) {
        const series = seriesMap.get(item.seriesSourceKey);
        if (!series) {
          continue;
        }

        const result = await client.query(
          `
            insert into catalog_seasons (library_id, source_key, series_id, season_number, title)
            values ($1, $2, $3, $4, $5)
            on conflict (library_id, source_key)
            do update set
              series_id = excluded.series_id,
              season_number = excluded.season_number,
              title = excluded.title,
              updated_at = now()
            returning id, library_id, source_key, series_id, season_number, title, created_at
          `,
          [item.libraryId, item.sourceKey, series.id, item.seasonNumber, item.title]
        );
        const record = mapCatalogSeasonRow(result.rows[0]);
        seasonMap.set(record.sourceKey, record);
      }

      const episodes: CatalogEpisodeRecord[] = [];
      for (const item of catalog.episodes) {
        const series = seriesMap.get(item.seriesSourceKey);
        const season = seasonMap.get(item.seasonSourceKey);

        if (!series || !season) {
          continue;
        }

        const result = await client.query(
          `
            insert into catalog_episodes (
              library_id,
              source_key,
              series_id,
              season_id,
              media_file_id,
              normalized_media_item_id,
              title,
              episode_number,
              confidence
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            on conflict (library_id, source_key)
            do update set
              series_id = excluded.series_id,
              season_id = excluded.season_id,
              media_file_id = excluded.media_file_id,
              normalized_media_item_id = excluded.normalized_media_item_id,
              title = excluded.title,
              episode_number = excluded.episode_number,
              confidence = excluded.confidence,
              updated_at = now()
            returning
              id,
              library_id,
              source_key,
              series_id,
              season_id,
              media_file_id,
              normalized_media_item_id,
              title,
              episode_number,
              confidence,
              created_at
          `,
          [
            item.libraryId,
            item.sourceKey,
            series.id,
            season.id,
            item.mediaFileId,
            item.normalizedMediaItemId,
            item.title,
            item.episodeNumber,
            item.confidence
          ]
        );

        episodes.push(mapCatalogEpisodeRow(result.rows[0]));
      }

      const movies: CatalogMovieRecord[] = [];
      for (const item of catalog.movies) {
        const result = await client.query(
          `
            insert into catalog_movies (
              library_id,
              source_key,
              media_file_id,
              normalized_media_item_id,
              title,
              year,
              confidence
            )
            values ($1, $2, $3, $4, $5, $6, $7)
            on conflict (library_id, source_key)
            do update set
              media_file_id = excluded.media_file_id,
              normalized_media_item_id = excluded.normalized_media_item_id,
              title = excluded.title,
              year = excluded.year,
              confidence = excluded.confidence,
              updated_at = now()
            returning
              id,
              library_id,
              source_key,
              media_file_id,
              normalized_media_item_id,
              title,
              year,
              confidence,
              created_at
          `,
          [
            item.libraryId,
            item.sourceKey,
            item.mediaFileId,
            item.normalizedMediaItemId,
            item.title,
            item.year,
            item.confidence
          ]
        );

        movies.push(mapCatalogMovieRow(result.rows[0]));
      }

      const episodeKeys = catalog.episodes.map((item) => item.sourceKey);
      const seasonKeys = catalog.seasons.map((item) => item.sourceKey);
      const seriesKeys = catalog.series.map((item) => item.sourceKey);
      const movieKeys = catalog.movies.map((item) => item.sourceKey);

      await deleteMissingRows(client, "catalog_episodes", libraryId, episodeKeys);
      await deleteMissingRows(client, "catalog_seasons", libraryId, seasonKeys);
      await deleteMissingRows(client, "catalog_series", libraryId, seriesKeys);
      await deleteMissingRows(client, "catalog_movies", libraryId, movieKeys);

      await client.query("commit");

      return {
        series: Array.from(seriesMap.values()),
        seasons: Array.from(seasonMap.values()),
        episodes,
        movies
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async replaceMetadataMatches(
    libraryId: string,
    matches: MetadataMatchUpsertInput[]
  ): Promise<MetadataMatchRecord[]> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query(
        `
          delete from metadata_matches
          where library_id = $1
            and provider = 'tmdb'
            and is_manual = false
        `,
        [libraryId]
      );

      const persisted: MetadataMatchRecord[] = [];

      for (const item of matches) {
        const result = await client.query(
          `
            insert into metadata_matches (
              library_id,
              entity_type,
              entity_id,
              provider,
              provider_id,
              title,
              overview,
              poster_url,
              backdrop_url,
              release_date,
              confidence,
              status,
              is_manual,
              raw_payload
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
            on conflict (entity_type, entity_id, provider)
            do update set
              provider_id = excluded.provider_id,
              title = excluded.title,
              overview = excluded.overview,
              poster_url = excluded.poster_url,
              backdrop_url = excluded.backdrop_url,
              release_date = excluded.release_date,
              confidence = excluded.confidence,
              status = excluded.status,
              raw_payload = excluded.raw_payload,
              updated_at = now()
            where metadata_matches.is_manual = false
            returning
              id,
              library_id,
              entity_type,
              entity_id,
              provider,
              provider_id,
              title,
              overview,
              poster_url,
              backdrop_url,
              release_date,
              confidence,
              status,
              is_manual,
              created_at
          `,
          [
            item.libraryId,
            item.entityType,
            item.entityId,
            item.provider,
            item.providerId,
            item.title,
            item.overview,
            item.posterUrl,
            item.backdropUrl,
            item.releaseDate,
            item.confidence,
            item.status,
            item.isManual,
            item.rawPayload
          ]
        );

        if (result.rows.length > 0) {
          persisted.push(mapMetadataMatchRow(result.rows[0]));
        }
      }

      await client.query("commit");
      return persisted;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}

async function deleteMissingRows(
  client: PoolClient,
  tableName: "catalog_episodes" | "catalog_seasons" | "catalog_series" | "catalog_movies",
  libraryId: string,
  sourceKeys: string[]
) {
  if (sourceKeys.length === 0) {
    await client.query(`delete from ${tableName} where library_id = $1`, [libraryId]);
    return;
  }

  await client.query(
    `delete from ${tableName} where library_id = $1 and not (source_key = any($2::text[]))`,
    [libraryId, sourceKeys]
  );
}
