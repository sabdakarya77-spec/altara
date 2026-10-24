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
  /** Kolom hanya baca (tampil tapi tidak dapat diedit dan tidak dikirim ke server). */
  readOnly?: boolean;
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
    key: "overview",
    label: "Ringkasan",
    titleColumn: "title",
    fields: [],
  },
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
    key: "campaigns",
    label: "Program Donasi",
    titleColumn: "title",
    fields: [
      { column: "title", label: "Judul Program", type: "text", inTable: true, required: true },
      {
        column: "category",
        label: "Kategori",
        type: "select",
        options: ["Pendidikan", "Kesehatan", "Kemanusiaan", "Lingkungan", "Umum"],
        inTable: true,
        required: true,
      },
      { column: "target_amount", label: "Target Donasi (Rp)", type: "number", inTable: true, hint: "Nominal angka tanpa titik (0 untuk donasi terbuka)." },
      {
        column: "collected_amount",
        label: "Dana Terkumpul (Rp)",
        type: "number",
        inTable: true,
        readOnly: true,
        hint: "Dihitung otomatis oleh sistem dari donasi terverifikasi (settlement).",
      },
      {
        column: "donor_count",
        label: "Jumlah Donatur",
        type: "number",
        inTable: true,
        readOnly: true,
        hint: "Dihitung otomatis oleh sistem dari donasi terverifikasi (settlement).",
      },
      {
        column: "is_placeholder",
        label: "Program Simulasi / Contoh",
        type: "boolean",
        inTable: true,
        hint: "Centang jika program ini masih data contoh/simulasi desain agar muncul tanda 'Simulasi'.",
      },
      { column: "image_url", label: "Foto Kampanye", type: "image", inTable: true },
      { column: "short_desc", label: "Ringkasan Singkat", type: "textarea", rows: 2, required: true },
      { column: "description", label: "Deskripsi Lengkap", type: "textarea", rows: 6, required: true },
      { column: "featured", label: "Sorotan Utama", type: "boolean", inTable: true },
      { column: "published", label: "Terbit", type: "boolean", inTable: true },
      { column: "sort_order", label: "Urutan", type: "number", inTable: true },
    ],
  },
  {
    key: "donations",
    label: "Donasi Masuk",
    titleColumn: "order_id",
    fields: [
      { column: "order_id", label: "Kode Referensi", type: "text", inTable: true, readOnly: true },
      { column: "campaign_title", label: "Program Kampanye", type: "text", inTable: true, readOnly: true },
      { column: "donor_name", label: "Nama Donatur", type: "text", inTable: true, readOnly: true },
      { column: "amount", label: "Nominal (Rp)", type: "number", inTable: true, readOnly: true },
      {
        column: "status",
        label: "Status Donasi",
        type: "select",
        options: ["pending", "settlement", "cancel", "expire"],
        inTable: true,
        required: true,
        hint: "Ubah ke 'settlement' setelah transfer diverifikasi di mutasi bank. Sistem akan otomatis menambahkan saldo & donatur kampanye.",
      },
      { column: "donor_email", label: "Email Donatur", type: "text", inTable: true, readOnly: true },
      { column: "donor_phone", label: "No. HP / WA", type: "text", inTable: true, readOnly: true },
      { column: "is_anonymous", label: "Anonim", type: "boolean", inTable: true, readOnly: true },
      { column: "payment_method", label: "Metode Bayar", type: "text", readOnly: true },
      { column: "message", label: "Pesan / Doa Donatur", type: "textarea", rows: 3, readOnly: true },
      { column: "created_at", label: "Waktu Transaksi", type: "date", inTable: true, readOnly: true },
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
  {
    key: "audit_logs",
    label: "Log Aktivitas (Audit)",
    titleColumn: "action",
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
