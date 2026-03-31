import type {
  CatalogEpisodePlaybackDetail,
  CatalogMovieListItem,
  CatalogSeriesDetail,
  CatalogSeriesListItem
} from "@media/types";
import { CatalogRepository } from "./repository";

export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async listSeries(): Promise<CatalogSeriesListItem[]> {
    return this.catalogRepository.listSeries();
  }

  async listMovies(): Promise<CatalogMovieListItem[]> {
    return this.catalogRepository.listMovies();
  }

  async getSeriesDetail(id: string): Promise<CatalogSeriesDetail | null> {
    return this.catalogRepository.getSeriesDetail(id);
  }

  async getEpisodePlaybackDetail(
    id: string
  ): Promise<CatalogEpisodePlaybackDetail | null> {
    return this.catalogRepository.getEpisodePlaybackDetail(id);
  }
}
