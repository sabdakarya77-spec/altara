# ALTARA — Yayasan Abdi Laksata Raya

Situs resmi Yayasan Abdi Laksata Raya (ALTARA): landing page satu halaman untuk
publik, ditambah panel admin sederhana untuk mengelola konten.

- **Badan hukum:** Yayasan Abdi Laksata Raya
- **Tagline:** Manunggaling Kawulane Gusti
- **Bahasa:** Indonesia (`id`)
- **Didirikan:** 2016

## Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 14.2.35 (App Router) |
| UI | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS 3.4 + token kustom di `tailwind.config.ts` |
| Font | Cormorant Garamond (display) + Inter (body), dimuat via Google Fonts |
| Package manager | pnpm 10 |
| Node | 20+ (teruji pada v22) |

## Menjalankan

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # build produksi
pnpm start    # jalankan hasil build
pnpm lint     # eslint (next/core-web-vitals)
pnpm typecheck # tsc --noEmit
```

## Menjalankan dengan Database (Fase 1–3)

Panel admin memakai PostgreSQL. Untuk pengembangan lokal:

```bash
# 1. Jalankan Postgres (butuh Docker)
docker compose up -d db

# 2. Siapkan environment
cp .env.example .env.local
#   isi minimal: DATABASE_URL, ALTARA_ADMIN_PASSWORD

# 3. Buat skema + isi data awal
pnpm db:migrate
pnpm db:seed

# 4. Jalankan situs
pnpm dev
```

Buka `http://localhost:3000/admin`, masuk dengan password dari
`ALTARA_ADMIN_PASSWORD`.

| Perintah | Fungsi |
| --- | --- |
| `pnpm db:migrate` | Menjalankan seluruh file di `db/migrations/` (idempoten) |
| `pnpm db:seed` | Menjalankan migrasi lalu mengisi data dari `src/data/content.ts` |

`db:seed` bersifat idempoten dan **insert-only**: entri yang sudah ada
(dicocokkan lewat slug/nama) dilewati, bukan ditimpa; entri yang sudah diedit
di panel admin tidak berubah; dan baris lama yang tidak ada lagi di seed tidak
dihapus. Kalau butuh mengembalikan isi ke kondisi awal, jalankan ulang pada
database yang dikosongkan.

### Environment

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | ya | Connection string Postgres |
| `DATABASE_SSL` | tidak | `true` untuk provider terkelola (Neon, Supabase, RDS) |
| `DATABASE_POOL_MAX` | tidak | Jumlah koneksi maksimal pool (default 10) |
| `ALTARA_ADMIN_PASSWORD` | ya | Password administrator tunggal |
| `ALTARA_UPLOAD_DIR` | tidak | Folder upload (default `<project>/data/uploads`) |
| `NEXT_PUBLIC_SITE_URL` | tidak | URL kanonik untuk metadata & sitemap |

> **Penting:** ganti `ALTARA_ADMIN_PASSWORD` sebelum produksi. Password
> dibandingkan dengan constant-time, dan hanya hash SHA-256 dari token
> session yang disimpan di tabel `sessions` — token mentah tidak pernah
> menyentuh database.
>
> Cookie session memakai flag `Secure` hanya bila request-nya benar-benar HTTPS
> (dibaca dari `x-forwarded-proto` / host). Jadi `pnpm start` di
> `http://localhost` tetap bisa login, sementara produksi di belakang reverse
> proxy TLS tetap aman.

## Deployment (Docker)

Target deployment adalah **container**. VM/host Proxmox hanya tempat
menjalankan Docker — bukan syarat arsitektur, karena seluruh stack sudah
berada di `docker-compose.yml`.

```bash
# 1. Siapkan environment
cp .env.example .env
#   isi minimal: ALTARA_ADMIN_PASSWORD, POSTGRES_PASSWORD, CADDY_DOMAIN

# 2. Build image & jalankan stack
docker compose up -d --build

# 3. Migrasi skema + seed (job sekali jalan)
docker compose run --rm migrate

# 4. Pantau
docker compose logs -f app
```

| Service | Port host | Keterangan |
| --- | --- | --- |
| `caddy` | 80, 443 | Satu-satunya yang publish ke publik; TLS otomatis Let's Encrypt |
| `app` | — (internal 3000) | Next.js `output: "standalone"`, tidak terjangkau dari luar |
| `db` | 127.0.0.1:5432 | Loopback saja; dari network compose lewat `db:5432` |
| `migrate` | — | Job sekali jalan, tidak auto-restart |

Volume: `altara-db-data` (data Postgres), `altara-uploads` (media),
`altara-caddy-data` + `altara-caddy-config` (sertifikat & config Caddy).
Volume sertifikat **wajib** persisten — hilang tiap restart memicu rate
limit Let's Encrypt.

Env tambahan khusus compose ada di `.env.example`: `POSTGRES_PASSWORD`,
`CADDY_DOMAIN`, `ACME_EMAIL`, `ACME_CA`.

> **Penting:** `ALTARA_ADMIN_PASSWORD` yang kosong membuat seluruh percobaan
> login ditolak (fail closed) — aplikasi menolak, bukan meloloskan akses.

### Health check

| Endpoint | Arti | Status |
| --- | --- | --- |
| `/api/health` | Liveness — proses Next.js hidup | 200 selama proses hidup, bahkan saat DB mati |
| `/api/ready` | Readiness — database bisa dijangkau | 200 saat DB hidup, 503 bila tidak |

Caddy memakai `/api/health` sebagai `health_uri` — jangan menggantinya dengan
`/api/ready`, karena saat database down sementara Caddy akan langsung menolak semua
request, padahal situs masih bisa menyajikan fallback statis.

## Struktur

```
src/
  app/
    layout.tsx        # metadata, favicon (/icon.png), link Google Fonts
    page.tsx          # komposisi landing page
    globals.css       # utility komponen (.shell, .eyebrow, .reveal, .hairline, ...)
    admin/
      page.tsx        # panel admin — merender AdminDashboard
      admin-dashboard.tsx  # shell: sidebar, header, state CRUD
      admin-entry-table.tsx# tabel daftar entri per koleksi
      admin-entry-dialog.tsx# modal tambah / ubah
      admin-entry-form.tsx  # form per-field + konversi tipe
      admin-image-field.tsx # unggah & pratinjau gambar
      fields.ts        # definisi kolom tiap koleksi (sumber tunggal)
      login/           # halaman + form login
    api/admin/
      login/route.ts  # POST — buat session, set cookie
      logout/route.ts # POST — cabut session
      session/route.ts# GET  — cek session aktif
      upload/route.ts # POST — unggah gambar (validasi + sharp)
      [key]/route.ts  # GET/POST/PATCH/DELETE CRUD koleksi
    health/route.ts   # GET  — liveness (selalu 200 selama proses hidup)
    ready/route.ts    # GET  — readiness (503 bila database mati)
    uploads/[...path]/route.ts  # menyajikan berkas hasil upload
  components/site/
    Navbar.tsx        # header fixed + menu seluler
    Hero.tsx          # hero image + CTA
    Sections.tsx      # Intro, AboutFoundation, ProgramList
    Impact.tsx        # ImpactStats, StoryFeature, StoryGrid, JournalSection
    Closing.tsx       # FounderMessage, Transparency, Partners, SupportCTA, Footer
    primitives.tsx    # Reveal, SectionHeader, Emblem, Lockup, useReveal
  data/content.ts     # konten statis (fallback bila database tidak tersedia)
  lib/
    db.ts             # connection pool + helper query (`queryMaybe`)
    queries.ts        # query baca konten publik + fallback ke content.ts
    auth.ts           # session admin (hash SHA-256, constant-time compare)
    admin-collections.ts # daftar koleksi + kolom yang boleh ditulis
    image.ts          # optimasi sharp (resize 1920px, WebP)
    storage.ts        # simpan/hapus berkas upload di luar public/
    slug.ts           # slug unik
db/
  migrations/001_init.sql  # skema: programs, stories, stats, journal_posts,
                           #   documents, partners, sessions, settings
scripts/
  migrate.ts          # pnpm db:migrate
  seed.ts             # pnpm db:seed
Dockerfile            # multi-stage: deps -> builder -> migrator -> runner
Caddyfile             # reverse proxy + TLS otomatis
docker-compose.yml    # 4 service: db, app, caddy, migrate
next.config.mjs       # output: "standalone" + external packages
.npmrc                # node-linker=hoisted (wajib untuk standalone)
public/
  icon.png            # favicon
  assets/             # foto program, cerita, jurnal, logo
docs/
  MASTERPLAN_ALTARA.md # SSOT apa yang ada sekarang
  ROADMAP.md           # rencana fase berikutnya
  archive/             # versi dokumen lama (arsip)
```

## Halaman

- `/` — Beranda: hero, tentang, 4 program, dampak, cerita, jurnal, pesan pendiri,
  transparansi, mitra, CTA dukungan, footer. Konten dibaca dari Postgres;
  bila database tidak tersedia, situs otomatis memakai fallback dari
  `src/data/content.ts`. Bila database hidup tetapi tabelnya sengaja dikosongkan,
  tabel kosong itu yang ditampilkan - konten statis tidak muncul diam-diam.
- `/admin/login` — Login admin (password tunggal dari `ALTARA_ADMIN_PASSWORD`).
- `/admin` — Panel admin: sidebar koleksi (Statistik Dampak, Program, Cerita
  Dampak, Jurnal, Dokumen Publik, Mitra & Pendukung), tabel entri, dan modal
  tambah/ubah. Semua operasi lewat `/api/admin/*` yang memvalidasi session di
  server; setiap penyimpanan memicu revalidasi halaman publik.
- `/uploads/<berkas>` — Berkas gambar hasil unggahan (disajikan di luar
  `public/` dengan proteksi path traversal dan cache immutable).
## Dokumentasi

| Berkas | Isi |
| --- | --- |
| [`docs/MASTERPLAN_ALTARA.md`](docs/MASTERPLAN_ALTARA.md) | SSOT apa yang ada sekarang: token, stack, struktur, anchor, data, admin |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Rencana fase berikutnya, open questions, dan risiko |
| `docs/archive/` | Versi dokumen lama (arsip, jangan dipakai sebagai acuan) |

> Kalau kode dan `MASTERPLAN_ALTARA.md` berbeda, yang benar adalah kode — perbarui dokumen di commit yang sama.

## Design Tokens

Token warna, font, dan radius terpusat di `tailwind.config.ts` dan
`src/app/globals.css`:

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `ivory` | `#F5F2EC` | latar utama, CTA terang |
| `parchment` | `#FAF8F2` | kartu, panel, admin shell |
| `ink` | `#171717` | teks utama, navbar solid |
| `muted` | `#6F6B64` | teks sekunder |
| `line` | `#DCD5C4` | garis pemisah |
| `forest` | `#1E3A2B` | aksen hijau tua |
| `moss` | `#2C4A38` | aksen hijau |
| `gold` | `#A98F56` | aksen emas |
| `goldsoft` | `#C9B88A` | aksen emas muda |

Kelas komponen utility: `.shell` (container max 90rem), `.eyebrow` (label kecil
letter-spacing tinggi), `.hairline` (garis atas tipis), `.reveal` / `.image-reveal`
(animasi masuk berbasis IntersectionObserver, menghormati
`prefers-reduced-motion`).

## Catatan Pengembang

- Semua navigasi publik berupa anchor (`#tentang`, `#program`, `#dampak`, dan
  seterusnya) dalam satu halaman; belum ada route terpisah per halaman.
- Panel admin sudah memakai autentikasi (password tunggal + session cookie)
  dan endpoint server berbasis database — bukan lagi state di browser.
- Animasi memakai CSS murni tanpa library animasi eksternal.
- Font dimuat lewat `<link>` Google Fonts di `layout.tsx`, bukan `next/font`.
- `next.config.mjs` memakai `output: "standalone"` untuk image container
  yang kecil, dengan `pg` dan `sharp` ditandai external. Pada Next 14.2 key
  `experimental.outputFileTracingRoot` dan
  `experimental.serverComponentsExternalPackages` **wajib** berada di dalam
  `experimental`.
- `.npmrc` memuat `node-linker=hoisted` — wajib, karena build standalone
  gagal dengan `EPERM ... symlink` bila Next menelusuri symlink
  `node_modules` milik pnpm.
- Angka dampak (`42.508 Jiwa`, `38 Program`, `34 Kota`, `92%`) di
  `src/data/content.ts` masih placeholder desain dan wajib diganti dengan angka
  asli sebelum situs tayang.
