import type { Metadata } from "next";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/ui/back-button";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const SHIPPING_TITLE = "Leira Shipping Policy | Delivery, Charges & Tracking India";
const SHIPPING_DESCRIPTION =
  "Read Leira's Shipping Policy for dispatch timelines, delivery coverage, shipping charges, and tracking details.";

export const metadata: Metadata = {
  title: SHIPPING_TITLE,
  description: SHIPPING_DESCRIPTION,
  keywords: [
    "Leira shipping policy",
    "delivery timeline Leira",
    "order tracking Leira",
    "shipping charges India",
  ],
  alternates: buildHreflangAlternates("/shipping-policy"),
  openGraph: {
    title: SHIPPING_TITLE,
    description: SHIPPING_DESCRIPTION,
    url: `${SITE_URL}/shipping-policy`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/logo.png", alt: "Leira shipping policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SHIPPING_TITLE,
    description: SHIPPING_DESCRIPTION,
    images: ["/images/logo.png"],
  },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <MiniNavbar />
      <main className="min-h-screen bg-[#FAF9F6] leira-underlap-nav-spacer pb-16">
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm md:p-10">
            <div className="mb-4">
              <BackButton />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-pink-600">Legal</p>
            <h1 className="mt-3 text-3xl font-semibold text-pink-600 md:text-4xl">Shipping Policy</h1>
            <p className="mt-3 text-sm text-gray-600">Last Updated: 05/03/2026</p>

            <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
              <section>
                <h2 className="text-lg font-semibold text-gray-900">1. Order Processing Time</h2>
                <p className="mt-2">
                  Orders are generally processed within 1-2 business days after successful payment confirmation.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">2. Delivery Timeline</h2>
                <p className="mt-2">
                  Delivery typically takes 3-7 business days depending on your location and courier service availability.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">3. Shipping Coverage</h2>
                <p className="mt-2">
                  We currently ship across major serviceable pin codes in India. Remote areas may require additional
                  delivery time.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">4. Tracking Information</h2>
                <p className="mt-2">
                  Once your order is dispatched, tracking details are shared through SMS/email and are also visible in
                  your account order history.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">5. Delays and Exceptions</h2>
                <p className="mt-2">
                  Delivery may be delayed due to weather issues, logistics disruptions, or local restrictions. We keep
                  customers informed in such cases.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

