/**
 * Product image roles from admin:
 * - homeCardImage → homepage Discover grid + homepage combo strip cards
 * - shopCardImage → /shop (and /combo) grid cards
 * - images[] → product detail gallery (+ fallback for older products)
 */

export type ProductImageFields = {
  images?: string[];
  folderPath?: string;
  homeCardImage?: string;
  shopCardImage?: string;
};

/** Paths as stored in DB (may be /uploads/... or /images/...) */
export function pickDetailGalleryPaths(product: ProductImageFields): string[] {
  if (product.images?.length) return product.images.map(String).filter(Boolean);
  const fp = String(product.folderPath || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/$/, "");
  if (fp) return [`${fp}/1.jpg`, `${fp}/2.jpg`];
  return [];
}

export function pickHomeCardPath(product: ProductImageFields): string | undefined {
  const h = String(product.homeCardImage || "").trim();
  if (h) return h;
  const s = String(product.shopCardImage || "").trim();
  if (s) return s;
  return pickDetailGalleryPaths(product)[0];
}

export function pickShopCardPath(product: ProductImageFields): string | undefined {
  const s = String(product.shopCardImage || "").trim();
  if (s) return s;
  const h = String(product.homeCardImage || "").trim();
  if (h) return h;
  return pickDetailGalleryPaths(product)[0];
}
