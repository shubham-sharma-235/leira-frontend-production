"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type WidgetSettings = {
  position?: string;
  brandName?: string;
  brandSubtitle?: string;
  brandLogo?: string;
  buttonText?: string;
  chatBtnText?: string;
  onScreenMessage?: string;
  countryCode?: string;
  whatsappNumber?: string;
  preFilledMessage?: string;
  buttonBackgroundColor?: string;
  chatBackgroundColor?: string;
  borderRadius?: string;
  marginbottom?: string;
  marginright?: string;
  marginleft?: string;
  enabledAnimation?: boolean;
};

/** Same as server fallback — widget must work even if config fetch fails (live /api proxy). */
const FALLBACK: WidgetSettings = {
  position: "bottom-right",
  brandName: "Leira",
  brandSubtitle: "Online",
  brandLogo: "",

  buttonText: "",

  chatBtnText: "Start Chat",
  onScreenMessage: "Hi, How can I help you ?",
  countryCode: "+91",
  whatsappNumber: "9599557232",
  preFilledMessage: "Hello Welcome to Leira ",
  buttonBackgroundColor: "#25D366",
  chatBackgroundColor: "#0c9ffa",
  borderRadius: "50",
  marginbottom: "30",
  marginright: "30",
  marginleft: "30",
  enabledAnimation: true,
};

/**
 * Point of Connect / 2Factor WhatsApp chat widget (React).
 * Live: nginx sends /api/* to Express — so we never depend on /api for this.
 * Defaults render immediately; optional refresh from GET /whatsapp-widget (Next).
 */
export function WhatsAppChatWidget() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const [settings, setSettings] = useState<WidgetSettings>(FALLBACK);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        // Not under /api — production nginx proxies /api to backend only
        const res = await fetch("/whatsapp-widget", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as WidgetSettings;
        if (!cancelled && data?.whatsappNumber) setSettings({ ...FALLBACK, ...data });
      } catch {
        /* keep FALLBACK */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("leira-hide-wa-widget", isAdmin);
  }, [isAdmin]);

  if (isAdmin || !settings?.whatsappNumber) {
    return null;
  }

  const isLeft = settings.position === "bottom-left";
  const marginSide = isLeft ? "left" : "right";
  const sidePx = isLeft
    ? `${settings.marginleft || 30}px`
    : `${settings.marginright || 30}px`;
  const bottomPx = `${settings.marginbottom || 30}px`;
  const btnBg = settings.buttonBackgroundColor || "#ff4747";
  const chatBg = settings.chatBackgroundColor || "#0c9ffa";
  const hasText = Boolean(settings.buttonText?.trim());
  const phone = `${String(settings.countryCode || "+91").replace(/\D/g, "")}${String(
    settings.whatsappNumber || "",
  ).replace(/\D/g, "")}`;
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    settings.preFilledMessage || "Hello",
  )}`;

  return (
    <div
      className="leira-wa-widget"
      style={{
        position: "fixed",
        bottom: bottomPx,
        [marginSide]: sidePx,
        zIndex: 999999,
        fontFamily: "inherit",
      }}
    >
      {open && (
        <div
          id="chat-container"
          role="dialog"
          aria-label="WhatsApp chat"
          style={{
            position: "absolute",
            bottom: "64px",
            [marginSide]: 0,
            width: "min(300px, calc(100vw - 40px))",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 10,
              background: chatBg,
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {settings.brandLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.brandLogo}
                  alt=""
                  width={40}
                  height={40}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#fff",
                    padding: 4,
                  }}
                />
              ) : (
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#fff",
                    color: chatBg,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  L
                </span>
              )}
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {settings.brandName || "Leira"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.95 }}>
                  {settings.brandSubtitle || "Online"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 24,
                lineHeight: 1,
                cursor: "pointer",
                width: 30,
                height: 30,
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              padding: 12,
              minHeight: 100,
              background: "linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 100%)",
            }}
          >
            <div
              style={{
                background: "#f9f9f9",
                padding: 14,
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                maxWidth: "85%",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {settings.brandName || "Leira"}
              </div>
              <div style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }}>
                {settings.onScreenMessage || "Hi, How can I help you ?"}
              </div>
            </div>
          </div>
          <div style={{ padding: 12, borderTop: "1px solid #eee", textAlign: "center" }}>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "8px 48px",
                background: chatBg,
                color: "#fff",
                borderRadius: 50,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {settings.chatBtnText || "Start Chat"}
            </a>
          </div>
        </div>
      )}

      <button
        id="custom-widget-button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat on WhatsApp"
        className={settings.enabledAnimation && !open ? "leira-wa-bounce" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          padding: 0,
          background: "#25D366",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16.6,14c-0.2-0.1-1.5-0.7-1.7-0.8c-0.2-0.1-0.4-0.1-0.6,0.1c-0.2,0.2-0.6,0.8-0.8,1c-0.1,0.2-0.3,0.2-0.5,0.1c-0.7-0.3-1.4-0.7-2-1.2c-0.5-0.5-1-1.1-1.4-1.7c-0.1-0.2,0-0.4,0.1-0.5c0.1-0.1,0.2-0.3,0.4-0.4c0.1-0.1,0.2-0.3,0.2-0.4c0.1-0.1,0.1-0.3,0-0.4c-0.1-0.1-0.6-1.3-0.8-1.8C9.4,7.3,9.2,7.3,9,7.3c-0.1,0-0.3,0-0.5,0C8.3,7.3,8,7.5,7.9,7.6C7.3,8.2,7,8.9,7,9.7c0.1,0.9,0.4,1.8,1,2.6c1.1,1.6,2.5,2.9,4.2,3.7c0.5,0.2,0.9,0.4,1.4,0.5c0.5,0.2,1,0.2,1.6,0.1c0.7-0.1,1.3-0.6,1.7-1.2c0.2-0.4,0.2-0.8,0.1-1.2C17,14.2,16.8,14.1,16.6,14 M19.1,4.9C15.2,1,8.9,1,5,4.9c-3.2,3.2-3.8,8.1-1.6,12L2,22l5.3-1.4c1.5,0.8,3.1,1.2,4.7,1.2h0c5.5,0,9.9-4.4,9.9-9.9C22,9.3,20.9,6.8,19.1,4.9 M16.4,18.9c-1.3,0.8-2.8,1.3-4.4,1.3h0c-1.5,0-2.9-0.4-4.2-1.1l-0.3-0.2l-3.1,0.8l0.8-3l-0.2-0.3C2.6,12.4,3.8,7.4,7.7,4.9S16.6,3.7,19,7.5C21.4,11.4,20.3,16.5,16.4,18.9" />
        </svg>
      </button>
    </div>
  );
}
