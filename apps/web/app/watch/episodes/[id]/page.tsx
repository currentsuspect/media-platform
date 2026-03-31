import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaShell } from "../../../../components/catalog/media-shell";
import { PlayerFrame } from "../../../../components/catalog/player-frame";
import {
  createEpisodePlaybackIntent,
  getCatalogEpisodeDetail
} from "../../../../lib/catalog-api";

export default async function WatchEpisodePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [episodeResponse, intentResponse] = await Promise.all([
    getCatalogEpisodeDetail(id),
    createEpisodePlaybackIntent(id)
  ]);

  if (!episodeResponse) {
    notFound();
  }

  return (
    <MediaShell
      eyebrow="Playback"
      title={`${episodeResponse.item.seriesTitle} • S${episodeResponse.item.seasonNumber}E${episodeResponse.item.episodeNumber}`}
      description={
        episodeResponse.item.overview ||
        "Direct-play path from the API stream endpoint. Adaptive and transcoded playback will layer on top of this contract next."
      }
    >
      <PlayerFrame src={intentResponse.intent.url} title={episodeResponse.item.title} />

      <section
        style={{
          display: "grid",
          gap: 12,
          borderRadius: 22,
          padding: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <h2 style={{ margin: 0 }}>{episodeResponse.item.title}</h2>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
          Media file {intentResponse.intent.mediaFileId} is being streamed through the
          playback intent boundary.
        </p>
        <Link
          href={`/series/${episodeResponse.item.seriesId}`}
          style={{ color: "#cbd5e1", textDecoration: "none" }}
        >
          Back to series
        </Link>
      </section>
    </MediaShell>
  );
}
