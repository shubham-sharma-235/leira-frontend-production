import {
  buildFallbackGa4Items,
  decodeGa4ItemsFromUrlParam,
} from "@/lib/analytics/ga4";
import { parseInrPrice } from "@/lib/analytics/metaPixel";
import type { Ga4PurchaseLineItem } from "@/lib/analytics/google";
import ThankYouContent from "./ThankYouContent";

type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

export default function ThankYouPage({ searchParams }: { searchParams: SearchParams }) {
  const firstParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  // Optional: backend/local order id for fetching full details (best for GA4 accuracy).
  const orderId = String(
    firstParam(searchParams.orderId) ||
      firstParam(searchParams.order_id) ||
      firstParam(searchParams.localOrderId) ||
      firstParam(searchParams.local_order_id) ||
      ""
  ).trim();

  const orderNumber = String(firstParam(searchParams.order) || "").trim();
  const value = parseInrPrice(firstParam(searchParams.value));
  const rawIds = String(firstParam(searchParams.ids) || "").trim();
  const contentIds = rawIds ? rawIds.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const numItems = Math.max(0, parseInt(String(firstParam(searchParams.qty) || "0"), 10) || 0);

  const ga4Raw = firstParam(searchParams.ga4_items);
  const decodedGa4 =
    typeof ga4Raw === "string" && ga4Raw.trim().length > 0
      ? decodeGa4ItemsFromUrlParam(ga4Raw)
      : null;
  const fallbackGa4 = buildFallbackGa4Items({ value, contentIds, numItems });
  const ga4Items: Ga4PurchaseLineItem[] =
    decodedGa4 && decodedGa4.length > 0 ? decodedGa4 : fallbackGa4;

  return (
    <ThankYouContent
      orderId={orderId || undefined}
      orderNumber={orderNumber || undefined}
      value={value}
      contentIds={contentIds}
      numItems={numItems}
      ga4Items={ga4Items}
    />
  );
}

