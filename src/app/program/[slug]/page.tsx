import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPrograms, getProgramBySlug } from "@/lib/queries";

// slug baru (dibuat lewat panel admin setelah build) tetap dilayani on-demand
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return {};
  return {
    title: `${program.title} — Yayasan Abdi Laksata Raya`,
    description: program.description,
    alternates: { canonical: `/program/${slug}` },
    openGraph: {
      title: program.title,
      description: program.description,
      images: program.image ? [{ url: program.image, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero foto */}
      {program.image && (
        <div className="relative h-[50svh] w-full overflow-hidden bg-ink lg:h-[60svh]">
          <Image
            src={program.image}
            alt={program.alt}
            fill
            sizes="100vw"
            className="object-cover opacity-80"
            priority
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="shell absolute bottom-0 pb-10">
            <p className="eyebrow text-parchment/60">{program.index}</p>
            <h1 className="display-lg mt-3 font-display text-parchment">{program.title}</h1>
          </div>
        </div>
      )}

      {/* Konten */}
      <article className="shell py-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="body-lead">{program.description}</p>
          <div className="hairline mt-12 pt-8">
            <a
              href="/#program"
              className="text-[0.72rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
            >
              ← Semua Program
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
