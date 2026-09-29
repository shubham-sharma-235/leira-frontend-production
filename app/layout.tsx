import type { CSSProperties } from "react";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PublicOnlyAnalytics } from "@/components/analytics/public-only-analytics";
import { WhatsAppChatWidget } from "@/components/whatsapp-chat-widget";

// Lighthouse/audit may flag woff2 preload hints; disable font preloading explicitly.
const outfit = Outfit({ subsets: ["latin"], preload: false });

import { ToastProvider } from "@/components/ui/toast";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LoginDiscountPopup } from "@/components/ui/login-discount-popup";
import { CartCheckoutDrawer } from "@/components/ui/cart-checkout-drawer";
import { SaleCountdownStrip } from "@/components/ui/sale-countdown-strip";
import {
  SALE_COUNTDOWN_STRIP_HEIGHT_PX,
  shouldShowSaleBarNow,
} from "@/lib/sale-countdown";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Leira",
  description: "Discover the essence of luxury with Leira's exquisite perfume collection. Handcrafted fragrances that tell a story.",
  keywords: [
    "Leira",
    "intimate perfume for women",
    "luxury feminine perfume",
    "essential oil intimate perfume",
    "women's intimate care",
  ],
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  other: {
    "p:domain_verify": "52b9783f85505572b6cbfcdc20b06084",
  },
};

export const viewport: Viewport = {
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="p:domain_verify" content="52b9783f85505572b6cbfcdc20b06084" />
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WPP4J9CK');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body
        className={outfit.className}
        suppressHydrationWarning
        style={
          {
            ["--leira-sale-bar-h" as string]: shouldShowSaleBarNow()
              ? `${SALE_COUNTDOWN_STRIP_HEIGHT_PX}px`
              : "0px",
          } as CSSProperties
        }
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WPP4J9CK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Suspense fallback={null}>
          <PublicOnlyAnalytics />
          <WhatsAppChatWidget />
        </Suspense>
        <ToastProvider>
          <CartProvider>
          <WishlistProvider>
            <SaleCountdownStrip />
            <div
              aria-hidden
              style={{
                height:
                  "calc(var(--leira-sale-bar-h, 0px) + var(--leira-mini-nav-h, 0px) + var(--leira-nav-below-gap, 0.5rem))",
              }}
            />
            {children}
            <LoginDiscountPopup />
            <CartCheckoutDrawer />
          </WishlistProvider>
        </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
