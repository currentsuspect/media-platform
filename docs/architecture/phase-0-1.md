# Phase 0 and 1

## Phase 0

- establish monorepo boundaries
- stand up api, worker, and web services
- define shared types
- define local development infra

## Phase 1

- persist libraries in Postgres
- enqueue real scan jobs through Redis
- inspect filesystem entries under configured library paths
- build initial media file records
- attach metadata matching pipeline
- render imported titles in web

## First Real Replacements

- replace in-memory library store with repository layer
- replace stub queue with BullMQ
- replace placeholder web milestone cards with live API data
- add auth before remote access work begins

## Completed in This Pass

- Postgres-backed library repository boundary in the API
- Redis/BullMQ scan publisher in the API
- BullMQ worker process for library scan jobs
- schema bootstrap path for local Docker Postgres
- library status transitions owned by the worker
