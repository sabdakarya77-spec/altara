import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeSession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Logout admin — cabut session di database dan hapus cookie.
 * Selalu mengembalikan 200 agar UI tidak bocor status session.
 */
export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await revokeSession(token);
    } catch (err) {
      console.error("[auth] gagal mencabut session:", (err as Error).message);
    }
  }
  cookies().delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
