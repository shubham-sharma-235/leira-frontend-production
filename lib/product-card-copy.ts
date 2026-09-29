/** Admin-controlled card copy — no hardcoded slug/subName/description fallbacks. */

export type ProductCardCopyFields = {
  shopCardDescription?: string;
  shopCardTagline?: string;
  homeCardTagline?: string;
  homeCardDescription?: string;
};

export function pickShopCardDescription(product: ProductCardCopyFields): string {
  return String(product.shopCardDescription ?? "").trim();
}

export function pickShopCardTagline(product: ProductCardCopyFields): string {
  return String(product.shopCardTagline ?? "").trim();
}

export function pickHomeCardTagline(product: ProductCardCopyFields): string {
  return String(product.homeCardTagline ?? "").trim();
}

export function pickHomeCardDescription(product: ProductCardCopyFields): string {
  return String(product.homeCardDescription ?? "").trim();
}
