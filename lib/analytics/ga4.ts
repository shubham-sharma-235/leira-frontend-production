import type { Ga4PurchaseLineItem } from "@/lib/analytics/google";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type Ga4PurchasePayload = {
  transaction_id: string;
  value: number;
  currency: string;
  tax?: number;
  shipping?: number;
  items: Ga4PurchaseLineItem[];
};

function purchaseDedupeKey(transactionId: string) {
  return `ga4_purchase_fired_${transactionId}`;
}

export function hasPurchaseBeenTracked(transactionId: string): boolean {
  if (typeof window === "undefined") return false;
  const tid = String(transactionId || "").trim();
  if (!tid) return false;
  try {
    return sessionStorage.getItem(purchaseDedupeKey(tid)) === "1";
  } catch {
    return false;
  }
}

/** Wait for gtag from async loader (layout). */
export function whenGtagReady(run: () => void, timeoutMs = 5000): void {
  if (typeof window === "undefined") return;
  const start = Date.now();
  const poll = () => {
    if (typeof window.gtag === "function") {
      run();
      return;
    }
    if (Date.now() - start >= timeoutMs) {
      run();
      return;
    }
    window.setTimeout(poll, 50);
  };
  poll();
}

function normalizePurchaseItems(items: Ga4PurchaseLineItem[]) {
  return (items || [])
    .filter((i) => i?.item_id && Number(i.quantity) > 0 && Number.isFinite(Number(i.price)))
    .map((i) => ({
      item_id: String(i.item_id),
      item_name: String(i.item_name || "Product"),
      price: Number(i.price),
      quantity: Number(i.quantity),
    }));
}

/**
 * GTM GA4 ecommerce + flat keys (works with "Data Layer" and "ecommerce" variable setups).
 */
function pushGtmPurchaseEvent(eventPayload: Record<string, unknown>): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "purchase",
    transaction_id: eventPayload.transaction_id,
    value: eventPayload.value,
    currency: eventPayload.currency,
    tax: eventPayload.tax,
    shipping: eventPayload.shipping,
    items: eventPayload.items,
    ecommerce: {
      transaction_id: eventPayload.transaction_id,
      value: eventPayload.value,
      currency: eventPayload.currency,
      tax: eventPayload.tax,
      shipping: eventPayload.shipping,
      items: eventPayload.items,
    },
  });
}

/**
 * GA4 purchase — numeric fields as numbers; deduped per transaction_id per session.
 * Sends GTM dataLayer (ecommerce object) + gtag purchase when available.
 */
export function trackGa4Purchase(payload: Ga4PurchasePayload): boolean {
  if (typeof window === "undefined") return false;
  const tid = String(payload.transaction_id || "").trim();
  if (!tid) return false;

  try {
    if (sessionStorage.getItem(purchaseDedupeKey(tid))) return false;
  } catch {
    // storage blocked — still try one fire
  }

  const items = normalizePurchaseItems(payload.items);
  if (items.length === 0) return false;

  const valueNum = Number(payload.value);
  if (!Number.isFinite(valueNum) || valueNum <= 0) return false;

  const eventPayload: Record<string, unknown> = {
    transaction_id: tid,
    value: valueNum,
    currency: payload.currency || "INR",
    items,
  };

  if (payload.tax != null && Number.isFinite(payload.tax)) {
    eventPayload.tax = Number(payload.tax);
  }
  if (payload.shipping != null && Number.isFinite(payload.shipping)) {
    eventPayload.shipping = Number(payload.shipping);
  }

  try {
    pushGtmPurchaseEvent(eventPayload);
  } catch {
    /* never block UX */
  }

  whenGtagReady(() => {
    if (typeof window.gtag !== "function") return;
    try {
      window.gtag("event", "purchase", eventPayload);
    } catch {
      /* never block UX */
    }
  });

  try {
    sessionStorage.setItem(purchaseDedupeKey(tid), "1");
  } catch {
    /* ignore */
  }

  return true;
}

/** Encode cart lines for thank-you URL (JSON → URI component). */
export function encodeGa4ItemsForUrl(lines: Ga4PurchaseLineItem[]): string {
  try {
    return encodeURIComponent(JSON.stringify(lines));
  } catch {
    return "";
  }
}

/** Decode `ga4_items` query param from thank-you page. */
export function decodeGa4ItemsFromUrlParam(raw: string | undefined): Ga4PurchaseLineItem[] | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const trimmed = raw.trim();
    let decoded = trimmed;
    try {
      decoded = decodeURIComponent(trimmed.replace(/\+/g, " "));
    } catch {
      decoded = trimmed;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(decoded) as unknown;
    } catch {
      parsed = JSON.parse(trimmed) as unknown;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const out: Ga4PurchaseLineItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const item_id = String(r.item_id ?? r.id ?? "").trim();
      const item_name = String(r.item_name ?? r.name ?? "Product");
      const price = Number(r.price);
      const quantity = Number(r.quantity ?? 1);
      if (!item_id || !Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) continue;
      out.push({ item_id, item_name, price, quantity });
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

/** Scale unit prices so Σ(price × qty) matches paid total (coupons / rounding). */
export function alignGa4ItemsToTransactionTotal(
  items: Ga4PurchaseLineItem[],
  transactionValue: number
): Ga4PurchaseLineItem[] {
  const v = Number(transactionValue);
  if (!Number.isFinite(v) || v <= 0 || items.length === 0) return items;
  const sum = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  if (sum <= 0 || Math.abs(sum - v) < 0.02) return items;
  const factor = v / sum;
  return items.map((i) => ({
    ...i,
    price: Math.round(Number(i.price) * factor * 100) / 100,
    quantity: Number(i.quantity),
  }));
}

/**
 * Fallback line items when only legacy query params exist (ids, qty, value).
 */
export function buildFallbackGa4Items(params: {
  value: number;
  contentIds: string[];
  numItems: number;
}): Ga4PurchaseLineItem[] {
  const { value, contentIds, numItems } = params;
  const v = Number(value);
  const n = Math.max(0, Math.floor(numItems));
  if (!Number.isFinite(v) || v <= 0 || n <= 0) {
    return [];
  }

  if (contentIds.length === 1) {
    return [
      {
        item_id: contentIds[0],
        item_name: "Leira product",
        price: v / n,
        quantity: n,
      },
    ];
  }

  if (contentIds.length > 1) {
    const share = v / contentIds.length;
    return contentIds.map((id) => ({
      item_id: id,
      item_name: "Leira product",
      price: share,
      quantity: 1,
    }));
  }

  return [
    {
      item_id: "leira-order",
      item_name: "Leira order",
      price: v / n,
      quantity: n,
    },
  ];
}
