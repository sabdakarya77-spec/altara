import Link from "next/link";
import Image from "next/image";
import { type Campaign, formatRupiah } from "@/data/campaigns";

interface Props {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: Props) {
  const target = campaign.target_amount;
  const collected = campaign.collected_amount;
  const percentage = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 100;

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-line/80 bg-parchment shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-md">
      {/* Gambar Kampanye */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
        {campaign.image_url ? (
          <Image
            src={campaign.image_url}
            alt={campaign.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-forest text-parchment/60">
            <span className="font-display text-2xl italic">ALTARA</span>
          </div>
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/95 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-forest backdrop-blur-sm shadow-sm">
          {campaign.category}
        </span>
      </div>

      {/* Konten & Progres */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-normal leading-snug text-ink transition-colors group-hover:text-forest">
            <Link href={`/donasi/${campaign.slug}`} className="focus:outline-none">
              {campaign.title}
            </Link>
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted line-clamp-2">
            {campaign.short_desc || campaign.description}
          </p>
        </div>

        {/* Progress Bar & Metrik */}
        <div className="mt-6 border-t border-line/60 pt-4">
          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-forest transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <div>
                <span className="text-[0.68rem] uppercase tracking-wider text-muted">Terkumpul</span>
                <p className="font-medium text-forest sm:text-sm">{formatRupiah(collected)}</p>
              </div>
              <div className="text-right">
                <span className="text-[0.68rem] uppercase tracking-wider text-muted">
                  {target > 0 ? "Target" : "Status"}
                </span>
                <p className="font-medium text-ink sm:text-sm">
                  {target > 0 ? formatRupiah(target) : "Donasi Terbuka"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line/40 pt-3 text-xs text-muted">
            <span>
              <strong className="text-ink font-semibold">{campaign.donor_count}</strong> Donatur
            </span>
            <Link
              href={`/donasi/${campaign.slug}`}
              className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-wider text-forest transition-colors hover:text-ink"
            >
              Donasi Sekarang <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
