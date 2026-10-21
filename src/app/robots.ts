import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Jangan index panel admin dan API internal
        disallow: ["/admin", "/api/", "/uploads/"],
      },
    ],
    sitemap: "https://altara.or.id/sitemap.xml",
  };
}
