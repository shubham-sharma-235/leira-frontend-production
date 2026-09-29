const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";

function toAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function buildHreflangAlternates(pathOrUrl: string) {
  const canonical = toAbsoluteUrl(pathOrUrl);

  return {
    canonical,
    languages: {
      "en-US": canonical,
      "en-IN": canonical,
      "en-GB": canonical,
      "x-default": canonical,
    },
  };
}

