import type {
  CatalogEpisodePlaybackDetail,
  CatalogMovieListItem,
  CatalogSeriesDetail,
  CatalogSeriesListItem,
  PlaybackIntent
} from "./types";

const apiBaseUrl =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

async function fetchFromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    next: {
      revalidate: 10
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

export class ApiUnavailableError extends Error {
  constructor(path: string) {
    super(`API unavailable for path: ${path}`);
    this.name = "ApiUnavailableError";
  }
}

export async function getCatalogSeries() {
  try {
    return await fetchFromApi<{ items: CatalogSeriesListItem[] }>("/catalog/series");
  } catch {
    return { items: [] as CatalogSeriesListItem[] };
  }
}

export async function getCatalogMovies() {
  try {
    return await fetchFromApi<{ items: CatalogMovieListItem[] }>("/catalog/movies");
  } catch {
    return { items: [] as CatalogMovieListItem[] };
  }
}

export async function getCatalogSeriesDetail(id: string) {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/catalog/series/${id}`, {
      next: {
        revalidate: 10
      }
    });
  } catch {
    return null;
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} /catalog/series/${id}`);
  }

  return response.json() as Promise<{ item: CatalogSeriesDetail }>;
}

export async function getCatalogEpisodeDetail(id: string) {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/catalog/episodes/${id}`, {
      next: {
        revalidate: 10
      }
    });
  } catch {
    return null;
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} /catalog/episodes/${id}`);
  }

  return response.json() as Promise<{ item: CatalogEpisodePlaybackDetail }>;
}

export async function createEpisodePlaybackIntent(id: string) {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/playback/episodes/${id}/intent`, {
      method: "POST",
      cache: "no-store"
    });
  } catch {
    throw new ApiUnavailableError(`/playback/episodes/${id}/intent`);
  }

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} /playback/episodes/${id}/intent`
    );
  }

  return response.json() as Promise<{ intent: PlaybackIntent }>;
}
