import { Pool, type QueryResultRow } from "pg";
import fs from "node:fs";

/**
 * Pool Postgres untuk ALTARA.
 *
 * `DATABASE_URL` diambil dari environment. Bila tidak diset — atau koneksi
 * gagal — `isDatabaseAvailable()` mengembalikan false dan aplikasi jatuh ke
 * fallback statis `src/data/content.ts` supaya situs tetap tampil.
 */

const globalForDb = globalThis as unknown as { altaraPool?: Pool };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getSslConfig() {
  if (process.env.DATABASE_SSL !== "true") return undefined;

  let ca: string | undefined = undefined;
  if (process.env.DATABASE_CA_CERT) {
    ca = process.env.DATABASE_CA_CERT;
  } else if (process.env.DATABASE_CA_PATH) {
    try {
      ca = fs.readFileSync(process.env.DATABASE_CA_PATH, "utf-8");
    } catch (e) {
      console.error("[db] Gagal membaca DATABASE_CA_PATH:", (e as Error).message);
    }
  }

  // Jika sertifikat CA terdefinisi, aktifkan verifikasi TLS secara default
  const rejectUnauthorized = ca
    ? process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false"
    : process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";

  return {
    rejectUnauthorized,
    ...(ca ? { ca } : {}),
  };
}

function createPool(): Pool | null {
  if (!isDatabaseConfigured()) return null;
  if (globalForDb.altaraPool) return globalForDb.altaraPool;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: getSslConfig(),
  });

  // Jangan biarkan error pool menggagalkan proses: pemanggil sudah
  // dibungkus try/catch dan punya fallback.
  pool.on("error", (err) => {
    console.error("[db] pool error:", err.message);
  });

  globalForDb.altaraPool = pool; // cache tanpa syarat — production maupun development
  return pool;
}

export function getPool(): Pool | null {
  return createPool();
}

/**
 * Jalankan query. Melempar error bila database tidak dikonfigurasi atau
 * koneksi gagal — pemanggil yang memutuskan fallback.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");
  const result = await pool.query<T>(text, params as never[]);
  return result.rows;
}

/**
 * Jalankan query dan kembalikan `null` bila database tidak bisa dijangkau.
 *
 * `null` berarti "tidak ada jawaban", bukan "hasilnya kosong". Pemanggil
 * bisa membedakan:
 *   - `null`  -> database tidak tersedia, pakai fallback statis
 *   - `[]`    -> database hidup tapi tabel memang kosong, jangan pakai fallback
 *
 * Pemisahan ini penting: tanpa itu, tabel yang sengaja dikosongkan lewat
 * panel admin (mis. semua mitra di-unpublish) akan diam-diam menampilkan
 * konten statis bawaan.
 */
export async function queryMaybe<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[] | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }
  try {
    return (await query<T>(text, params)) as T[];
  } catch (err) {
    console.error("[db] query gagal, memakai fallback:", (err as Error).message);
    return null;
  }
}
