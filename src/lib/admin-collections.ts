/**
 * Definisi koleksi admin: nama tabel dan kolom yang boleh ditulis.
 *
 * Dipisah dari `src/app/api/admin/[key]/route.ts` karena berkas route pada
 * App Router hanya boleh mengekspor HTTP method (GET/POST/PATCH/DELETE) dan
 * segudang konfigurasi route. Daftar koleksi dan daftar kolom ditulis
 * satu kali supaya tidak ada risiko dua daftar yang berbeda.
 */

export type Collection =
  | "hero_slides"
  | "campaigns"
  | "donations"
  | "programs"
  | "stories"
  | "stats"
  | "journal"
  | "documents"
  | "partners";

export const COLLECTIONS: Collection[] = [
  "hero_slides",
  "campaigns",
  "donations",
  "programs",
  "stories",
  "stats",
  "journal",
  "documents",
  "partners",
];

/**
 * Peta kolom per koleksi. `slug` dipakai sebagai kunci unik yang di-generate
 * dari judul bila tidak diberikan.
 */
export const TABLE_BY_COLLECTION: Record<Collection, string> = {
  hero_slides: "hero_slides",
  campaigns: "campaigns",
  donations: "donations",
  programs: "programs",
  stories: "stories",
  stats: "stats",
  journal: "journal_posts",
  documents: "documents",
  partners: "partners",
};

/**
 * Kolom yang boleh ditulis langsung dari body request.
 * Sisanya (id, created_at, updated_at, collected_amount, donor_count) dikelola server.
 */
export const WRITABLE: Record<Collection, string[]> = {
  hero_slides: [
    "headline",
    "caption",
    "location",
    "image_url",
    "alt",
    "object_position",
    "ken_burns",
    "sort_order",
    "published",
  ],
  campaigns: [
    "title",
    "slug",
    "category",
    "short_desc",
    "description",
    "image_url",
    "target_amount",
    "is_placeholder",
    "start_date",
    "end_date",
    "published",
    "featured",
    "sort_order",
  ],
  donations: ["status", "payment_method", "message"],
  programs: ["idx", "title", "slug", "description", "image", "alt", "published", "sort_order"],
  stories: ["category", "title", "slug", "description", "image", "alt", "published", "sort_order"],
  stats: ["idx", "value", "label", "sort_order", "is_placeholder"],
  journal: [
    "category", "title", "slug", "excerpt", "body",
    "cover_image", "alt", "published_at", "published", "sort_order",
  ],
  documents: ["title", "meta", "file_url", "published", "sort_order"],
  partners: ["name", "logo_url", "published", "sort_order"],
};

/** Apakah `value` adalah kunci koleksi yang dikenal? */
export function isCollection(value: string): value is Collection {
  return (COLLECTIONS as string[]).includes(value);
}
