import type { NextConfig } from "next";
import { productSlugRedirects } from "./lib/product-slugs";

const isProd = process.env.NODE_ENV === "production";

/** true only when site is meant to be served over HTTPS (domain). IP:3000 HTTP → false */
const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com").trim();
const isHttpsSite = /^https:\/\//i.test(siteUrl);

function mediaRemotePattern(): { protocol: "https"; hostname: string } | null {
  const raw = process.env.NEXT_PUBLIC_MEDIA_URL?.trim();
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    if (!host) return null;
    return { protocol: "https", hostname: host };
  } catch {
    return null;
  }
}

function siteHttpRemotePattern():
  | { protocol: "http"; hostname: string; port?: string }
  | null {
  if (isHttpsSite) return null;
  try {
    const u = new URL(siteUrl);
    if (u.protocol !== "http:") return null;
    return {
      protocol: "http",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
    };
  } catch {
    return null;
  }
}

const mediaPattern = mediaRemotePattern();
const siteHttpPattern = siteHttpRemotePattern();

/**
 * CSP: never send upgrade-insecure-requests / HSTS on bare HTTP IP deploys.
 */
function buildContentSecurityPolicy(): string {
  const localApi =
    " http://localhost:5000 http://127.0.0.1:5000 http://localhost:3000 http://127.0.0.1:3000";
  const directives: string[] = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
    [
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://connect.facebook.net",
      "https://checkout.razorpay.com",
      "https://www.google.com",
      "https://www.gstatic.com",
    ].join(" "),
    ["style-src 'self' 'unsafe-inline'", "https://fonts.googleapis.com"].join(" "),
    [
      "img-src 'self' data: blob: https:",
      isHttpsSite ? "" : "http:",
      isProd ? "" : localApi.trim(),
    ]
      .filter(Boolean)
      .join(" "),
    ["font-src 'self' data:", "https://fonts.gstatic.com"].join(" "),
    [
      "connect-src 'self' https: wss:",
      isHttpsSite ? "" : "http:",
      isProd ? "" : localApi.trim(),
    ]
      .filter(Boolean)
      .join(" "),
    "media-src 'self' https: blob:" + (isHttpsSite ? "" : " http:"),
    "worker-src 'self' blob:",
  ];
  if (isProd && isHttpsSite) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

const securityHeaders: { key: string; value: string }[] = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd && isHttpsSite
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=(self)",
      "picture-in-picture=(self)",
      "publickey-credentials-get=(self)",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return productSlugRedirects().map(({ source, destination }) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  async rewrites() {
    const liveApi =
      process.env.LIVE_API_PROXY_TARGET?.replace(/\/$/, "") ||
      "https://leiraindia.com/api";
    // Proxy when:
    // - local `next dev`, OR
    // - HTTP IP production (SITE_URL is http://...) so browser stays same-origin (no CORS)
    // - or ENABLE_API_PROXY=true
    const forceProxy =
      String(process.env.ENABLE_API_PROXY || "").toLowerCase() === "true";
    const httpIpDeploy = !isHttpsSite;
    if (process.env.NODE_ENV === "production" && !forceProxy && !httpIpDeploy) {
      return [];
    }
    return {
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${liveApi}/:path*`,
        },
      ],
    };
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(mediaPattern ? [mediaPattern] : []),
      ...(siteHttpPattern ? [siteHttpPattern] : []),
      {
        protocol: "https",
        hostname: "leiraindia.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
    ],
  },
};

export default nextConfig;
