/**
 * GA4 ecommerce events via GTM dataLayer (+ optional gtag).
 * GTM mein Custom Event triggers: view_item | add_to_cart | begin_checkout | purchase
 */

import { whenGtagReady } from "@/lib/analytics/ga4";

export type EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_category?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function normalizeItems(items: EcommerceItem[]): EcommerceItem[] {
  return (items || [])
    .filter((i) => i?.item_id && Number(i.quantity) > 0 && Number.isFinite(Number(i.price)))
    .map((i) => ({
      item_id: String(i.item_id),
      item_name: String(i.item_name || "Product"),
      price: Number(i.price),
      quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
      item_brand: i.item_brand || "Leira",
      ...(i.item_category ? { item_category: i.item_category } : {}),
    }));
}

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce object (GA4 recommended)
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(payload);
}

function pushEcommerceEvent(
  eventName: "view_item" | "add_to_cart" | "begin_checkout" | "view_cart",
  value: number,
  items: EcommerceItem[],
  extra?: Record<string, unknown>
) {
  if (typeof window === "undefined") return false;
  const normalized = normalizeItems(items);
  if (normalized.length === 0) return false;

  const safeValue = Number.isFinite(value) && value >= 0 ? value : 0;
  const ecommerce = {
    currency: "INR",
    value: safeValue,
    items: normalized,
    ...extra,
  };

  try {
    pushDataLayer({
      event: eventName,
      currency: "INR",
      value: safeValue,
      items: normalized,
      ecommerce,
      ...extra,
    });
  } catch {
    return false;
  }

  whenGtagReady(() => {
    if (typeof window.gtag !== "function") return;
    try {
      window.gtag("event", eventName, {
        currency: "INR",
        value: safeValue,
        items: normalized,
        ...extra,
      });
    } catch {
      /* never block UX */
    }
  });

  return true;
}

export function trackViewItem(item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}) {
  const qty = Math.max(1, Math.floor(item.quantity || 1));
  const price = Number(item.price) || 0;
  return pushEcommerceEvent("view_item", price * qty, [
    {
      item_id: String(item.item_id),
      item_name: String(item.item_name || "Product"),
      price,
      quantity: qty,
      item_brand: "Leira",
      item_category: "Intimate Perfume",
    },
  ]);
}

export function trackAddToCart(item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}) {
  const qty = Math.max(1, Math.floor(item.quantity || 1));
  const price = Number(item.price) || 0;
  return pushEcommerceEvent("add_to_cart", price * qty, [
    {
      item_id: String(item.item_id),
      item_name: String(item.item_name || "Product"),
      price,
      quantity: qty,
      item_brand: "Leira",
      item_category: "Intimate Perfume",
    },
  ]);
}

export function trackBeginCheckout(
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>,
  value: number
) {
  const mapped = items.map((i) => ({
    item_id: String(i.item_id),
    item_name: String(i.item_name || "Product"),
    price: Number(i.price) || 0,
    quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
    item_brand: "Leira",
    item_category: "Intimate Perfume",
  }));
  return pushEcommerceEvent("begin_checkout", Number(value) || 0, mapped);
}

export function trackViewCart(
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>,
  value: number
) {
  const mapped = items.map((i) => ({
    item_id: String(i.item_id),
    item_name: String(i.item_name || "Product"),
    price: Number(i.price) || 0,
    quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
    item_brand: "Leira",
    item_category: "Intimate Perfume",
  }));
  return pushEcommerceEvent("view_cart", Number(value) || 0, mapped);
}
