import type {
  CatalogMovieRecord,
  CatalogSeriesRecord,
  MetadataMatchUpsertInput
} from "@media/types";

interface TmdbSearchResult {
  id: number;
  name?: string;
  title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  release_date?: string;
}

function buildImageUrl(path: string | null | undefined) {
  return path ? `https://image.tmdb.org/t/p/original${path}` : null;
}

async function searchTmdb(
  apiKey: string,
  type: "tv" | "movie",
  query: string,
  year?: number | null
): Promise<TmdbSearchResult | null> {
  const params = new URLSearchParams({
    api_key: apiKey,
    query
  });

  if (year) {
    params.set(type === "movie" ? "year" : "first_air_date_year", String(year));
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/search/${type}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`TMDB ${type} search failed: ${response.status}`);
  }

  const payload = (await response.json()) as { results?: TmdbSearchResult[] };
  return payload.results?.[0] ?? null;
}

export async function buildSeriesTmdbMatch(
  apiKey: string,
  series: CatalogSeriesRecord
): Promise<MetadataMatchUpsertInput | null> {
  const result = await searchTmdb(apiKey, "tv", series.title);

  if (!result) {
    return null;
  }

  return {
    libraryId: series.libraryId,
    entityType: "series",
    entityId: series.id,
    provider: "tmdb",
    providerId: String(result.id),
    title: result.name ?? series.title,
    overview: result.overview ?? null,
    posterUrl: buildImageUrl(result.poster_path),
    backdropUrl: buildImageUrl(result.backdrop_path),
    releaseDate: result.first_air_date ?? null,
    confidence: 0.8,
    status: "matched",
    isManual: false,
    rawPayload: JSON.stringify(result)
  };
}

export async function buildMovieTmdbMatch(
  apiKey: string,
  movie: CatalogMovieRecord
): Promise<MetadataMatchUpsertInput | null> {
  const result = await searchTmdb(apiKey, "movie", movie.title, movie.year);

  if (!result) {
    return null;
  }

  return {
    libraryId: movie.libraryId,
    entityType: "movie",
    entityId: movie.id,
    provider: "tmdb",
    providerId: String(result.id),
    title: result.title ?? movie.title,
    overview: result.overview ?? null,
    posterUrl: buildImageUrl(result.poster_path),
    backdropUrl: buildImageUrl(result.backdrop_path),
    releaseDate: result.release_date ?? null,
    confidence: movie.year ? 0.86 : 0.76,
    status: "matched",
    isManual: false,
    rawPayload: JSON.stringify(result)
  };
}
