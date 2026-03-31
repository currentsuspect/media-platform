import { EmptyState } from "../components/catalog/empty-state";
import { MediaCard } from "../components/catalog/media-card";
import { MediaGrid } from "../components/catalog/media-grid";
import { MediaShell } from "../components/catalog/media-shell";
import { getCatalogMovies, getCatalogSeries } from "../lib/catalog-api";

export default async function HomePage() {
  const [{ items: series }, { items: movies }] = await Promise.all([
    getCatalogSeries(),
    getCatalogMovies()
  ]);

  return (
    <MediaShell
      eyebrow="Browse"
      title="Local libraries, now browseable."
      description="This web surface is reading the real catalog API: aggregated series and movies, enriched when provider matches exist, and organized for the same model mobile and TV will consume."
    >
      {series.length === 0 && movies.length === 0 ? (
        <EmptyState
          title="No catalog items yet"
          description="Add a library, run a scan, and this page will populate from the catalog tables instead of placeholder content."
        />
      ) : null}

      {series.length > 0 ? (
        <MediaGrid title="Series">
          {series.map((item) => (
            <MediaCard
              key={item.id}
              href={`/series/${item.id}`}
              title={item.title}
              subtitle={`${item.seasonCount} seasons • ${item.episodeCount} episodes`}
              description={item.overview}
              posterUrl={item.posterUrl}
            />
          ))}
        </MediaGrid>
      ) : null}

      {movies.length > 0 ? (
        <MediaGrid title="Movies">
          {movies.map((item) => (
            <MediaCard
              key={item.id}
              title={item.title}
              subtitle={item.year ? String(item.year) : "Movie"}
              description={item.overview}
              posterUrl={item.posterUrl}
            />
          ))}
        </MediaGrid>
      ) : null}
    </MediaShell>
  );
}
