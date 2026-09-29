/**
 * Meta Pixel — base code loads directly on the site (PublicOnlyAnalytics).
 *
 * Pixel ID: 2246501689158730
 * Browser events + server CAPI Purchase share the same event_id for dedupe.
 *
 * Avoid a second Meta Pixel PageView tag in GTM on All Pages, or you will double-count.
 */

export const META_PIXEL_ID = "2246501689158730";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type MetaEventParams = Record<string, unknown>;

const FBQ_BRIDGE_ENABLED =
  String(process.env.NEXT_PUBLIC_META_FBQ_BRIDGE ?? "true").toLowerCase() !== "false";

/** Wait until Pixel base code has defined window.fbq */
export function whenFbqReady(run: () => void, timeoutMs = 8000): void {
  if (typeof window === "undefined") return;
  const start = Date.now();
  const poll = () => {
    if (typeof window.fbq === "function") {
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

function pushMetaDataLayer(eventName: string, params?: MetaEventParams) {
  window.dataLayer = window.dataLayer || [];
  const safeParams = params && typeof params === "object" ? { ...params } : {};
  window.dataLayer.push({
    event: `meta_${eventName}`,
    meta_event_name: eventName,
    meta_event_params: safeParams,
    meta_pixel_id: META_PIXEL_ID,
    ...safeParams,
  });
}

function splitEventId(params?: MetaEventParams): {
  eventID?: string;
  custom: MetaEventParams;
} {
  if (!params || typeof params !== "object") return { custom: {} };
  const raw = params.eventID ?? params.event_id;
  const eventID = raw != null && String(raw).trim() ? String(raw).trim() : undefined;
  const custom = { ...params };
  delete custom.eventID;
  delete custom.event_id;
  return { eventID, custom };
}

function fireFbq(eventName: string, params?: MetaEventParams) {
  if (typeof window.fbq !== "function") return;
  try {
    const { eventID, custom } = splitEventId(params);
    const hasCustom = Object.keys(custom).length > 0;
    if (eventID) {
      if (hasCustom) {
        window.fbq("track", eventName, custom, { eventID });
      } else {
        window.fbq("track", eventName, {}, { eventID });
      }
      return;
    }
    if (hasCustom) {
      window.fbq("track", eventName, custom);
      return;
    }
    window.fbq("track", eventName);
  } catch {
    // Never block UX
  }
}

/**
 * Meta standard events → dataLayer + fbq (with optional eventID for CAPI dedupe).
 */
export function trackMetaEvent(eventName: string, params?: MetaEventParams) {
  if (typeof window === "undefined") return;
  const name = String(eventName || "").trim();
  if (!name) return;

  try {
    pushMetaDataLayer(name, params);
  } catch {
    /* ignore */
  }

  if (!FBQ_BRIDGE_ENABLED) return;

  whenFbqReady(() => {
    fireFbq(name, params);
  });
}

/** SPA / soft navigations */
export function trackMetaVirtualPageView(
  pathname: string,
  options?: { fireFbqPageView?: boolean }
) {
  if (typeof window === "undefined") return;
  const path = String(pathname || "").trim() || "/";
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "virtual_page_view",
      page_path: path,
      page_location: window.location.href,
      page_title: typeof document !== "undefined" ? document.title : "",
      meta_pixel_id: META_PIXEL_ID,
    });
  } catch {
    /* ignore */
  }

  if (!FBQ_BRIDGE_ENABLED || options?.fireFbqPageView === false) return;
  whenFbqReady(() => {
    fireFbq("PageView");
  });
}

export function parseInrPrice(value: string | number | undefined | null): number {
  if (value == null || value === "") return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = parseFloat(String(value).replace(/,/g, "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
