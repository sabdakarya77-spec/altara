import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness check: apakah proses Next.js sendiri masih hidup?
 *
 * Sengaja tidak di-bundle lewat middleware admin dan tidak memerlukan
 * session. Selalu mengembalikan 200 selama prosesnya masih hidup, termasuk
 * saat database mati — situs tetap bisa melayani fallback statis
 * `src/data/content.ts`.
 *
 * Dipakai oleh healthcheck Docker dan Caddy (`health_uri`).
 */
export async function GET() {
  return NextResponse.json({ ok: true });
}