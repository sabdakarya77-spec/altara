/**
 * Konfigurasi Next.js ALTARA.
 *
 * `output: "standalone"` menghasilkan `.next/standalone/` berisi server Node
 * minimal plus hanya dependensi yang benar-benar dipakai. Ini yang membuat
 * image Docker kecil dan membuat Caddy bisa meneruskan ke aplikasi di dalam
 * network internal tanpa mengekspos port aplikasi ke publik.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server produksi mandiri: `node server.js` tanpa node_modules penuh.
  output: "standalone",

  experimental: {
    // Akar penelusuran berkas. Tanpa ini, Next menelusuri dari folder
    // `.next` saja dan `pg` (yang ada di node_modules) bisa terlewat.
    // Di Next 14.2 key ini masih berada di dalam `experimental`.
    outputFileTracingRoot: projectRoot,

    // `pg` dan `sharp` tidak boleh di-bundle webpack: keduanya memakai
    // native binding dan optional require saat runtime. Menandainya external
    // membuat Next menyalinnya utuh ke `.next/standalone/node_modules`.
    serverComponentsExternalPackages: ["pg", "sharp"],
  },

  images: {
    // Semua aset visual bersifat lokal (public/assets + /uploads).
    // Konversi AVIF/WebP lewat optimizer bawaan Next.
    // AVIF dihapus sementara — advisory RCE di Next 14.x Image Optimizer
    // menyebut format ini. Aktifkan kembali setelah upgrade ke Next 15.x.
    formats: ["image/webp"],
    remotePatterns: [],
  },

  // Jangan bocorkan versi framework lewat header.
  poweredByHeader: false,

  // Header keamanan dasar. CSP sengaja tidak di-set di sini karena
  // `next/script` dan inline style milik komponen perlu nonce yang
  // dibuat per-request.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
