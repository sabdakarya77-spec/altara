import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getStories, getStoryBySlug } from "@/lib/queries";

export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const stories = await getStories();
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return {};
  return {
    title: `${story.title} — Yayasan Abdi Laksata Raya`,
    description: story.description,
    alternates: { canonical: `/cerita/${slug}` },
    openGraph: {
      title: story.title,
      description: story.description,
      type: "article",
      images: story.image ? [{ url: story.image, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function CeritaPage({ params }: Props) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero foto */}
      {story.image && (
        <div className="relative h-[55svh] w-full overflow-hidden bg-ink lg:h-[65svh]">
          <Image
            src={story.image}
            alt={story.alt}
            fill
            sizes="100vw"
            className="object-cover opacity-75"
            priority
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/20" />
          <div className="shell absolute bottom-0 pb-10 lg:pb-16">
            <p className="eyebrow text-gold">{story.category}</p>
            <h1 className="display-lg mt-3 max-w-3xl font-display text-parchment">
              {story.title}
            </h1>
          </div>
        </div>
      )}

      {/* Konten */}
      <article className="shell py-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="body-lead">{story.description}</p>
          <div className="hairline mt-12 pt-8">
            <a
              href="/#cerita"
              className="text-[0.72rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
            >
              ← Semua Cerita
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
