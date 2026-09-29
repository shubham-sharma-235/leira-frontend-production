/** GA4 Measurement ID — keep in sync with `PublicOnlyAnalytics`. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-YGPKK0XCL5";

export type Ga4PurchaseLineItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};
