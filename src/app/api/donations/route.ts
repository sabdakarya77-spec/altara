import { NextResponse, type NextRequest } from "next/server";
import { getPool } from "@/lib/db";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateDonationBody {
  campaign_id?: number | null;
  campaign_slug?: string;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  is_anonymous?: boolean;
  amount?: number;
  message?: string;
}

/**
 * Buat kode referensi transaksi unik:
 * Format: ALTR-YYMMDD-XXXX (contoh: ALTR-261022-9F4K)
 */
function generateOrderCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
  return `ALTR-${yy}${mm}${dd}-${rand}`;
}

export async function POST(request: NextRequest) {
  let body: CreateDonationBody;
  try {
    body = (await request.json()) as CreateDonationBody;
  } catch {
    return NextResponse.json({ error: "Payload JSON tidak valid" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!amount || amount < 10_000) {
    return NextResponse.json(
      { error: "Nominal donasi minimal Rp 10.000" },
      { status: 400 }
    );
  }

  const isAnonymous = Boolean(body.is_anonymous);
  const donorName = isAnonymous
    ? "Hamba Allah"
    : String(body.donor_name || "").trim();

  if (!isAnonymous && !donorName) {
    return NextResponse.json(
      { error: "Nama donatur wajib diisi jika bukan anonim" },
      { status: 400 }
    );
  }

  const donorEmail = String(body.donor_email || "").trim();
  if (!donorEmail || !donorEmail.includes("@")) {
    return NextResponse.json(
      { error: "Email donatur wajib diisi dengan alamat email yang valid" },
      { status: 400 }
    );
  }

  const donorPhone = String(body.donor_phone || "").trim();
  const message = String(body.message || "").trim().slice(0, 1000);
  const orderId = generateOrderCode();

  try {
    const pool = getPool();
    if (pool) {
      let resolvedCampaignId = body.campaign_id ? Number(body.campaign_id) : null;

      // Bila campaign_id tidak ada tapi ada campaign_slug, cari campaign_id
      if (!resolvedCampaignId && body.campaign_slug) {
        const campRes = await pool.query<{ id: number }>(
          "SELECT id FROM campaigns WHERE slug = $1 LIMIT 1",
          [body.campaign_slug]
        );
        if (campRes.rows.length > 0) {
          resolvedCampaignId = campRes.rows[0].id;
        }
      }

      await pool.query(
        `INSERT INTO donations (
          order_id,
          campaign_id,
          donor_name,
          donor_email,
          donor_phone,
          is_anonymous,
          amount,
          status,
          payment_method,
          message,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'bank_transfer', $8, now(), now())`,
        [
          orderId,
          resolvedCampaignId,
          donorName,
          donorEmail,
          donorPhone,
          isAnonymous,
          amount,
          message,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      amount,
      donor_name: donorName,
      is_anonymous: isAnonymous,
      message,
    });
  } catch (err) {
    console.error("[api/donations] Gagal mencatat donasi:", (err as Error).message);
    // Jika database bermasalah, tetap kembalikan order_id agar donatur tidak terblokir
    return NextResponse.json({
      success: true,
      order_id: orderId,
      amount,
      donor_name: donorName,
      is_anonymous: isAnonymous,
      message,
      warning: "Pencatatan database ditangguhkan",
    });
  }
}
