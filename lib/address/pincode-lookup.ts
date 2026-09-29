import { INDIAN_STATES_AND_UTS } from "./india-states";

type PostalPostOffice = {
  Name?: string;
  District?: string;
  State?: string;
  Block?: string;
};

type PostalApiBlock = {
  Status?: string;
  Message?: string;
  PostOffice?: PostalPostOffice[] | null;
};

const STATE_ALIASES: Record<string, string> = {
  orissa: "Odisha",
  uttaranchal: "Uttarakhand",
  pondicherry: "Puducherry",
  "pondicherry union territory": "Puducherry",
  "the dadra and nagar haveli and daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "dnh and dd": "Dadra and Nagar Haveli and Daman and Diu",
  "nct of delhi": "Delhi",
  "new delhi": "Delhi",
  "j&k": "Jammu and Kashmir",
  "jammu & kashmir": "Jammu and Kashmir",
};

function normalizeStateKey(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchIndianStateName(apiState: string): string {
  const raw = String(apiState || "").trim();
  if (!raw) return "";
  const key = normalizeStateKey(raw);
  const alias = STATE_ALIASES[key];
  if (alias) return alias;
  const exact = INDIAN_STATES_AND_UTS.find((s) => normalizeStateKey(s) === key);
  if (exact) return exact;
  if (key.includes("delhi")) return "Delhi";
  const fuzzy = INDIAN_STATES_AND_UTS.find(
    (s) => key.includes(normalizeStateKey(s)) || normalizeStateKey(s).includes(key)
  );
  if (fuzzy) return fuzzy;
  return raw;
}

/** Parses https://api.postalpincode.in/pincode/{pin} JSON shape. */
export function parsePostalPincodeIndiaResponse(json: unknown): { state: string; city: string } | null {
  if (!Array.isArray(json) || !json[0]) return null;
  const block = json[0] as PostalApiBlock;
  if (block.Status !== "Success" || !Array.isArray(block.PostOffice) || block.PostOffice.length === 0) {
    return null;
  }
  const po = block.PostOffice[0];
  const apiState = String(po.State || "").trim();
  const city = String(po.District || po.Block || po.Name || "").trim();
  const state = matchIndianStateName(apiState);
  if (!city && !state) return null;
  return { state: state || apiState, city };
}
