-- ALTARA — Migrasi 004: Security Hardening (Constraint & Indexing)
-- Idempoten: aman dijalankan berulang kali.

-- 1. Penegakan Check Constraint untuk status transaksi donasi
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'donations_status_check'
  ) THEN
    ALTER TABLE donations
      ADD CONSTRAINT donations_status_check
      CHECK (status IN ('pending', 'settlement', 'cancel', 'expire', 'deny'));
  END IF;
END $$;

-- 2. Indeks komposit & performa untuk query riwayat dan pelaporan donasi
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations (created_at DESC);
CREATE INDEX IF NOT EXISTS donations_donor_email_idx ON donations (donor_email);
