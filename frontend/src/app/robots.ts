import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/report", "/track", "/analytics"],
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: "https://campuspulse.vercel.app/sitemap.xml",
  };
}
