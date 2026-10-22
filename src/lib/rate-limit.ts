/**
 * Rate limiter in-memory berbasis IP untuk endpoint login admin.
 *
 * Batas: MAX_ATTEMPTS percobaan gagal dalam WINDOW_MS milidetik per IP.
 * Setelah batas terlampaui, semua percobaan ditolak dengan 429 sampai
 * jendela waktu bergulir habis.
 *
 * Ini adalah solusi pragmatis untuk single-instance. Bila aplikasi dijalankan
 * multi-instance (cluster / Kubernetes), ganti dengan Redis-based counter.
 */

const MAX_ATTEMPTS = 10;       // percobaan gagal sebelum diblokir
const WINDOW_MS   = 15 * 60 * 1000; // 15 menit

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

/** Bersihkan entri yang sudah kedaluwarsa supaya Map tidak tumbuh selamanya. */
function purge(): void {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.resetAt <= now) store.delete(key);
  });
}

/**
 * Periksa apakah `ip` sudah melebihi batas percobaan.
 * Mengembalikan `{ allowed: true }` bila masih diizinkan,
 * atau `{ allowed: false, retryAfterSec: number }` bila diblokir.
 */
export function checkRateLimit(
  ip: string
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    // Jendela baru — biarkan lewat, catat percobaan pertama
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true };
}

/**
 * Catat satu percobaan gagal dari `ip`.
 * Dipanggil HANYA setelah percobaan login yang ditolak karena password salah.
 */
export function recordFailedAttempt(ip: string): void {
  // Bersihkan sesekali agar Map tidak membesar tidak terbatas
  if (store.size > 500) purge();

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

/**
 * Hapus catatan percobaan gagal setelah login berhasil.
 * Mencegah akun admin yang sah terkunci setelah salah beberapa kali.
 */
export function resetAttempts(ip: string): void {
  store.delete(ip);
}

/**
 * Rate limiter generik untuk endpoint publik (misalnya: pembuatan donasi).
 * Membatasi jumlah request per identitas (IP + prefix endpoint) dalam jendela waktu tertentu.
 */
const publicStore = new Map<string, Entry>();

function purgePublic(): void {
  const now = Date.now();
  Array.from(publicStore.entries()).forEach(([key, entry]) => {
    if (entry.resetAt <= now) publicStore.delete(key);
  });
}

export function checkPublicRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 10 * 60 * 1000 // default 10 menit
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  if (publicStore.size > 1000) purgePublic();

  const now = Date.now();
  const entry = publicStore.get(identifier);

  if (!entry || entry.resetAt <= now) {
    publicStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true };
}

/**
 * Ekstraksi IP klien secara aman dari header HTTP request.
 */
export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();
  return "127.0.0.1";
}
