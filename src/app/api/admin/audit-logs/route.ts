import { NextResponse } from "next/server";
import { getSessionHashFromCookies, isSessionValid } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureAuth(): Promise<boolean> {
  const hash = await getSessionHashFromCookies();
  return isSessionValid(hash);
}

export type AuditLogRow = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_ip: string;
  actor_role: string;
  details: Record<string, unknown>;
  created_at: string;
};

/** Ambil 100 rekaman audit trail terbaru untuk kepatuhan dan forensik admin */
export async function GET() {
  if (!(await ensureAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");

    const res = await pool.query<AuditLogRow>(
      `SELECT * FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ rows: res.rows });
  } catch (err) {
    console.error("[api/admin/audit-logs] GET gagal:", (err as Error).message);
    return NextResponse.json({ error: "Gagal memuat catatan audit" }, { status: 500 });
  }
}
