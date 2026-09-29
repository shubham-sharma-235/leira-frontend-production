import { Metadata } from "next";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";
import { products as staticProducts } from "@/data/products";
import { resolveProductSeoCopy } from "@/lib/seo/productCopy";
import { canonicalProductSlug } from "@/lib/product-slugs";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api` : "") ||
  "https://leiraindia.com/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const PRICE_VALID_UNTIL = "2026-12-31";
const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchProduct(id: string) {
  const normalizedId = toSlug(id);
  try {
    const res = await fetchWithTimeout(`${API_URL}/products/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.success && json?.data) return json.data;
  } catch {
    // ignore
  }

  try {
    const res = await fetchWithTimeout(`${API_URL}/products`);
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : [];
      const matched =
        items.find((item: any) => String(item?._id || "") === id) ||
        items.find((item: any) => String(item?.id || "") === id) ||
        items.find((item: any) => toSlug(item?.id || item?.name || "") === normalizedId);
      if (matched) return matched;
    }
  } catch {
    // ignore
  }

  const staticMatch = staticProducts.find(
    (item) =>
      item.id === id ||
      toSlug(item.id || item.name || "") === normalizedId ||
      toSlug(item.name || "") === normalizedId
  );
  if (staticMatch) {
    return {
      _id: staticMatch.id,
      id: staticMatch.id,
      name: staticMatch.name,
      description: staticMatch.description,
      price: staticMatch.price,
      status: "active",
      images: [`${staticMatch.folderPath}/1.jpg`],
      folderPath: staticMatch.folderPath,
    };
  }

  return null;
}

async function fetchReviewStats(productId?: string) {
  if (!productId) return { avgRating: 0, totalCount: 0 };
  try {
    const res = await fetchWithTimeout(`${API_URL}/reviews/product/${productId}`);
    if (!res.ok) return { avgRating: 0, totalCount: 0 };
    const json = await res.json();
    return {
      avgRating: Number(json?.stats?.avgRating || 0),
      totalCount: Number(json?.stats?.totalCount || 0),
    };
  } catch {
    return { avgRating: 0, totalCount: 0 };
  }
}

function buildImageUrl(product: any): string | undefined {
  if (!product) return undefined;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";
  const img = product.images?.[0];
  if (img?.startsWith("http")) return img;
  if (img) return img.startsWith("/") ? `${base}${img}` : `${base}/${img}`;
  if (product.folderPath) {
    const fp = product.folderPath.startsWith("/") ? product.folderPath : `/${product.folderPath}`;
    return `${base}${fp}/1.jpg`;
  }
  return undefined;
}

function buildImageUrls(product: any): string[] {
  if (!product) return [];
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";
  const images = Array.isArray(product.images) ? product.images : [];
  const normalized = images
    .map((img: string) => {
      if (!img) return "";
      if (img.startsWith("http")) return img;
      return img.startsWith("/") ? `${base}${img}` : `${base}/${img}`;
    })
    .filter(Boolean);

  if (normalized.length > 0) return Array.from(new Set(normalized));

  if (product.folderPath) {
    const fp = product.folderPath.startsWith("/") ? product.folderPath : `/${product.folderPath}`;
    return [`${base}${fp}/1.jpg`];
  }

  return [];
}

function normalizePrice(price: unknown): number | undefined {
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

function buildSku(product: any): string | undefined {
  const raw = String(product?.id || product?._id || "").trim();
  if (!raw) return undefined;
  return `LEIRA-${raw.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toUpperCase()}-15ML`;
}

function isInStock(product: any): boolean {
  const stock = Number(product?.stock ?? 0);
  const hasPositiveStock = Number.isFinite(stock) ? stock > 0 : true;
  return product?.status !== "inactive" && hasPositiveStock;
}

function buildHasMerchantReturnPolicy() {
  // Google Merchant listings validation expects `hasMerchantReturnPolicy` inside `offers`.
  // Keep it deterministic (doesn't depend on backend data).
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "IN",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 30,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesFree",
  };
}

function buildOfferShippingDetails() {
  // Google Merchant listings validation expects `shippingDetails` inside `offers`.
  // Use a safe deterministic shipping policy: India delivery in a few days.
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

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) {
    return { title: "Product Not Found | Leira" };
  }
  const seoCopy = resolveProductSeoCopy(
    id,
    String(product?.id || ""),
    String(product?.name || "")
  );
  const title = seoCopy?.title || `${product.name} | Leira`;
  const description =
    seoCopy?.metaDescription ||
    (product.description?.trim().length > 3
      ? product.description.slice(0, 160)
      : `Shop ${product.name} at Leira. Luxury fragrance.`);
  const image = buildImageUrl(product);
  const slugOrId = canonicalProductSlug(String(product.id || ""), String(product.name || "")) || product._id || id;
  const canonicalUrl = `${SITE_URL}/shop/${slugOrId}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      "Leira",
      "intimate perfume for women",
      "luxury feminine perfume",
      "essential oil intimate perfume",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      ...(image && { images: [{ url: image, alt: product.name }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: buildHreflangAlternates(canonicalUrl),
  };
}

export default async function ProductDetailLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);
  const reviewStats = await fetchReviewStats(product?._id || product?.id);
  const imageUrl = product ? buildImageUrl(product) : undefined;
  const imageUrls = product ? buildImageUrls(product) : [];
  const slugOrId = canonicalProductSlug(String(product?.id || ""), String(product?.name || "")) || product?._id || id;
  const productUrl = `${SITE_URL}/shop/${slugOrId}`;

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            name: product.name,
            description:
              product.description?.trim().length > 3
                ? product.description
                : `Luxury fragrance: ${product.name}`,
            image: imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : undefined,
            sku: buildSku(product) || product.id || product._id || undefined,
            brand: {
              "@type": "Brand",
              name: "Leira",
            },
            ...(reviewStats.totalCount > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: reviewStats.avgRating,
                    reviewCount: reviewStats.totalCount,
                  },
                }
              : {}),
            offers: {
              "@type": "Offer",
              url: productUrl,
              price: normalizePrice(
                product.price ?? (product as any)?.buyNowSection?.price
              ),
              priceCurrency: "INR",
              priceValidUntil: PRICE_VALID_UNTIL,
              availability:
                isInStock(product)
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              hasMerchantReturnPolicy: buildHasMerchantReturnPolicy(),
              shippingDetails: buildOfferShippingDetails(),
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@type": "Organization",
                name: "Leira",
              },
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Shop",
                item: `${SITE_URL}/shop`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.name,
                item: productUrl,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
