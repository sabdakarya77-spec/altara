/**
 * Definisi tipe dan data bawaan program penggalangan dana (Campaigns)
 * dan transaksi donasi untuk Yayasan Abdi Laksata Raya.
 */

export type Campaign = {
  id: number;
  title: string;
  slug: string;
  category: "Pendidikan" | "Kesehatan" | "Kemanusiaan" | "Lingkungan" | "Umum";
  short_desc: string;
  description: string;
  image_url: string;
  target_amount: number;
  collected_amount: number;
  donor_count: number;
  start_date: string;
  end_date: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  is_placeholder?: boolean;
};

export type DonationStatus = "pending" | "settlement" | "cancel" | "expire" | "deny";

export type Donation = {
  id: number;
  order_id: string;
  campaign_id: number | null;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  is_anonymous: boolean;
  amount: number;
  status: DonationStatus;
  payment_method: string;
  payment_channel: string;
  transaction_id: string;
  payment_proof_url: string;
  message: string;
  snap_token: string;
  snap_redirect_url: string;
  paid_at: string | null;
  created_at: string;
};

export const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    title: "Air Bersih untuk Pelosok Nusantara",
    slug: "air-bersih-pelosok-nusantara",
    category: "Lingkungan",
    short_desc: "Pembangunan sumur bor dan instalasi sanitasi layak untuk warga desa rawan kekeringan.",
    description:
      "Program pengadaan infrastruktur air bersih berkelanjutan di wilayah pelosok yang menghadapi krisis air bersih menahun. Donasi disalurkan untuk pengeboran sumber air, pipanisasi warga, dan pelatihan pemeliharaan swadaya.",
    image_url: "/assets/program-empowerment.jpg",
    target_amount: 75_000_000,
    collected_amount: 0,
    donor_count: 0,
    start_date: "2026-01-01T00:00:00.000Z",
    end_date: null,
    published: true,
    featured: true,
    sort_order: 1,
    is_placeholder: true,
  },
  {
    id: 2,
    title: "Beasiswa Pendidikan Generasi Laksata",
    slug: "beasiswa-generasi-laksata",
    category: "Pendidikan",
    short_desc: "Dukungan biaya seragam, buku modul, dan pendampingan belajar bagi anak-anak prasejahtera.",
    description:
      "Menjamin keberlanjutan sekolah dasar hingga menengah bagi generasi muda dari keluarga prasejahtera agar tidak putus sekolah karena kendala biaya perlengkapan dan operasional harian.",
    image_url: "/assets/program-education.jpg",
    target_amount: 50_000_000,
    collected_amount: 0,
    donor_count: 0,
    start_date: "2026-01-01T00:00:00.000Z",
    end_date: null,
    published: true,
    featured: true,
    sort_order: 2,
    is_placeholder: true,
  },
  {
    id: 3,
    title: "Layanan Kesehatan & Nutrisi Balita",
    slug: "layanan-kesehatan-nutrisi-balita",
    category: "Kesehatan",
    short_desc: "Pemeriksaan medis berkala dan penyaluran paket gizi pencegahan stunting di pedesaan.",
    description:
      "Aksi tanggap kesehatan preventif melalui posko medis keliling, edukasi pola asuh bernutrisi bagi ibu, dan pemberian makanan tambahan kaya protein hewani untuk balita.",
    image_url: "/assets/program-humanitarian.jpg",
    target_amount: 40_000_000,
    collected_amount: 0,
    donor_count: 0,
    start_date: "2026-01-01T00:00:00.000Z",
    end_date: null,
    published: true,
    featured: false,
    sort_order: 3,
    is_placeholder: true,
  },
];

/** Format angka ke Rupiah bersih: "Rp 75.000.000" */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

