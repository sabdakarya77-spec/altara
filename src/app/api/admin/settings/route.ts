import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionHashFromCookies, isSessionValid } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureAuth(): Promise<boolean> {
  const hash = await getSessionHashFromCookies();
  return isSessionValid(hash);
}

/** Ambil seluruh pengaturan key-value yayasan */
export async function GET() {
  if (!(await ensureAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");

    const res = await pool.query<{ key: string; value: string }>(
      "SELECT key, value FROM settings ORDER BY key"
    );

    const settings: Record<string, string> = {};
    for (const row of res.rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[api/admin/settings] GET gagal:", (err as Error).message);
    return NextResponse.json({ error: "Gagal memuat pengaturan" }, { status: 500 });
  }
}

/** Simpan atau perbarui seluruh pengaturan sekaligus (batch upsert) */
export async function PATCH(request: NextRequest) {
  if (!(await ensureAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { settings?: Record<string, string> } | null = null;
  try {
    body = (await request.json()) as { settings?: Record<string, string> };
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const settings = body?.settings;
  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "Data settings tidak valid" }, { status: 400 });
  }

  try {
    const pool = getPool();
    if (!pool) throw new Error("DATABASE_URL belum dikonfigurasi");

    // Upsert setiap key-value
    for (const [key, rawValue] of Object.entries(settings)) {
      const sanitizedKey = String(key).trim().slice(0, 100);
      const sanitizedVal = String(rawValue ?? "").slice(0, 2000);
      if (!sanitizedKey) continue;

      await pool.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (key)
         DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [sanitizedKey, sanitizedVal]
      );
    }

    revalidatePath("/");
    revalidatePath("/program/[slug]", "page");
    revalidatePath("/cerita/[slug]", "page");
    revalidatePath("/jurnal/[slug]", "page");
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("[api/admin/settings] PATCH gagal:", (err as Error).message);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
