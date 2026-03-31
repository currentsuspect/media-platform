import type { FastifyInstance } from "fastify";
import { PlaybackService } from "./service";
import { playbackIdParamSchema } from "./schema";

function inferContentType(container: string | null) {
  switch (container) {
    case "mp4":
    case "m4v":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    default:
      return "video/x-matroska";
  }
}

export async function registerPlaybackRoutes(
  app: FastifyInstance,
  playbackService: PlaybackService
) {
  app.post("/playback/episodes/:id/intent", async (request) => {
    const params = playbackIdParamSchema.parse(request.params);

    return {
      intent: await playbackService.createEpisodeIntent(params.id)
    };
  });

  app.get("/stream/media/:id", async (request, reply) => {
    const params = playbackIdParamSchema.parse(request.params);
    const opened = await playbackService.getStream(
      params.id,
      typeof request.headers.range === "string" ? request.headers.range : undefined
    );

    if (!opened) {
      reply.code(404);
      return {
        error: "media_file_not_found"
      };
    }

    reply.header("Accept-Ranges", "bytes");
    reply.header("Content-Type", inferContentType(opened.mediaFile.container));

    if (opened.partial) {
      reply.code(206);
      reply.header(
        "Content-Range",
        `bytes ${opened.start}-${opened.end}/${opened.fileSize}`
      );
      reply.header("Content-Length", String(opened.end - opened.start + 1));
    } else {
      reply.header("Content-Length", String(opened.fileSize));
    }

    return reply.send(opened.stream);
  });
}

