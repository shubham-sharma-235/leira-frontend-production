import type { MetadataRoute } from "next";
import { canonicalProductSlug } from "@/lib/product-slugs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api` : "") ||
  "https://leiraindia.com/api";

type BasicEntity = { _id?: string; id?: string; slug?: string; title?: string; name?: string };
type BlogEntity = BasicEntity & { category?: string };

const toAbsoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: toAbsoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: toAbsoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: toAbsoluteUrl("/combo"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: toAbsoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: toAbsoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: toAbsoluteUrl("/collaboration"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: toAbsoluteUrl("/benefits"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: toAbsoluteUrl("/blogs"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: toAbsoluteUrl("/privacy-policy"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: toAbsoluteUrl("/shipping-policy"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: toAbsoluteUrl("/cancellation-policy"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: toAbsoluteUrl("/terms-and-conditions"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: toAbsoluteUrl("/account-deletion"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [productsRes, blogsRes] = await Promise.all([
      fetchWithTimeout(`${API_URL}/products`),
      fetchWithTimeout(`${API_URL}/blogs`),
    ]);
    if (!productsRes.ok || !blogsRes.ok) return staticRoutes;

    const [productsJson, blogsJson] = await Promise.all([productsRes.json(), blogsRes.json()]);

    const productUrls: MetadataRoute.Sitemap = (productsJson?.success ? productsJson.data : [])
      .map((p: BasicEntity) => canonicalProductSlug(String(p?.id || ""), String(p?.name || "")) || p?._id)
      .filter(Boolean)
      .map((id: string) => ({
        url: toAbsoluteUrl(`/shop/${id}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    const blogItems: BlogEntity[] = blogsJson?.success ? blogsJson.data : [];

    const blogUrls: MetadataRoute.Sitemap = blogItems
      .map((b: BlogEntity) => toSlug(b?.slug || b?.title || "") || b?._id || b?.id)
      .filter((id): id is string => Boolean(id))
      .map((id: string) => ({
        url: toAbsoluteUrl(`/blogs/${id}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    const categoryUrls: MetadataRoute.Sitemap = Array.from(
      new Set(
        blogItems
          .map((b) => toSlug(b?.category || ""))
          .filter(Boolean)
      )
    ).map((categorySlug) => ({
      url: toAbsoluteUrl(`/blogs/category/${categorySlug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));

    return [...staticRoutes, ...productUrls, ...blogUrls, ...categoryUrls];
  } catch {
    // If API is temporarily unreachable, still return key static pages.
    return staticRoutes;
  }
}

