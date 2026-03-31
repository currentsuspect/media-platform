import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { CatalogEpisodeNotFoundError } from "../modules/catalog/errors";
import { LibraryPathConflictError } from "../modules/library/errors";

export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({
        error: "validation_error",
        details: error.flatten()
      });
      return;
    }

    if (error instanceof LibraryPathConflictError) {
      reply.code(409).send({
        error: "library_path_conflict",
        message: error.message
      });
      return;
    }

    if (error instanceof CatalogEpisodeNotFoundError) {
      reply.code(404).send({
        error: "catalog_episode_not_found",
        message: error.message
      });
      return;
    }

    request.log.error(error);
    reply.code(500).send({
      error: "internal_server_error"
    });
  });
}
