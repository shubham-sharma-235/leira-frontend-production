import type { Metadata } from "next";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/ui/back-button";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const CANCELLATION_TITLE = "Leira Cancellation Policy | Refunds, Orders & Eligibility";
const CANCELLATION_DESCRIPTION =
  "Read Leira's Cancellation Policy for order cancellation timelines, eligibility, and refund processing details.";

export const metadata: Metadata = {
  title: CANCELLATION_TITLE,
  description: CANCELLATION_DESCRIPTION,
  keywords: [
    "Leira cancellation policy",
    "order cancellation Leira",
    "refund policy India",
  ],
  alternates: buildHreflangAlternates("/cancellation-policy"),
  openGraph: {
    title: CANCELLATION_TITLE,
    description: CANCELLATION_DESCRIPTION,
    url: `${SITE_URL}/cancellation-policy`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/logo.png", alt: "Leira cancellation policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: CANCELLATION_TITLE,
    description: CANCELLATION_DESCRIPTION,
    images: ["/images/logo.png"],
  },
};

export default function CancellationPolicyPage() {
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
            <h1 className="mt-3 text-3xl font-semibold text-pink-600 md:text-4xl">Cancellation Policy</h1>
            <p className="mt-3 text-sm text-gray-600">Last Updated: 05/03/2026</p>

            <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
              <section>
                <h2 className="text-lg font-semibold text-gray-900">1. Cancellation Window</h2>
                <p className="mt-2">
                  You may cancel an order yourself from your account profile within <strong>24 hours</strong> of
                  placing it, as long as it has not been dispatched (order status is still placed or confirmed).
                  After 24 hours, or once processing or shipping has started, cancellation from the website is not
                  available.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">2. How to Request Cancellation</h2>
                <p className="mt-2">
                  Sign in, go to <strong>Profile → My Orders</strong>, and use <strong>Cancel order</strong> on eligible
                  orders. For orders outside the 24-hour window or already shipped, contact customer support with your
                  order ID.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">3. Refund for Prepaid Orders</h2>
                <p className="mt-2">
                  If cancellation is approved before dispatch, refunds for prepaid orders are initiated to the original
                  payment method as per banking timelines.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">4. Non-Cancellable Cases</h2>
                <p className="mt-2">
                  Orders that are already shipped, in transit, or marked as delivered may not be eligible for direct
                  cancellation and will be handled under return/refund eligibility.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">5. Support Contact</h2>
                <p className="mt-2">
                  For cancellation help, contact us at <span className="font-medium">support@leiraindia.com</span> and share your
                  order details.
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

