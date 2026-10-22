import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Closing";
import { CampaignCard } from "@/components/donation/CampaignCard";
import { getCampaigns, getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Katalog Program Donasi — Yayasan Abdi Laksata Raya",
  description:
    "Salurkan donasi Anda untuk program pendidikan, kesehatan, lingkungan, dan kemanusiaan terukur bersama Yayasan Abdi Laksata Raya.",
  alternates: { canonical: "/donasi" },
};

export default async function DonationCatalogPage() {
  const [campaigns, settings] = await Promise.all([
    getCampaigns(),
    getSettings(),
  ]);

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="shell">
          {/* Header Katalog */}
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-4 text-[0.72rem] tracking-wider uppercase text-muted">
              <Link href="/" className="hover:text-ink transition-colors">
                Beranda
              </Link>
              <span className="mx-2 text-line">/</span>
              <span className="text-forest font-medium">Program Donasi</span>
            </nav>

            <span className="eyebrow text-gold">Gotong Royong Sesama</span>
            <h1 className="display-lg mt-2 font-display text-ink leading-tight">
              Katalog Penggalangan Dana
            </h1>
            <p className="body-lead mt-4 text-muted">
              Setiap rupiah yang Anda percayakan disalurkan langsung ke lapangan dengan
              pertanggungjawaban terbuka dan laporan terukur.
            </p>
          </div>

          {/* Grid Kampanye */}
          <div className="mt-12 sm:mt-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>

          {/* Opsi Donasi Rekening Resmi Yayasan */}
          <section className="mt-20 sm:mt-24 rounded-sm border border-line bg-parchment p-8 sm:p-12 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <span className="eyebrow text-forest">Transfer Langsung</span>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl text-ink font-normal">
                  Donasi Rekening Resmi Yayasan
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Bagi lembaga, korporasi, atau perseorangan yang ingin menyalurkan donasi dalam jumlah
                  besar atau melalui transfer perbankan konvensional:
                </p>

                <div className="mt-6 flex flex-wrap gap-6 text-sm">
                  {settings.bank_name && (
                    <div className="rounded-sm border border-line/80 bg-ivory/80 px-4 py-3">
                      <span className="block text-[0.68rem] uppercase tracking-wider text-muted">
                        Bank Tujuan
                      </span>
                      <strong className="text-base text-ink">{settings.bank_name}</strong>
                    </div>
                  )}
                  {settings.bank_account_no && (
                    <div className="rounded-sm border border-line/80 bg-ivory/80 px-4 py-3">
                      <span className="block text-[0.68rem] uppercase tracking-wider text-muted">
                        Nomor Rekening
                      </span>
                      <strong className="text-base font-mono text-forest">
                        {settings.bank_account_no}
                      </strong>
                    </div>
                  )}
                  {settings.bank_account_holder && (
                    <div className="rounded-sm border border-line/80 bg-ivory/80 px-4 py-3">
                      <span className="block text-[0.68rem] uppercase tracking-wider text-muted">
                        Atas Nama
                      </span>
                      <strong className="text-base text-ink">{settings.bank_account_holder}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {settings.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, "")}?text=Halo%20ALTARA,%20saya%20telah%20menyalurkan%20donasi.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-sm bg-forest px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-forest/90"
                  >
                    Konfirmasi via WhatsApp
                  </a>
                )}
                <Link
                  href="/#transparansi"
                  className="inline-flex items-center justify-center rounded-sm border border-line px-6 py-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  Lihat Laporan Transparansi
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
