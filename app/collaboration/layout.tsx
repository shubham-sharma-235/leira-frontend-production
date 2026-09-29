import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const COLLAB_TITLE = "Collaborate With Leira | Influencers, Creators & Brands";
const COLLAB_DESCRIPTION =
  "Collaborate with Leira as an influencer, creator, or brand partner. Share your profile and partnership idea through our collaboration form.";

export const metadata: Metadata = {
  title: COLLAB_TITLE,
  description: COLLAB_DESCRIPTION,
  keywords: [
    "Leira collaboration",
    "influencer collaboration India",
    "brand partnership Leira",
    "creator partnership",
  ],
  alternates: buildHreflangAlternates("/collaboration"),
  openGraph: {
    title: COLLAB_TITLE,
    description: COLLAB_DESCRIPTION,
    url: `${SITE_URL}/collaboration`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/Intro.JPEG", alt: "Collaborate with Leira" }],
  },
  twitter: {
    card: "summary_large_image",
    title: COLLAB_TITLE,
    description: COLLAB_DESCRIPTION,
    images: ["/images/Intro.JPEG"],
  },
};

export default function CollaborationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

