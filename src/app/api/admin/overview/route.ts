import { NextResponse } from "next/server";
import { getSessionHashFromCookies, isSessionValid } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { DEFAULT_HERO_SLIDES } from "@/data/hero-slides";
import {
  documents as seedDocuments,
  journal as seedJournal,
  partners as seedPartners,
  programs as seedPrograms,
  stats as seedStats,
  stories as seedStories,
} from "@/data/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type OverviewMetrics = {
  hero: { total: number; published: number };
  programs: { total: number; published: number };
  stories: { total: number; published: number };
  journal: { total: number; published: number };
  documents: { total: number; published: number };
  partners: { total: number; published: number };
  stats: { total: number; verified: number };
};

export type RecentItem = {
  type: "program" | "story" | "journal";
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
};

export type OverviewResponse = {
  dbConnected: boolean;
  metrics: OverviewMetrics;
  recentEntries: RecentItem[];
};

export async function GET() {
  const hash = await getSessionHashFromCookies();
  if (!(await isSessionValid(hash))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getPool();
  if (!pool) {
    // Mode fallback bila Postgres belum terhubung
    const metrics: OverviewMetrics = {
      hero: { total: DEFAULT_HERO_SLIDES.length, published: DEFAULT_HERO_SLIDES.length },
      programs: { total: seedPrograms.length, published: seedPrograms.length },
      stories: { total: seedStories.length, published: seedStories.length },
      journal: { total: seedJournal.length, published: seedJournal.length },
      documents: { total: seedDocuments.length, published: seedDocuments.length },
      partners: { total: seedPartners.length, published: seedPartners.length },
      stats: { total: seedStats.length, verified: 0 },
    };

    const recentEntries: RecentItem[] = [
      ...seedJournal.slice(0, 2).map((j) => ({
        type: "journal" as const,
        title: j.title,
        slug: j.title.toLowerCase().replace(/\s+/g, "-"),
        published: true,
        updatedAt: new Date().toISOString(),
      })),
      ...seedPrograms.slice(0, 2).map((p) => ({
        type: "program" as const,
        title: p.title,
        slug: p.title.toLowerCase().replace(/\s+/g, "-"),
        published: true,
        updatedAt: new Date().toISOString(),
      })),
      ...seedStories.slice(0, 1).map((s) => ({
        type: "story" as const,
        title: s.title,
        slug: s.title.toLowerCase().replace(/\s+/g, "-"),
        published: true,
        updatedAt: new Date().toISOString(),
      })),
    ];

    return NextResponse.json<OverviewResponse>({
      dbConnected: false,
      metrics,
      recentEntries,
    });
  }

  try {
    const [
      heroRes,
      programsRes,
      storiesRes,
      journalRes,
      docsRes,
      partnersRes,
      statsRes,
      recentRes,
    ] = await Promise.all([
      pool.query<{ count: string; published: string }>(
        "SELECT COUNT(*)::text AS count, COUNT(*) FILTER (WHERE published)::text AS published FROM hero_slides"
      ),
      pool.query<{ count: string; published: string }>(
        "SELECT COUNT(*)::text AS count, COUNT(*) FILTER (WHERE published)::text AS published FROM programs"
      ),
      pool.query<{ count: string; published: string }>(
        "SELECT COUNT(*)::text AS count, COUNT(*) FILTER (WHERE published)::text AS published FROM stories"
      ),
      pool.query<{ count: string; published: string }>(
        "SELECT COUNT(*)::text AS count, COUNT(*) FILTER (WHERE published)::text AS published FROM journal_posts"
      ),
      pool.query<{ count: string; published: string }>(
        "SELECT COUNT(*)::text AS count, COUNT(*) FILTER (WHERE published)::text AS published FROM documents"
      ),
      pool.query<{ count: string; published: string }>(
        "SELECT COUNT(*)::text AS count, COUNT(*) FILTER (WHERE published)::text AS published FROM partners"
      ),
      pool.query<{ count: string; verified: string }>(
        "SELECT COUNT(*)::text AS count, COUNT(*) FILTER (WHERE NOT is_placeholder)::text AS verified FROM stats"
      ),
      pool.query<{ type: "program" | "story" | "journal"; title: string; slug: string; published: boolean; updated_at: Date }>(`
        SELECT 'journal' AS type, title, slug, published, updated_at FROM journal_posts
        UNION ALL
        SELECT 'program' AS type, title, slug, published, updated_at FROM programs
        UNION ALL
        SELECT 'story' AS type, title, slug, published, updated_at FROM stories
        ORDER BY updated_at DESC LIMIT 6
      `),
    ]);

    const metrics: OverviewMetrics = {
      hero: {
        total: Number(heroRes.rows[0]?.count ?? 0),
        published: Number(heroRes.rows[0]?.published ?? 0),
      },
      programs: {
        total: Number(programsRes.rows[0]?.count ?? 0),
        published: Number(programsRes.rows[0]?.published ?? 0),
      },
      stories: {
        total: Number(storiesRes.rows[0]?.count ?? 0),
        published: Number(storiesRes.rows[0]?.published ?? 0),
      },
      journal: {
        total: Number(journalRes.rows[0]?.count ?? 0),
        published: Number(journalRes.rows[0]?.published ?? 0),
      },
      documents: {
        total: Number(docsRes.rows[0]?.count ?? 0),
        published: Number(docsRes.rows[0]?.published ?? 0),
      },
      partners: {
        total: Number(partnersRes.rows[0]?.count ?? 0),
        published: Number(partnersRes.rows[0]?.published ?? 0),
      },
      stats: {
        total: Number(statsRes.rows[0]?.count ?? 0),
        verified: Number(statsRes.rows[0]?.verified ?? 0),
      },
    };

    const recentEntries: RecentItem[] = recentRes.rows.map((r) => ({
      type: r.type,
      title: r.title,
      slug: r.slug,
      published: r.published,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json<OverviewResponse>({
      dbConnected: true,
      metrics,
      recentEntries,
    });
  } catch (err) {
    console.error("[api/admin/overview] Query error:", (err as Error).message);
    return NextResponse.json({ error: "Gagal memuat ringkasan data" }, { status: 500 });
  }
}
