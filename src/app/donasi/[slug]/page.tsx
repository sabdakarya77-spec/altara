import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Closing";
import { DonationForm } from "@/components/donation/DonationForm";
import { getCampaigns, getCampaignBySlug, getSettings, formatRupiah } from "@/lib/queries";

export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const campaigns = await getCampaigns();
  return campaigns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return {};

  return {
    title: `Donasi: ${campaign.title} — Yayasan Abdi Laksata Raya`,
    description: campaign.short_desc || campaign.description,
    alternates: { canonical: `/donasi/${slug}` },
    openGraph: {
      title: `Donasi: ${campaign.title}`,
      description: campaign.short_desc || campaign.description,
      images: campaign.image_url ? [{ url: campaign.image_url, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function DonationDetailPage({ params }: Props) {
  const { slug } = await params;
  const [campaign, settings] = await Promise.all([
    getCampaignBySlug(slug),
    getSettings(),
  ]);

  if (!campaign) notFound();

  const target = campaign.target_amount;
  const collected = campaign.collected_amount;
  const percentage = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 100;

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="shell">
          {/* Breadcrumb Navigasi */}
          <nav aria-label="Breadcrumb" className="mb-6 text-[0.72rem] tracking-wider uppercase text-muted">
            <Link href="/" className="hover:text-ink transition-colors">
              Beranda
            </Link>
            <span className="mx-2 text-line">/</span>
            <Link href="/donasi" className="hover:text-ink transition-colors">
              Program Donasi
            </Link>
            <span className="mx-2 text-line">/</span>
            <span className="text-forest font-medium line-clamp-1 max-w-[200px] sm:max-w-none inline-block align-bottom">
              {campaign.title}
            </span>
          </nav>

          {/* Grid Utama: Kiri Konten & Cerita, Kanan Sticky Form Donasi */}
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 items-start">
            {/* Kolom Kiri: Detail Program & Kisah Lapangan */}
            <article className="lg:col-span-7 space-y-8">
              <div>
                <span className="inline-block rounded-full bg-forest/10 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-forest">
                  {campaign.category}
                </span>
                <h1 className="display-lg mt-3 font-display text-ink leading-tight">
                  {campaign.title}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                  {campaign.short_desc}
                </p>
              </div>

              {/* Foto Utama Program */}
              {campaign.image_url && (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-line/80 bg-ink shadow-sm">
                  <Image
                    src={campaign.image_url}
                    alt={campaign.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Progress Bar di Mobile/Tablet View */}
              <div className="rounded-sm border border-line bg-parchment p-6 lg:hidden">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted">Dana Terkumpul</span>
                    <span className="font-display text-2xl font-normal text-forest">
                      {formatRupiah(collected)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-forest transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted pt-1">
                    <span>{percentage}% dari target</span>
                    <span>Target: {target > 0 ? formatRupiah(target) : "Donasi Terbuka"}</span>
                  </div>
                </div>
              </div>

              {/* Narasi Lengkap Program */}
              <div className="prose max-w-none text-muted space-y-5 border-t border-line/70 pt-8 text-base leading-relaxed">
                <h2 className="font-display text-2xl text-ink font-normal">
                  Tentang Program Ini
                </h2>
                <p>{campaign.description}</p>
                <p>
                  Melalui inisiatif ini, tim lapangan ALTARA berkoordinasi langsung dengan tokoh
                  masyarakat dan relawan lokal untuk memastikan setiap tahapan berjalan tepat sasaran,
                  efisien, dan berdaya guna jangka panjang bagi para penerima manfaat.
                </p>
              </div>

              {/* Komitmen Akuntabilitas */}
              <div className="rounded-sm border border-gold/40 bg-parchment p-6">
                <h3 className="font-display text-xl text-ink font-normal flex items-center gap-2">
                  <span className="text-gold">✦</span> Komitmen Akuntabilitas ALTARA
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                  Laporan penggunaan dana program ini akan dipublikasikan secara transparan
                  melalui kanal Jurnal ALTARA dan dokumen laporan berkala yang dapat diakses publik.
                </p>
              </div>
            </article>

            {/* Kolom Kanan: Sticky Form Donasi */}
            <aside className="lg:col-span-5 lg:sticky lg:top-28">
              <DonationForm campaign={campaign} settings={settings} />
            </aside>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
