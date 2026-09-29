/**
 * Resolve product/blog/video media paths to a public URL.
 * Prefer CloudFront (`NEXT_PUBLIC_MEDIA_URL`); fall back to backend `/uploads` in dev.
 */

function safeEncodeUrl(value: string): string {
  try {
    return encodeURI(decodeURI(value));
  } catch {
    return encodeURI(value);
  }
}

export function getMediaBaseUrl(): string {
  const media = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, "");
  if (media) return media;
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000"
  );
}

function isUploadPath(normalizedPath: string): boolean {
  return (
    normalizedPath.startsWith("/uploads/") ||
    normalizedPath.startsWith("uploads/") ||
    normalizedPath.startsWith("/api/uploads/") ||
    normalizedPath.startsWith("api/uploads/")
  );
}

function uploadPathToKey(normalizedPath: string): string {
  const withoutApi = normalizedPath.replace(/^\/?api\//, "/");
  const withSlash = withoutApi.startsWith("/") ? withoutApi : `/${withoutApi}`;
  return withSlash.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "");
}

/**
 * Resolve any stored media reference to a browser-loadable URL.
 */
export function resolveMediaUrl(path: string | undefined | null): string {
  if (!path) return "/images/placeholder.png";

  const normalizedPath = String(path).replace(/\\/g, "/").trim();
  if (!normalizedPath) return "/images/placeholder.png";

  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return safeEncodeUrl(normalizedPath);
  }

  if (isUploadPath(normalizedPath)) {
    const key = uploadPathToKey(normalizedPath);
    return safeEncodeUrl(`${getMediaBaseUrl()}/${key}`);
  }

  if (normalizedPath.startsWith("/images/") || normalizedPath.startsWith("images/")) {
    return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}

/** @deprecated use resolveMediaUrl */
export const getImageUrl = resolveMediaUrl;
