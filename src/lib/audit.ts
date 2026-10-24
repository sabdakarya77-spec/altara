import type { Pool, PoolClient } from "pg";
import { getPool } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";

export type AuditAction =
  | "AUTH_LOGIN"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "DONATION_STATUS_UPDATE"
  | "SETTINGS_UPDATE"
  | "ENTRY_CREATE"
  | "ENTRY_UPDATE"
  | "ENTRY_DELETE";

export interface LogAuditParams {
  action: AuditAction;
  entityType: string;
  entityId?: string | number | null;
  actorIp?: string;
  actorRole?: string;
  details?: Record<string, unknown>;
  client?: PoolClient | Pool;
}

/**
 * Mencatat rekaman audit trail ke tabel `audit_logs`.
 * Bersifat non-fatal (fail-safe): kegagalan pencatatan log tidak akan
 * menggagalkan alur transaksi utama aplikasi.
 */
export async function recordAuditLog(params: LogAuditParams): Promise<void> {
  const {
    action,
    entityType,
    entityId = "",
    actorIp = "127.0.0.1",
    actorRole = "admin",
    details = {},
    client,
  } = params;

  try {
    const dbClient = client || getPool();
    if (!dbClient) return;

    await dbClient.query(
      `INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        actor_ip,
        actor_role,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, now())`,
      [
        action,
        entityType,
        String(entityId ?? ""),
        actorIp,
        actorRole,
        JSON.stringify(details),
      ]
    );
  } catch (err) {
    console.error("[audit] Gagal mencatat audit log:", (err as Error).message);
  }
}

export { getClientIp };
