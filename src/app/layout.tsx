import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://altara.or.id";
const SITE_NAME = "Yayasan Abdi Laksata Raya";
const TITLE = "Yayasan Abdi Laksata Raya — Manunggaling Kawulane Gusti";
const DESCRIPTION =
  "Yayasan Abdi Laksata Raya bekerja bersama masyarakat Indonesia sejak 2016 melalui pendidikan, pemberdayaan, kemanusiaan, dan lingkungan yang terukur dan transparan.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,

  // Canonical — mencegah duplikasi di search engine
  alternates: {
    canonical: "/",
  },

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    // OG image 1200×630 — sesuai standar Facebook/Twitter/WhatsApp
    // Ganti logo.png (2000×2000, 1.4 MB) dengan file yang sudah dioptimasi
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Manunggaling Kawulane Gusti`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

/**
 * JSON-LD schema.org untuk NonProfit Organization.
 * Membantu Google menampilkan knowledge panel dan rich results
 * untuk pencarian nama yayasan.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: SITE_NAME,
  alternateName: "ALTARA",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo-emblem.png`,
  description: DESCRIPTION,
  foundingDate: "2016",
  areaServed: {
    "@type": "Country",
    name: "Indonesia",
  },
  knowsAbout: [
    "Pendidikan",
    "Pemberdayaan Masyarakat",
    "Kemanusiaan",
    "Lingkungan Hidup",
  ],
  sameAs: [
    // Tambahkan URL media sosial yayasan di sini saat sudah ada
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap"
        />
      </head>
      <body className="antialiased">
        {children}
        <Script
          id="json-ld-ngo"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
