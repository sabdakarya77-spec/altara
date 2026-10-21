export type Program = {
  index: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

export type Story = {
  category: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

export type Stat = {
  index: string;
  value: string;
  label: string;
};

export const programs: Program[] = [
  {
    index: "01",
    title: "Pendidikan",
    description:
      "Membuka akses pendidikan yang bermakna dan kesempatan bagi generasi berikutnya.",
    image: "/assets/program-education.jpg",
    alt: "Seorang anak perempuan berseragam sekolah sedang menulis di buku tulisnya",
  },
  {
    index: "02",
    title: "Kemanusiaan",
    description: "Berdiri bersama masyarakat pada saat dukungan paling dibutuhkan.",
    image: "/assets/program-humanitarian.jpg",
    alt: "Relawan menurunkan bantuan logistik di sebuah desa setelah banjir",
  },
  {
    index: "03",
    title: "Kesehatan",
    description:
      "Layanan kesehatan dasar, gizi, dan posyandu binaan yang berkelanjutan.",
    image: "/assets/story-3.jpg",
    alt: "Seorang bidan memeriksa bayi di pos kesehatan desa",
  },
  {
    index: "04",
    title: "Lingkungan",
    description:
      "Mendampingi komunitas menjaga hutan, air bersih, dan desa tangguh iklim.",
    image: "/assets/program-empowerment.jpg",
    alt: "Perempuan-perempuan menenun kain di sebuah koperasi kecil",
  },
];

export const stats: Stat[] = [
  { index: "01", value: "42.508", label: "Jiwa Terjangkau" },
  { index: "02", value: "38", label: "Program Berjalan" },
  { index: "03", value: "34", label: "Kota & Kabupaten" },
  { index: "04", value: "92%", label: "Dana Langsung ke Program" },
];

export const stories: Story[] = [
  {
    category: "Pendidikan",
    title: "Kelas di Bawah Pohon Asam",
    description:
      "Bagaimana sebuah kelas sore tanpa dinding membuat tiga puluh anak kembali bersekolah.",
    image: "/assets/story-1.jpg",
    alt: "Seorang anak lelaki membaca buku di bawah pohon di halaman rumah",
  },
  {
    category: "Komunitas",
    title: "Air yang Kembali ke Desa",
    description: "Sumur bersama yang dibangun, dikelola, dan dirawat oleh warga sendiri.",
    image: "/assets/story-2.jpg",
    alt: "Warga desa bekerja sama memasang pompa pada sumur komunitas",
  },
  {
    category: "Kesehatan",
    title: "Pos Kesehatan yang Tak Pernah Tutup",
    description: "Dua bidan, satu ruangan, dan seribu kunjungan dalam setahun.",
    image: "/assets/story-3.jpg",
    alt: "Seorang bidan memeriksa bayi di pos kesehatan desa",
  },
  {
    category: "Lingkungan",
    title: "Panen Pertama Kelompok Tani Muda",
    description:
      "Dua belas petani muda kembali ke kampung setelah melihat lahan bisa menghidupi.",
    image: "/assets/story-4.jpg",
    alt: "Seorang petani muda memegang hasil panen di ladang saat senja",
  },
];

export type JournalPost = {
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
};

export const journal: JournalPost[] = [
  {
    category: "Riset",
    date: "12 Februari 2026",
    title: "Mengukur Dampak Itu Berbeda dari Menghitung Donasi",
    excerpt:
      "Sorotan metodologis atas cara kami memverifikasi perubahan di lapangan, bukan hanya rupiah yang terkirim.",
    image: "/assets/journal-1.jpg",
    alt: "Seseorang mencatat data lapangan di buku catatan",
  },
  {
    category: "Kolom",
    date: "28 Januari 2026",
    title: "Ketika Sumur Digali, Siapa yang Merawat?",
    excerpt:
      "Refleksi tentang pengelolaan sebuah sistem air bersih yang dibangun bersama warga.",
    image: "/assets/journal-2.jpg",
    alt: "Warga desa bersama-sama membangun instalasi air bersih",
  },
  {
    category: "Laporan",
    date: "9 Januari 2026",
    title: "Ringkasan Temuan Program Kesehatan 2025",
    excerpt:
      "Temuan utama dari 38 titik posyandu binaannya, termasuk yang masih belum berhasil.",
    image: "/assets/journal-3.jpg",
    alt: "Tenaga kesehatan mencatat hasil kunjungan posyandu",
  },
];

export const documents = [
  { title: "Laporan Tahunan 2025", meta: "PDF · 4,2 MB" },
  { title: "Laporan Keuangan Teraudit 2025", meta: "PDF · 1,8 MB" },
  { title: "Kebijakan Perlindungan Anak", meta: "PDF · 620 KB" },
  { title: "Akta Pendirian & Legalitas", meta: "PDF · 1,1 MB" },
];

export const partners = [
  "Bank Nusantara",
  "Astra Sejahtera",
  "UNICEF Indonesia",
  "Universitas Gadjah Mada",
  "Ford Foundation",
  "Kemitraan Hijau",
];
