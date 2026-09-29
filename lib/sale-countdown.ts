/** Height (px) of the fixed sale strip — keep in sync with `SaleCountdownStrip` layout. */
export const SALE_COUNTDOWN_STRIP_HEIGHT_PX = 56;

/** Used when `NEXT_PUBLIC_SALE_END_AT` is missing — 15 calendar days from “now”, end of that day (local). */
export function getDefaultSaleEnd(days: number = 15): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, Math.floor(days)));
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getSaleEndDate(): Date {
  const raw = process.env.NEXT_PUBLIC_SALE_END_AT;
  if (raw) {
    const t = new Date(raw);
    if (!Number.isNaN(t.getTime())) return t;
  }
  return getDefaultSaleEnd();
}

export function isSaleCountdownEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_SALE_COUNTDOWN;
  if (v === "0" || v === "false") return false;
  return true;
}

export function shouldShowSaleBarNow(): boolean {
  if (!isSaleCountdownEnabled()) return false;
  return getSaleEndDate().getTime() > Date.now();
}

export function saleCountdownTitle(): string {
  return (
    process.env.NEXT_PUBLIC_SALE_COUNTDOWN_TITLE?.trim() ||
    "ANNIVERSARY SALE ENDS IN"
  );
}
