export type HeroSlide = {
  id: number;
  headline: string;
  caption: string;
  location: string;
  imageUrl: string;
  alt: string;
  objectPosition: string;
  kenBurns: string;
  published: boolean;
  sortOrder: number;
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    imageUrl: "/assets/hero.jpg",
    alt: "Seorang guru mendampingi anak-anak membaca di ruang kelas sederhana di sebuah desa",
    location: "Jawa Tengah",
    headline: "Manunggaling\nKawulane Gusti",
    caption: "Mendampingi setiap langkah menuju masa depan yang bermartabat",
    kenBurns: "zoom-in",
    objectPosition: "center 35%",
    published: true,
    sortOrder: 0,
  },
  {
    id: 2,
    imageUrl: "/assets/story-feature.jpg",
    alt: "Perempuan penerima manfaat program pemberdayaan ALTARA tersenyum di depan rumahnya",
    location: "Yogyakarta",
    headline: "Satu Keluarga,\nSatu Harapan",
    caption: "Pemberdayaan dimulai dari kepercayaan yang kita bangun bersama",
    kenBurns: "pan-left",
    objectPosition: "center top",
    published: true,
    sortOrder: 1,
  },
  {
    id: 3,
    imageUrl: "/assets/program-education.jpg",
    alt: "Anak-anak mengikuti program pendidikan komunitas ALTARA",
    location: "Jawa Timur",
    headline: "Pendidikan\nUntuk Semua",
    caption: "Akses pendidikan yang setara sebagai fondasi perubahan nyata",
    kenBurns: "zoom-out",
    objectPosition: "center 40%",
    published: true,
    sortOrder: 2,
  },
  {
    id: 4,
    imageUrl: "/assets/about.jpg",
    alt: "Komunitas masyarakat berkumpul bersama relawan ALTARA",
    location: "Nusantara",
    headline: "Bersama\nKita Tumbuh",
    caption: "Dari pelosok desa hingga kota, kami hadir mendampingi",
    kenBurns: "pan-right",
    objectPosition: "center 30%",
    published: true,
    sortOrder: 3,
  },
  {
    id: 5,
    imageUrl: "/assets/program-empowerment.jpg",
    alt: "Peserta program pemberdayaan ekonomi ALTARA menampilkan hasil karyanya",
    location: "Jawa Barat",
    headline: "Mandiri\nBerdaya Bangsa",
    caption: "Keterampilan nyata yang membuka jalan menuju kemandirian",
    kenBurns: "zoom-in-slow",
    objectPosition: "center 45%",
    published: true,
    sortOrder: 4,
  },
];
