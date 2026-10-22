import Link from "next/link";
import { Reveal, SectionHeader } from "./primitives";
import type { JournalPost, Stat, Story } from "@/lib/queries";

export function ImpactStats({ stats }: { stats: Stat[] }) {
  return (
    <section
      id="dampak"
      className="shell scroll-mt-24 border-t border-line py-24 md:py-28 lg:py-32"
    >
      <Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="eyebrow">Dampak dalam Angka</p>
          <p className="max-w-sm text-xs leading-relaxed text-muted">
            Data terverifikasi per Desember 2025, diaudit oleh auditor independen.
          </p>
        </div>
      </Reveal>
      <div className="mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.index} delay={i * 90}>
            <div className="hairline flex flex-col pt-6 md:pt-8">
              <span className="text-[0.62rem] tracking-[0.24em] text-muted">{stat.index}</span>
              <span className="mt-8 font-display text-[clamp(2.75rem,5.5vw,4.75rem)] font-light leading-none tracking-tight text-ink tabular-nums">
                {stat.value}
              </span>
              <span className="mt-4 max-w-[10rem] text-xs uppercase leading-relaxed tracking-wide text-muted">
                {stat.label}
              </span>
              {stat.isPlaceholder ? (
                <span className="mt-3 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                  Data contoh
                </span>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function StoryFeature() {
  return (
    <section className="border-t border-line py-24 md:py-32 lg:py-40">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-20">
        <Reveal className="overflow-hidden lg:col-span-6">
          <img
            src="/assets/story-feature.jpg"
            alt="Ratih berdiri di ambang pintu rumahnya sambil memeluk buku pelajaran"
            loading="lazy"
            width={1408}
            height={1600}
            className="aspect-[4/5] w-full object-cover"
          />
        </Reveal>
        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <p className="eyebrow">Sebuah Kisah Dampak</p>
            <h2 className="display-lg mt-6 font-display text-ink">
              Satu Kesempatan
              <br />
              Dapat Mengubah Segalanya.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 text-sm leading-relaxed text-muted">
              Ratih tumbuh di sebuah desa di Sumba Timur, tiga jam berjalan dari sekolah
              menengah terdekat. Pada usia empat belas tahun, ia hampir berhenti sekolah.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Tahun ini, ia menjadi perempuan pertama di desanya yang menempuh pendidikan
              tinggi — dan kini kembali setiap akhir pekan untuk mengajar dua belas anak
              lain.
            </p>
            <a
              href="#cerita"
              className="group mt-10 inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:border-ink"
            >
              Baca Kisahnya
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function JournalSection({ journal }: { journal: JournalPost[] }) {
  return (
    <section id="jurnal" className="scroll-mt-24 border-t border-line py-24 md:py-32 lg:py-40">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Jurnal"
            title="Catatan dari lapangan."
            className="max-w-2xl"
          />
          <Reveal delay={120}>
            <a
              href="#jurnal"
              className="group inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:border-ink"
            >
              Semua Tulisan
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-14 lg:grid-cols-12 lg:gap-y-20">
          {journal.map((post, i) => (
            <Reveal
              key={post.title}
              delay={i * 90}
              className={`group ${i === 0 ? "lg:col-span-6" : "lg:col-span-3"}`}
            >
              <Link
                href={post.slug ? `/jurnal/${post.slug}` : "#jurnal"}
                className="block"
              >
                <div className="overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.alt}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03] ${
                      i === 0 ? "aspect-[16/10]" : "aspect-[4/5]"
                    }`}
                  />
                </div>
                <div className="hairline mt-6 flex items-baseline justify-between gap-4 pt-5">
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">
                    {post.category}
                  </span>
                  <span className="text-[0.62rem] tracking-[0.18em] text-muted">
                    {post.date}
                  </span>
                </div>
                <h3
                  className={`mt-5 font-display font-light leading-tight text-ink ${
                    i === 0
                      ? "text-[clamp(1.75rem,2.8vw,2.5rem)]"
                      : "text-[clamp(1.375rem,1.9vw,1.75rem)]"
                  }`}
                >
                  {post.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StoryGrid({ stories }: { stories: Story[] }) {
  return (
    <section id="cerita" className="scroll-mt-24 border-t border-line py-24 md:py-32 lg:py-40">
      <div className="shell">
        <SectionHeader
          eyebrow="Cerita Dampak"
          title="Perubahan selalu punya nama dan wajah."
        />
        <div className="mt-16 grid gap-x-8 gap-y-16 lg:grid-cols-12 lg:gap-y-24">
          {stories.map((story, i) => (
            <Reveal
              key={story.title}
              delay={(i % 2) * 90}
              className={`group ${i % 2 === 0 ? "lg:col-span-7" : "lg:col-span-5 lg:mt-16"}`}
            >
              <Link
                href={story.slug ? `/cerita/${story.slug}` : "#cerita"}
                className="block"
              >
                <div className="overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.alt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="hairline mt-6 flex items-baseline justify-between pt-5">
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">
                    {story.category}
                  </span>
                  <span aria-hidden className="text-muted transition-all duration-500 group-hover:translate-x-1 group-hover:text-ink">
                    →
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[clamp(1.5rem,2.2vw,2.125rem)] font-light leading-tight text-ink">
                  {story.title}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                  {story.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
