import sharp from "sharp";
import path from "node:path";

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // 1. Ambil background hero & darken
  const heroPath = path.join(process.cwd(), "public", "assets", "hero.jpg");
  const emblemPath = path.join(process.cwd(), "public", "assets", "logo-emblem.png");
  const outputPath = path.join(process.cwd(), "public", "og-image.jpg");

  // Siapkan emblem (tinggi ~120px)
  const emblemBuffer = await sharp(emblemPath)
    .resize({ height: 120, fit: "inside" })
    .toBuffer();

  // SVG teks dan ornamen
  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Gradient overlay gelap bertingkat -->
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#141E17" stop-opacity="0.88" />
        <stop offset="60%" stop-color="#101913" stop-opacity="0.94" />
        <stop offset="100%" stop-color="#0B110D" stop-opacity="0.98" />
      </linearGradient>
      <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#C9B88A" stop-opacity="0" />
        <stop offset="30%" stop-color="#C9B88A" stop-opacity="0.6" />
        <stop offset="70%" stop-color="#C9B88A" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#C9B88A" stop-opacity="0" />
      </linearGradient>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

    <!-- Bingkai halus elegan -->
    <rect x="36" y="36" width="${width - 72}" height="${height - 72}" fill="none" stroke="#C9B88A" stroke-width="1" stroke-opacity="0.25" />
    <rect x="42" y="42" width="${width - 84}" height="${height - 84}" fill="none" stroke="#FAF8F2" stroke-width="0.5" stroke-opacity="0.1" />

    <!-- Aksen ornamen sudut -->
    <path d="M 36 56 L 36 36 L 56 36" fill="none" stroke="#C9B88A" stroke-width="2" stroke-opacity="0.8" />
    <path d="M ${width - 56} 36 L ${width - 36} 36 L ${width - 36} 56" fill="none" stroke="#C9B88A" stroke-width="2" stroke-opacity="0.8" />
    <path d="M 36 ${height - 56} L 36 ${height - 36} L 56 ${height - 36}" fill="none" stroke="#C9B88A" stroke-width="2" stroke-opacity="0.8" />
    <path d="M ${width - 56} ${height - 36} L ${width - 36} ${height - 36} L ${width - 36} ${height - 56}" fill="none" stroke="#C9B88A" stroke-width="2" stroke-opacity="0.8" />

    <!-- Eyebrow -->
    <text x="600" y="275" font-family="'Inter', sans-serif" font-size="14" font-weight="600" letter-spacing="4.5" fill="#C9B88A" text-anchor="middle">
      YAYASAN ABDI LAKSATA RAYA
    </text>

    <!-- Divider dekoratif -->
    <line x1="380" y1="305" x2="820" y2="305" stroke="url(#goldLine)" stroke-width="1" />

    <!-- Headline motto -->
    <text x="600" y="380" font-family="'Georgia', 'Times New Roman', serif" font-size="52" font-weight="normal" fill="#FAF8F2" text-anchor="middle" letter-spacing="1">
      Manunggaling Kawulane Gusti
    </text>

    <!-- Pilar program / Tagline -->
    <text x="600" y="435" font-family="'Inter', sans-serif" font-size="17" font-weight="300" fill="#DCD5C4" text-anchor="middle" letter-spacing="1.5">
      Pendidikan  ·  Kemanusiaan  ·  Kesehatan  ·  Lingkungan
    </text>

    <!-- Footer URL -->
    <text x="600" y="525" font-family="'Inter', sans-serif" font-size="14" font-weight="500" fill="#C9B88A" text-anchor="middle" letter-spacing="3" opacity="0.85">
      ALTARA.OR.ID
    </text>
  </svg>
  `;

  // Komposisikan gambar
  await sharp(heroPath)
    .resize(width, height, { fit: "cover", position: "center" })
    .composite([
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
      { input: emblemBuffer, top: 110, left: Math.round((width - 120) / 2) },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath);

  console.log("Berhasil menghasilkan public/og-image.jpg!");
}

generateOgImage().catch((err) => {
  console.error(err);
  process.exit(1);
});
