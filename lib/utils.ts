import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Parse ₹ / comma style amounts for display logic (not accounting). */
export function parseInrAmount(value: string | undefined | null): number {
    const n = Number(String(value || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
}

/** Return trimmed MRP string only when it is higher than the selling price (for product cards). */
export function strikethroughPriceIfHigher(
    salePrice: string,
    mrp: string | undefined | null
): string | undefined {
    const t = String(mrp || "").trim();
    if (!t) return undefined;
    const sale = parseInrAmount(salePrice);
    const list = parseInrAmount(t);
    if (list <= sale) return undefined;
    return t;
}
