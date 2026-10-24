-- ALTARA — Migrasi 005: Audit Trail & Logging Admin
-- Idempoten: aman dijalankan berulang kali.

CREATE TABLE IF NOT EXISTS audit_logs (
  id          serial PRIMARY KEY,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   text NOT NULL DEFAULT '',
  actor_ip    text NOT NULL DEFAULT '',
  actor_role  text NOT NULL DEFAULT 'admin',
  details     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs (action);
