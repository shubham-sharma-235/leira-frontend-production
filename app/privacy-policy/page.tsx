import type { Metadata } from "next";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/ui/back-button";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const PRIVACY_TITLE = "Leira Privacy Policy | How We Collect & Protect Your Data";
const PRIVACY_DESCRIPTION =
  "Read Leira's Privacy Policy to understand how we collect, use, and protect your personal information.";

export const metadata: Metadata = {
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  keywords: [
    "Leira privacy policy",
    "data protection Leira",
    "customer data privacy",
  ],
  alternates: buildHreflangAlternates("/privacy-policy"),
  openGraph: {
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    url: `${SITE_URL}/privacy-policy`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/logo.png", alt: "Leira privacy policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    images: ["/images/logo.png"],
  },
};

export default function PrivacyPolicyPage() {
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
            <h1 className="mt-3 text-3xl font-semibold text-pink-600 md:text-4xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-gray-600">Last Updated: 05/03/2026</p>

            <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
              <section>
                <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
                <p className="mt-2">
                  We collect information that you provide directly, including your name, email, phone number,
                  billing and shipping address, and order details.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Data</h2>
                <p className="mt-2">
                  We use your data to process orders, provide customer support, improve services, and send important
                  updates related to purchases and account activity.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">3. Payments and Security</h2>
                <p className="mt-2">
                  Payments are processed through secure third-party payment partners. We do not store full card
                  information on our servers.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">4. Data Sharing</h2>
                <p className="mt-2">
                  We only share data with logistics, payment, and service partners required to fulfill your order and
                  operate the platform. We do not sell personal data.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">5. Your Rights</h2>
                <p className="mt-2">
                  You may request data correction or account updates by contacting our support team at
                  <span className="font-medium"> support@leiraindia.com</span>.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900">6. Contact</h2>
                <p className="mt-2">
                  If you have any privacy-related concerns, please contact us at <span className="font-medium">support@leiraindia.com</span>.
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

