import { Queue } from "bullmq";
import type IORedis from "ioredis";
import { queueNames } from "@media/config";
import type { QueuedJobRecord, ScanLibraryJobData } from "@media/types";

export class LibraryScanPublisher {
  private readonly queue: Queue<ScanLibraryJobData>;

  constructor(connection: IORedis) {
    this.queue = new Queue<ScanLibraryJobData>(queueNames.libraryScan, {
      connection
    });
  }

  async enqueue(libraryId: string): Promise<QueuedJobRecord> {
    const job = await this.queue.add(
      "scan-library",
      {
        libraryId,
        requestedAt: new Date().toISOString()
      },
      {
        removeOnComplete: 100,
        removeOnFail: 500
      }
    );

    return {
      id: job.id ?? libraryId,
      queue: queueNames.libraryScan,
      status: "queued"
    };
  }

  async close() {
    await this.queue.close();
  }
}
