import { NextResponse } from "next/server";

const WIDGET_ID =
  process.env.NEXT_PUBLIC_WHATSAPP_WIDGET_ID ||
  "53c2805b-299d-4cd6-972f-8cf35bfd6824";

const SETTINGS_URL = `https://wa-widget.pointofconnect.com/api/widgets/${WIDGET_ID}`;

/** Fallback if Point of Connect API is unreachable (client dashboard values). */
export const WHATSAPP_WIDGET_FALLBACK = {
  position: "bottom-right",
  brandName: "Leira",
  brandSubtitle: "Online",
  brandLogo: "",
  buttonText: "Chat with us",
  chatBtnText: "Start Chat",
  onScreenMessage: "Hi, How can I help you ?",
  countryCode: "+91",
  whatsappNumber: "9599557232",
  preFilledMessage: "Hello Welcome to Leira ",
  buttonBackgroundColor: "#ff4747",
  chatBackgroundColor: "#0c9ffa",
  borderRadius: "50",
  marginbottom: "30",
  marginright: "30",
  marginleft: "30",
  enabledAnimation: true,
  disableMobileWidget: false,
  partnerLogo: "",
};

/**
 * NOTE: Do NOT put this under /api/* — production nginx proxies /api to Express backend.
 * Path: GET /whatsapp-widget
 */
export async function GET() {
  try {
    const res = await fetch(SETTINGS_URL, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json({ ...WHATSAPP_WIDGET_FALLBACK, source: "fallback" });
    }
    const data = await res.json();
    return NextResponse.json({
      ...WHATSAPP_WIDGET_FALLBACK,
      ...data,
      disableMobileWidget: false,
      source: "live",
    });
  } catch {
    return NextResponse.json({ ...WHATSAPP_WIDGET_FALLBACK, source: "fallback" });
  }
}
