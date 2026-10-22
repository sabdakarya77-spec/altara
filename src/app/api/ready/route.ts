import { NextResponse } from "next/server";
import { isDatabaseConfigured, query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Readiness check: apakah aplikasi siap melayani traffic yang butuh database?
 *
 * Berbeda dengan `/api/health` (liveness, selalu 200 selama proses hidup),
 * endpoint ini mengembalikan 503 bila `DATABASE_URL` belum diset atau
 * database tidak bisa dijangkau. Dipakai monitoring dan load balancer yang
 * butuh tahu kapan konten dinamis benar-benar bisa dilayani.
 */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, database: "not-configured" },
      { status: 503 }
    );
  }

  try {
    await query("SELECT 1");
    return NextResponse.json({ ok: true, database: "up" });
  } catch {
    // Pesan error internal tidak dikembalikan ke klien (information disclosure).
    return NextResponse.json(
      { ok: false, database: "down" },
      { status: 503 }
    );
  }
}