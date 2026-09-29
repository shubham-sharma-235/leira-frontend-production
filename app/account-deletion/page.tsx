import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";
import AccountDeletionClient from "./AccountDeletionClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const TITLE = "Delete Your Leira Account | Account Deletion Request";
const DESCRIPTION =
  "Request permanent deletion of your Leira account and personal data. Learn what is removed, what is retained, and how to submit a deletion request.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Leira account deletion",
    "delete Leira account",
    "data deletion request India",
    "remove Leira profile",
  ],
  alternates: buildHreflangAlternates("/account-deletion"),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/account-deletion`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/logo.png", alt: "Leira account deletion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/logo.png"],
  },
};

export default function AccountDeletionPage() {
  return <AccountDeletionClient />;
}
