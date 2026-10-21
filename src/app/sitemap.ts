import type { MetadataRoute } from "next";
import { getPrograms, getStories, getJournal } from "@/lib/queries";

const BASE = "https://altara.or.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, stories, journal] = await Promise.all([
    getPrograms(),
    getStories(),
    getJournal(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/#tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/#program`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/#transparansi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const programRoutes: MetadataRoute.Sitemap = programs
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE}/program/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const storyRoutes: MetadataRoute.Sitemap = stories
    .filter((s) => s.slug)
    .map((s) => ({
      url: `${BASE}/cerita/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const journalRoutes: MetadataRoute.Sitemap = journal
    .filter((j) => j.slug)
    .map((j) => ({
      url: `${BASE}/jurnal/${j.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));

  return [...staticRoutes, ...programRoutes, ...storyRoutes, ...journalRoutes];
}
