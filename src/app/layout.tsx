import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://altara.or.id"),
  title: "Yayasan Abdi Laksata Raya — Manunggaling Kawulane Gusti",
  description:
    "Yayasan Abdi Laksata Raya bekerja bersama masyarakat Indonesia sejak 2016 melalui pendidikan, pemberdayaan, kemanusiaan, dan lingkungan yang terukur dan transparan.",
  applicationName: "Yayasan Abdi Laksata Raya",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Yayasan Abdi Laksata Raya — Manunggaling Kawulane Gusti",
    description:
      "Yayasan Abdi Laksata Raya bekerja bersama masyarakat Indonesia sejak 2016 melalui pendidikan, pemberdayaan, kemanusiaan, dan lingkungan.",
    type: "website",
    url: "/",
    siteName: "Yayasan Abdi Laksata Raya",
    images: ["/assets/logo.png"],
  },
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
      <body className="antialiased">{children}</body>
    </html>
  );
}

