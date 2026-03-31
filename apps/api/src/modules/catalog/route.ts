import type { FastifyInstance } from "fastify";
import { CatalogService } from "./service";
import { catalogIdParamSchema } from "./schema";

export async function registerCatalogRoutes(
  app: FastifyInstance,
  catalogService: CatalogService
) {
  app.get("/catalog/series", async () => {
    return {
      items: await catalogService.listSeries()
    };
  });

  app.get("/catalog/movies", async () => {
    return {
      items: await catalogService.listMovies()
    };
  });

  app.get("/catalog/series/:id", async (request, reply) => {
    const params = catalogIdParamSchema.parse(request.params);
    const item = await catalogService.getSeriesDetail(params.id);

    if (!item) {
      reply.code(404);
      return {
        error: "catalog_series_not_found"
      };
    }

    return {
      item
    };
  });

  app.get("/catalog/episodes/:id", async (request, reply) => {
    const params = catalogIdParamSchema.parse(request.params);
    const item = await catalogService.getEpisodePlaybackDetail(params.id);

    if (!item) {
      reply.code(404);
      return {
        error: "catalog_episode_not_found"
      };
    }

    return {
      item
    };
  });
}
