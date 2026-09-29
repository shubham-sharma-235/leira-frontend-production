import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/_next/static/",
          "/_next/image/",
          "/_next/data/",
          "/shop/",
          "/about",
          "/benefits",
          "/contact",
          "/blogs",
          "/privacy-policy",
          "/terms-and-conditions",
          "/shipping-policy",
          "/cancellation-policy",
          "/account-deletion",
        ],
        disallow: ["/admin/", "/api/", "/dashboard/", "/auth/", "/_next/webpack-hmr"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

