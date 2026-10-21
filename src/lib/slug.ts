/**
 * Slug URL-aman untuk konten yang dikelola admin.
 * Menyeragamkan ejaan bahasa Indonesia: "Mengajar Anak" -> "mengajar-anak".
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/**
 * Slug unik berdasarkan judul: menambah suffix angka bila slug dasar sudah dipakai.
 * `existing` = daftar slug yang sudah ada di tabel.
 */
export function uniqueSlug(title: string, existing: string[]): string {
  const base = slugify(title) || "entri";
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
