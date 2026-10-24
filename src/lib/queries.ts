import { queryMaybe } from "@/lib/db";
import { slugify } from "@/lib/slug";
import {
  documents as seedDocuments,
  journal as seedJournal,
  partners as seedPartners,
  programs as seedPrograms,
  stats as seedStats,
  stories as seedStories,
} from "@/data/content";

export type Program = {
  id: number;
  index: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  alt: string;
  published: boolean;
  sortOrder: number;
};

export type Story = {
  id: number;
  category: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  alt: string;
  published: boolean;
  sortOrder: number;
};

export type Stat = {
  id: number;
  index: string;
  value: string;
  label: string;
  sortOrder: number;
  isPlaceholder: boolean;
};

export type JournalPost = {
  id: number;
  category: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image: string;
  alt: string;
  date: string;
  published: boolean;
  sortOrder: number;
};

export type DocumentItem = {
  id: number;
  title: string;
  meta: string;
  fileUrl: string;
  published: boolean;
  sortOrder: number;
};

export type Partner = {
  id: number;
  name: string;
  logoUrl: string;
  published: boolean;
  sortOrder: number;
};

/**
 * Format tanggal Indonesia: "9 Januari 2026" (tanpa nol di depan).
 */
export function formatDateId(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

type ProgramRow = {
  id: number; idx: string; title: string; slug: string; description: string;
  image: string; alt: string; published: boolean; sort_order: number;
};

export async function getPrograms(includeDrafts = false): Promise<Program[]> {
  const sql = includeDrafts
    ? "SELECT * FROM programs ORDER BY sort_order, id"
    : "SELECT * FROM programs WHERE published ORDER BY sort_order, id";
  const rows = await queryMaybe<ProgramRow>(sql);
  if (rows === null) {
    return seedPrograms.map((p, i) => ({
      id: i + 1,
      index: p.index,
      title: p.title,
      slug: slugify(p.title),
      description: p.description,
      image: p.image,
      alt: p.alt,
      published: true,
      sortOrder: i,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    index: r.idx,
    title: r.title,
    slug: r.slug,
    description: r.description,
    image: r.image,
    alt: r.alt,
    published: r.published,
    sortOrder: r.sort_order,
  }));
}

type StoryRow = {
  id: number; category: string; title: string; slug: string; description: string;
  image: string; alt: string; published: boolean; sort_order: number;
};

export async function getStories(includeDrafts = false): Promise<Story[]> {
  const sql = includeDrafts
    ? "SELECT * FROM stories ORDER BY sort_order, id"
    : "SELECT * FROM stories WHERE published ORDER BY sort_order, id";
  const rows = await queryMaybe<StoryRow>(sql);
  if (rows === null) {
    return seedStories.map((s, i) => ({
      id: i + 1,
      category: s.category,
      title: s.title,
      slug: slugify(s.title),
      description: s.description,
      image: s.image,
      alt: s.alt,
      published: true,
      sortOrder: i,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    slug: r.slug,
    description: r.description,
    image: r.image,
    alt: r.alt,
    published: r.published,
    sortOrder: r.sort_order,
  }));
}

type StatRow = {
  id: number; idx: string; value: string; label: string;
  sort_order: number; is_placeholder: boolean;
};

export async function getStats(): Promise<Stat[]> {
  const rows = await queryMaybe<StatRow>("SELECT * FROM stats ORDER BY sort_order, id");
  if (rows === null) {
    return seedStats.map((s, i) => ({
      id: i + 1,
      index: s.index,
      value: s.value,
      label: s.label,
      sortOrder: i,
      isPlaceholder: true,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    index: r.idx,
    value: r.value,
    label: r.label,
    sortOrder: r.sort_order,
    isPlaceholder: r.is_placeholder,
  }));
}

type JournalRow = {
  id: number; category: string; title: string; slug: string; excerpt: string;
  body: string; cover_image: string; alt: string; published_at: Date | null;
  published: boolean; sort_order: number;
};

export async function getJournal(includeDrafts = false): Promise<JournalPost[]> {
  const sql = includeDrafts
    ? "SELECT * FROM journal_posts ORDER BY sort_order, id"
    : "SELECT * FROM journal_posts WHERE published ORDER BY sort_order, id";
  const rows = await queryMaybe<JournalRow>(sql);
  if (rows === null) {
    return seedJournal.map((j, i) => ({
      id: i + 1,
      category: j.category,
      title: j.title,
      slug: slugify(j.title),
      excerpt: j.excerpt,
      body: j.excerpt,
      image: j.image,
      alt: j.alt,
      date: j.date,
      published: true,
      sortOrder: i,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    body: r.body,
    image: r.cover_image,
    alt: r.alt,
    date: r.published_at ? formatDateId(r.published_at) : "",
    published: r.published,
    sortOrder: r.sort_order,
  }));
}

type DocumentRow = {
  id: number; title: string; meta: string; file_url: string;
  published: boolean; sort_order: number;
};

export async function getDocuments(includeDrafts = false): Promise<DocumentItem[]> {
  const sql = includeDrafts
    ? "SELECT * FROM documents ORDER BY sort_order, id"
    : "SELECT * FROM documents WHERE published ORDER BY sort_order, id";
  const rows = await queryMaybe<DocumentRow>(sql);
  if (rows === null) {
    return seedDocuments.map((d, i) => ({
      id: i + 1,
      title: d.title,
      meta: d.meta,
      fileUrl: "",
      published: true,
      sortOrder: i,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    meta: r.meta,
    fileUrl: r.file_url,
    published: r.published,
    sortOrder: r.sort_order,
  }));
}

type PartnerRow = {
  id: number; name: string; logo_url: string;
  published: boolean; sort_order: number;
};

export async function getPartners(includeDrafts = false): Promise<Partner[]> {
  const sql = includeDrafts
    ? "SELECT * FROM partners ORDER BY sort_order, id"
    : "SELECT * FROM partners WHERE published ORDER BY sort_order, id";
  const rows = await queryMaybe<PartnerRow>(sql);
  if (rows === null) {
    return seedPartners.map((name, i) => ({
      id: i + 1,
      name,
      logoUrl: "",
      published: true,
      sortOrder: i,
    }));
  }
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    logoUrl: r.logo_url,
    published: r.published,
    sortOrder: r.sort_order,
  }));
}

/* ─── Fetch tunggal by slug (untuk route publik) ──────────────────────── */

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const rows = await queryMaybe<ProgramRow>(
    "SELECT * FROM programs WHERE slug = $1 AND published LIMIT 1",
    [slug]
  );
  if (rows === null) {
    const idx = seedPrograms.findIndex((p) => slugify(p.title) === slug);
    if (idx === -1) return null;
    const p = seedPrograms[idx];
    return {
      id: idx + 1,
      index: p.index,
      title: p.title,
      slug: slugify(p.title),
      description: p.description,
      image: p.image,
      alt: p.alt,
      published: true,
      sortOrder: idx,
    };
  }
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    index: r.idx,
    title: r.title,
    slug: r.slug,
    description: r.description,
    image: r.image,
    alt: r.alt,
    published: r.published,
    sortOrder: r.sort_order,
  };
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const rows = await queryMaybe<StoryRow>(
    "SELECT * FROM stories WHERE slug = $1 AND published LIMIT 1",
    [slug]
  );
  if (rows === null) {
    const idx = seedStories.findIndex((s) => slugify(s.title) === slug);
    if (idx === -1) return null;
    const s = seedStories[idx];
    return {
      id: idx + 1,
      category: s.category,
      title: s.title,
      slug: slugify(s.title),
      description: s.description,
      image: s.image,
      alt: s.alt,
      published: true,
      sortOrder: idx,
    };
  }
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    category: r.category,
    title: r.title,
    slug: r.slug,
    description: r.description,
    image: r.image,
    alt: r.alt,
    published: r.published,
    sortOrder: r.sort_order,
  };
}

export async function getJournalBySlug(slug: string): Promise<JournalPost | null> {
  const rows = await queryMaybe<JournalRow>(
    "SELECT * FROM journal_posts WHERE slug = $1 AND published LIMIT 1",
    [slug]
  );
  if (rows === null) {
    const idx = seedJournal.findIndex((j) => slugify(j.title) === slug);
    if (idx === -1) return null;
    const j = seedJournal[idx];
    return {
      id: idx + 1,
      category: j.category,
      title: j.title,
      slug: slugify(j.title),
      excerpt: j.excerpt,
      body: j.excerpt,
      image: j.image,
      alt: j.alt,
      date: j.date,
      published: true,
      sortOrder: idx,
    };
  }
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    category: r.category,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    body: r.body,
    image: r.cover_image,
    alt: r.alt,
    date: r.published_at ? formatDateId(r.published_at) : "",
    published: r.published,
    sortOrder: r.sort_order,
  };
}

/* ─── Hero Slides (Beranda) ─────────────────────────────────────────── */

export type { HeroSlide } from "@/data/hero-slides";
export { DEFAULT_HERO_SLIDES } from "@/data/hero-slides";
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/data/hero-slides";

type HeroSlideRow = {
  id: number;
  headline: string;
  caption: string;
  location: string;
  image_url: string;
  alt: string;
  object_position: string;
  ken_burns: string;
  sort_order: number;
  published: boolean;
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const rows = await queryMaybe<HeroSlideRow>(
    "SELECT * FROM hero_slides WHERE published ORDER BY sort_order, id"
  );
  if (!rows || rows.length === 0) {
    return DEFAULT_HERO_SLIDES;
  }
  return rows.map((r) => ({
    id: r.id,
    headline: r.headline,
    caption: r.caption,
    location: r.location,
    imageUrl: r.image_url,
    alt: r.alt,
    objectPosition: r.object_position || "center 35%",
    kenBurns: r.ken_burns || "zoom-in",
    published: r.published,
    sortOrder: r.sort_order,
  }));
}

/* ─── Pengaturan Organisasi ─────────────────────────────────────────── */

export type { SiteSettings } from "@/data/settings";
export { DEFAULT_SETTINGS } from "@/data/settings";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/data/settings";

export async function getSettings(): Promise<SiteSettings> {
  const rows = await queryMaybe<{ key: string; value: string }>(
    "SELECT key, value FROM settings"
  );
  if (!rows || rows.length === 0) {
    return DEFAULT_SETTINGS;
  }
  const result = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in result) {
      (result as Record<string, string>)[r.key] = r.value;
    }
  }
  return result;
}

/* ─── Program Donasi (Campaigns) ────────────────────────────────────── */

export type { Campaign, Donation, DonationStatus } from "@/data/campaigns";
export { DEFAULT_CAMPAIGNS, formatRupiah } from "@/data/campaigns";
import { DEFAULT_CAMPAIGNS, type Campaign } from "@/data/campaigns";

type CampaignRow = {
  id: number;
  title: string;
  slug: string;
  category: string;
  short_desc: string;
  description: string;
  image_url: string;
  target_amount: string | number;
  collected_amount: string | number;
  donor_count: number;
  start_date: Date | string;
  end_date: Date | string | null;
  published: boolean;
  featured: boolean;
  is_placeholder?: boolean;
  sort_order: number;
};

function mapCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: (r.category as Campaign["category"]) || "Umum",
    short_desc: r.short_desc || "",
    description: r.description || "",
    image_url: r.image_url || "",
    target_amount: Number(r.target_amount || 0),
    collected_amount: Number(r.collected_amount || 0),
    donor_count: Number(r.donor_count || 0),
    start_date: typeof r.start_date === "string" ? r.start_date : new Date(r.start_date).toISOString(),
    end_date: r.end_date ? (typeof r.end_date === "string" ? r.end_date : new Date(r.end_date).toISOString()) : null,
    published: r.published,
    featured: r.featured,
    is_placeholder: Boolean(r.is_placeholder),
    sort_order: r.sort_order,
  };
}

export async function getCampaigns(includeDrafts = false): Promise<Campaign[]> {
  const sql = includeDrafts
    ? "SELECT * FROM campaigns ORDER BY sort_order, id"
    : "SELECT * FROM campaigns WHERE published ORDER BY sort_order, id";
  const rows = await queryMaybe<CampaignRow>(sql);
  if (!rows || rows.length === 0) {
    return includeDrafts ? DEFAULT_CAMPAIGNS : DEFAULT_CAMPAIGNS.filter((c) => c.published);
  }
  return rows.map(mapCampaign);
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const rows = await queryMaybe<CampaignRow>(
    "SELECT * FROM campaigns WHERE slug = $1 AND published = true",
    [slug]
  );
  if (rows && rows.length > 0) {
    return mapCampaign(rows[0]);
  }
  return DEFAULT_CAMPAIGNS.find((c) => c.slug === slug && c.published) ?? null;
}
