import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/bulk", "/api/"],
      },
    ],
    sitemap: "https://behindthetext.site/sitemap.xml",
    host: "https://behindthetext.site",
  };
}
