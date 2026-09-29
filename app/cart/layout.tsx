import type { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const CART_DESCRIPTION =
  "Review your selected Leira products, apply available offers, and proceed securely to checkout with billing and shipping details.";

export const metadata: Metadata = {
  title: "Cart | Leira",
  description: CART_DESCRIPTION,
  keywords: [
    "Leira cart",
    "checkout Leira",
    "buy intimate perfume online",
  ],
  alternates: buildHreflangAlternates("/cart"),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Cart | Leira",
    description: CART_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cart | Leira",
    description: CART_DESCRIPTION,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

