import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { revokeSession, SESSION_COOKIE } from "@/lib/auth";
import { recordAuditLog, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Logout admin — cabut session di database dan hapus cookie.
 * Selalu mengembalikan 200 agar UI tidak bocor status session.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await revokeSession(token);
    } catch (err) {
      console.error("[auth] gagal mencabut session:", (err as Error).message);
    }
  }
  cookieStore.delete(SESSION_COOKIE);

  void recordAuditLog({
    action: "AUTH_LOGOUT",
    entityType: "auth",
    actorIp: getClientIp(request),
  });

  return NextResponse.json({ ok: true });
}
