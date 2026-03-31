import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { Pool } from "pg";

export interface PlayableMediaFile {
  mediaFileId: string;
  absolutePath: string;
  relativePath: string;
  container: string | null;
  sizeBytes: number | null;
}

export class PlaybackRepository {
  constructor(private readonly pool: Pool) {}

  async getMediaFileById(id: string): Promise<PlayableMediaFile | null> {
    const result = await this.pool.query(
      `
        select
          media_files.id as media_file_id,
          libraries.path as library_path,
          media_files.relative_path,
          media_files.container,
          media_files.size_bytes
        from media_files
        inner join libraries on libraries.id = media_files.library_id
        where media_files.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as {
      media_file_id: string;
      library_path: string;
      relative_path: string;
      container: string | null;
      size_bytes: string | number | null;
    };

    return {
      mediaFileId: row.media_file_id,
      absolutePath: join(row.library_path, row.relative_path),
      relativePath: row.relative_path,
      container: row.container,
      sizeBytes:
        row.size_bytes === null ? null : Number.parseInt(String(row.size_bytes), 10)
    };
  }

  async openMediaStream(id: string, rangeHeader?: string | undefined) {
    const mediaFile = await this.getMediaFileById(id);

    if (!mediaFile) {
      return null;
    }

    const fileStats = await stat(mediaFile.absolutePath);
    const fileSize = fileStats.size;
    const defaultStart = 0;
    const defaultEnd = fileSize - 1;

    let start = defaultStart;
    let end = defaultEnd;
    let partial = false;

    if (rangeHeader?.startsWith("bytes=")) {
      const [rawStart, rawEnd] = rangeHeader.replace("bytes=", "").split("-");
      start = rawStart ? Number.parseInt(rawStart, 10) : defaultStart;
      end = rawEnd ? Number.parseInt(rawEnd, 10) : defaultEnd;
      partial = true;
    }

    return {
      mediaFile,
      fileSize,
      start,
      end,
      partial,
      stream: createReadStream(mediaFile.absolutePath, {
        start,
        end
      })
    };
  }
}

