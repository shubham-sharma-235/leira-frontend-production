/**
 * Same rules as `ShopPageClient` / admin: shop grid visibility.
 */
export function isProductShopVisible(p: {
  showInShopSection?: boolean;
  showInComboSection?: boolean;
}): boolean {
  if (typeof p.showInShopSection === "boolean") return p.showInShopSection;
  return !Boolean(p.showInComboSection);
}

/** Duo / trio / combo bundles (by name), even if admin cleared homepage combo flag. */
export function productNameLooksLikeBundle(name: string | undefined): boolean {
  return /\b(duo|trio|combo)\b/i.test(String(name || ""));
}

/**
 * Products allowed in Shop + active, excluding bundle SKUs from upsell surfaces.
 */
export function isRecommendableProduct(p: {
  id?: string;
  _id?: string;
  name?: string;
  status?: string;
  showInShopSection?: boolean;
  showInComboSection?: boolean;
}): boolean {
  const id = String(p.id || p._id || "").trim();
  if (!id || !String(p.name || "").trim()) return false;
  if (p.status === "inactive") return false;
  if (!isProductShopVisible(p)) return false;
  if (Boolean(p.showInComboSection)) return false;
  if (productNameLooksLikeBundle(p.name)) return false;
  return true;
}
