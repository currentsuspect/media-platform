import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaShell } from "../../../../components/catalog/media-shell";
import { EmptyState } from "../../../../components/catalog/empty-state";
import { PlayerFrame } from "../../../../components/catalog/player-frame";
import {
  ApiUnavailableError,
  createEpisodePlaybackIntent,
  getCatalogEpisodeDetail
} from "../../../../lib/catalog-api";

export default async function WatchEpisodePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const episodeResponse = await getCatalogEpisodeDetail(id);

  if (!episodeResponse) {
    notFound();
  }

  let intentResponse: Awaited<ReturnType<typeof createEpisodePlaybackIntent>> | null = null;
  let playbackUnavailable = false;

  try {
    intentResponse = await createEpisodePlaybackIntent(id);
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      playbackUnavailable = true;
    } else {
      throw error;
    }
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
      {intentResponse ? (
        <PlayerFrame
          src={intentResponse.intent.url}
          title={episodeResponse.item.title}
        />
      ) : (
        <EmptyState
          title="Playback backend not reachable yet"
          description="The watch page is wired, but the deployed frontend cannot currently reach the API stream service. Once the backend is exposed, this page will play through the same playback intent contract."
        />
      )}

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
          {intentResponse
            ? `Media file ${intentResponse.intent.mediaFileId} is being streamed through the playback intent boundary.`
            : "The episode route, metadata, and playback intent request path are in place. The remaining gap is public backend reachability."}
        </p>
        {playbackUnavailable ? (
          <p style={{ margin: 0, color: "#fbbf24", lineHeight: 1.7 }}>
            Frontend deploy is live; backend deploy still needs to be exposed.
          </p>
        ) : null}
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
