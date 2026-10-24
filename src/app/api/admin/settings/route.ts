import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionHashFromCookies, isSessionValid } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { recordAuditLog, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Whitelist kunci konfigurasi resmi yang diizinkan untuk disimpan ke database */
const ALLOWED_SETTING_KEYS = new Set([
  "contact_whatsapp",
  "contact_email",
  "office_address",
  "bank_name",
  "bank_account_no",
  "bank_account_holder",
  "social_instagram",
  "social_youtube",
  "social_linkedin",
  "social_tiktok",
  "social_facebook",
  "social_x",
]);

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
      if (ALLOWED_SETTING_KEYS.has(row.key)) {
        settings[row.key] = row.value;
      }
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[api/admin/settings] GET gagal:", (err as Error).message);
    return NextResponse.json({ error: "Gagal memuat pengaturan" }, { status: 500 });
  }
}

/** Simpan atau perbarui seluruh pengaturan sekaligus dengan transaksi database aman */
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

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updatedKeys: string[] = [];
      for (const [key, rawValue] of Object.entries(settings)) {
        const sanitizedKey = String(key).trim();
        // Cegah arbitrary key injection
        if (!ALLOWED_SETTING_KEYS.has(sanitizedKey)) continue;

        const sanitizedVal = String(rawValue ?? "").slice(0, 2000);
        await client.query(
          `INSERT INTO settings (key, value, updated_at)
           VALUES ($1, $2, now())
           ON CONFLICT (key)
           DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
          [sanitizedKey, sanitizedVal]
        );
        updatedKeys.push(sanitizedKey);
      }

      await recordAuditLog({
        action: "SETTINGS_UPDATE",
        entityType: "settings",
        actorIp: getClientIp(request),
        details: { updated_keys: updatedKeys },
        client,
      });

      await client.query("COMMIT");
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

    revalidatePath("/");
    revalidatePath("/donasi");
    revalidatePath("/donasi/[slug]", "page");
    revalidatePath("/program/[slug]", "page");
    revalidatePath("/cerita/[slug]", "page");
    revalidatePath("/jurnal/[slug]", "page");

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("[api/admin/settings] PATCH gagal:", (err as Error).message);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
