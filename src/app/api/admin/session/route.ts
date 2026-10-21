import { NextResponse } from "next/server";
import { getSessionHashFromCookies, isSessionValid } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Status session — dipakai admin UI untuk cek login dan middleware.
 * Validasi penuh dilakukan di sini (Node Runtime), bukan di middleware.
 */
export async function GET() {
  const hash = getSessionHashFromCookies();
  const authenticated = await isSessionValid(hash);
  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401 });
}
