/**
 * Seed database ALTARA.
 *
 * Memindahkan seluruh konten dari `src/data/content.ts` ke Postgres.
 * Idempoten dan **insert-only**: entri yang sudah ada dicocokkan lewat
 * slug / nama lalu **dilewati**, bukan ditimpa. Baris lama yang tidak ada
 * lagi di seed juga tidak dihapus. Dengan begitu pengeditan lewat panel admin
 * tidak hilang karena `pnpm db:seed` dijalankan ulang.
 *
 * Jalankan: `pnpm db:seed`
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  documents as seedDocuments,
  journal as seedJournal,
  partners as seedPartners,
  programs as seedPrograms,
  stats as seedStats,
  stories as seedStories,
} from "../src/data/content";

const seedHeroSlides = [
  {
    image_url: "/assets/hero.jpg",
    alt: "Seorang guru mendampingi anak-anak membaca di ruang kelas sederhana di sebuah desa",
    location: "Jawa Tengah",
    headline: "Manunggaling\nKawulane Gusti",
    caption: "Mendampingi setiap langkah menuju masa depan yang bermartabat",
    ken_burns: "zoom-in",
    object_position: "center 35%",
  },
  {
    image_url: "/assets/story-feature.jpg",
    alt: "Perempuan penerima manfaat program pemberdayaan ALTARA tersenyum di depan rumahnya",
    location: "Yogyakarta",
    headline: "Satu Keluarga,\nSatu Harapan",
    caption: "Pemberdayaan dimulai dari kepercayaan yang kita bangun bersama",
    ken_burns: "pan-left",
    object_position: "center top",
  },
  {
    image_url: "/assets/program-education.jpg",
    alt: "Anak-anak mengikuti program pendidikan komunitas ALTARA",
    location: "Jawa Timur",
    headline: "Pendidikan\nUntuk Semua",
    caption: "Akses pendidikan yang setara sebagai fondasi perubahan nyata",
    ken_burns: "zoom-out",
    object_position: "center 40%",
  },
  {
    image_url: "/assets/about.jpg",
    alt: "Komunitas masyarakat berkumpul bersama relawan ALTARA",
    location: "Nusantara",
    headline: "Bersama\nKita Tumbuh",
    caption: "Dari pelosok desa hingga kota, kami hadir mendampingi",
    ken_burns: "pan-right",
    object_position: "center 30%",
  },
  {
    image_url: "/assets/program-empowerment.jpg",
    alt: "Peserta program pemberdayaan ekonomi ALTARA menampilkan hasil karyanya",
    location: "Jawa Barat",
    headline: "Mandiri\nBerdaya Bangsa",
    caption: "Keterampilan nyata yang membuka jalan menuju kemandirian",
    ken_burns: "zoom-in-slow",
    object_position: "center 45%",
  },
];

const seedSettings: Record<string, string> = {
  contact_whatsapp: "",
  contact_email: "halo@altara.or.id",
  office_address: "Jakarta · Yogyakarta · Kupang",
  bank_name: "",
  bank_account_no: "",
  bank_account_holder: "",
  social_instagram: "https://instagram.com/altara.or.id",
  social_youtube: "https://youtube.com/@altara",
  social_linkedin: "https://linkedin.com/company/altara",
};

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL belum diset.");
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

/** Jalankan semua file migrasi berurutan (lexikografis). */
async function runMigrations(client: Client) {
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`  -> migrasi ${file}`);
    await client.query(sql);
  }
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Terhubung ke database.");

  console.log("Menjalankan migrasi...");
  await runMigrations(client);

  console.log("Menyemai data...");

  // Programs
  for (let i = 0; i < seedPrograms.length; i++) {
    const p = seedPrograms[i];
    await client.query(
      `INSERT INTO programs (idx, title, slug, description, image, alt, published, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,true,$7)
       ON CONFLICT (slug) DO NOTHING`,
      [p.index, p.title, slug(p.title), p.description, p.image, p.alt, i]
    );
  }

  // Stories
  for (let i = 0; i < seedStories.length; i++) {
    const s = seedStories[i];
    await client.query(
      `INSERT INTO stories (category, title, slug, description, image, alt, published, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,true,$7)
       ON CONFLICT (slug) DO NOTHING`,
      [s.category, s.title, slug(s.title), s.description, s.image, s.alt, i]
    );
  }

  // Stats - ditandai sebagai placeholder (OQ-1 belum dijawab owner).
  for (let i = 0; i < seedStats.length; i++) {
    const s = seedStats[i];
    await client.query(
      `INSERT INTO stats (idx, value, label, sort_order, is_placeholder)
       VALUES ($1,$2,$3,$4,true)
       ON CONFLICT (idx) DO NOTHING`,
      [s.index, s.value, s.label, i]
    );
  }

  // Journal - tanggal seed diparsing dari format "12 Februari 2026".
  for (let i = 0; i < seedJournal.length; i++) {
    const j = seedJournal[i];
    await client.query(
      `INSERT INTO journal_posts (category, title, slug, excerpt, body, cover_image, alt, published_at, published, sort_order)
       VALUES ($1,$2,$3,$4,'',$5,$6,$7,true,$8)
       ON CONFLICT (slug) DO NOTHING`,
      [
        j.category, j.title, slug(j.title), j.excerpt, j.image, j.alt,
        parseDateId(j.date), i,
      ]
    );
  }

  // Documents
  for (let i = 0; i < seedDocuments.length; i++) {
    const d = seedDocuments[i];
    const existing = await client.query<{ id: number }>(
      "SELECT id FROM documents WHERE title = $1",
      [d.title]
    );
    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO documents (title, meta, file_url, published, sort_order)
         VALUES ($1,$2,'',true,$3)`,
        [d.title, d.meta, i]
      );
    }
    // Entri yang sudah ada dibiarkan apa adanya: file_url dan urutan hasil
    // edit panel admin tidak boleh ditimpa oleh seed.
  }

  // Partners
  for (let i = 0; i < seedPartners.length; i++) {
    const name = seedPartners[i];
    const existing = await client.query<{ id: number }>(
      "SELECT id FROM partners WHERE name = $1",
      [name]
    );
    if (existing.rows.length === 0) {
      await client.query(
        "INSERT INTO partners (name, logo_url, published, sort_order) VALUES ($1,'',true,$2)",
        [name, i]
      );
    }
  }

  // Hero Slides — insert-only jika headline belum ada
  for (let i = 0; i < seedHeroSlides.length; i++) {
    const hs = seedHeroSlides[i];
    const existing = await client.query<{ id: number }>(
      "SELECT id FROM hero_slides WHERE headline = $1",
      [hs.headline]
    );
    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO hero_slides (headline, caption, location, image_url, alt, object_position, ken_burns, sort_order, published)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)`,
        [hs.headline, hs.caption, hs.location, hs.image_url, hs.alt, hs.object_position, hs.ken_burns, i]
      );
    }
  }

  // Settings — insert-only bila key belum ada
  for (const [key, value] of Object.entries(seedSettings)) {
    await client.query(
      `INSERT INTO settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }

  console.log("Selesai.");
  await client.end();
}

/** Slug sederhana yang sama dengan `src/lib/slug.ts`. */
function slug(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

const MONTHS: Record<string, number> = {
  Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
  Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
};

/** Ubah "12 Februari 2026" -> ISO string. Return null bila gagal parse. */
function parseDateId(value: string): string | null {
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = MONTHS[parts[1]];
  const year = Number(parts[2]);
  if (!Number.isFinite(day) || month === undefined || !Number.isFinite(year)) return null;
  const d = new Date(Date.UTC(year, month, day));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

