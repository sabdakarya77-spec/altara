# MASTERPLAN ALTARA — Website Yayasan Ultra-Premium
> SSOT (Single Source of Truth). Status: APPROVED.
> Skema: Emerald + Champagne Gold | Paket B Signature 3D | Multi-Pilar.
> Preview visual (buka di browser): `preview/home.html` (public) + `preview/admin.html` (admin).

## 0. Identitas & Prinsip
- Nama: Yayasan Abdi Laksata Raya (ALTARA) — Tagline: "Manunggaling Kawulane Gusti"
- Pilar: Pendidikan | Sosial & Kemanusiaan | Kesehatan | Lingkungan
- Positioning: yayasan nasional modern, transparan, ultra-premium.
- Prinsip: Luxury Humanitarian + Premium Restraint (90% ringan, 10% 3D signature).
- Stack: Next.js 14 App Router + Tailwind + Framer Motion + R3F/Drei (islands) + Lucide.
- Data MVP: JSON lokal siap migrasi Supabase Tahap 2. Bahasa: ID.

## 1. Design Tokens (TERKUNCI)
```css
--emerald-950:#07271E; --emerald-900:#0B3D2E; --emerald-700:#145843; --emerald-100:#D9E9E2;
--gold-500:#C6A664; --gold-400:#D8BC7E; --gold-100:#F5EBD3;
--ivory-50:#FAF8F4; --ivory-100:#F3EFE7;
--charcoal-900:#1A1E1D; --charcoal-500:#5A6360;
```
- Rasio 60 Ivory / 30 Emerald / 10 Gold. Gold hanya CTA, badge, progress, garis premium.
- Heading: Fraunces serif 600-700. Body: Plus Jakarta Sans 400-600.
- Radius card 20px, button pill, shadow soft + gold-glow, ease [0.22,1,0.36,1].
- Komponen: ButtonGold, ButtonOutline, BadgeLegal, ProgressBarGold, CounterAnim, SectionHeading, PillarCard3D, CampaignCard.

## 2. Sitemap Visual (Mermaid — render otomatis di VS Code/GitHub)
```mermaid
flowchart TB
  HOME["/ Beranda"] --> TENTANG["/tentang"]
  HOME --> PROG["/program"]
  PROG --> P1["/program/pendidikan"]
  PROG --> P2["/program/sosial-kemanusiaan"]
  PROG --> P3["/program/kesehatan"]
  PROG --> P4["/program/lingkungan"]
  HOME --> DON["/donasi"]

## 3. Visual Halaman — BERANDA (Wireframe Kotak, skala proporsional)
> Lihat versi berwarna interaktif: buka `preview/home.html` di browser.
```
+==================================================================================+
| TOPBAR #07271E: [Badge SK Kemenkumham]  halo@altara.or.id | +62-8xx | IG YT       |
+==================================================================================+
| NAVBAR ivory blur: [◆ ALTARA]  Beranda Tentang Program Donasi Transparansi  [Donasi]| 
+==================================================================================+
| HERO 100vh #07271E (3D: partikel emas + sutra emerald, teks HTML di atas)          |
|  eyebrow GOLD: YAYASAN MULTI-PILAR • TERDAFTAR KEMENKUMHAM                         |
|  H1 serif ivory 64px:                                                              |
|    Manunggaling Kawulane,                                                          |
|    Gusti.                                                                          |
|  Sub ivory/80: Misi 2 kalimat + angka dampak                                       |
|  [◆ Donasi Sekarang GOLD]  [◇ Jelajahi Program outline]                            |
|  +------------------------------------------------------------------------------+  |
|  | STATS card ivory floating: Rp8,4M+ | 42.500+ Jiwa | 1.200+ Relawan | 34 Kota |  |
|  +------------------------------------------------------------------------------+  |
+==================================================================================+
| MARQUEE #F5EBD3: TERDAFTAR KEMENKUMHAM • DIAUDIT KAP • 12.400+ DONATUR • 48 MITRA   |
+==================================================================================+
| 4 PILAR (ivory) — eyebrow GOLD "PILAR KEBAIKAN" + H2 serif "Satu Yayasan, 4 Jalan"  |
| +------------+ +------------+ +------------+ +------------+                        |
| | 🎓 PENDID. | | ♥ SOSIAL   | | ✚ KESEHAT.| | ❀ LINGKUNG.|  (tilt 3D + glow)      |
| | cover img  | | cover img  | | cover img  | | cover img  |                        |
| | H3 + desc  | | H3 + desc  | | H3 + desc  | | H3 + desc  |                        |
| | Lihat →    | | Lihat →    | | Lihat →    | | Lihat →    |                        |
| +------------+ +------------+ +------------+ +------------+                        |
+==================================================================================+

## 4. Visual Halaman — ADMIN PANEL (Wireframe Kotak)
> Versi berwarna interaktif: buka `preview/admin.html` di browser.
```
+===========+====================================================================+
| SIDEBAR   | TOPBAR ivory: Breadcrumb > Dashboard | Search | Bell(3) | Avatar    |
| #07271E   +====================================================================+
| ◆ ALTARA  | KPI ROW (4 cards, gold left-border):                                 |
| Dashboard | [Rp 8,4M Total] [12.480 Donatur] [9 Campaign] [1.240 Relawan]        |
| Donasi    +------------------------------------------+-------------------------+|
| Campaign  | LINE CHART Donasi 30 hari (gold)          | DONUT per Pilar         ||
| Program   |  _/\_/‾\_/‾\_                            | 32% 28% 22% 18%         ||
| Kegiatan  +------------------------------------------+-------------------------+|
| Galeri    | TABEL Donasi Terbaru: Nama|Campaign|Rp|Status|Aksi Verifikasi       ||
| Relawan   | Andi|Beasiswa|500rb|Pending|[✓][✕]  Sari|Qurban|1jt|Verified      ||
| Laporan   +------------------------------------------+-------------------------+|
| Transpar. | [Aktivitas: upload PDF, relawan baru] | [Target bulan 68% bar]  |   |
| Setting   +====================================================================+
| User box  | Modul lain = pola sama: filter bar + tabel + form drawer + export        |
+===========+====================================================================+
LOGIN /admin/login: card center emerald: logo + email + password + [Masuk GOLD].
Guard MVP: cookie altara_admin=1. Tahap 2: NextAuth + Supabase.
```
CRUD pola: Campaign (cover, judul, target, progress, featured toggle), Donasi (verifikasi/tolak),
Program (4 pilar), Kegiatan (SEO meta), Galeri (dropzone), Relawan (status), Transparansi (PDF 10MB).

| CAMPAIGN MENDESAK #0B3D2E: H2 ivory + "Lihat Semua"                                |
| +--------------+ +--------------+ +--------------+                                |
| | img+badge   | | img+badge   | | img+badge   |  dark card, ProgressBarGold  |
| | H3 + Rp + % | | H3 + Rp + % | | H3 + Rp + % |  [Donasi] GOLD               |
| +--------------+ +--------------+ +--------------+                                |
+==================================================================================+
| DAMPAK split ivory:                                                                |
|  KIRI: H2 + 4 Counter + quote ketua + [Laporan Transparansi]                       |
|  KANAN: [GLOBE 3D: bola dot + titik kota glow gold, drag putar, tooltip]           |
+==================================================================================+
| TENTANG singkat | TRANSPARANSI teaser (gradient + 3 PDF + badge WTP) | TESTIMONI  |
| MITRA grid 6 | BERITA 3 cards | CTA GOLD besar + FAQ 5 accordion                     |
+==================================================================================+
| FOOTER MEGA #07271E 4 kolom + newsletter | [Floating WA] [Sticky Donasi mobile]      |
+==================================================================================+
```
Mobile 360px: H1 36px, stats 2x2, pilar/campaign 1 kolom, globe 320px, sticky CTA on.

  DON --> DSLUG["/donasi/[slug]"]
  DSLUG --> SUKSES["/donasi/sukses"]
  HOME --> TRANS["/transparansi"]
  HOME --> KEG["/kegiatan"] --> KSLUG["/kegiatan/[slug]"]
  HOME --> GAL["/galeri"]
  HOME --> REL["/relawan"]
  HOME --> KON["/kontak"]
  HOME --> ADMIN["/admin Dashboard"]
  ADMIN --> AD1["/admin/donasi"]
  ADMIN --> AD2["/admin/campaign"]
  ADMIN --> AD3["/admin/program"]
  ADMIN --> AD4["/admin/kegiatan"]
  ADMIN --> AD5["/admin/galeri"]
  ADMIN --> AD6["/admin/relawan"]
  ADMIN --> AD7["/admin/laporan"]
  ADMIN --> AD8["/admin/transparansi"]
  ADMIN --> AD9["/admin/pengaturan"]
```

## 5. Spesifikasi 3D Paket B (Premium Restraint)
- Hanya 2 canvas: HeroScene3D + ImpactGlobe. Tilt kartu pakai Framer (tanpa WebGL).
- Lazy: next/dynamic ssr:false + Suspense. CTA HTML render dulu <1.5 dtk.
- Budget: JS 3D <250KB gzip/island, partikel 800 desktop / 400 mobile, dpr 1-1.75.
- Adaptive: turunkan kualitas jika deviceMemory<=4 atau lebar<768.
- Fallback: WebGL gagal / reduced-motion -> poster gradient + foto + SVG map.
- File: components/3d/HeroScene3D.tsx, ImpactGlobe.tsx, SceneFallback.tsx.

## 6. Sub-Halaman Public (Ringkas)
- TENTANG: hero + timeline + visi-misi + legalitas SK/Akta + pengurus + AD/ART.
- PROGRAM [slug] x4: hero cover + masalah-solusi + 4 fokus + stepper + campaign terkait.
- DONASI: katalog filter + detail sticky checkout + QR/VA simulasi + sukses invoice.
- TRANSPARANSI: badge WTP + tab + grid PDF + chart per pilar.
- KEGIATAN/GALERI/RELAWAN/KONTAK: pola list-detail-form standar premium.

## 7. Skema Data + Acceptance
- JSON: programs, campaigns, donations, posts, impact, reports, volunteers, gallery, settings.
- Tahap 2: Supabase + Midtrans/Xendit + NextAuth + i18n EN.
- Kriteria: build sukses, Lighthouse >85, LCP <2.5 dtk, mobile 360 rapi, SEO JSON-LD NGO.
- Ubah desain = revisi file ini dulu. Preview: preview/home.html + preview/admin.html.

