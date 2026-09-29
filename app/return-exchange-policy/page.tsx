import type { Metadata } from "next";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/ui/back-button";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const RETURN_EXCHANGE_TITLE = "Leira Return & Exchange Policy | Replacements, Hygiene & Eligibility";
const RETURN_EXCHANGE_DESCRIPTION =
  "Read Leira's Return and Exchange Policy for replacement eligibility, hygiene guidelines, and how to report damaged or incorrect products.";

export const metadata: Metadata = {
  title: RETURN_EXCHANGE_TITLE,
  description: RETURN_EXCHANGE_DESCRIPTION,
  keywords: [
    "Leira return policy",
    "Leira exchange policy",
    "Leira replacement policy",
    "intimate perfume return policy",
  ],
  alternates: buildHreflangAlternates("/return-exchange-policy"),
  openGraph: {
    title: RETURN_EXCHANGE_TITLE,
    description: RETURN_EXCHANGE_DESCRIPTION,
    url: `${SITE_URL}/return-exchange-policy`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/logo.png", alt: "Leira return and exchange policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: RETURN_EXCHANGE_TITLE,
    description: RETURN_EXCHANGE_DESCRIPTION,
    images: ["/images/logo.png"],
  },
};

export default function ReturnExchangePolicyPage() {
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
            <h1 className="mt-3 text-3xl font-semibold text-pink-600 md:text-4xl">
              Return &amp; Exchange Policy
            </h1>
            <p className="mt-3 text-sm text-gray-600">Last Updated: 25/05/2026</p>

            <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
              <section>
                <p>
                  At Leira, we prioritize hygiene, safety, and customer well-being. Because our luxury intimate
                  perfumes are designed for intimate and personal care, all purchases are non-returnable and
                  non-refundable once delivered.
                </p>
                <p className="mt-3">
                  Please read our guidelines carefully before placing an order.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">1. Eligibility for Replacement</h2>
                <p className="mt-2">
                  We offer case-by-case resolutions only under the following conditions:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    <strong>Damaged or defective upon delivery:</strong> The product is received broken, leaking, or
                    damaged.
                  </li>
                  <li>
                    <strong>Incorrect item:</strong> You received a different variant, such as Jasmine instead of
                    Damask Rose, than what you ordered.
                  </li>
                  <li>
                    <strong>Timely claim:</strong> The issue is reported within <strong>48 hours</strong> of delivery
                    via email at{" "}
                    <a href="mailto:support@leiraindia.com" className="font-medium text-pink-600 hover:underline">
                      support@leiraindia.com
                    </a>{" "}
                    with clear images or unboxing videos of the package and product.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">2. Non-Returnable Conditions</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    <strong>Opened or tampered products:</strong> Due to the sensitive and natural botanical nature of
                    intimate care products, we cannot accept returns or exchanges for items that have been opened,
                    tampered with, or used under any circumstances.
                  </li>
                  <li>
                    <strong>Change of mind or dislike of scent:</strong> We do not accept returns or exchanges if you
                    dislike the fragrance variant or change your mind after the order has shipped.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">3. How to Raise a Claim</h2>
                <p className="mt-2">
                  Email us at{" "}
                  <a href="mailto:support@leiraindia.com" className="font-medium text-pink-600 hover:underline">
                    support@leiraindia.com
                  </a>{" "}
                  within 48 hours of delivery with your order ID, issue details, and clear images or an unboxing video.
                  Our team will review the request and share the next steps if the claim is eligible.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">4. Final Decision</h2>
                <p className="mt-2">
                  All replacement approvals are subject to verification by Leira. The final resolution may vary based on
                  product condition, claim evidence, and delivery records.
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
