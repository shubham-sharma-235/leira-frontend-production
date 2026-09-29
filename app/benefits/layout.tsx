import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const BENEFITS_TITLE = "Leira Benefits | Natural Intimate Perfume India";
const BENEFITS_DESCRIPTION =
  "Leira intimate perfume benefits: bikini & sensitive area care. Jasmine, Damask Rose, Ylang Ylang—alcohol-free, pH-balanced.";
const BENEFITS_OG_IMAGE = "/images/brown.JPEG";

export const metadata: Metadata = {
  title: BENEFITS_TITLE,
  description: BENEFITS_DESCRIPTION,
  keywords: [
    "Leira benefits",
    "intimate perfume benefits",
    "odor control for women",
    "long-lasting freshness",
    "essential oil feminine care",
  ],
  alternates: buildHreflangAlternates("/benefits"),
  openGraph: {
    title: BENEFITS_TITLE,
    description: BENEFITS_DESCRIPTION,
    url: `${SITE_URL}/benefits`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: BENEFITS_OG_IMAGE, alt: "Leira benefits" }],
  },
  twitter: {
    card: "summary_large_image",
    title: BENEFITS_TITLE,
    description: BENEFITS_DESCRIPTION,
    images: [BENEFITS_OG_IMAGE],
  },
};

export default function BenefitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

