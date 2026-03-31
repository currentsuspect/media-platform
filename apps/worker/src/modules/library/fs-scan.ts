import { readdir, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import type { MediaFileUpsertInput } from "@media/types";

const supportedContainers = new Set([
  ".mkv",
  ".mp4",
  ".avi",
  ".mov",
  ".m4v",
  ".webm",
  ".ts"
]);

export interface FileScanWarning {
  path: string;
  message: string;
}

export interface ScanLibraryFilesResult {
  files: MediaFileUpsertInput[];
  warnings: FileScanWarning[];
}

export async function scanLibraryFiles(
  libraryId: string,
  rootPath: string
): Promise<ScanLibraryFilesResult> {
  const files: MediaFileUpsertInput[] = [];
  const warnings: FileScanWarning[] = [];

  async function walkDirectory(currentPath: string): Promise<void> {
    let entries;

    try {
      entries = await readdir(currentPath, {
        withFileTypes: true
      });
    } catch (error) {
      warnings.push({
        path: currentPath,
        message: error instanceof Error ? error.message : "Failed to read directory"
      });
      return;
    }

    for (const entry of entries) {
      const entryPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walkDirectory(entryPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = extname(entry.name).toLowerCase();

      if (!supportedContainers.has(extension)) {
        continue;
      }

      try {
        const metadata = await stat(entryPath);
        const relativePath = relative(rootPath, entryPath).split(sep).join("/");

        files.push({
          libraryId,
          relativePath,
          container: extension.slice(1),
          sizeBytes: metadata.size
        });
      } catch (error) {
        warnings.push({
          path: entryPath,
          message: error instanceof Error ? error.message : "Failed to read file metadata"
        });
      }
    }
  }

  await walkDirectory(rootPath);

  return {
    files,
    warnings
  };
}
