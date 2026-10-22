import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionHashFromCookies, isSessionValid } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { deleteFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint CRUD admin.
 *
 * Satu route untuk semua koleksi agar permukaan API kecil dan mudah diaudit.
 * Koleksi: programs | stories | stats | journal | documents | partners.
 *
 * Semua handler memvalidasi session penuh (Node Runtime) dan mengembalikan
 * 401 bila tidak terautentikasi.
 */

import {
  isCollection,
  TABLE_BY_COLLECTION,
  WRITABLE,
  type Collection,
} from "@/lib/admin-collections";

/**
 * Definisi koleksi dan daftar kolom yang boleh ditulis disimpan di
 * `@/lib/admin-collections` supaya berkas route ini hanya mengekspor
 * HTTP method (aturan Next.js untuk App Router).
 */

async function unauthorized(): Promise<NextResponse> {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Revalidasi halaman index PLUS halaman detail yang relevan.
 * Dipanggil setiap kali sebuah entri berhasil dibuat, diperbarui, atau dihapus.
 */
function revalidateDetailPaths(collection: string, slug?: string): void {
  revalidatePath("/");
  if (collection === "programs") {
    revalidatePath("/program/[slug]", "page");
    if (slug) revalidatePath(`/program/${slug}`);
  } else if (collection === "stories") {
    revalidatePath("/cerita/[slug]", "page");
    if (slug) revalidatePath(`/cerita/${slug}`);
  } else if (collection === "journal") {
    revalidatePath("/jurnal/[slug]", "page");
    if (slug) revalidatePath(`/jurnal/${slug}`);
  } else if (collection === "campaigns") {
    revalidatePath("/donasi");
    revalidatePath("/donasi/[slug]", "page");
    if (slug) revalidatePath(`/donasi/${slug}`);
  }
}


async function ensureAuth(): Promise<boolean> {
  const hash = await getSessionHashFromCookies();
  return isSessionValid(hash);
}

/** Baca body JSON; return null bila tidak valid. */
async function readJson(
  request: NextRequest
): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Sanitasi nilai body sesuai tipe kolom yang diizinkan. */
function sanitizeValue(column: string, value: unknown): unknown {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined) return null;
  if (column === "published_at") {
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  // Kolom artikel / narasi panjang tidak dipotong 4000 karakter
  if (column === "body" || column === "description") {
    return String(value).slice(0, 100_000);
  }
  return String(value).slice(0, 4000);
}

/**
 * Susun daftar slug yang sudah dipakai, supaya slug baru tidak bentrok.
 */
async function existingSlugs(
  collection: Collection,
  pool: import("pg").Pool
): Promise<string[]> {
  const table = TABLE_BY_COLLECTION[collection];
  if (!["programs", "stories", "journal", "campaigns"].includes(collection)) return [];
  const res = await pool.query<{ slug: string }>(`SELECT slug FROM ${table}`);
  return res.rows.map((r) => r.slug);
}


/**
 * Pesan yang mudah dipahami untuk pelanggaran constraint database.
 * Tanpa ini, duplikasi `idx` pada stats atau `slug` akan tampil sebagai
 * "Gagal menyimpan data" yang tidak informsif.
 */
function describeDbError(err: unknown): string {
  const code = (err as { code?: string }).code;
  if (code === "23505") {
    const constraint = (err as { constraint?: string }).constraint ?? "";
    if (constraint.includes("idx")) {
      return "Nomor sudah dipakai entri lain. Pilih nomor lain.";
    }
    if (constraint.includes("slug")) {
      return "Slug sudah dipakai entri lain.";
    }
    return "Data duplikat: nilai unik sudah dipakai entri lain.";
  }
  if (code === "23502") {
    return "Ada kolom wajib yang belum diisi.";
  }
  return "Gagal menyimpan data.";
}

/** Daftar semua entri dalam satu koleksi. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await ensureAuth())) return unauthorized();
  const { key } = await params;
  if (!isCollection(key)) {
    return NextResponse.json({ error: "Koleksi tidak dikenal" }, { status: 404 });
  }

  try {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");
    const table = TABLE_BY_COLLECTION[key];
    if (key === "donations") {
      const res = await pool.query(`
        SELECT d.*, COALESCE(c.title, 'Program Tidak Diketahui') AS campaign_title
        FROM donations d
        LEFT JOIN campaigns c ON d.campaign_id = c.id
        ORDER BY d.created_at DESC
      `);
      return NextResponse.json({ rows: res.rows });
    }

    const res = await pool.query(`SELECT * FROM ${table} ORDER BY sort_order, id`);
    return NextResponse.json({ rows: res.rows });
  } catch (err) {
    console.error("[api/admin] GET gagal:", (err as Error).message);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}


/** Tambah entri baru. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await ensureAuth())) return unauthorized();
  const { key } = await params;
  if (!isCollection(key)) {
    return NextResponse.json({ error: "Koleksi tidak dikenal" }, { status: 404 });
  }

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  try {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");
    const collection = key;
    const table = TABLE_BY_COLLECTION[collection];
    const allowed = WRITABLE[collection];

    const values: Record<string, unknown> = {};
    for (const column of allowed) {
      if (column in body) values[column] = sanitizeValue(column, body[column]);
    }

    if (allowed.includes("slug")) {
      const title = String(body.title ?? "");
      const given = typeof body.slug === "string" ? body.slug : "";
      const slugs = await existingSlugs(collection, pool);
      values.slug = given ? uniqueSlug(given, slugs) : uniqueSlug(title, slugs);
    }

    const columns = Object.keys(values);
    if (columns.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk disimpan" }, { status: 400 });
    }

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${table} (${columns.join(", ")})
                VALUES (${placeholders})
                RETURNING *`;
    const res = await pool.query(sql, columns.map((c) => values[c]));

    revalidateDetailPaths(collection, typeof values.slug === "string" ? values.slug : undefined);
    return NextResponse.json({ row: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[api/admin] POST gagal:", (err as Error).message);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}

/** Perbarui entri yang ada. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await ensureAuth())) return unauthorized();
  const { key } = await params;
  if (!isCollection(key)) {
    return NextResponse.json({ error: "Koleksi tidak dikenal" }, { status: 404 });
  }

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const id = body.id;
  if (id === undefined || id === null) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  try {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");
    const collection = key;
    const table = TABLE_BY_COLLECTION[collection];
    const allowed = WRITABLE[collection];

    // Ambil data baris lama untuk memeriksa perubahan berkas media
    const oldRowRes = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    const oldRow = oldRowRes.rows[0];
    if (!oldRow) {
      return NextResponse.json({ error: "Entri tidak ditemukan" }, { status: 404 });
    }

    const values: Record<string, unknown> = {};
    for (const column of allowed) {
      if (column in body) values[column] = sanitizeValue(column, body[column]);
    }
    if (Object.keys(values).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
    }

    const assignments = Object.keys(values).map((c, i) => `${c} = $${i + 1}`);
    const paramList = Object.values(values);
    paramList.push(id);
    const sql = `UPDATE ${table} SET ${assignments.join(", ")}, updated_at = now()
                WHERE id = $${paramList.length}
                RETURNING *`;
    const res = await pool.query(sql, paramList);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Entri tidak ditemukan" }, { status: 404 });
    }

    // Bersihkan berkas media lama di disk jika kolom gambar diubah ke berkas baru
    const MEDIA_COLS = ["image", "image_url", "cover_image", "logo_url", "file_url"];
    for (const col of MEDIA_COLS) {
      if (col in values) {
        const oldFile = oldRow[col];
        const newFile = values[col];
        if (
          typeof oldFile === "string" &&
          oldFile.startsWith("/uploads/") &&
          oldFile !== newFile
        ) {
          void deleteFile(oldFile);
        }
      }
    }

    // Jika status donasi diubah, sinkronkan metrik kampanye secara otomatis
    if (collection === "donations" && oldRow.campaign_id && "status" in values) {
      const amountVal = Number(oldRow.amount || 0);
      if (oldRow.status !== "settlement" && values.status === "settlement") {
        await pool.query(
          `UPDATE campaigns
           SET collected_amount = collected_amount + $1,
               donor_count = donor_count + 1,
               updated_at = now()
           WHERE id = $2`,
          [amountVal, oldRow.campaign_id]
        );
        revalidatePath("/donasi");
      } else if (oldRow.status === "settlement" && values.status !== "settlement") {
        await pool.query(
          `UPDATE campaigns
           SET collected_amount = GREATEST(0, collected_amount - $1),
               donor_count = GREATEST(0, donor_count - 1),
               updated_at = now()
           WHERE id = $2`,
          [amountVal, oldRow.campaign_id]
        );
        revalidatePath("/donasi");
      }
    }

    revalidateDetailPaths(collection, typeof res.rows[0]?.slug === "string" ? res.rows[0].slug : undefined);
    return NextResponse.json({ row: res.rows[0] });
  } catch (err) {
    console.error("[api/admin] PATCH gagal:", (err as Error).message);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}

/** Hapus entri. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await ensureAuth())) return unauthorized();
  const { key } = await params;
  if (!isCollection(key)) {
    return NextResponse.json({ error: "Koleksi tidak dikenal" }, { status: 404 });
  }

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const id = body.id;
  if (id === undefined || id === null) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  try {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");
    const table = TABLE_BY_COLLECTION[key];
    const res = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Entri tidak ditemukan" }, { status: 404 });
    }

    // Bersihkan berkas media yang tersimpan di disk lokal bila ada
    const deletedRow = res.rows[0];
    const MEDIA_COLS = ["image", "image_url", "cover_image", "logo_url", "file_url"];
    for (const col of MEDIA_COLS) {
      if (typeof deletedRow[col] === "string" && deletedRow[col].startsWith("/uploads/")) {
        void deleteFile(deletedRow[col]);
      }
    }

    revalidateDetailPaths(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin] DELETE gagal:", (err as Error).message);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}
