/** Canonical shop slugs — old campaign URLs map to clean permanent slugs. */

export const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  "complete-trio-full-mother-s-day-description": "the-complete-trio-all-3",
};

export function toProductSlug(value = ""): string {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function canonicalProductSlug(id?: string, name?: string): string {
  const slug = toProductSlug(id || name || "");
  if (!slug) return "";
  return PRODUCT_SLUG_ALIASES[slug] || slug;
}

export function getProductShopPath(product: {
  id?: string;
  _id?: string;
  name?: string;
}): string {
  const slug = canonicalProductSlug(product.id, product.name);
  if (slug) return `/shop/${slug}`;
  return `/shop/${product._id || ""}`;
}

/** Old slugs that should 301 to their canonical slug. */
export function productSlugRedirects(): { source: string; destination: string }[] {
  return Object.entries(PRODUCT_SLUG_ALIASES).map(([from, to]) => ({
    source: `/shop/${from}`,
    destination: `/shop/${to}`,
  }));
}
