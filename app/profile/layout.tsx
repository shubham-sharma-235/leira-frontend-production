import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const PROFILE_DESCRIPTION =
  "Access your Leira profile to view orders, manage addresses, update account details, and track your purchase history securely.";

export const metadata: Metadata = {
  title: "My Profile | Leira",
  description: PROFILE_DESCRIPTION,
  keywords: [
    "Leira profile",
    "my orders Leira",
    "manage address Leira",
  ],
  alternates: buildHreflangAlternates("/profile"),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "My Profile | Leira",
    description: PROFILE_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "My Profile | Leira",
    description: PROFILE_DESCRIPTION,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

