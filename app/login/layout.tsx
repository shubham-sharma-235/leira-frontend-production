import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const LOGIN_DESCRIPTION =
  "Sign in to your Leira account to manage orders, track shipments, update profile details, and access a smoother checkout experience.";

export const metadata: Metadata = {
  title: "Login | Leira",
  description: LOGIN_DESCRIPTION,
  keywords: [
    "Leira login",
    "customer account login",
    "secure login Leira",
  ],
  alternates: buildHreflangAlternates("/login"),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Login | Leira",
    description: LOGIN_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Login | Leira",
    description: LOGIN_DESCRIPTION,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

