import { Worker } from "bullmq";
import type IORedis from "ioredis";
import { queueNames } from "@media/config";
import type { ScanLibraryJobData } from "@media/types";

export function createLibraryScanWorker(
  connection: IORedis,
  processor: (payload: ScanLibraryJobData) => Promise<unknown>
) {
  return new Worker<ScanLibraryJobData>(
    queueNames.libraryScan,
    async (job) => processor(job.data),
    {
      connection,
      concurrency: 2
    }
  );
}
