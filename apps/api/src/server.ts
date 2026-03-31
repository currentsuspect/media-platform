import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env";
import { createDatabasePool } from "./infrastructure/database";
import { runMigrations } from "./infrastructure/migrations";
import { createRedisConnection } from "./infrastructure/redis";
import { registerCatalogRoutes } from "./modules/catalog/route";
import { CatalogRepository } from "./modules/catalog/repository";
import { CatalogService } from "./modules/catalog/service";
import { registerHealthRoutes } from "./modules/health/route";
import { LibraryScanPublisher } from "./modules/library/queue";
import { LibraryRepository } from "./modules/library/repository";
import { registerLibraryRoutes } from "./modules/library/route";
import { LibraryService } from "./modules/library/service";
import { PlaybackRepository } from "./modules/playback/repository";
import { registerPlaybackRoutes } from "./modules/playback/route";
import { PlaybackService } from "./modules/playback/service";
import { registerErrorHandler } from "./plugins/error-handler";

async function buildServer() {
  const app = Fastify({
    logger: true
  });
  const databasePool = createDatabasePool(env.DATABASE_URL);
  const redisConnection = createRedisConnection(env.REDIS_URL);

  await runMigrations(databasePool);

  const libraryRepository = new LibraryRepository(databasePool);
  const catalogRepository = new CatalogRepository(databasePool);
  const playbackRepository = new PlaybackRepository(databasePool);
  const libraryScanPublisher = new LibraryScanPublisher(redisConnection);
  const libraryService = new LibraryService(
    libraryRepository,
    libraryScanPublisher
  );
  const catalogService = new CatalogService(catalogRepository);
  const playbackService = new PlaybackService(
    catalogService,
    playbackRepository
  );

  await app.register(cors, {
    origin: true
  });

  await registerErrorHandler(app);
  await registerHealthRoutes(app);
  await registerLibraryRoutes(app, libraryService);
  await registerCatalogRoutes(app, catalogService);
  await registerPlaybackRoutes(app, playbackService);

  app.addHook("onClose", async () => {
    await Promise.all([
      libraryScanPublisher.close(),
      databasePool.end(),
      redisConnection.quit()
    ]);
  });

  return app;
}

const app = await buildServer();

app.listen({
  host: "0.0.0.0",
  port: env.API_PORT
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
