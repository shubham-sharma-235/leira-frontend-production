import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const BLOGS_TITLE = "Leira Intimate Perfume: India's First Edible-Grade Vaginal Perfume for Women";
const BLOGS_DESCRIPTION =
  "Discover Leira - India's boldest luxury intimate perfume for women. Alcohol-free, edible-grade, kiss-friendly. Available in Jasmine, Damask Rose & Ylang-Ylang. Shop now.";
const BLOGS_OG_IMAGE = "/images/Intro.JPEG";

export const metadata: Metadata = {
  title: BLOGS_TITLE,
  description: BLOGS_DESCRIPTION,
  keywords: [
    "intimate perfume blog",
    "women's intimate wellness",
    "vaginal perfume India",
    "edible intimate oil",
    "Leira blog",
  ],
  alternates: buildHreflangAlternates("/blogs"),
  openGraph: {
    title: BLOGS_TITLE,
    description: BLOGS_DESCRIPTION,
    url: `${SITE_URL}/blogs`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: BLOGS_OG_IMAGE, alt: "Leira blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOGS_TITLE,
    description: BLOGS_DESCRIPTION,
    images: [BLOGS_OG_IMAGE],
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
