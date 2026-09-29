import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
/** Under ~60 chars for Google SERP display */
const ABOUT_TITLE = "About Leira | Feminine Intimate Perfume India";
const ABOUT_DESCRIPTION =
  "Leira: India's first essential oil intimate perfume—bikini, private & sensitive skin. Alcohol-free, pH-balanced, natural.";
const ABOUT_OG_IMAGE = "/images/white.JPEG";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  keywords: [
    "intimate area",
    "bikini area",
    "private area",
    "sensitive area",
    "vulva",
    "Leira",
  ],
  alternates: buildHreflangAlternates("/about"),
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: `${SITE_URL}/about`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: ABOUT_OG_IMAGE, alt: "About Leira" }],
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    images: [ABOUT_OG_IMAGE],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

