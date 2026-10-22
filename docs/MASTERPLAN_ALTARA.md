# MASTERPLAN ALTARA — Foundations of the Current Build

> **Status:** FACTUAL — mirror of the code as of 2026-10-22.
> **Role:** SSOT for *what exists*. Planning lives in [`ROADMAP.md`](./ROADMAP.md).
> **Rule:** this file describes reality. If code and this file disagree, the code wins — fix this file in the same commit.

---

## 0. Identitas

| Item | Nilai |
| --- | --- |
| Badan hukum | Yayasan Abdi Laksata Raya (ALTARA) |
| Tagline | Manunggaling Kawulane Gusti |
| Bahasa | Indonesia (`id`) |
| Didirikan | 2016 |
| Domain | `altara.or.id` (`metadataBase` di `src/app/layout.tsx`) |
| Email | `halo@altara.or.id` |

Pilar program: **Pendidikan · Kemanusiaan · Kesehatan · Lingkungan** — direpresentasikan sebagai 4 kartu pada section `#program`.

---

## 1. Design Tokens (TERKUNCI — nilai asli, jangan diubah)

Sumber: `tailwind.config.ts` + `src/app/globals.css`.

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `ivory` | `#F5F2EC` | latar utama body dan section terang |
| `parchment` | `#FAF8F2` | kartu, panel, admin shell |
| `ink` | `#171717` | teks utama, navbar solid, **latar hero** |
| `muted` | `#6F6B64` | teks sekunder, eyebrow |
| `line` | `#DCD5C4` | garis pemisah |
| `forest` | `#1E3A2B` | aksen hijau tua (juga `::selection`) |
| `moss` | `#2C4A38` | aksen hijau |
| `gold` | `#A98F56` | aksen emas |
| `goldsoft` | `#C9B88A` | aksen emas muda |

**Latar hero = `ink` `#171717`** (near-black), bukan emerald. Panel admin memakai `bg-ivory` dengan sidebar `bg-parchment`.

Tipografi:
- Display: **Cormorant Garamond** (300/400/500) — H1, H2, H3, wordmark
- Body: **Inter** (300/400/500/600) — paragraf, nav, label
- Dimuat via `<link>` Google Fonts di `src/app/layout.tsx` (bukan `next/font`)

Utilities komponen (`globals.css`):

| Class | Perilaku |
| --- | --- |
| `.shell` | container `max-width: 90rem`, padding responsif 1.25/2.5/4rem |
| `.eyebrow` | 11px, weight 500, `letter-spacing: .22em`, uppercase, warna `muted` |
| `.body-lead` | ukuran fluid, line-height 1.75, warna `muted` |
| `.hairline` | border-top 1px `line` |
| `.display-hero` / `.display-lg` / `.display-md` | skala fluid Cormorant, weight 300 |
| `.reveal` | `opacity 0` menjadi `translateY(28px)`, transisi 800ms |
| `.image-reveal` | `clip-path: inset(0 0 100% 0)` menjadi 0, transisi 900–1200ms |

Transisi global memakai `cubic-bezier(0.22, 0.61, 0.36, 1)`.

---

## 2. Stack (TERKUNCI)

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js **14.2.35** (App Router) |
| UI | React **18** + TypeScript 5 (strict) |
| Styling | Tailwind CSS **3.4** |
| Package manager | pnpm 10 |
| Node | 20+ (teruji v22) |
| Animasi | **CSS murni** — tanpa library |
| 3D | **Tidak ada** — nol dependensi WebGL |

`package.json` dependencies hanya `react`, `react-dom`, dan `next`.
Dev dependencies: `typescript`, `@types/*`, `postcss`, `tailwindcss`, `eslint`, `eslint-config-next`.

> **Catatan:** tidak ada `framer-motion`, `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `lenis`, maupun ORM. Penambahan library baru harus melalui keputusan di `ROADMAP.md` dan entri Decision Log di Bab 9.
---

## 3. Struktur Codebase

```
altara-app/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx          # metadata, Google Fonts, canonical, OG, JSON-LD NGO, <html lang="id">
│  │  ├─ page.tsx            # komposisi beranda (14 komponen)
│  │  ├─ sitemap.ts          # sitemap dinamis (halaman statis + slug program/cerita/jurnal)
│  │  ├─ robots.ts           # robots.txt (crawlable public, disallow /admin, /api/, /uploads/)
│  │  ├─ globals.css         # utilities + tokens CSS + hero slider styles
│  │  ├─ program/[slug]/     # route detail publik program (SSG + metadata dinamis)
│  │  ├─ cerita/[slug]/      # route detail publik cerita (SSG + metadata dinamis)
│  │  ├─ jurnal/[slug]/      # route detail publik jurnal (SSG + metadata dinamis)
│  │  └─ admin/              # panel admin (shell client + login)
│  ├─ components/site/
│  │  ├─ Navbar.tsx          # header fixed + mobile overlay murni (solid bg-ivory)
│  │  ├─ HeroSlider.tsx      # hero slider (Ken Burns, fade transition, autoplay, 100svh mobile)
│  │  ├─ Hero.tsx            # hero fallback
│  │  ├─ Sections.tsx        # Intro, AboutFoundation, ProgramList
│  │  ├─ Impact.tsx          # ImpactStats, StoryFeature, StoryGrid, JournalSection
│  │  ├─ Closing.tsx         # FounderMessage, Transparency, Partners, SupportCTA, Footer
│  │  └─ primitives.tsx      # Reveal, SectionHeader, Emblem, Lockup (responsif mobile), useReveal
│  ├─ data/content.ts        # konten statis (fallback bila DB tidak tersedia)
│  └─ lib/                   # db, queries (get* & get*BySlug), auth, storage, image, slug, admin-collections
├─ public/
│  ├─ icon.png               # favicon
│  ├─ og-image.jpg           # OpenGraph image kanonik
│  └─ assets/                # 18 aset gambar (sekitar 4,4 MB)
└─ docs/
   ├─ MASTERPLAN_ALTARA.md   # dokumen ini
   ├─ ROADMAP.md             # rencana fase berikutnya
   └─ archive/               # versi dokumen lama
```

---

## 4. Halaman dan Anchor

### Route yang ada

| Route | Rendering | Isi |
| --- | --- | --- |
| `/` | SSG + revalidasi | Beranda: 14 section dalam satu halaman |
| `/program/[slug]` | SSG dinamis | Halaman detail program dengan foto hero dan metadata |
| `/cerita/[slug]` | SSG dinamis | Halaman detail cerita dampak dengan metadata artikel |
| `/jurnal/[slug]` | SSG dinamis | Halaman baca artikel jurnal dengan metadata artikel |
| `/sitemap.xml` | Server metadata | Peta situs XML dinamis dari static routes + konten DB |
| `/robots.txt` | Server metadata | Panduan crawler: indeks publik, proteksi admin/uploads |
| `/admin` | Client component | Panel admin 6 koleksi (data dari PostgreSQL) |

### Anchor di beranda (8)

| Anchor | Komponen | Section |
| --- | --- | --- |
| `#top` | `HeroSlider.tsx` | Hero slider sinematik 5 slide (latar `ink`, 100svh mobile) |
| `#tentang` | `Sections.tsx` | `AboutFoundation` — Tentang yayasan |
| `#program` | `Sections.tsx` | `ProgramList` — 4 kartu program |
| `#dampak` | `Impact.tsx` | `ImpactStats` — Statistik dampak |
| `#cerita` | `Impact.tsx` | `StoryGrid` — Grid cerita |
| `#jurnal` | `Impact.tsx` | `JournalSection` — Jurnal |
| `#transparansi` | `Closing.tsx` | `Transparency` — Dokumen dan laporan |
| `#dukung` | `Closing.tsx` | `SupportCTA` — CTA dukungan |

Navigasi navbar: Tentang, Program, Dampak, Cerita, Jurnal, Transparansi — semuanya menuju anchor. Tombol aksi menuju `#dukung`. Menu mobile memakai overlay mandiri `fixed inset-0 z-40 bg-[#F5F2EC]` solid bebas dari efek pembatasan header. Lockup menampilkan wordmark ALTARA dan subtitle Abdi Laksata Raya di mobile dan desktop.

---

## 5. Sistem Animasi (TERKUNCI — CSS murni)

Tidak ada library animasi. Mekanismenya:

1. **`useReveal` hook** (`src/components/site/primitives.tsx`)
   - `IntersectionObserver`, `threshold` default **0.18**, `rootMargin: "0px 0px -8% 0px"`
   - Fallback: bila `IntersectionObserver` undefined, langsung `visible = true`
   - `observer.disconnect()` setelah elemen pertama kali terlihat, sehingga animasi hanya jalan sekali
2. **Komponen `Reveal`** — membungkus children, mengatur `data-visible`, mendukung `delay` dalam milidetik via `transitionDelay`
3. **Komponen `SectionHeader`** — `eyebrow`, `title`, dan `description`, dibungkus `Reveal`
4. **CSS** — `.reveal` dan `.image-reveal` di `globals.css`
5. **Aksesibilitas** — `@media (prefers-reduced-motion: reduce)` memaksa `opacity: 1`, `transform: none`, `clip-path: none`, `transition: none !important`, serta `scroll-behav## 6. Model Data (SAAT INI)

Sumber tunggal: **PostgreSQL** (tabel `hero_slides`, `programs`, `stories`, `stats`, `journal_posts`,
`documents`, `partners`, `sessions`, `settings`). `src/data/content.ts`, `src/data/hero-slides.ts`,
dan `src/data/settings.ts` kini menjadi fallback terisolasi yang dipakai saat database tidak bisa dijangkau.

| Tabel | Jumlah Awal | Dipakai oleh | Keterangan |
| --- | --- | --- | --- |
| `hero_slides` | 5 | `HeroSlider` | Foto, headline, caption, crop focal point, Ken Burns |
| `programs` | 4 | `ProgramList` | Nomor, judul, slug, deskripsi, gambar |
| `stories` | 4 | `StoryFeature`, `StoryGrid` | Kategori, judul, slug, deskripsi, gambar |
| `stats` | 4 | `ImpactStats` | Nomor, angka, keterangan dampak, is_placeholder |
| `journal_posts` | 3 | `JournalSection` | Kategori, judul, slug, ringkasan, isi, cover, tanggal |
| `documents` | 4 | `Transparency` | Judul berkas, keterangan ukuran/tipe, link berkas |
| `partners` | 6 | `Partners` | Nama institusi kolaborator, logo |
| `settings` | 9 | `SupportCTA`, `Footer` | WhatsApp, email, kantor, bank donasi, 6 akun medsos |
| `sessions` | dinamis | Autentikasi | Hash SHA-256 session token administrator |

Bentuk tipe (lihat `src/lib/queries.ts`):

```ts
type HeroSlide   = { id, headline, caption, location, imageUrl, alt, objectPosition, kenBurns, sortOrder }
type Program     = { id, index, title, slug, description, image, alt, published, sortOrder }
type Story       = { id, category, title, slug, description, image, alt, published, sortOrder }
type Stat        = { id, index, value, label, sortOrder, isPlaceholder }
type JournalPost = { id, category, title, slug, excerpt, body, image, alt, date, published, sortOrder }
type SiteSettings= { contact_whatsapp, contact_email, office_address, bank_name, bank_account_no, bank_account_holder, social_instagram, social_youtube, social_linkedin, social_tiktok, social_facebook, social_x }
```

Nilai statistik saat ini (`stats`):

| index | value | label |
| --- | --- | --- |
| 01 | `42.508` | Jiwa Terjangkau |
| 02 | `38` | Program Berjalan |
| 03 | `34` | Kota & Kabupaten |
| 04 | `92%` | Dana Langsung ke Program |

> ⚠️ **Angka ini placeholder desain.** Angka live di tabel `stats` dan dapat disunting langsung di panel admin.

---

## 7. Panel Admin (SAAT INI)

Lokasi: `src/app/admin/` (shell client) + `src/app/api/admin/` (route handlers).

| Aspek | Realita |
| --- | --- |
| Modul | **Ringkasan (Overview)**, **Hero Slider**, **Statistik Dampak**, **Program**, **Cerita Dampak**, **Jurnal**, **Dokumen Publik**, **Mitra & Pendukung**, **Pengaturan Yayasan** |
| Overview | Kartu metrik agregat, status koneksi Postgres, tombol Aksi Cepat, dan riwayat pembaruan konten terbaru |
| Responsivitas | **Mobile Drawer Navigation** (`☰ Menu`) terisolasi untuk kenyamanan admin di smartphone |
| Quick Preview | Tombol tautan langsung **"Lihat di Web" (`↗`)** pada setiap baris tabel untuk pratinjau halaman publik |
| Operasi | Tambah, ubah, toggle publish-draft, hapus, dan batch update pengaturan |
| Penyimpanan | **PostgreSQL** via API terotorisasi (`/api/admin/[key]`, `/api/admin/overview`, `/api/admin/settings`) |
| Seed | `scripts/seed.ts` — idempoten, **insert-only** (isi yang sudah diedit admin tidak ditimpa) |
| Autentikasi | Password tunggal dari `ALTARA_ADMIN_PASSWORD`; session di tabel `sessions` (hash SHA-256) |
| Server | Next.js Route Handlers (Node Runtime) + `revalidatePath("/")` setelah tiap penyimpanan |
| Gambar | Diunggah ke folder di luar `public/`, dikonversi WebP (sharp), disajikan via `/uploads/[...path]` |

---

## 8. Infrastruktur dan Deployment (SUDAH ADA)

Infra container sudah dibangun. Target deployment adalah **container**; VM/host Proxmox hanyalah tempat menjalankan Docker, bukan syarat arsitektur.

| Komponen | Pilihan | Status |
| --- | --- | --- |
| Database | **Postgres 16** (container, `postgres:16-alpine`) | ✅ ada — service `db`, port bind ke `127.0.0.1` saja |
| Driver | `pg` dengan query tipis | ✅ ada — tanpa ORM atau codegen |
| Reverse proxy | **Caddy** | ✅ ada — service `caddy`, TLS otomatis Let's Encrypt, `Caddyfile` |
| App runtime | Next.js `output: "standalone"` | ✅ ada — `Dockerfile` multi-stage (deps → builder → migrator → runner) |
| Object storage | **Folder disk** di volume Docker | ✅ ada — OQ-2 diputuskan: folder disk, bukan MinIO (`src/lib/storage.ts`) |
| Orkestrasi | Docker Compose | ✅ ada — 4 service: `db`, `app`, `caddy`, `migrate` |
| Backup | `pg_dump` cron + **restic** | ⬜ belum ada |
| Monitoring | Uptime Kuma (container) | ⬜ belum ada — probe `/api/health` & `/api/ready` sudah tersedia |

Deployment di VM, bukan LXC — Docker dengan overlay2 butuh virtualisasi nested yang bersih. Postgres **tidak pernah** di-expose ke internet, hanya lewat docker network internal (`app` dan `migrate` menjangkau lewat `db:5432`).

---

## 9. Decision Log

| # | Tanggal | Keputusan | Alasan |
| --- | --- | --- | --- |
| 1 | 2026-10-21 | Tagline menjadi "Manunggaling Kawulane Gusti" | Disetujui owner; dipakai di `layout.tsx`, `Hero.tsx`, dan README |
| 2 | 2026-10-21 | Palet dan latar **tetap mengikuti realita kode** (`ink #171717`, `ivory`, `gold #A98F56`) | Tampilan disetujui owner; plan lama menyebut emerald sehingga dibuang |
| 3 | 2026-10-21 | **Tanpa library animasi**; animasi CSS murni plus IntersectionObserver | Nol dependensi, performa dan aksesibilitas baik; Framer Motion tidak jadi perlu |
| 4 | 2026-10-21 | **3D ditunda** | Tone editorial yang tenang tidak konsisten dengan showpiece WebGL; revisit setelah Fase 1 sampai 5 |
| 5 | 2026-10-21 | Homeserver Proxmox plus Postgres menggantikan Supabase | Data berada di dalam negeri, tanpa biaya dan tanpa batas; konsekuensinya biaya operasional |
| 6 | 2026-10-21 | Dokumen dipisah: MASTERPLAN untuk *ada*, ROADMAP untuk *rencana* | Dua audiens berbeda; file lama sudah basi (emerald, 3D, Framer, preview) |
| 7 | 2026-10-21 | Dokumen dipindah ke `altara-app/docs/` | Masuk version control repo |
| 8 | 2026-10-21 | **Container adalah target deployment**; VM/host Proxmox hanya tempat menjalankan Docker | Seluruh stack (app, db, caddy, migrate) sudah berada di `docker-compose.yml`; VM bukan syarat arsitektur |
| 9 | 2026-10-21 | `.npmrc` memakai `node-linker=hoisted` | Build `output: "standalone"` gagal dengan `EPERM ... symlink` saat Next menelusuri symlink `node_modules` milik pnpm |
| 10 | 2026-10-21 | Health check dipecah: `/api/health` (liveness) dan `/api/ready` (readiness) | Caddy memakai liveness sebagai `health_uri` — memakai readiness akan menolak semua traffic saat DB mati |
| 11 | 2026-10-22 | Hero Slider ultra modern menggantikan hero statis | Ken Burns CSS fade, 5 slide terkurasi, autoplay 6s dengan pause on hover/focus, `prefers-reduced-motion` compliance, objectPosition per slide |
| 12 | 2026-10-22 | Implementasi SEO & Route Publik Dinamis | Canonical URL, OG 1200x630, JSON-LD NGO schema, `sitemap.ts`, `robots.ts`, dan route publik dinamis `/program/[slug]`, `/cerita/[slug]`, `/jurnal/[slug]` |
| 13 | 2026-10-22 | Pemisahan Mobile Menu Overlay & Perapian Mobile Hero | Mengeluarkan fixed mobile menu dari header ber-`backdrop-blur` agar latar `#F5F2EC` solid dan tidak tembus |
| 14 | 2026-10-22 | Migrasi Hero Slider ke PostgreSQL & Form Admin Dinamis | Tabel `hero_slides` (migrasi 002) memungkinkan admin mengganti foto, headline, crop objectPosition, dan efek Ken Burns secara mandiri |
| 15 | 2026-10-22 | Modul Pengaturan Yayasan & Integrasi Publik | Tabel `settings` key-value mengelola kontak WhatsApp resmi, email, rekening bank donasi resmi, serta 6 akun media sosial resmi dengan graceful degradation di beranda dan footer |
| 16 | 2026-10-22 | Dashboard Overview, Mobile Drawer, dan Quick Preview Web | Beranda admin ringkasan metrik agregat, aksi cepat satu-klik, drawer navigasi mobile smartphone, dan tombol `Lihat di Web ↗` per entri |

---

## 10. Acceptance (permanen)

Setiap perubahan harus memenuhi:

- ✅ `pnpm build` sukses, tanpa error
- ✅ Tidak ada perubahan visual pada beranda tanpa persetujuan owner
- ✅ Token warna dan font di Bab 1 tidak berubah
- ✅ Tidak menambah dependensi runtime tanpa entri Decision Log
- ✅ Animasi baru memakai utility yang ada dan tetap menghormati `prefers-reduced-motion`
- ✅ Konten baru masuk lewat `src/data/content.ts` lalu dipindahkan ke Postgres lewat `pnpm db:seed`
�� Token warna dan font di Bab 1 tidak berubah
- ✅ Tidak menambah dependensi runtime tanpa entri Decision Log
- ✅ Animasi baru memakai utility yang ada dan tetap menghormati `prefers-reduced-motion`
- ✅ Konten baru masuk lewat `src/data/content.ts` lalu dipindahkan ke Postgres lewat `pnpm db:seed`
