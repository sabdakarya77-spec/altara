import type { MetadataRoute } from "next";
import { getPrograms, getStories, getJournal, getCampaigns } from "@/lib/queries";

const BASE = "https://altara.or.id";

/** Slug yang aman untuk URL: tidak ada spasi, tidak ada karakter aneh. */
function isCleanSlug(slug: string): boolean {
  return slug.length > 0 && /^[a-z0-9-]+$/.test(slug);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, stories, journal, campaigns] = await Promise.all([
    getPrograms(),
    getStories(),
    getJournal(),
    getCampaigns(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/donasi`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const programRoutes: MetadataRoute.Sitemap = programs
    .filter((p) => isCleanSlug(p.slug))
    .map((p) => ({
      url: `${BASE}/program/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const storyRoutes: MetadataRoute.Sitemap = stories
    .filter((s) => isCleanSlug(s.slug))
    .map((s) => ({
      url: `${BASE}/cerita/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const journalRoutes: MetadataRoute.Sitemap = journal
    .filter((j) => isCleanSlug(j.slug))
    .map((j) => ({
      url: `${BASE}/jurnal/${j.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));

  const campaignRoutes: MetadataRoute.Sitemap = campaigns
    .filter((c) => isCleanSlug(c.slug))
    .map((c) => ({
      url: `${BASE}/donasi/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...programRoutes, ...storyRoutes, ...journalRoutes, ...campaignRoutes];
}
