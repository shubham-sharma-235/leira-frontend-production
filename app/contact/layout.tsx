import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const CONTACT_TITLE = "Contact Leira | Support, Orders & Intimate Perfume Help";
const CONTACT_DESCRIPTION =
  "Contact Leira for product support, order help, collaborations, and feedback. Reach our team for guidance on intimate perfume and self-care routines.";
const CONTACT_OG_IMAGE = "/images/Intro.JPEG";

export const metadata: Metadata = {
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  keywords: [
    "contact Leira",
    "Leira customer support",
    "intimate perfume support",
    "order help Leira",
  ],
  alternates: buildHreflangAlternates("/contact"),
  openGraph: {
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    url: `${SITE_URL}/contact`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: CONTACT_OG_IMAGE, alt: "Contact Leira" }],
  },
  twitter: {
    card: "summary_large_image",
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    images: [CONTACT_OG_IMAGE],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

