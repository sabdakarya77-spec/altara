-- ALTARA — Migrasi 002: Hero Slides dan konfirmasi Settings
-- Idempoten: aman dijalankan berulang kali.

CREATE TABLE IF NOT EXISTS hero_slides (
  id              serial PRIMARY KEY,
  headline        text NOT NULL,
  caption         text NOT NULL DEFAULT '',
  location        text NOT NULL DEFAULT '',
  image_url       text NOT NULL,
  alt             text NOT NULL DEFAULT '',
  object_position text NOT NULL DEFAULT 'center 35%',
  ken_burns       text NOT NULL DEFAULT 'zoom-in',
  sort_order      integer NOT NULL DEFAULT 0,
  published       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hero_slides_sort_idx ON hero_slides (sort_order);

-- Konfirmasi struktur tabel settings (key/value)
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
