import ComboPageClient from "./ComboPageClient";
import type { Metadata } from "next";
import type { Product } from "@/hooks/useProducts";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const COMBO_DESCRIPTION =
  "Explore Leira’s signature curated combos — luxury intimate perfumes and pairings, hand-picked for the homepage edit.";
const COMBO_OG_IMAGE = "/images/Intro.JPEG";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api` : "") ||
  "https://leiraindia.com/api";

export const metadata: Metadata = {
  title: "Signature Combos | Leira",
  description: COMBO_DESCRIPTION,
  keywords: [
    "Leira combo",
    "luxury intimate perfume set",
    "curated perfume India",
    "Leira signature edit",
  ],
  alternates: buildHreflangAlternates("/combo"),
  openGraph: {
    title: "Signature Combos | Leira",
    description: COMBO_DESCRIPTION,
    url: `${SITE_URL}/combo`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: COMBO_OG_IMAGE,
        alt: "Leira signature combos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Signature Combos | Leira",
    description: COMBO_DESCRIPTION,
    images: [COMBO_OG_IMAGE],
  },
};

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

async function getInitialProducts(): Promise<Product[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/products`);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json?.data)) return [];
    return json.data;
  } catch {
    return [];
  }
}

export default async function ComboPage() {
  const initialProducts = await getInitialProducts();
  const comboBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Signature Combos",
        item: `${SITE_URL}/combo`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comboBreadcrumbSchema) }}
      />
      <ComboPageClient initialProducts={initialProducts} />
    </>
  );
}
