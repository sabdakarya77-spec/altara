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
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login admin.
 *
 * Password tunggal dari `ALTARA_ADMIN_PASSWORD`. Bila password benar, session
 * dicatat di tabel `sessions` dan cookie berisi token acak (httpOnly) dikirim.
 * Respons deliberately sama untuk "password salah" dan "session gagal dibuat"
 * agar tidak membocorkan informasi apa pun.
 *
 * Rate limit: 10 percobaan gagal per IP per 15 menit.
 */
export async function POST(request: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────
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
    recordFailedAttempt(ip);
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

  resetAttempts(ip);
  const cookieStore = await cookies();
  const options = await sessionCookieOptions();
  cookieStore.set(SESSION_COOKIE, token, options);
  await purgeExpiredSessions();
  return NextResponse.json({ ok: true });
}
