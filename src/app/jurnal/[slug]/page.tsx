import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getJournal, getJournalBySlug } from "@/lib/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getJournal();
  return posts.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Jurnal ALTARA`,
    description: post.excerpt,
    alternates: { canonical: `/jurnal/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function JurnalPage({ params }: Props) {
  const { slug } = await params;
  const post = await getJournalBySlug(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-ivory">
      {/* Hero foto */}
      {post.image && (
        <div className="relative h-[45svh] w-full overflow-hidden bg-ink lg:h-[52svh]">
          <Image
            src={post.image}
            alt={post.alt}
            fill
            sizes="100vw"
            className="object-cover opacity-70"
            priority
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 to-ink/25" />
          <div className="shell absolute bottom-0 pb-10 lg:pb-14">
            <p className="eyebrow text-goldsoft">{post.category}</p>
            {post.date && (
              <p className="mt-1 text-[0.72rem] uppercase tracking-[0.18em] text-parchment/50">
                {post.date}
              </p>
            )}
            <h1 className="display-md mt-4 max-w-3xl font-display text-parchment">
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* Artikel */}
      <article className="shell py-16 lg:py-24">
        <div className="max-w-2xl">
          {/* Excerpt / lead */}
          <p className="body-lead">{post.excerpt}</p>

          {/* Body — ditampilkan jika ada (dari DB) */}
          {post.body && (
            <div
              className="prose prose-neutral mt-10 max-w-none"
              // Body disimpan sebagai Markdown yang sudah disanitasi di DB
              // Untuk sprint ini ditampilkan sebagai teks polos;
              // tambahkan remark/react-markdown saat body aktif dipakai
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}

          <div className="hairline mt-12 pt-8">
            <a
              href="/#jurnal"
              className="text-[0.72rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
            >
              ← Semua Jurnal
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
