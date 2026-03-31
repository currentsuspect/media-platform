import Link from "next/link";
import type { CatalogSeriesDetail } from "@media/types";

export function SeriesDetail({ item }: { item: CatalogSeriesDetail }) {
  return (
    <section
      style={{
        display: "grid",
        gap: 24,
        borderRadius: 28,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)"
      }}
    >
      <div
        style={{
          minHeight: 260,
          padding: "28px 24px",
          display: "grid",
          alignItems: "end",
          background: item.backdropUrl
            ? `linear-gradient(180deg, rgba(5,9,20,0.18), rgba(5,9,20,0.92)), url(${item.backdropUrl}) center / cover`
            : "linear-gradient(135deg, #0f172a, #1e3a8a)"
        }}
      >
        <div style={{ display: "grid", gap: 10, maxWidth: 700 }}>
          <h2 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            {item.title}
          </h2>
          <p style={{ margin: 0, color: "#dbe4f0", lineHeight: 1.7 }}>
            {item.overview || "No provider synopsis yet. Local metadata normalization is already shaping the show and episode structure."}
          </p>
        </div>
      </div>

      <div style={{ padding: "0 24px 24px", display: "grid", gap: 18 }}>
        {item.seasons.map((season) => (
          <section
            key={season.id}
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: 14
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                flexWrap: "wrap"
              }}
            >
              <h3 style={{ margin: 0 }}>{season.title}</h3>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>
                {season.episodes.length} episodes
              </span>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {season.episodes.map((episode) => (
                <article
                  key={episode.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.04)"
                  }}
                >
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong>
                      Episode {episode.episodeNumber}: {episode.title}
                    </strong>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>
                      Media file {episode.mediaFileId}
                    </span>
                  </div>
                  <Link
                    href={`/watch/episodes/${episode.id}`}
                    style={{
                      color: "#f8fafc",
                      textDecoration: "none",
                      borderRadius: 999,
                      padding: "10px 14px",
                      background: "rgba(59,130,246,0.22)",
                      whiteSpace: "nowrap",
                      fontSize: 14
                    }}
                  >
                    Play
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
