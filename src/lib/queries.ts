import { queryMaybe } from "@/lib/db";
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
      slug: p.title.toLowerCase(),
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
      slug: s.title.toLowerCase(),
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
      slug: j.title.toLowerCase(),
      excerpt: j.excerpt,
      body: "",
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
