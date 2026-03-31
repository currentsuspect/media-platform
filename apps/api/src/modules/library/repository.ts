import type { Pool } from "pg";
import type { LibraryRecord, LibraryStatus } from "@media/types";
import type { AddLibraryInput } from "./schema";
import { LibraryPathConflictError } from "./errors";

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

export class LibraryRepository {
  constructor(private readonly pool: Pool) {}

  async list(): Promise<LibraryRecord[]> {
    const result = await this.pool.query(
      `
        select id, name, type, path, status, created_at
        from libraries
        order by created_at desc
      `
    );

    return result.rows.map((row) => mapLibraryRow(row));
  }

  async create(input: AddLibraryInput): Promise<LibraryRecord> {
    try {
      const result = await this.pool.query(
        `
          insert into libraries (name, type, path, status)
          values ($1, $2, $3, 'pending-scan')
          returning id, name, type, path, status, created_at
        `,
        [input.name, input.type, input.path]
      );

      return mapLibraryRow(result.rows[0]);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new LibraryPathConflictError(input.path);
      }

      throw error;
    }
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
}
