import type { Metadata } from "next";
import Link from "next/link";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/ui/back-button";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const TERMS_TITLE = "Leira Terms & Conditions | Website Use, Orders & Returns";
const TERMS_DESCRIPTION =
  "Read Leira's Terms and Conditions for website usage, orders, returns, shipping, liability, and governing law.";
const TERMS_OG_IMAGE = "/images/logo.png";

export const metadata: Metadata = {
  title: TERMS_TITLE,
  description: TERMS_DESCRIPTION,
  keywords: [
    "Leira terms and conditions",
    "Leira website terms",
    "ecommerce terms India",
  ],
  alternates: buildHreflangAlternates("/terms-and-conditions"),
  openGraph: {
    title: "Terms & Conditions | Leira",
    description: TERMS_DESCRIPTION,
    url: `${SITE_URL}/terms-and-conditions`,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [{ url: TERMS_OG_IMAGE, alt: "Leira terms and conditions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TERMS_TITLE,
    description: TERMS_DESCRIPTION,
    images: [TERMS_OG_IMAGE],
  },
};

const sections = [
  {
    title: "1. About Leira",
    paragraphs: [
      "Leira is a wellness-focused brand offering luxury intimate perfumes designed for external use. Our products are created to support freshness, confidence, and personal care.",
      "All information provided on this website is intended for general informational purposes and should not replace medical advice.",
    ],
  },
  {
    title: "2. Eligibility to Use the Website",
    paragraphs: ["By using this website, you confirm that:"],
    points: [
      "You are at least 18 years of age.",
      "You are legally capable of entering into binding agreements.",
      "You will use the website only for lawful purposes.",
    ],
    closing:
      "Leira reserves the right to refuse service or cancel orders if misuse or suspicious activity is detected.",
  },
  {
    title: "3. Product Information",
    paragraphs: [
      "We strive to ensure that all product descriptions, images, and details on the website are accurate. However:",
    ],
    points: [
      "Slight variations in packaging, color, or fragrance perception may occur.",
      "Individual experiences with fragrance may vary due to body chemistry.",
    ],
    closing: "Leira does not guarantee identical results for every user.",
  },
  {
    title: "4. Use of Products",
    paragraphs: ["Leira products are designed for external use only on intimate areas.", "Users should:"],
    points: [
      "Follow the usage instructions provided with the product.",
      "Perform a patch test before regular use.",
      "Discontinue use if irritation or discomfort occurs.",
    ],
    closing: "Leira will not be responsible for misuse of the product or use contrary to instructions.",
  },
  {
    title: "5. Orders and Payments",
    paragraphs: ["When you place an order on our website:"],
    points: [
      "You agree that all information provided is accurate and complete.",
      "Orders are subject to availability and confirmation.",
      "Prices listed on the website are in Indian Rupees (INR) unless stated otherwise.",
    ],
    closing: "Leira reserves the right to modify prices or cancel orders in case of pricing errors.",
  },
  {
    title: "6. Shipping and Delivery",
    paragraphs: [
      "We aim to process and dispatch orders promptly. Delivery timelines may vary depending on location and logistics partners.",
      "Leira is not responsible for delays caused by:",
    ],
    points: ["Courier service disruptions", "Weather conditions", "Regional delivery restrictions"],
    closing: "Once the order is shipped, tracking details will be shared with the customer.",
  },
  {
    title: "7. Returns and Refunds",
    paragraphs: [
      "Due to the personal and intimate nature of the product, opened or used items may not be eligible for return unless the product is damaged or defective.",
      "If you receive a damaged product, please contact our support team within 48 hours of delivery with clear images of the package and product.",
      "Return eligibility and refund decisions will be evaluated on a case-by-case basis.",
    ],
  },
  {
    title: "8. Intellectual Property",
    paragraphs: ["All content on this website, including:"],
    points: ["Logos", "Product names", "Images", "Text", "Design elements"],
    closing:
      "These are the property of Leira and may not be copied, reproduced, or used without prior written permission.",
  },
  {
    title: "9. Privacy",
    paragraphs: [
      "Your privacy is important to us. Any personal information shared through this website is handled according to our Privacy Policy.",
      "We do not sell or misuse customer data.",
    ],
  },
  {
    title: "10. Limitation of Liability",
    paragraphs: ["Leira shall not be held liable for:"],
    points: [
      "Any allergic reactions caused by individual sensitivity",
      "Misuse of the product",
      "Indirect or consequential damages arising from website use",
    ],
    closing: "Users are responsible for reviewing ingredients before use.",
  },
  {
    title: "11. Changes to Terms",
    paragraphs: [
      "Leira reserves the right to update or modify these Terms and Conditions at any time without prior notice. Continued use of the website constitutes acceptance of any updated terms.",
    ],
  },
  {
    title: "12. Governing Law",
    paragraphs: [
      "These Terms and Conditions are governed by the laws of India. Any disputes arising from the use of this website shall fall under the jurisdiction of the appropriate courts in India.",
    ],
  },
  {
    title: "13. Contact Us",
    paragraphs: ["For any questions regarding these Terms and Conditions, please contact us at:"],
    points: ["Email: support@leiraindia.com", "Website: https://leiraindia.com/"],
    closing: "Authorized by AOMAN SERVICES PRIVATE LIMITED.",
  },
];

export default function TermsAndConditionsPage() {
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
            <h1 className="mt-3 text-3xl font-semibold text-pink-600 md:text-4xl">Terms & Conditions</h1>
            <p className="mt-3 text-sm text-gray-600">Last Updated: 05/03/2026</p>

            <p className="mt-6 text-gray-700 leading-relaxed">
              Welcome to Leira. These Terms and Conditions govern your use of our website{" "}
              <Link href="https://leiraindia.com/" className="text-pink-600 hover:underline">
                https://leiraindia.com/
              </Link>{" "}
              and the purchase of products offered through the site. By accessing or using this website, you agree to
              comply with and be bound by the terms outlined below.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              If you do not agree with these Terms, please refrain from using the website.
            </p>

            <div className="my-8 h-px w-full bg-pink-100" />

            <div className="space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-gray-700 leading-relaxed">
                    {section.paragraphs?.map((text) => (
                      <p key={text}>{text}</p>
                    ))}
                    {!!section.points?.length && (
                      <ul className="list-disc pl-5 space-y-1">
                        {section.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    )}
                    {section.closing && <p>{section.closing}</p>}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

