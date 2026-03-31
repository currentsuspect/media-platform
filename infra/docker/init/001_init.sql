create extension if not exists "pgcrypto";

create table if not exists libraries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('shows', 'movies')),
  path text not null unique,
  status text not null check (status in ('pending-scan', 'scanning', 'ready', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_files (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  relative_path text not null,
  container text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (library_id, relative_path)
);

create table if not exists normalized_media_items (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  media_file_id uuid not null references media_files(id) on delete cascade,
  kind text not null check (kind in ('episode', 'movie')),
  title text not null,
  series_title text,
  season_number integer,
  episode_number integer,
  year integer,
  confidence real not null,
  source text not null check (source in ('local-parser')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (media_file_id)
);

create table if not exists catalog_series (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  source_key text not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (library_id, source_key)
);

create table if not exists catalog_seasons (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  source_key text not null,
  series_id uuid not null references catalog_series(id) on delete cascade,
  season_number integer not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (library_id, source_key)
);

create table if not exists catalog_episodes (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  source_key text not null,
  series_id uuid not null references catalog_series(id) on delete cascade,
  season_id uuid not null references catalog_seasons(id) on delete cascade,
  media_file_id uuid not null references media_files(id) on delete cascade,
  normalized_media_item_id uuid not null references normalized_media_items(id) on delete cascade,
  title text not null,
  episode_number integer not null,
  confidence real not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (library_id, source_key),
  unique (normalized_media_item_id)
);

create table if not exists catalog_movies (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  source_key text not null,
  media_file_id uuid not null references media_files(id) on delete cascade,
  normalized_media_item_id uuid not null references normalized_media_items(id) on delete cascade,
  title text not null,
  year integer,
  confidence real not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (library_id, source_key),
  unique (normalized_media_item_id)
);

create table if not exists metadata_matches (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references libraries(id) on delete cascade,
  entity_type text not null check (entity_type in ('series', 'movie')),
  entity_id uuid not null,
  provider text not null check (provider in ('tmdb')),
  provider_id text not null,
  title text not null,
  overview text,
  poster_url text,
  backdrop_url text,
  release_date text,
  confidence real not null,
  status text not null check (status in ('matched', 'manual', 'unmatched')),
  is_manual boolean not null default false,
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, provider)
);
