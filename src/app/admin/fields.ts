/**
 * Konfigurasi kolom untuk tiap koleksi yang dikelola di panel admin.
 *
 * Dipakai bersama oleh komponen form dan tabel agar definisi kolom hanya
 * ada di satu tempat. Nama kolom di sini persis sama dengan nama kolom di
 * Postgres (snake_case) — endpoint CRUD memfilter body berdasarkan daftar
 * ini, jadi kolom yang tidak disebut di sini tidak akan pernah bisa ditulis.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "image"
  | "date"
  | "select";

export type Field = {
  /** Nama kolom di database. */
  column: string;
  /** Label yang tampil di form. */
  label: string;
  type: FieldType;
  /** Opsi untuk tipe `select`. */
  options?: string[];
  /** Tampilkan kolom ini di tabel daftar. */
  inTable?: boolean;
  /** Tidak boleh kosong saat disimpan. */
  required?: boolean;
  /** Baris baru di dalam textarea. */
  rows?: number;
  /** Teks bantuan kecil di bawah input. */
  hint?: string;
};

export type CollectionConfig = {
  key: string;
  label: string;
  /** Judul kolom pertama di tabel. */
  titleColumn: string;
  fields: Field[];
};

export const COLLECTIONS: CollectionConfig[] = [
  {
    key: "hero_slides",
    label: "Hero Slider",
    titleColumn: "headline",
    fields: [
      { column: "image_url", label: "Foto Slide", type: "image", inTable: true, required: true },
      { column: "headline", label: "Judul Slide", type: "textarea", rows: 2, inTable: true, required: true },
      { column: "caption", label: "Keterangan (Caption)", type: "textarea", rows: 3 },
      { column: "location", label: "Lokasi", type: "text", inTable: true, hint: "Contoh: Jawa Tengah, Yogyakarta" },
      { column: "alt", label: "Deskripsi Foto (Alt)", type: "text", hint: "Deskripsi foto untuk aksesibilitas pembaca layar" },
      {
        column: "object_position",
        label: "Posisi Fokus Foto",
        type: "select",
        options: ["center 35%", "center top", "center 40%", "center 30%", "center 45%", "center center", "top center", "bottom center"],
        hint: "Menentukan titik fokus foto agar tidak terpotong canggung saat di-crop",
      },
      {
        column: "ken_burns",
        label: "Efek Animasi (Ken Burns)",
        type: "select",
        options: ["zoom-in", "zoom-out", "pan-left", "pan-right", "zoom-in-slow"],
        hint: "Gaya gerakan sinematik yang berjalan perlahan pada slide ini",
      },
      { column: "published", label: "Aktif", type: "boolean", inTable: true },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "stats",
    label: "Statistik Dampak",
    titleColumn: "label",
    fields: [
      { column: "idx", label: "Nomor", type: "text", inTable: true, required: true },
      { column: "value", label: "Angka", type: "text", inTable: true, required: true },
      { column: "label", label: "Keterangan", type: "text", inTable: true, required: true },
      {
        column: "is_placeholder",
        label: "Masih data contoh",
        type: "boolean",
        hint: "Centang selama angka belum diverifikasi owner. Bila sudah terverifikasi, tampilannya berbeda di situs.",
      },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "programs",
    label: "Program",
    titleColumn: "title",
    fields: [
      { column: "idx", label: "Nomor", type: "text", inTable: true },
      { column: "title", label: "Judul", type: "text", inTable: true, required: true },
      { column: "description", label: "Deskripsi", type: "textarea", rows: 4 },
      { column: "image", label: "Gambar", type: "image" },
      { column: "alt", label: "Teks alternatif gambar", type: "text", hint: "Deskripsi gambar untuk pembaca layar." },
      { column: "published", label: "Terbit", type: "boolean", inTable: true },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "stories",
    label: "Cerita Dampak",
    titleColumn: "title",
    fields: [
      { column: "category", label: "Kategori", type: "text", inTable: true },
      { column: "title", label: "Judul", type: "text", inTable: true, required: true },
      { column: "description", label: "Deskripsi", type: "textarea", rows: 4 },
      { column: "image", label: "Gambar", type: "image" },
      { column: "alt", label: "Teks alternatif gambar", type: "text" },
      { column: "published", label: "Terbit", type: "boolean", inTable: true },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "journal",
    label: "Jurnal",
    titleColumn: "title",
    fields: [
      { column: "category", label: "Kategori", type: "text", inTable: true },
      { column: "title", label: "Judul", type: "text", inTable: true, required: true },
      { column: "excerpt", label: "Ringkasan", type: "textarea", rows: 3 },
      { column: "body", label: "Isi artikel", type: "textarea", rows: 10 },
      { column: "cover_image", label: "Gambar sampul", type: "image" },
      { column: "alt", label: "Teks alternatif gambar", type: "text" },
      { column: "published_at", label: "Tanggal terbit", type: "date", inTable: true },
      { column: "published", label: "Terbit", type: "boolean", inTable: true },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "documents",
    label: "Dokumen Publik",
    titleColumn: "title",
    fields: [
      { column: "title", label: "Judul dokumen", type: "text", inTable: true, required: true },
      { column: "meta", label: "Keterangan", type: "text", inTable: true, hint: "Contoh: PDF · 4,2 MB" },
      { column: "file_url", label: "Tautan berkas", type: "text" },
      { column: "published", label: "Terbit", type: "boolean", inTable: true },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "partners",
    label: "Mitra & Pendukung",
    titleColumn: "name",
    fields: [
      { column: "name", label: "Nama mitra", type: "text", inTable: true, required: true },
      { column: "logo_url", label: "Logo", type: "image" },
      { column: "published", label: "Tampilkan", type: "boolean", inTable: true },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "settings",
    label: "Pengaturan Yayasan",
    titleColumn: "key",
    fields: [],
  },
];

/** Ubah nilai timestamptz dari database menjadi format input `date`. */
export function toDateInput(value: unknown): string {
  if (!value) return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
