import ShopPageClient from "./ShopPageClient";
import type { Metadata } from "next";
import type { Product } from "@/hooks/useProducts";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const SHOP_TITLE = "Buy Intimate Perfume for Women Online India | Leira Shop";
const SHOP_DESCRIPTION =
  "Shop Leira intimate perfume for women online in India. Alcohol-free, pH-balanced essential oil fragrances for bikini area, sensitive skin & private area. Browse singles, duos & gift sets with fast delivery.";
const SHOP_OG_IMAGE = "/images/Intro.JPEG";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api` : "") ||
  "https://leiraindia.com/api";

export const metadata: Metadata = {
  title: SHOP_TITLE,
  description: SHOP_DESCRIPTION,
  keywords: [
    "buy intimate perfume for women online India",
    "intimate perfume shop India",
    "Leira shop",
    "luxury intimate perfume for women",
    "essential oil feminine perfume",
    "alcohol-free intimate perfume",
    "buy feminine perfume India",
  ],
  alternates: buildHreflangAlternates("/shop"),
  openGraph: {
    title: SHOP_TITLE,
    description: SHOP_DESCRIPTION,
    url: `${SITE_URL}/shop`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: SHOP_OG_IMAGE,
        alt: "Leira intimate perfume collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SHOP_TITLE,
    description: SHOP_DESCRIPTION,
    images: [SHOP_OG_IMAGE],
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

export default async function ShopPage() {
  const initialProducts = await getInitialProducts();
  const shopBreadcrumbSchema = {
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
        name: "Shop",
        item: `${SITE_URL}/shop`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopBreadcrumbSchema) }}
      />
      <ShopPageClient initialProducts={initialProducts} />
    </>
  );
}

