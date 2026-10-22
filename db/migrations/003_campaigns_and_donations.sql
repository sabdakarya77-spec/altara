-- ALTARA — Migrasi 003: Tabel Campaigns dan Donations (Fase 6: Transaksi Donasi)
-- Idempoten: aman dijalankan berulang kali.

-- 1. Tabel Kampanye / Program Penggalangan Dana
CREATE TABLE IF NOT EXISTS campaigns (
  id               serial PRIMARY KEY,
  title            text NOT NULL,
  slug             text NOT NULL UNIQUE,
  category         text NOT NULL DEFAULT 'Umum',
  short_desc       text NOT NULL DEFAULT '',
  description      text NOT NULL DEFAULT '',
  image_url        text NOT NULL DEFAULT '',
  target_amount    bigint NOT NULL DEFAULT 0,
  collected_amount bigint NOT NULL DEFAULT 0,
  donor_count      integer NOT NULL DEFAULT 0,
  start_date       timestamptz NOT NULL DEFAULT now(),
  end_date         timestamptz,
  published        boolean NOT NULL DEFAULT true,
  featured         boolean NOT NULL DEFAULT false,
  is_placeholder   boolean NOT NULL DEFAULT false,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_placeholder boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS campaigns_slug_idx ON campaigns (slug);
CREATE INDEX IF NOT EXISTS campaigns_sort_idx ON campaigns (sort_order);
CREATE INDEX IF NOT EXISTS campaigns_published_idx ON campaigns (published, sort_order);

-- 2. Tabel Transaksi Donasi
CREATE TABLE IF NOT EXISTS donations (
  id                serial PRIMARY KEY,
  order_id          text NOT NULL UNIQUE,
  campaign_id       integer REFERENCES campaigns(id) ON DELETE SET NULL,
  donor_name        text NOT NULL,
  donor_email       text NOT NULL DEFAULT '',
  donor_phone       text NOT NULL DEFAULT '',
  is_anonymous      boolean NOT NULL DEFAULT false,
  amount            bigint NOT NULL CHECK (amount > 0),
  status            text NOT NULL DEFAULT 'pending', -- 'pending' | 'settlement' | 'cancel' | 'expire' | 'deny'
  payment_method    text NOT NULL DEFAULT '',        -- 'qris' | 'bank_transfer' | 'gopay' | 'manual'
  payment_channel   text NOT NULL DEFAULT '',        -- 'bca' | 'bni' | 'bri' | 'mandiri' | 'qris_gopay'
  transaction_id    text NOT NULL DEFAULT '',        -- ID dari gateway (Midtrans)
  payment_proof_url text NOT NULL DEFAULT '',        -- URL bukti transfer jika metode manual
  message           text NOT NULL DEFAULT '',        -- Doa / pesan dari donatur
  snap_token        text NOT NULL DEFAULT '',        -- Token Snap Midtrans
  snap_redirect_url text NOT NULL DEFAULT '',
  payload           jsonb NOT NULL DEFAULT '{}'::jsonb, -- Raw payload webhook untuk audit trail
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donations_order_id_idx ON donations (order_id);
CREATE INDEX IF NOT EXISTS donations_campaign_id_idx ON donations (campaign_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations (status);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations (created_at DESC);
