import type { Ga4PurchaseLineItem } from "@/lib/analytics/google";

type CartLike = { id: string; name: string; price: number; quantity: number };

/**
 * Thank-you URL: order number, paid total, line items for GA4/Meta, optional DB order id for API fallback.
 */
export function buildThankYouOrderUrl(
  order: string,
  value: number,
  items: CartLike[],
  orderId?: string
): string {
  const lines: Ga4PurchaseLineItem[] = (items || []).map((it) => ({
    item_id: String(it.id),
    item_name: String(it.name || "Product"),
    price: Number(it.price),
    quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
  }));

  const totalQty = items.reduce((s, it) => s + Math.max(1, Math.floor(Number(it.quantity) || 1)), 0);
  const ids = items.map((it) => it.id).join(",");
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  const params = new URLSearchParams();
  params.set("order", order);
  params.set("value", String(safeValue));
  params.set("qty", String(totalQty));
  if (ids) params.set("ids", ids);

  const oid = String(orderId || "").trim();
  if (oid) params.set("orderId", oid);

  if (lines.length > 0) {
    params.set("ga4_items", JSON.stringify(lines));
  }

  return `/thank-you?${params.toString()}`;
}
