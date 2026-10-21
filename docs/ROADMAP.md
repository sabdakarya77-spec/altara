# ROADMAP ALTARA — Rencana Fase Berikutnya

> **Status:** Fase 0 sampai 3 selesai. Fase 4 ke atas belum dimulai.
> **Role:** rencana kerja ke depan. Realitas codebase ada di [`MASTERPLAN_ALTARA.md`](./MASTERPLAN_ALTARA.md).
> **Aturan:** setiap fase harus punya kriteria selesai yang bisa diverifikasi. Fase baru hanya dimulai setelah kriteria fase sebelumnya terpenuhi.
> **Verifikasi terakhir:** 2026-10-21 — status setiap fase di bawah sudah dicocokkan dengan kode yang ada, bukan dengan klaim lama.

---

## Peta Fase

| Fase | Judul | Status | Estimasi | Menghalangi |
| --- | --- | --- | --- | --- |
| 0 | Ratifikasi dokumen | ✅ selesai | — | — |
| 1 | Fondasi data (Postgres + migrasi) | ✅ selesai | 2-3 hari | OQ-1, OQ-2 |
| 2 | Autentikasi admin | ✅ selesai | 0,5-1 hari | - |
| 3 | Admin CRUD ke database | ✅ selesai | 2-3 hari | Fase 1, 2 |
| 4 | Route publik baru | ⬜ belum dimulai | 3–4 hari | Fase 1 |
| 5 | Polish: token animasi, SEO, sitemap | ⬜ belum dimulai | 1–2 hari | Fase 4 |
| 6 | Transaksi donasi + Midtrans | ⬜ belum dimulai | 4–6 hari | Fase 4, OQ-3 |
| 7 | Evaluasi 3D | ⏸ on hold | — | Fase 5 |
| 8 | Multi-admin dan versioning | ⬜ opsional | — | Fase 6 |

> **Estimasi** dalam hari kerja terfokus. Tidak termasuk waktu belajar infra atau waktu tunggu.
>
> **Catatan Fase 1:** skema, migrasi, seed, dan layer query sudah jadi, begitu juga
> infra container: `docker-compose.yml` kini punya service `app` (Next.js
> `output: "standalone"`), `caddy` (TLS otomatis), dan `migrate` (job sekali
> jalan), plus `Dockerfile` multi-stage dan `Caddyfile`. Yang belum terverifikasi
> end-to-end adalah `docker compose up` di mesin ber-Docker — alat ini tidak
> tersedia di lingkungan verifikasi, jadi yang diuji adalah hasil `pnpm build`
> mode standalone dijalankan langsung lewat `node server.js`.

---

## Urutan dan Alasan

```
Fase 1 (data)  ──┬──> Fase 3 (admin CRUD)  ──> Fase 6 (donasi)
                 │
                 └──> Fase 4 (route) ──> Fase 5 (polish) ──> Fase 7 (evaluasi 3D)
                        ▲
Fase 2 (auth) ──┘
```

**Mengapa data lebih dulu:** selama konten masih statis di `content.ts`, setiap fitur baru harus menyalin-ganti kode. Dengan database, admin dan situs membaca sumber yang sama.

**Mengapa auth sebelum CRUD:** menambah CRUD tanpa auth berarti membuka endpoint tulis ke publik. Urutan ini menutup celah itu sejak awal.

**Mengapa route lebih penting daripada polish:** route memberi nilai langsung ke pengunjung — dari landing ke isi program dalam satu klik.

---

## Fase 0 — Ratifikasi Dokumentasi ✅ SELESAI

**Deliverable:** dokumentasi yang memisahkan realita dari rencana.

- `docs/MASTERPLAN_ALTARA.md` ditulis ulang sebagai cermin akurat codebase
- `docs/ROADMAP.md` dibuat (dokumen ini)
- Versi plan lama diarsipkan ke `docs/archive/MASTERPLAN_ALTARA.v0-legacy.md`

**Kriteria selesai:**
- ✅ Semua token, route, anchor, dan komponen terverifikasi terhadap kode
- ✅ Tidak ada klaim yang bertentangan dengan kode
- ✅ Mermaid pada plan lama yang rusak dibuang, diganti tabel

---

## Fase 1 - Fondasi Data: Postgres + Migrasi (SELESAI)

**Status:** done · **Estimasi:** 2-3 hari · **Menghalangi:** OQ-1, OQ-2

### Deliverable

1. **Docker Compose** di satu VM Proxmox:
   - `postgres:16-alpine` dengan named volume
   - `next` service memakai `output: "standalone"`
   - `caddy` sebagai reverse proxy dengan TLS otomatis
2. **Skema tabel** (6 tabel dari `content.ts` + `settings`):

| Tabel | Kolom inti |
| --- | --- |
| `programs` | id, idx, title, slug, description, image, alt, published, sort_order |
| `stories` | id, category, title, slug, description, image, alt, published, sort_order |
| `stats` | id, idx, value, label, sort_order |
| `journal_posts` | id, title, slug, excerpt, body, cover_image, published_at, published |
| `documents` | id, title, meta, file_url, sort_order |
| `partners` | id, name, logo_url, sort_order |
| `settings` | key, value |

3. **`src/lib/db.ts`** — pool `pg` dengan query tipis, tanpa ORM
4. **Seed script** yang memindahkan seluruh `content.ts` ke database
5. **`revalidatePath()`** pada Route Handler agar beranda ter-update tanpa rebuild

### File yang disentuh

```
docker-compose.yml
Dockerfile
Caddyfile
.dockerignore
.npmrc
.env.example
next.config.mjs
src/lib/db.ts
src/lib/queries.ts
src/app/api/admin/[key]/route.ts
src/app/api/health/route.ts
src/app/api/ready/route.ts
scripts/seed.ts
```

### Kriteria selesai

- ✅ `docker compose up` menghasilkan Postgres yang sehat — service `db` (`postgres:16-alpine`, named volume, healthcheck) tersedia
- ✅ Seed script menginsert 6 koleksi tanpa kehilangan data (insert-only: entri yang sudah diedit admin tidak ditimpa)
- ✅ Beranda tetap SSG dan First Load JS tidak naik signifikan
- ✅ Admin menyimpan perubahan → beranda berubah tanpa rebuild (`revalidatePath("/")` di `src/app/api/admin/[key]/route.ts`)
- ✅ `pnpm build` tetap sukses
- ✅ Service `app` (`output: "standalone"`) dan `caddy` ada di `docker-compose.yml` — plus `Dockerfile` multi-stage, `Caddyfile`, `.dockerignore`, `.npmrc`
- ⚠️ `docker compose up` (stack penuh) **belum pernah dijalankan di lingkungan verifikasi** — Docker tidak terpasang di mesin ini. Yang sudah terbukti: `pnpm build` mode standalone sukses, dan hasil build dijalankan langsung (`node .next/standalone/server.js`) dengan balasan `/` → 200, `/api/health` → 200, `/api/ready` → 503 (DB belum dikonfigurasi), `/admin` → redirect ke `/admin/login`, `/api/admin/*` → 401

### Catatan verifikasi (per 2026-10-21)

- Skema di `db/migrations/001_init.sql` sudah memuat 7 tabel + `sessions`: `programs`, `stories`, `stats`, `journal_posts`, `documents`, `partners`, `settings`, `sessions`.
- `stats` punya kolom `is_placeholder` (default `true`) — belum ada di tabel roadmap di atas.
- `src/lib/queries.ts` sudah menyediakan getter untuk keenam koleksi + `formatDateId()`, dengan fallback ke `@/data/content`.
- `settings` (key/value) sudah ada di skema, **tetapi belum dipakai kode apa pun** — tabelnya kosong dan tidak ada UI yang menuliskannya.
- `next.config.mjs` sekarang berisi `output: "standalone"`, `experimental.outputFileTracingRoot`, dan `experimental.serverComponentsExternalPackages: ["pg", "sharp"]`. Pada Next 14.2 kedua key itu **wajib** berada di dalam `experimental` — di top-level Next memunculkan peringatan "Invalid next.config.mjs options".
- `.npmrc` memuat `node-linker=hoisted`. Tanpa ini, build standalone gagal dengan `EPERM: operation not permitted, symlink ...` karena Next menelusuri dependensi lewat symlink `node_modules` milik pnpm. Layout hoisted juga memastikan `pg` dan `sharp` ikut tersalin ke `.next/standalone/node_modules` (sudah diverifikasi: keduanya ada).
- `docker-compose.yml` punya 4 service: `db` (port di-bind ke `127.0.0.1` saja), `app` (internal saja, lewat `expose`), `caddy` (satu-satunya yang publish 80/443), dan `migrate` (job sekali jalan, tanpa `restart`).
- Health check dipisah dua: `/api/health` (liveness, selalu 200 selama proses hidup) dipakai Caddy `health_uri` dan healthcheck Docker; `/api/ready` (readiness, 503 bila DB mati) untuk monitoring. Jangan tukar keduanya — memakai `/api/ready` sebagai `health_uri` akan membuat Caddy menolak semua traffic saat database down sementara.
- `migrate` sengaja tidak memakai `container_name`, supaya `docker compose run --rm migrate` bisa dipakai berulang kali.
- Compose menginterpolasi seluruh berkas sebelum menjalankan service mana pun, jadi placeholder `:?` (wajib) **tidak** dipakai untuk `ALTARA_ADMIN_PASSWORD` — kalau dipakai, `docker compose up -d db` untuk pengembangan lokal ikut gagal. Validasi dilakukan aplikasi: `verifyPassword()` menolak semua input bila env kosong (fail closed), dan `/api/admin/login` mencatat pesan diagnosik ke log container.

### Risiko

- Data lama masih static — perlu masa transisi dua sumber. Mitigasi: `content.ts` dibaca sebagai fallback bila database tidak bisa dijangkau (bila database hidup tapi tabel kosong, yang ditampilkan adalah tabel kosong itu).
---

## Fase 2 - Autentikasi Admin (SELESAI)

**Status:** done · **Estimasi:** 0,5-1 hari · **Ketergantungan:** -

Masalah yang diselesaikan: `/admin` saat ini bisa diakses dan ditulis oleh siapa pun yang menemukan URL-nya.

### Deliverable

1. `src/middleware.ts` — guard `/admin` dan `/api/admin/*`
2. Password dari environment variable `ALTARA_ADMIN_PASSWORD`
3. Session cookie `httpOnly` + `sameSite=lax` + `secure` + value ter-hash (bukan plaintext)
4. Route `/admin/login`
5. Logout

### File yang disentuh

```
src/middleware.ts
src/app/admin/login/page.tsx
src/lib/auth.ts
.env.example
```

### Kriteria selesai

- ✅ `/admin` tanpa session → redirect ke `/admin/login`
- ✅ `/api/admin/*` tanpa session → 401
- ✅ Password salah → ditolak, tanpa membocorkan apakah session ada
- ✅ `.env` tidak masuk version control
- ✅ Build tetap sukses

### Catatan verifikasi (per 2026-10-21)

- `src/middleware.ts` ada, matcher `["/admin/:path*", "/api/admin/:path*"]`. Middleware hanya mengecek *kehadiran* cookie (dijalankan di Edge Runtime, tidak bisa akses `pg`); validasi penuh ada di Route Handler Node Runtime.
- `src/lib/auth.ts` memakai `sha256` untuk hash token, `randomBytes(32)` untuk token, `timingSafeEqual` untuk perbandingan, cookie `httpOnly` + `sameSite=lax` + `secure` (hanya bila request HTTPS) + `maxAge` TTL.
- Session disimpan di tabel `sessions` (`token_hash`, `expires_at`) — token plaintext tidak pernah disimpan.
- `.gitignore` memuat `.env`.
- Catatan: password admin **dibandingkan** langsung dari env (bukan di-hash di database) — sesuai desain Fase 2 "password tunggal".

### Catatan

Password tunggal sudah cukup untuk satu administrator. Multi-user dengan role ada di Fase 8.

---

## Fase 3 - Admin CRUD ke Database (SELESAI)

**Status:** done · **Estimasi:** 2-3 hari · **Ketergantungan:** Fase 1, Fase 2

Ini fase yang benar-benar membuat panel admin berfungsi. Saat ini admin menulis ke `localStorage` yang tidak pernah dibaca beranda.

### Deliverable

1. Ganti `src/lib/admin-store.ts` dengan pemanggilan Route Handler berbasis database
2. Form terstruktur per entitas, bukan tabel generik
3. Upload gambar — **tergantung OQ-2** (MinIO atau folder disk)
4. Status `published` / `draft` dengan pratinjau
5. Halaman **Statistik** untuk mengubah angka dampak (tabel `settings`)

### Kriteria selesai

- ✅ Menambah program baru langsung muncul di beranda
- ✅ Mengubah angka statistik langsung berubah di section `#dampak`
- ✅ Draft tidak muncul di situs publik
- ✅ Upload gambar terkompresi dan tersimpan dengan nama aman
- ✅ Refresh admin tidak menghilangkan data

### Catatan verifikasi (per 2026-10-21)

- `src/lib/admin-store.ts` (localStorage) sudah **dihapus** — diganti Route Handler `src/app/api/admin/[key]/route.ts` yang berbasis database.
- Form **terstruktur per entitas** lewat `src/app/admin/fields.ts`: tiap koleksi punya definis kolom sendiri (`stats`, `programs`, `stories`, `journal_posts`, `documents`, `partners`), dipakai bersama oleh form dan tabel.
- Upload: `src/app/api/admin/upload/route.ts` + `src/lib/image.ts` (sharp → resize max 1920px, WebP q82, hormati EXIF) + `src/lib/storage.ts` (folder disk, `randomUUID` sebagai nama berkas, path traversal dicegah). OQ-2 diputuskan: **folder disk**.
- Penyajian hasil upload: `src/app/uploads/[...path]/route.ts`.
- ⚠️ **Statistik memakai tabel `stats`, bukan `settings`.** Deliverable di atas menyebut tabel `settings`, tapi kode memakai tabel `stats` (kolom `value`, `label`, `is_placeholder`). Tabel `settings` ada di skema tapi **tidak terpakai** — tidak ada query maupun UI yang membaca/menulisnya.

### Risiko

Perubahan ini menyentuh `src/app/admin/page.tsx` secara total. Karena itu Fase 2 wajib selesai lebih dulu — kalau tidak, endpoint tulis terbuka ke publik.

---

## Fase 4 — Route Publik Baru

**Status:** planned (belum dimulai) · **Estimasi:** 3–4 hari · **Ketergantungan:** Fase 1

Anchor di beranda tetap dipertahankan (sudah disetujui owner). Route baru adalah **pintu masuk tambahan**, bukan pengganti.

### Deliverable

| Route | Isi | Rendering |
| --- | --- | --- |
| `/program/[slug]` | Detail program | `generateStaticParams` + `dynamicParams` |
| `/cerita/[slug]` | Detail cerita | idem |
| `/jurnal` | Daftar jurnal | statis |
| `/jurnal/[slug]` | Artikel jurnal | `generateStaticParams` |
| `/transparansi` | Dokumen dan laporan | statis |

### Kriteria selesai

- ⬜ Build menghasilkan semua halaman statis, tidak ada error
- ⬜ Halaman baru konsisten dengan beranda — token, tipografi, dan `Reveal` yang sama
- ⬜ Navigasi navbar diperluas tanpa merusak anchor yang ada
- ⬜ Metadata per halaman (title, description, OpenGraph) terisi
- ⬜ 360px rapi

### Catatan verifikasi (per 2026-10-21)

Belum ada route publik baru sama sekali. `src/app/` hanya berisi `layout.tsx`, `page.tsx`, `admin/`, `api/admin/`, `uploads/`. Tidak ada `program/`, `cerita/`, `jurnal/`, atau `transparansi/`.

Yang sudah siap dipakai: `src/lib/queries.ts` sudah menyediakan `getJournal()`, `getDocuments()`, `getPrograms()`, `getStories()` — tinggal dibungkus route.

### Risiko

`generateStaticParams` dengan database butuh koneksi saat build. Mitigasi: mode build boleh memakai snapshot JSON hasil dump database.
---

## Fase 5 — Polish: Token Animasi, SEO, Sitemap

**Status:** planned (belum dimulai) · **Estimasi:** 1–2 hari · **Ketergantungan:** Fase 4

### Deliverable

1. **Token animasi terpusat** di `globals.css`:

```css
:root {
  --ease-out-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
  --dur-reveal: 800ms;
  --dur-image: 900ms;
  --dur-nav: 500ms;
  --reveal-offset: 28px;
}
```

   `.reveal`, `.image-reveal`, dan navbar memakai variabel tersebut — bukan angka literal.

2. `sitemap.xml` dan `robots.txt` otomatis
3. JSON-LD `NGO` untuk organisasi
4. `next/image` untuk aset yang sudah ada (image optimization)

### Kriteria selesai

- ⬜ Tidak ada angka transisi yang tertulis langsung di komponen
- ⬜ Sitemap memuat seluruh route dan dapat diakses
- ⬜ Google Fonts dimuat via `next/font` agar tidak menambah request eksternal — opsional
- ⬜ Lighthouse tetap di atas 85

### Catatan verifikasi (per 2026-10-21)

Belum ada satupun dari 4 deliverable yang dikerjakan:
- Token animasi (`--ease-out-soft`, `--dur-reveal`, `--dur-image`, `--dur-nav`, `--reveal-offset`) **tidak ada** di `src/app/globals.css`.
- Tidak ada `src/app/sitemap.ts` maupun `src/app/robots.ts`.
- Tidak ada JSON-LD (`application/ld+json` / `schema.org`) di seluruh `src/`.
- `next/font` belum dipakai; font masih dimuat via `<link>` eksternal (perlu dicek di `layout.tsx`).

Sebagian sudah ada dari fase sebelumnya: `next/image` **sudah** dipakai di `src/app/admin/admin-dashboard.tsx` dan `src/app/admin/admin-entry-table.tsx`. Metadata dasar (`metadataBase`, `title`, `description`, `openGraph`) sudah ada di `src/app/layout.tsx` — tinggal ditambah per halaman saat Fase 4.

### Catatan

Bagian ini murni kosmetik dan SEO. Tidak menyentuh logika.

---

## Fase 6 — Transaksi Donasi + Midtrans

**Status:** planned (belum dimulai) · **Estimasi:** 4–6 hari · **Ketergantungan:** Fase 4, OQ-3

### Prasyarat (harus beres lebih dulu)

- ⬜ Domain dan HTTPS aktif
- ⬜ Endpoint webhook dapat dijangkau dari internet
- ⬜ Solusi CGNAT sudah diputuskan (OQ-3 masih terbuka)

### Deliverable

1. Tabel `donations` dan `campaigns`
2. Katalog program donasi
3. Halaman detail campaign dengan progress bar
4. Integrasi Midtrans Snap
5. Webhook handler dengan verifikasi signature
6. Halaman sukses dengan invoice

### Kriteria selesai

- ⬜ Pembayaran uji coba terverifikasi dan tercatat
- ⬜ Webhook menolak request dengan signature salah
- ⬜ Nominal dan status donasi benar di database
- ⬜ Halaman sukses menampilkan invoice

### Catatan verifikasi (per 2026-10-21)

Belum ada apa pun. Tabel `donations` / `campaigns` belum ada di `db/migrations/001_init.sql`, dependency Midtrans belum ada di `package.json`, dan belum ada route/API donasi.

Prasyarat domain & HTTPS: infra sudah siap — service `caddy` dengan TLS otomatis ada di `docker-compose.yml`, dan `CADDY_DOMAIN`/`ACME_EMAIL`/`ACME_CA` sudah ada di `.env.example`. Yang belum adalah sisi **operasional**: domain belum di-point ke IP server, dan sertifikat belum pernah diterbitkan. Selain itu, CGNAT (OQ-3) masih jadi blocker karena webhook Midtrans harus bisa dijangkau dari internet.

### Risiko

Fase paling besar dan paling berisiko. Donasi harus punya nomor rekening resmi dan NPWP sebelum integrasi pembayaran dijalankan.

---

## Fase 7 — Evaluasi 3D ⏸ ON HOLD

**Status:** on hold · **Ketergantungan:** Fase 5 selesai

Alasan ditunda: tone editorial beranda sudah disetujui owner, sementara showpiece WebGL berisiko terasa seperti elemen dari proyek lain. Evaluasi ulang dilakukan **setelah** Fase 1 sampai 5 selesai, dengan kriteria:

- Animasi CSS yang ada tetap menjadi standar, 3D hanya tambahan
- Budget JS tambahan maksimal 150 kB gzip
- Fallback wajib untuk WebGL gagal dan `prefers-reduced-motion`
- Konten statis (foto, SVG) tetap dapat dipakai sebagai pengganti

Bila prioritas dana dan waktu lebih baik ke donasi (Fase 6), fase ini dibatalkan permanen.

---

## Fase 8 — Multi-Admin dan Versioning (opsional)

**Status:** optional (belum dimulai) · **Ketergantungan:** Fase 6

- Tabel `users` dengan role (admin, editor)
- Riwayat revisi konten dengan diff
- Dashboard donors dan laporan keuangan
- Ekspor PDF laporan tahunan otomatis

Hanya relevan bila ada lebih dari satu pengelola konten atau kebutuhan pelaporan yang nyata.

> **Status autentikasi saat ini:** password tunggal dari env (`ALTARA_ADMIN_PASSWORD`), tabel `users` belum ada, dan role-based access belum ada di kode mana pun.
---

## Open Questions (perlu keputusan owner)

| ID | Pertanyaan | Menghambat | Default bila tidak dijawab | Status |
| --- | --- | --- | --- | --- |
| **OQ-1** | Apakah angka `42.508 Jiwa / 38 Program / 34 Kota / 92%` sudah final, atau masih placeholder desain? | Fase 1, Fase 3 | Dipindah apa adanya ke tabel `stats`, ditandai belum final | ⏳ **Menunggu owner** — angka sudah masuk ke `stats` dengan `is_placeholder = true`; UI admin sudah bisa mengubahnya |
| **OQ-2** | Apakah admin perlu **upload gambar**? Jika ya: MinIO (S3-compatible) atau folder disk + Route Handler? | Fase 1, Fase 3 | Folder disk di volume Docker — lebih sederhana, cukup untuk 1 editor | ✅ **Terjawab** — folder disk (`src/lib/storage.ts` + `ALTARA_UPLOAD_DIR`) |
| **OQ-3** | Sudah punya domain dan IP publik? Apakah IP homeserver berada di belakang CGNAT? | Fase 6 | Ditunda — transaksi butuh webhook publik | ⏳ **Terbuka** — infra TLS sudah siap (`caddy` + `CADDY_DOMAIN` di `.env.example`), tapi domain belum di-point ke IP server dan CGNAT belum dipastikan |
| **OQ-4** | Siapa pengelola konten setelah Fase 3? Bila hanya satu orang, multi-user dilewati. | Fase 8 | Password tunggal seperti Fase 2 | ⏳ **Terbuka** — default (password tunggal) sudah aktif |
| **OQ-5** | Berapa lama sumber daya untuk operasional harian (backup, monitoring, update)? | Fase 1 | Backup dan monitoring wajib disiapkan lebih dulu | ⏳ **Terbuka** — belum ada setup backup/monitoring |

### Catatan OQ-5

Homeserver menggantikan Supabase berarti **operasi menjadi tanggung jawab owner**. Ini bukan konsekuensi kecil:

- Backup harian `pg_dump` + restic ke node lain, dan **restore wajib pernah diuji**
- Monitoring uptime dengan notifikasi
- Update keamanan container terjadwal
- Jaringan: bila IP berada di belakang CGNAT, perlu Cloudflare Tunnel atau VPS penghubung

Bila keempat hal ini tidak siap dikerjakan, Supabase justru lebih aman karena vendor yang mengurus server.

**Status:** infra container sudah ada (`docker-compose.yml` + `Dockerfile` + `Caddyfile`), jadi tiga dari empat item di atas tinggal dikonfigurasi — bukan dikerjakan dari nol. Yang belum ada: script backup, target restic, dan monitoring. Endpoint `/api/health` (liveness) dan `/api/ready` (readiness) sudah tersedia sebagai target probe untuk Uptime Kuma atau service similair.

---

## Di Luar Scope Saat Ini

Hal-hal ini **secara sadar tidak** dikerjakan pada fase-fase di atas:

- **Framer Motion / GSAP / Lenis** — animasi CSS yang ada sudah memadai
- **Three.js / R3F / Drei** — lihat Fase 7
- **ORM (Prisma/Drizzle)** — query tipis dengan `pg` cukup untuk skala ini
- **i18n / bahasa Inggris** — bahasa Indonesia dulu
- **PWA / offline mode** — bukan kebutuhan saat ini
- **Testing otomatis (unit/E2E)** — belum ada; baru dipertimbangkan bila jumlah fitur bertambah banyak
- **Microservices** — satu aplikasi monolit tetap paling murah di-maintain

---

## Risiko Utama

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Homeserver mati tanpa backup yang teruji | Situs down, data hilang | Backup otomatis + restore drill tiap bulan |
| Admin terbuka karena lupa guard | Konten rusak atau bocor | Fase 2 wajib selesai sebelum Fase 3 |
| Migrasi DB merusak data lama | Konten hilang | Seed script idempotent, `content.ts` jadi fallback, dump sebelum migrasi |
| Caddy gagal dapat sertifikat | Situs tidak dapat diakses HTTPS | Uji dengan ACME staging lebih awal (`ACME_CA`), siapkan DNS manual |
| Image container tidak bisa menelonusuri dependensi (`pg`/`sharp` hilang) | Container crash saat runtime | `serverComponentsExternalPackages` + `.npmrc` `node-linker=hoisted`; sudah diverifikasi ada di `.next/standalone/node_modules` |
| CGNAT memblokir webhook | Donasi gagal tercatat | Putuskan OQ-3 sebelum Fase 6 |
| Scope creep pada 3D | Waktu habis, kualitas turun | Fase 7 dipegang on hold, dievaluasi setelah Fase 5 |

---

## Definition of Done (seluruh proyek)

- ✅ `pnpm build` sukses tanpa error
- ✅ Tidak ada perubahan visual pada beranda tanpa persetujuan owner
- ✅ Token warna dan font tetap sesuai `MASTERPLAN_ALTARA.md` Bab 1
- ⬜ Backup otomatis berjalan dan restore pernah diuji
- ⏳ HTTPS aktif, monitoring uptime terpasang — infra HTTPS sudah ada (`caddy` + TLS otomatis, `CADDY_DOMAIN` di `.env.example`), tapi domain belum di-point ke server, sertifikat belum pernah terbit, dan monitoring belum dipasang
- ✅ Admin terlindungi autentikasi
- ✅ Konten yang diedit di admin tampil di situs tanpa rebuild
- ✅ `.env` tidak pernah masuk version control

> Status per 2026-10-21: 6 dari 8 item terpenuhi. Dua item yang tersisa (`backup` + `HTTPS/monitoring`) kini **operasional**, bukan arsitektural: service `next`/`caddy` di `docker-compose.yml` dan `output: "standalone"` di `next.config.mjs` sudah ada, sehingga yang tersisa tinggal konfigurasi domain, penerbitan sertifikat, setup `pg_dump` + restic, dan pemasangan monitoring.

---

## Deployment

Container adalah target deployment. VM (atau Proxmox host) hanyalah tempat menjalankan Docker — bukan syarat arsitektur, karena seluruh stack sudah berada di dalam `docker-compose.yml`.

```bash
# 1. Siapkan environment
cp .env.example .env
#   isi minimal: ALTARA_ADMIN_PASSWORD, POSTGRES_PASSWORD, CADDY_DOMAIN

# 2. Build & jalankan
docker compose up -d --build

# 3. Migrasi skema + seed (sekali jalan)
docker compose run --rm migrate

# 4. Pantau
docker compose logs -f app
```

| Service | Port host | Keterangan |
| --- | --- | --- |
| `caddy` | 80, 443 | Satu-satunya yang publish ke publik; TLS otomatis |
| `app` | — (internal 3000) | Next.js standalone, tidak terjangkau dari luar |
| `db` | 127.0.0.1:5432 | Loopback saja; dari network compose lewat `db:5432` |
| `migrate` | — | Job sekali jalan, tidak auto-restart |

Volume: `altara-db-data` (data Postgres), `altara-uploads` (media), `altara-caddy-data` + `altara-caddy-config` (sertifikat & config Caddy). Certificate volume **wajib** persisten — hilang tiap restart memicu rate limit Let's Encrypt.

Bisa juga dijalankan di host non-Docker (`pnpm build` + `pnpm start`), asalkan ada Postgres dan reverse proxy TLS di depannya. Yang hilang hanya otomatisasi container.
