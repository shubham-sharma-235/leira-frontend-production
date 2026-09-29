"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/google";
import { META_PIXEL_ID, trackMetaVirtualPageView } from "@/lib/analytics/metaPixel";

/**
 * Public analytics only (skips /admin).
 * - GA4 gtag loader
 * - Meta Pixel base script (direct — same as before GTM-only experiment)
 * - SPA route changes → extra PageView via fbq + dataLayer
 */
export function PublicOnlyAnalytics() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const isFirstPath = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] =
      isAdmin;
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !pathname) return;
    // First paint: base Pixel script already fires PageView — avoid double fire.
    if (isFirstPath.current) {
      isFirstPath.current = false;
      trackMetaVirtualPageView(pathname, { fireFbqPageView: false });
      return;
    }
    trackMetaVirtualPageView(pathname, { fireFbqPageView: true });
  }, [pathname, isAdmin]);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        id="ga4-init"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
        }}
      />
      <script
        id="meta-pixel"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
