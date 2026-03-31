import { env } from "./config/env";
import { createDatabasePool } from "./infrastructure/database";
import { createRedisConnection } from "./infrastructure/redis";
import { runScanLibraryJob } from "./jobs/scan-library";
import { LibraryRepository } from "./modules/library/repository";
import { createLibraryScanWorker } from "./queues/library-scan-queue";

const databasePool = createDatabasePool(env.DATABASE_URL);
const redisConnection = createRedisConnection(env.REDIS_URL);
const libraryRepository = new LibraryRepository(databasePool);
const worker = createLibraryScanWorker(redisConnection, async (job) =>
  runScanLibraryJob(job, libraryRepository)
);

async function bootstrap() {
  worker.on("completed", (job, result) => {
    console.log("scan-completed", job.id, result);
  });

  worker.on("failed", (job, error) => {
    console.error("scan-failed", job?.id, error);
  });

  console.log("worker-ready", {
    queue: "library-scan"
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function shutdown() {
  await worker.close();
  await Promise.all([databasePool.end(), redisConnection.quit()]);
}

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
