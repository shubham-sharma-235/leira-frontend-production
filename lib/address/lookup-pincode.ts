import { parsePostalPincodeIndiaResponse } from "./pincode-lookup";

const POSTAL_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (compatible; LeiraIndia/1.0; +https://leiraindia.com)",
} as const;

/** Server-side: India Post pincode API. */
export async function fetchPincodeFromPostalApi(pin: string): Promise<{ state: string; city: string } | null> {
  const clean = String(pin || "").replace(/\D/g, "");
  if (clean.length !== 6) return null;

  const upstream = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
    next: { revalidate: 86400 },
    headers: POSTAL_HEADERS,
  });
  if (!upstream.ok) return null;
  const json: unknown = await upstream.json();
  return parsePostalPincodeIndiaResponse(json);
}

/** Client: `/api/pincode` first, then direct postal API if proxy fails. */
export async function lookupIndianPincode(pin: string): Promise<{ state: string; city: string } | null> {
  const clean = String(pin || "").replace(/\D/g, "");
  if (clean.length !== 6) return null;

  try {
    const res = await fetch(`/api/pincode/${clean}`, { cache: "no-store" });
    const data = (await res.json()) as {
      ok?: boolean;
      state?: string;
      city?: string;
    };
    if (data?.ok && (data.state || data.city)) {
      return { state: String(data.state || ""), city: String(data.city || "") };
    }
  } catch {
    // try direct API below
  }

  if (typeof window === "undefined") return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      headers: POSTAL_HEADERS,
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return parsePostalPincodeIndiaResponse(json);
  } catch {
    return null;
  }
}
