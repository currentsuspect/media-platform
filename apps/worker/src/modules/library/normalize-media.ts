import { basename, dirname } from "node:path";
import type {
  MediaFileRecord,
  NormalizedMediaItemUpsertInput
} from "@media/types";

const noiseTokens = new Set([
  "1080p",
  "720p",
  "2160p",
  "x264",
  "x265",
  "h264",
  "h265",
  "hevc",
  "bluray",
  "brrip",
  "webrip",
  "web-dl",
  "webdl",
  "dvdrip",
  "hdrip",
  "proper",
  "repack"
]);

function titleize(value: string) {
  return value
    .replace(/[._]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanTitle(value: string) {
  return titleize(
    value
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\([^)]+\)/g, " ")
      .split(/\s+/)
      .filter((token) => !noiseTokens.has(token.toLowerCase()))
      .join(" ")
  );
}

function parseEpisode(
  mediaFile: MediaFileRecord
): NormalizedMediaItemUpsertInput | null {
  const fileName = basename(mediaFile.relativePath, `.${mediaFile.container ?? ""}`);
  const match = fileName.match(/(.+?)[ ._-]+s(\d{1,2})e(\d{1,3})(?:[ ._-]+(.*))?$/i);

  if (!match) {
    return null;
  }

  const [, rawSeriesTitle, rawSeason, rawEpisode, rawEpisodeTitle] = match;
  const seriesTitle = cleanTitle(rawSeriesTitle);
  const title = cleanTitle(rawEpisodeTitle || rawSeriesTitle);

  return {
    libraryId: mediaFile.libraryId,
    mediaFileId: mediaFile.id,
    kind: "episode",
    title,
    seriesTitle,
    seasonNumber: Number.parseInt(rawSeason, 10),
    episodeNumber: Number.parseInt(rawEpisode, 10),
    year: null,
    confidence: rawEpisodeTitle ? 0.92 : 0.85,
    source: "local-parser"
  };
}

function parseMovie(
  mediaFile: MediaFileRecord
): NormalizedMediaItemUpsertInput | null {
  const fileName = basename(mediaFile.relativePath, `.${mediaFile.container ?? ""}`);
  const directoryName = dirname(mediaFile.relativePath);
  const candidate = fileName === directoryName ? fileName : fileName;
  const match = candidate.match(/(.+?)(?:[ ._-]+\(?((?:19|20)\d{2})\)?)?$/);

  if (!match) {
    return null;
  }

  const [, rawTitle, rawYear] = match;
  const title = cleanTitle(rawTitle);

  if (!title) {
    return null;
  }

  return {
    libraryId: mediaFile.libraryId,
    mediaFileId: mediaFile.id,
    kind: "movie",
    title,
    seriesTitle: null,
    seasonNumber: null,
    episodeNumber: null,
    year: rawYear ? Number.parseInt(rawYear, 10) : null,
    confidence: rawYear ? 0.86 : 0.74,
    source: "local-parser"
  };
}

export function normalizeMediaFiles(
  mediaFiles: MediaFileRecord[]
): NormalizedMediaItemUpsertInput[] {
  return mediaFiles.flatMap((mediaFile) => {
    const episode = parseEpisode(mediaFile);

    if (episode) {
      return [episode];
    }

    const movie = parseMovie(mediaFile);

    return movie ? [movie] : [];
  });
}
