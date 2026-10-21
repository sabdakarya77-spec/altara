import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { query } from "@/lib/db";

/**
 * Autentikasi admin (Fase 2 ROADMAP).
 *
 * Satu administrator, satu password dari environment variable.
 * Session: cookie `httpOnly` + `sameSite=lax` + `secure` (di produksi) berisi
 * token acak. Yang disimpan di tabel `sessions` hanyalah SHA-256 dari token —
 * token plaintext tidak pernah menyentuh database, dan password pun tidak
 * pernah disimpan di sana.
 */

export const SESSION_COOKIE = "altara_admin_session";
const SESSION_TTL_HOURS = 8;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Cocokkan password dengan password admin.
 * Perbandingan constant-time; return boolean.
 */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ALTARA_ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Tetap lakukan perbandingan dummy agar waktu respons tidak bocor.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Buat token session baru (random). */
export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/** Hash token untuk disimpan / dibandingkan. */
export function hashToken(token: string): string {
  return sha256(token);
}

/**
 * Apakah request ini datang lewat HTTPS?
 *
 * Cookie session memakai flag `Secure` hanya di koneksi aman. Kalau flag itu
 * selalu dipasang di produksi, login di `http://localhost` (mis. `pnpm start`
 * tanpa reverse proxy TLS) akan "sukses" tapi cookie-nya tidak pernah dikirim
 * browser — gejalanya: panel admin selalu memantul balik ke halaman login.
 */
function isSecureRequest(): boolean {
  const h = headers();
  const proto = h.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  if (h.get("x-forwarded-ssl") === "on") return true;
  // Tanpa proxy, andalkan skema yang dilihat server.
  const host = h.get("host") ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]")) {
    return false;
  }
  return process.env.NODE_ENV === "production";
}

/** Set cookie session di respons. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecureRequest(),
    path: "/",
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  };
}

/**
 * Daftarkan session baru di database. Mengembalikan hash token.
 * Melempar error bila database tidak tersedia.
 */
export async function createSession(token: string): Promise<string> {
  const hash = hashToken(token);
  await query(
    `INSERT INTO sessions (token_hash, expires_at)
     VALUES ($1, now() + ($2 || ' hours')::interval)`,
    [hash, String(SESSION_TTL_HOURS)]
  );
  return hash;
}

/** Cabut session (logout). Aman dipanggil bila token sudah tidak ada. */
export async function revokeSession(token: string): Promise<void> {
  await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}

/**
 * Buang session yang sudah kedaluwarsa.
 *
 * Dipanggil sesaat setelah login berhasil supaya tabel `sessions` tidak
 * menumpuk baris mati. Aman dipanggil berulang kali.
 */
export async function purgeExpiredSessions(): Promise<void> {
  try {
    await query("DELETE FROM sessions WHERE expires_at <= now()", []);
  } catch (err) {
    // Kebersihan housekeeping: kegagalan tidak boleh menggagalkan login.
    console.error("[auth] gagal membersihkan session kedaluwarsa:", (err as Error).message);
  }
}

/**
 * Ambil hash session aktif dari cookie request.
 * Mengembalikan null bila tidak ada cookie.
 */
export function getSessionHashFromCookies(): string | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return hashToken(token);
}

/**
 * Apakah session dengan hash ini valid (ada di database dan belum kedaluwarsa)?
 * Bila database tidak bisa dijangkau, return false — fail closed.
 */
export async function isSessionValid(hash: string | null): Promise<boolean> {
  if (!hash) return false;
  try {
    const rows = await query<{ token_hash: string }>(
      "SELECT token_hash FROM sessions WHERE token_hash = $1 AND expires_at > now()",
      [hash]
    );
    return rows.length > 0;
  } catch (err) {
    console.error("[auth] cek session gagal:", (err as Error).message);
    return false;
  }
}
