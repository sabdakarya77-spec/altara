import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Penyimpanan media.
 *
 * OQ-2 (ROADMAP): untuk tahap sekarang **folder disk** di dalam volume Docker
 * sudah cukup — hanya ada 1 editor dan volume imagenya kecil. Driver MinIO
 * (S3-compatible) baru relevan bila:
 *   - aplikasi dijalankan multi-instance (butuh shared storage), atau
 *   - backup media dipisah dari backup container, atau
 *   - traffic upload naik signifikan.
 *
 * Semua akses ke folder ini lewat modul ini, jadi pindah ke MinIO nanti cukup
 * mengganti isi `saveFile()` — tidak ada perubahan di pemanggil.
 */

export const UPLOAD_DIR = process.env.ALTARA_UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");

/** Prefix URL publik untuk berkas yang diunggah. */
export const UPLOAD_URL_PREFIX = "/uploads";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(MIME_EXT);

/**
 * Nama berkas aman: UUID + ekstensi. Nama asli dari klien tidak pernah
 * dipakai sebagai path, sehingga tidak ada path traversal.
 */
function safeFileName(originalName: string, mimeType: string): string {
  const ext = MIME_EXT[mimeType] ?? "bin";
  const base = path
    .basename(originalName)
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const stamp = base ? `${base}-` : "";
  return `${stamp}${randomUUID()}.${ext}`;
}

/**
 * Simpan berkas ke disk. Mengembalikan URL publiknya.
 * `buffer` = isi berkas; `mimeType` menentukan ekstensi.
 */
export async function saveFile(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error(`Tipe berkas tidak didukung: ${mimeType}`);
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const fileName = safeFileName(originalName, mimeType);
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);
  return `${UPLOAD_URL_PREFIX}/${fileName}`;
}

/**
 * Hapus berkas yang sebelumnya tersimpan dari disk.
 * Path traversal dicegah: hasil `path.resolve` harus tetap di dalam UPLOAD_DIR.
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  if (!publicUrl.startsWith(`${UPLOAD_URL_PREFIX}/`)) return;
  const fileName = path.basename(publicUrl);
  const target = path.resolve(UPLOAD_DIR, fileName);
  const root = path.resolve(UPLOAD_DIR);
  if (!target.startsWith(root + path.sep)) return;
  try {
    await unlink(target);
  } catch {
    /* berkas sudah hilang — abaikan */
  }
}
