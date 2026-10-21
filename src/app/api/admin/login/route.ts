import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  createSession,
  createSessionToken,
  purgeExpiredSessions,
  sessionCookieOptions,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login admin.
 *
 * Password tunggal dari `ALTARA_ADMIN_PASSWORD`. Bila password benar, session
 * dicatat di tabel `sessions` dan cookie berisi token acak (httpOnly) dikirim.
 * Respons deliberately sama untuk "password salah" dan "session gagal dibuat"
 * agar tidak membocorkan informasi apa pun.
 */
export async function POST(request: NextRequest) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "Permintaan tidak valid" }, { status: 400 });
  }

  // Tanpa env ini, semua password ditolak (fail closed). Log sekali supaya
  // masalah konfigurasi terlihat di log container, bukan hanya "Password salah".
  if (!process.env.ALTARA_ADMIN_PASSWORD) {
    console.error(
      "[auth] ALTARA_ADMIN_PASSWORD belum diset — semua percobaan login akan ditolak."
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false, error: "Password salah" }, { status: 401 });
  }

  const token = createSessionToken();
  try {
    await createSession(token);
  } catch (err) {
    console.error("[auth] gagal membuat session:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: "Server sedang tidak dapat menyimpan session." },
      { status: 503 }
    );
  }

  cookies().set(SESSION_COOKIE, token, sessionCookieOptions());
  await purgeExpiredSessions();
  return NextResponse.json({ ok: true });
}
