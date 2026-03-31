import type { PlaybackIntent } from "@media/types";
import { CatalogEpisodeNotFoundError } from "../catalog/errors";
import { CatalogService } from "../catalog/service";
import { PlaybackRepository } from "./repository";

export class PlaybackService {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly playbackRepository: PlaybackRepository
  ) {}

  async createEpisodeIntent(id: string): Promise<PlaybackIntent> {
    const episode = await this.catalogService.getEpisodePlaybackDetail(id);

    if (!episode) {
      throw new CatalogEpisodeNotFoundError(id);
    }

    return {
      playableId: episode.id,
      mediaFileId: episode.mediaFileId,
      mode: "direct-play",
      url: `/stream/media/${episode.mediaFileId}`,
      subtitles: []
    };
  }

  async getStream(id: string, rangeHeader?: string) {
    return this.playbackRepository.openMediaStream(id, rangeHeader);
  }
}

