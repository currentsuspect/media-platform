export class CatalogEpisodeNotFoundError extends Error {
  constructor(id: string) {
    super(`Catalog episode not found: ${id}`);
    this.name = "CatalogEpisodeNotFoundError";
  }
}

