import type { PlaybackIntent } from "@media/types";

export interface PlaybackHeartbeat {
  playableId: string;
  positionSeconds: number;
  durationSeconds: number;
}

export function buildPlaybackUrl(intent: PlaybackIntent) {
  return intent.url;
}

export function shouldMarkComplete(heartbeat: PlaybackHeartbeat) {
  if (heartbeat.durationSeconds <= 0) {
    return false;
  }

  return heartbeat.positionSeconds / heartbeat.durationSeconds >= 0.92;
}

