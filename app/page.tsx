import { products as staticProducts } from "@/data/products";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroGalleryScrollAnimation } from "@/components/ui/hero-gallery-scroll-animation";
import { VisitorHighlight } from "@/components/ui/visitor-highlight";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import { IntroducingSection } from "@/components/Sections";
import { HomeProductSections } from "@/components/home/HomeProductSections";
import type { Product as HookProduct } from "@/hooks/useProducts";
import HomeDeferredSections from "@/components/home/home-deferred-sections";
import HomeVideoSection from "@/components/home/home-video-section";
import ScienceUSPSection from "@/components/home/ScienceUSPSection";
import ProductShowcase from "@/components/ui/ProductShowcase";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";
import HowToUse from "@/components/home/Howtouse";
import Hero from "@/components/home/Hero";
import Preloader from "@/components/Preloader";
// import LuxuryHero from "@/components/home/Luxuryhero";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leiraindia.com/api";
const HOME_TITLE =
  "Leira | India's First Luxury Intimate Perfume for Women";
const HOME_DESCRIPTION =
  "Leira is India's first intimate perfume crafted exclusively for women. Essential oil-based, alcohol-free, and pH-balanced for all-day freshness and confidence. Shop now.";
const HOME_OG_IMAGE = "/images/Intro.JPEG";
const HOME_KEYWORDS = [
  "intimate perfume for women",
  "luxury intimate perfume India",
  "essential oil feminine perfume",
  "natural intimate care",
  "long-lasting feminine fragrance",
  "Leira",
];
const SOCIAL_PROFILES = [
  "https://www.instagram.com/leiraindia?igsh=MXBmY2R2MjNjdzBlaA==",
  "https://www.facebook.com/profile.php?id=61581120730884",
];

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  keywords: HOME_KEYWORDS,
  alternates: buildHreflangAlternates("/"),
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: "Leira",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: HOME_OG_IMAGE,
        alt: "Leira intro collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_OG_IMAGE],
  },
};

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getInitialProducts(): Promise<HookProduct[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/products`);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json?.data)) return [];
    return json.data;
  } catch {
    return [];
  }
}

async function getHomeVideos(): Promise<
  Array<{ _id: string; title: string; subtitle?: string; videoUrl: string; posterUrl?: string }>
> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/home-videos`);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json?.data)) return [];
    return json.data;
  } catch {
    return [];
  }
}

function buildHasMerchantReturnPolicy(siteUrl: string) {
  // Google Merchant listings validation expects `hasMerchantReturnPolicy` inside `offers`.
  // We keep this stable across pages so it doesn't depend on backend product fields.
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "IN",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 30,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesFree",
    // If you have an actual returns policy page, you can set `merchantReturnLink` here.
    // merchantReturnLink: `${siteUrl}/returns`,
  };
}

function buildOfferShippingDetails() {
  // Google Merchant listings validation expects `shippingDetails` inside `offers`.
  return {
    "@type": "OfferShippingDetails",
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "IN",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "d",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 2,
        maxValue: 5,
        unitCode: "d",
      },
    },
  };
}

function normalizePriceForSchema(price: unknown): number | undefined {
  if (price == null) return undefined;
  if (typeof price === "number") {
    if (!Number.isFinite(price) || price <= 0) return undefined;
    return price;
  }
  if (typeof price === "string") {
    const cleaned = price.replace(/[^0-9.]/g, "");
    if (!cleaned) return undefined;
    const parsed = parseFloat(cleaned);
    if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
    return parsed;
  }
  return undefined;
}

export default async function Home() {
  const [initialProducts, homeVideos] = await Promise.all([
    getInitialProducts(),
    getHomeVideos(),
  ]);
  const showComboSectionLink = initialProducts.some((p) => Boolean(p.showInComboSection));
  const product = staticProducts[0];
  const showHomeBanner = false;
  const siteUrl = SITE_URL;
  const testimonialReviews = [
    {
      "@type": "Review",
      reviewBody:
        "Using Leira gave me the confidence and comfort to enjoy our intimate moments fully. It's been a wonderful change.",
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      author: { "@type": "Person", name: "Anita" },
    },
    {
      "@type": "Review",
      reviewBody:
        "I was skeptical at first, but now I can't imagine going without it. It's light, natural, and gives me a sense of calm every time I use it.",
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      author: { "@type": "Person", name: "Sneha P" },
    },
    {
      "@type": "Review",
      reviewBody:
        "The long-lasting fragrance is incredible. Leira's blend feels elegant and has become an essential part of my self-care routine.",
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      author: { "@type": "Person", name: "Meera Kapoor" },
    },
  ];
  const testimonialsSchema = {
    "@type": "Product",
    "@id": `${siteUrl}/shop#homepage-testimonials-product`,
    name: "Leira Intimate Perfume for Women",
    description: HOME_DESCRIPTION,
    image: `${siteUrl}${HOME_OG_IMAGE}`,
    brand: {
      "@type": "Brand",
      name: "Leira",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: testimonialReviews.length,
    },
    review: testimonialReviews,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/shop`,
      // Google Merchant validation expects `price` to be a valid numeric value (no currency symbols).
      price: normalizePriceForSchema(
        product?.price ?? (product as any)?.buyNowSection?.price
      ),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      hasMerchantReturnPolicy: buildHasMerchantReturnPolicy(siteUrl),
      shippingDetails: buildOfferShippingDetails(),
    },
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this a substitute for hygiene?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Leira is a finishing touch, to complement-not replace-your daily cleansing.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use it every day?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Begin with a patch test; once comfortable, you can use it daily as part of your self-care routine.",
        },
      },
      {
        "@type": "Question",
        name: "What if my skin is sensitive?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Apply sparingly on less delicate areas and avoid freshly shaved skin for at least 24 hours.",
        },
      },
      {
        "@type": "Question",
        name: "Is Leira safe for daily use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Leira is designed for gentle daily use. Start with a small amount and increase as needed.",
        },
      },
      {
        "@type": "Question",
        name: "Is this a replacement for intimate hygiene products?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Leira complements your regular cleansing routine and is not a replacement.",
        },
      },
      {
        "@type": "Question",
        name: "Does it help with odor control?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Used regularly as part of daily self-care, it helps keep the area fresh and balanced.",
        },
      },
    ],
  };
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: "Leira",
        url: siteUrl,
        logo: `${siteUrl}/images/logo.png`,
        email: "support@leiraindia.com",
        telephone: "+91-9810822968",
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+91-9810822968",
            contactType: "customer support",
            email: "support@leiraindia.com",
            areaServed: "IN",
            availableLanguage: ["en", "hi"],
          },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Office No. 48, 7th Floor, ETT Tower 2, Sector 132",
          addressLocality: "Noida",
          addressRegion: "UP",
          postalCode: "201304",
          addressCountry: "IN",
        },
        sameAs: SOCIAL_PROFILES,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: "Leira",
        publisher: {
          "@id": `${siteUrl}#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/shop?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
        ],
      },
      faqSchema,
      testimonialsSchema,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <MiniNavbar />
      <main
        className="relative min-w-0 overflow-x-hidden bg-[#faf7f2] leira-underlap-nav-spacer"
      >
        {/* <HeroGalleryScrollAnimation showComboSectionLink={showComboSectionLink} /> */}
        {/* <VisitorHighlight /> */}
        <Preloader />
        <Hero />
        
        <ScienceUSPSection />
        {/* <LuxuryHero /> */}
        <ProductShowcase />
        <HowToUse />
        <div className="relative z-10 min-w-0">
        {/* <HomeProductSections initialProducts={initialProducts} /> */}
        {/* <IntroducingSection product={product} /> */}
        <HomeVideoSection videos={homeVideos} />
        {/* {showHomeBanner && null} */}
        <HomeDeferredSections />
        </div>
      </main>
    </>
  );
}
