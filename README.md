# Media Platform

Cross-platform local-first media platform: web first, then Android, then TV.

## Workspace

- `apps/api`: HTTP API for libraries, metadata, playback, profiles, and admin.
- `apps/worker`: background jobs for scanning, metadata enrichment, and transcode orchestration.
- `apps/web`: Next.js web client for browse and playback.
- `packages/types`: shared contracts across API, worker, and clients.
- `packages/player-sdk`: shared playback session logic and request builders.
- `infra/docker`: local development services.
- `docs/architecture`: system notes and implementation plans.

## First Milestone

1. Add a library path.
2. Queue a scan job.
3. Store discovered media files.
4. Match metadata.
5. Browse titles in web.
6. Create a playback intent and save progress.

## Backend State

- libraries are designed to persist in Postgres
- scan jobs are designed to flow through Redis/BullMQ
- the worker owns background scan execution and library status transitions
- ingest and metadata matching are the next backend pass

## Local Development

```bash
pnpm install
docker compose -f infra/docker/docker-compose.yml up -d
pnpm dev
```
