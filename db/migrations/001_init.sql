-- ALTARA — Fase 1: fondasi data
-- Idempoten: aman dijalankan berulang kali.

CREATE TABLE IF NOT EXISTS programs (
  id          serial PRIMARY KEY,
  idx         text NOT NULL DEFAULT '',
  title       text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image       text NOT NULL DEFAULT '',
  alt         text NOT NULL DEFAULT '',
  published   boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stories (
  id          serial PRIMARY KEY,
  category    text NOT NULL DEFAULT '',
  title       text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image       text NOT NULL DEFAULT '',
  alt         text NOT NULL DEFAULT '',
  published   boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stats (
  id           serial PRIMARY KEY,
  idx          text NOT NULL DEFAULT '' UNIQUE,
  value        text NOT NULL,
  label        text NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0,
  is_placeholder boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_posts (
  id           serial PRIMARY KEY,
  category     text NOT NULL DEFAULT '',
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  excerpt      text NOT NULL DEFAULT '',
  body         text NOT NULL DEFAULT '',
  cover_image  text NOT NULL DEFAULT '',
  alt          text NOT NULL DEFAULT '',
  published_at timestamptz,
  published    boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id         serial PRIMARY KEY,
  title      text NOT NULL,
  meta       text NOT NULL DEFAULT '',
  file_url   text NOT NULL DEFAULT '',
  published  boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partners (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  logo_url   text NOT NULL DEFAULT '',
  published  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS programs_sort_idx ON programs (sort_order);
CREATE INDEX IF NOT EXISTS stories_sort_idx ON stories (sort_order);
CREATE INDEX IF NOT EXISTS stats_sort_idx ON stats (sort_order);
CREATE INDEX IF NOT EXISTS journal_posts_sort_idx ON journal_posts (sort_order);
CREATE INDEX IF NOT EXISTS documents_sort_idx ON documents (sort_order);
CREATE INDEX IF NOT EXISTS partners_sort_idx ON partners (sort_order);
