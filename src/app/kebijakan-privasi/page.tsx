import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Closing";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Kebijakan Privasi & Pelindungan Data — Yayasan Abdi Laksata Raya",
  description:
    "Kebijakan privasi dan komitmen kepatuhan pelindungan data pribadi (UU PDP No. 27 Tahun 2022) bagi para donatur dan mitra Yayasan Abdi Laksata Raya.",
  alternates: { canonical: "/kebijakan-privasi" },
};

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="shell max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-[0.72rem] tracking-wider uppercase text-muted">
            <Link href="/" className="hover:text-ink transition-colors">
              Beranda
            </Link>
            <span className="mx-2 text-line">/</span>
            <span className="text-forest font-medium">Kebijakan Privasi</span>
          </nav>

          <header className="border-b border-line/70 pb-8">
            <span className="eyebrow text-forest">Transparansi & Akuntabilitas</span>
            <h1 className="display-lg mt-2 font-display text-ink leading-tight">
              Kebijakan Privasi & Pelindungan Data Donatur
            </h1>
            <p className="mt-3 text-sm text-muted">
              Terakhir diperbarui: 22 Oktober 2026 • Memenuhi Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
            </p>
          </header>

          <article className="prose max-w-none text-muted space-y-8 pt-8 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-normal">
                1. Komitmen Kami
              </h2>
              <p>
                Yayasan Abdi Laksata Raya (&ldquo;ALTARA&rdquo;) berkomitmen penuh untuk menjaga
                kepercayaan para donatur dan masyarakat luas. Dalam setiap penyelenggaraan penggalangan
                dana dan kegiatan kemanusiaan, kami memperlakukan data pribadi Anda secara bertanggung
                jawab, transparan, dan sesuai dengan ketentuan Undang-Undang Republik Indonesia Nomor 27
                Tahun 2022 tentang Pelindungan Data Pribadi (&ldquo;UU PDP&rdquo;).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-normal">
                2. Data Pribadi yang Kami Kumpulkan
              </h2>
              <p>
                Ketika Anda melakukan donasi melalui situs web ALTARA, kami mengumpulkan data yang Anda
                berikan secara sukarela, meliputi:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-ink/80">
                <li>
                  <strong>Identitas Diri:</strong> Nama donatur (atau opsi &ldquo;Hamba Allah&rdquo; jika Anda memilih donasi secara anonim).
                </li>
                <li>
                  <strong>Data Kontak:</strong> Alamat surel (email) dan nomor telepon/WhatsApp untuk pengiriman konfirmasi serta bukti donasi.
                </li>
                <li>
                  <strong>Informasi Transaksi:</strong> Nominal donasi, program kampanye yang dituju, kode unik referensi transaksi, waktu pengiriman, dan pesan/doa dari donatur.
                </li>
                <li>
                  <strong>Data Teknis:</strong> Alamat IP dan informasi peramban standar semata-mata untuk pencegahan serangan siber, penyalahgunaan bot, dan pembatasan laju request (<em>rate limiting</em>).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-normal">
                3. Tujuan Pemrosesan Data
              </h2>
              <p>
                Data pribadi yang Anda percayakan kepada yayasan hanya diproses untuk tujuan-tujuan yang sah berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-ink/80">
                <li>Pencatatan dan rekonsiliasi transfer donasi dengan rekening resmi yayasan.</li>
                <li>Penerbitan dan pengiriman tanda terima resmi (<em>official receipt</em>) donasi.</li>
                <li>Penyampaian laporan perkembangan dan akuntabilitas penyaluran bantuan program terkait.</li>
                <li>Pemenuhan kewajiban pelaporan dan audit keuangan nirlaba sesuai peraturan perundang-undangan di Indonesia.</li>
              </ul>
              <p className="rounded-sm border border-forest/20 bg-forest/5 p-4 text-xs sm:text-sm text-forest font-medium">
                ALTARA tidak pernah dan tidak akan pernah menjual, menyewakan, atau membagikan data kontak donatur kepada pihak ketiga untuk kepentingan komersial atau periklanan.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-normal">
                4. Batasan Akses & Keamanan Data
              </h2>
              <p>
                Akses terhadap data pribadi donatur dibatasi secara ketat hanya kepada staf dan pengurus yayasan yang memiliki wewenang operasional langsung (<em>least privilege access</em>). Seluruh komunikasi data dienkripsi dengan standar TLS/HTTPS, dan penyimpanan data diamankan dengan kata sandi ter-hash serta mekanisme proteksi sesi berlapis.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-normal">
                5. Masa Simpan Data (Retensi)
              </h2>
              <p>
                Data transaksi donasi disimpan selama masa retensi hukum pembukuan yayasan nirlaba (minimal 5 tahun sesuai standar akuntansi dan audit lembaga nirlaba). Setelah masa retensi berakhir atau atas permohonan donatur yang sah, data pribadi yang tidak lagi diwajibkan oleh hukum akan dihapus atau dianonimkan secara permanen.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-normal">
                6. Hak Donatur sebagai Subjek Data
              </h2>
              <p>
                Sesuai UU PDP, Anda memiliki hak untuk:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-ink/80">
                <li>Memperoleh informasi mengenai kejelasan identitas dan tujuan pemrosesan data Anda.</li>
                <li>Melakukan pembaruan atau perbaikan data kontak Anda yang tersimpan di sistem kami.</li>
                <li>Meminta penghapusan atau penarikan data pribadi Anda sepanjang tidak bertentangan dengan kewajiban audit hukum.</li>
                <li>Memilih untuk berdonasi secara anonim tanpa menampilkan nama Anda di ruang publik.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-line/70 pt-6">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-normal">
                7. Kontak Narahubung & Pejabat Data
              </h2>
              <p>
                Apabila Anda memiliki pertanyaan, klarifikasi, atau hendak mengajukan hak subjek data terkait pelindungan data pribadi di ALTARA, silakan menghubungi narahubung resmi kami:
              </p>
              <div className="rounded-sm border border-line bg-parchment p-5 space-y-1 text-xs sm:text-sm text-ink">
                <p><strong>Yayasan Abdi Laksata Raya</strong></p>
                <p>Email: <span className="text-forest font-mono">{settings?.contact_email || "kontak@altara.or.id"}</span></p>
                {settings?.contact_whatsapp && (
                  <p>WhatsApp: <span className="text-forest font-mono">{settings.contact_whatsapp}</span></p>
                )}
                {settings?.office_address && (
                  <p className="text-muted pt-1">{settings.office_address}</p>
                )}
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
