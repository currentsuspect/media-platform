import type { FastifyInstance } from "fastify";
import { addLibrarySchema } from "./schema";
import { LibraryService } from "./service";

export async function registerLibraryRoutes(
  app: FastifyInstance,
  libraryService: LibraryService
) {
  app.get("/libraries", async () => {
    return { items: await libraryService.list() };
  });

  app.post("/libraries", async (request, reply) => {
    const body = addLibrarySchema.parse(request.body);
    const result = await libraryService.create(body);

    reply.code(201);
    return result;
  });
}
