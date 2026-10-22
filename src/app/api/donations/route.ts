import { NextResponse, type NextRequest } from "next/server";
import { getPool } from "@/lib/db";
import { checkPublicRateLimit, getClientIp } from "@/lib/rate-limit";
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

const CROCKFORD_32 = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^[0-9+()\s-]{7,25}$/;

/**
 * Buat kode referensi transaksi unik:
 * - Menggunakan tanggal WIB (Asia/Jakarta) agar sesuai waktu donatur lokal.
 * - Menggunakan 5 karakter alfanumerik Base32 (32^5 = 33.554.432 kombinasi per hari)
 *   menghindari karakter ambigu (0, O, 1, I).
 * Contoh: ALTR-261022-8KM7P
 */
function generateOrderCode(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  // Format en-CA: "YY-MM-DD"
  const dateStr = formatter.format(new Date()).replace(/-/g, "");

  const randomBytes = crypto.randomBytes(5);
  let rand = "";
  for (let i = 0; i < 5; i++) {
    rand += CROCKFORD_32[randomBytes[i] % CROCKFORD_32.length];
  }

  return `ALTR-${dateStr}-${rand}`;
}

export async function POST(request: NextRequest) {
  // 1. Rate Limiting berbasis IP klien (maksimal 10 request donasi per 10 menit per IP)
  const clientIp = getClientIp(request);
  const rateCheck = checkPublicRateLimit(`donations:${clientIp}`, 10, 10 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak permintaan donasi dari IP Anda. Silakan coba kembali dalam ${rateCheck.retryAfterSec} detik.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSec) },
      }
    );
  }

  // 2. Parsing Payload
  let body: CreateDonationBody;
  try {
    body = (await request.json()) as CreateDonationBody;
  } catch {
    return NextResponse.json({ error: "Payload JSON tidak valid" }, { status: 400 });
  }

  // 3. Validasi Nominal Donasi (wajib integer, minimal 10.000, maksimal 500.000.000)
  const amount = Number(body.amount);
  if (!amount || !Number.isInteger(amount) || amount < 10_000 || amount > 500_000_000) {
    return NextResponse.json(
      {
        error:
          "Nominal donasi harus bilangan bulat (tanpa sen/desimal) antara Rp 10.000 dan Rp 500.000.000.",
      },
      { status: 400 }
    );
  }

  // 4. Validasi Nama Donatur (maksimal 100 karakter)
  const isAnonymous = Boolean(body.is_anonymous);
  let donorName = "";
  if (isAnonymous) {
    donorName = "Hamba Allah";
  } else {
    donorName = String(body.donor_name || "").trim().slice(0, 100);
    if (!donorName) {
      return NextResponse.json(
        { error: "Nama donatur wajib diisi jika Anda tidak memilih opsi donasi anonim." },
        { status: 400 }
      );
    }
  }

  // 5. Validasi Email (maksimal 100 karakter + format email baku)
  const donorEmail = String(body.donor_email || "").trim().slice(0, 100);
  if (!donorEmail || !EMAIL_REGEX.test(donorEmail)) {
    return NextResponse.json(
      { error: "Email donatur wajib diisi dengan format alamat email yang valid." },
      { status: 400 }
    );
  }

  // 6. Validasi Nomor Telepon / WA (opsional, jika diisi maksimal 25 karakter)
  let donorPhone = "";
  if (body.donor_phone) {
    donorPhone = String(body.donor_phone).trim().slice(0, 25);
    if (donorPhone && !PHONE_REGEX.test(donorPhone)) {
      return NextResponse.json(
        { error: "Format nomor telepon/WhatsApp tidak valid. Masukkan nomor kontak yang benar." },
        { status: 400 }
      );
    }
  }

  // 7. Pesan / Doa Donatur (maksimal 500 karakter)
  const message = String(body.message || "").trim().slice(0, 500);

  // 8. Verifikasi Database & Program Kampanye
  const pool = getPool();
  if (!pool) {
    return NextResponse.json(
      {
        error:
          "Sistem pencatatan donasi sedang dalam pemeliharaan database. Silakan hubungi narahubung yayasan secara langsung.",
      },
      { status: 503 }
    );
  }

  try {
    let campaignQuery = "";
    let campaignParam: unknown = null;

    if (body.campaign_id && Number.isInteger(Number(body.campaign_id))) {
      campaignQuery =
        "SELECT id, title, is_placeholder, published FROM campaigns WHERE id = $1 LIMIT 1";
      campaignParam = Number(body.campaign_id);
    } else if (body.campaign_slug && typeof body.campaign_slug === "string") {
      campaignQuery =
        "SELECT id, title, is_placeholder, published FROM campaigns WHERE slug = $1 LIMIT 1";
      campaignParam = body.campaign_slug.trim();
    } else {
      return NextResponse.json(
        { error: "Target program donasi tidak valid." },
        { status: 400 }
      );
    }

    const campRes = await pool.query<{
      id: number;
      title: string;
      is_placeholder: boolean;
      published: boolean;
    }>(campaignQuery, [campaignParam]);

    if (campRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Program donasi yang dituju tidak ditemukan atau tidak tersedia." },
        { status: 404 }
      );
    }

    const campaign = campRes.rows[0];

    if (!campaign.published) {
      return NextResponse.json(
        { error: "Program donasi ini sedang dinonaktifkan." },
        { status: 400 }
      );
    }

    if (campaign.is_placeholder) {
      return NextResponse.json(
        {
          error:
            "Program donasi ini berstatus simulasi/peragaan sistem dan belum menerima donasi publik.",
        },
        { status: 400 }
      );
    }

    // Buat kode order unik & simpan ke database
    const orderId = generateOrderCode();

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
        campaign.id,
        donorName,
        donorEmail,
        donorPhone,
        isAnonymous,
        amount,
        message,
      ]
    );

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
    return NextResponse.json(
      {
        error:
          "Terjadi kendala saat menyimpan data donasi ke sistem. Mohon ulangi beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
