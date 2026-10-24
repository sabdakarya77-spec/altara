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

  // Akar penelusuran berkas untuk standalone output.
  outputFileTracingRoot: projectRoot,

  // `pg` dan `sharp` tidak boleh di-bundle webpack / Turbopack: keduanya memakai
  // native binding dan optional require saat runtime.
  serverExternalPackages: ["pg", "sharp"],

  images: {
    // Semua aset visual bersifat lokal (public/assets + /uploads).
    // Konversi AVIF/WebP lewat optimizer bawaan Next.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  // Jangan bocorkan versi framework lewat header.
  poweredByHeader: false,

  // Header keamanan terstruktur, termasuk Content Security Policy (CSP).
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
