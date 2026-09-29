/**
 * Flagship single-note PDPs — used for guaranteed internal links on every product page (SEO + UX).
 * Keep in sync with public URLs (e.g. leiraindia.com/shop/...).
 */
export const FLAGSHIP_PRODUCT_LINKS = [
  {
    href: "/shop/ylang-ylang",
    label: "Ylang Ylang",
    line: "Warm, creamy floral depth",
  },
  {
    href: "https://leiraindia.com/shop/jasmine",
    label: "Jasmine",
    line: "Fresh, sensual white florals",
  },
  {
    href: "/shop/damask-rose",
    label: "Damask Rose",
    line: "Velvet rose elegance",
  },
] as const;

export type FlagshipProductLink = (typeof FLAGSHIP_PRODUCT_LINKS)[number];

/** Other flagship PDPs (excludes current product by canonical path, URL param, and slug). */
export function getFlagshipSiblingsExcluding(args: {
  canonicalPath: string;
  urlParam: string;
  slugFromProduct: string;
}): FlagshipProductLink[] {
  const blocked = new Set<string>();
  const c = String(args.canonicalPath || "").trim();
  if (c) blocked.add(c);
  const param = String(args.urlParam || "").trim();
  if (param) blocked.add(`/shop/${param}`);
  const slug = String(args.slugFromProduct || "").trim();
  if (slug) blocked.add(`/shop/${slug}`);
  return FLAGSHIP_PRODUCT_LINKS.filter((x) => !blocked.has(x.href));
}
