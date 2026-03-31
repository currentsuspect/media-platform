import type {
  CatalogEpisodePlaybackDetail,
  CatalogMovieListItem,
  PlaybackIntent,
  CatalogSeriesDetail,
  CatalogSeriesListItem
} from "@media/types";

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

export async function getCatalogSeries() {
  return fetchFromApi<{ items: CatalogSeriesListItem[] }>("/catalog/series");
}

export async function getCatalogMovies() {
  return fetchFromApi<{ items: CatalogMovieListItem[] }>("/catalog/movies");
}

export async function getCatalogSeriesDetail(id: string) {
  const response = await fetch(`${apiBaseUrl}/catalog/series/${id}`, {
    next: {
      revalidate: 10
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} /catalog/series/${id}`);
  }

  return response.json() as Promise<{ item: CatalogSeriesDetail }>;
}

export async function getCatalogEpisodeDetail(id: string) {
  const response = await fetch(`${apiBaseUrl}/catalog/episodes/${id}`, {
    next: {
      revalidate: 10
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} /catalog/episodes/${id}`);
  }

  return response.json() as Promise<{ item: CatalogEpisodePlaybackDetail }>;
}

export async function createEpisodePlaybackIntent(id: string) {
  const response = await fetch(`${apiBaseUrl}/playback/episodes/${id}/intent`, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} /playback/episodes/${id}/intent`
    );
  }

  return response.json() as Promise<{ intent: PlaybackIntent }>;
}
