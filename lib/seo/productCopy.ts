export type ProductSeoCopy = {
  title?: string;
  metaDescription?: string;
  /** PDP body; omit to use product.description from admin. */
  longDescription?: string;
  /** Keyword-rich benefit H2 for PDP (client SEO). */
  benefitH2?: string;
};

const PRODUCT_COPY_BY_KEY: Record<string, ProductSeoCopy> = {
  "damask-rose": {
    title: "Leira Damask Rose | Intimate Perfume for Sensitive Area | 15ml",
    benefitH2: "Why Women Love Leira Damask Rose Intimate Perfume",
    metaDescription:
      "Leira Damask Rose — a sophisticated floral intimate perfume crafted for your sensitive area. Alcohol-free, pH-friendly, long-lasting freshness. Natural feminine care for women in India. ₹2,399.",
    longDescription:
      "Leira Damask Rose is a luxury intimate perfume for women crafted with essential oils for refined intimate care. This natural intimate perfume blends rich Damask Rose with creamy floral undertones, creating a soft yet confident scent that enhances your natural aroma.\n\nFormulated as a long-lasting intimate perfume, its concentrated oil-based composition gently melts into the skin, delivering elegance without overpowering.\n\n100% organic, alcohol-free, pH-friendly, and designed for delicate external intimate areas, this safe intimate perfume for women supports daily freshness and sensual wellness.\n\nPresented in a 15ml premium glass bottle with precision dropper for controlled, hygienic application.\n\nLuxury. Confidence. Intimate Care - Redefined.",
  },
  jasmine: {
    title: "Leira Jasmine | Natural Intimate Perfume for Bikini Area | 15ml",
    benefitH2: "Why Women Love Leira Jasmine Intimate Perfume",
    metaDescription:
      "Leira Jasmine — a light, romantic essential oil intimate perfume for your bikini area. 100% organic, alcohol-free, pH balanced. Daily-use feminine perfume for women in India. ₹2,399.",
    longDescription:
      "Leira Jasmine is a luxury intimate perfume for women in India crafted with pure jasmine essential oil for a light, fresh, and romantic floral experience. Softly sweet and elegant, it enhances your natural aroma with subtle sophistication.\n\nDesigned as a daily use inner perfume for women, this long-lasting intimate perfume delivers gentle freshness without overpowering.\n\nFormulated as an alcohol-free intimate perfume with 100% organic ingredients. It is pH-friendly and suitable for delicate external intimate areas, making it a safe and natural intimate perfume choice for modern women.\n\nEdible, Kiss-friendly and created to support sensual wellness and intimate confidence.\n\nPresented in a 15ml premium glass bottle with precision dropper for hygienic, controlled application.\n\nSoft. Elegant. Naturally Confident.",
  },
  "ylang-ylang": {
    title: "Leira Ylang Ylang | Intimate Perfume for Private Area | 15ml",
    benefitH2: "Why Women Love Leira Ylang Ylang Intimate Perfume",
    metaDescription:
      "Leira Ylang Ylang — a bold, exotic essential oil perfume for your private area. Kiss-friendly, alcohol-free, and pH-balanced for all-day intimate confidence. Shop now. ₹2,399.",
    longDescription:
      "Leira Ylang Ylang is a bold and exotic luxury intimate area perfume for women in India, crafted with rich ylang ylang essential oil and warm floral undertones. Deep, sensual, and confident, it enhances your natural scent with an intense yet refined signature.\n\nFormulated as a concentrated essential oil based inner perfume for women, this long-lasting intimate perfume blends smoothly with your skin for elegant, close-to-body fragrance performance.\n\nThis alcohol-free intimate perfume is pH-friendly and designed for delicate external intimate areas, making it a safe and natural intimate perfume choice for women who prioritize purity and comfort.\n\nEdible, Kiss-friendly and created to complement romantic intimacy and sensual wellness.\n\nPresented in a 15ml premium glass bottle with precision dropper for controlled, hygienic application.\n\nBold. Sensual. Unapologetically Confident.",
  },
  "purity-romance-duo-jasmine-damask-rose": {
    title: "Leira Jasmine & Damask Rose | Intimate Perfume Duo for Bikini Area & Sensitive Area | 40% Off",
    metaDescription:
      "Leira Jasmine & Damask Rose duo — essential oil intimate perfumes for your bikini area and sensitive area. Beat Indian summer heat with alcohol-free, pH-balanced freshness. Save ₹2,399. Now ₹3,599.",
  },
  "purity-bliss-duo-jasmine-ylang-ylang": {
    title: "Leira Jasmine & Ylang Ylang | Intimate Perfume Duo for Bikini Area & Private Area | 40% Off",
    metaDescription:
      "Leira Jasmine & Ylang Ylang duo — fresh meets sensual. Essential oil intimate perfumes for your bikini area and private area. Alcohol-free, pH-balanced, 100% organic. Save ₹2,399. Now ₹3,599.",
  },
  "romance-bliss-duo-damask-rose-ylang-ylang": {
    title: "Leira Damask Rose & Ylang Ylang | Intimate Perfume Duo for Sensitive Area & Private Area | 40% Off",
    metaDescription:
      "Leira Damask Rose & Ylang Ylang duo — luxury floral intimate perfumes for your sensitive area and private area. Soothing, long-lasting, alcohol-free. Save ₹2,399. Now ₹3,599.",
  },
  "complete-collection-all-3-variants": {
    title: "The Complete Leira Collection | Intimate Perfume Trio — Bikini Area, Sensitive Area & Private Area | 45% Off",
    metaDescription:
      "All 3 Leira intimate perfumes in one set — Jasmine, Damask Rose & Ylang Ylang. India's best value intimate perfume collection. 100% organic, alcohol-free, pH-balanced. Save ₹4,048. Now ₹4,949.",
  },
};

const KEY_ALIASES: Record<string, string> = {
  "jasmine-inner-perfume-for-women": "jasmine",
  jasmine: "jasmine",
  "ylang-ylang": "ylang-ylang",
  ylang: "ylang-ylang",
  "ylang ylang": "ylang-ylang",
  "damask-rose": "damask-rose",
  damask: "damask-rose",
  "damask rose": "damask-rose",
  "the-purity-romance-duo-jasmine-damask-rose": "purity-romance-duo-jasmine-damask-rose",
  "purity-romance-duo-jasmine-damask-rose": "purity-romance-duo-jasmine-damask-rose",
  "purity-romance-duo": "purity-romance-duo-jasmine-damask-rose",
  "the-purity-bliss-duo-jasmine-ylang-ylang": "purity-bliss-duo-jasmine-ylang-ylang",
  "purity-bliss-duo-jasmine-ylang-ylang": "purity-bliss-duo-jasmine-ylang-ylang",
  "purity-bliss-duo": "purity-bliss-duo-jasmine-ylang-ylang",
  "the-romance-bliss-duo-damask-rose-ylang-ylang": "romance-bliss-duo-damask-rose-ylang-ylang",
  "romance-bliss-duo-damask-rose-ylang-ylang": "romance-bliss-duo-damask-rose-ylang-ylang",
  "romance-bliss-duo": "romance-bliss-duo-damask-rose-ylang-ylang",
  "the-complete-leira-collection-all-3-variants": "complete-collection-all-3-variants",
  "complete-leira-collection-all-3-variants": "complete-collection-all-3-variants",
  "complete-collection-all-3-variants": "complete-collection-all-3-variants",
  "complete-collection": "complete-collection-all-3-variants",
};

/** Duos / collection: italic PDP hero line is admin-only (`detailTagline`); no auto "Why Women Love…". */
const NO_AUTO_BENEFIT_HERO_KEYS = new Set([
  "purity-romance-duo-jasmine-damask-rose",
  "purity-bliss-duo-jasmine-ylang-ylang",
  "romance-bliss-duo-damask-rose-ylang-ylang",
  "complete-collection-all-3-variants",
]);

const toKey = (value: string) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export function resolveProductSeoCopy(...candidates: Array<string | undefined | null>): ProductSeoCopy | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = toKey(candidate);
    const canonicalKey = KEY_ALIASES[normalized] || normalized;
    if (PRODUCT_COPY_BY_KEY[canonicalKey]) return PRODUCT_COPY_BY_KEY[canonicalKey];
  }
  return null;
}

/** Benefit-focused H2 for PDPs; flagship slugs use copy from PRODUCT_COPY_BY_KEY. */
export function resolveProductBenefitH2(
  productName: string,
  ...candidates: Array<string | undefined | null>
): string {
  const seo = resolveProductSeoCopy(...candidates);
  if (seo?.benefitH2) return seo.benefitH2;
  const raw = String(productName || "").trim();
  if (!raw) return "Why Women Love Leira Intimate Perfume";
  const withLeira = /^leira\b/i.test(raw) ? raw : `Leira ${raw}`;
  if (/\bintimate\s+perfume\b/i.test(withLeira)) {
    return `Why Women Love ${withLeira}`;
  }
  return `Why Women Love ${withLeira} Intimate Perfume`;
}

/** Italic line under PDP title: admin `detailTagline` first, then optional `benefitH2` in PRODUCT_COPY_BY_KEY, else auto (except gift bundles). */
export function resolvePdpHeroLine(
  productName: string,
  adminDetailTagline: string | undefined | null,
  ...candidates: Array<string | undefined | null>
): string {
  const admin = String(adminDetailTagline ?? "").trim();
  if (admin) return admin;
  const seo = resolveProductSeoCopy(...candidates);
  if (seo?.benefitH2) return seo.benefitH2;
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = toKey(candidate);
    const canonicalKey = KEY_ALIASES[normalized] || normalized;
    if (NO_AUTO_BENEFIT_HERO_KEYS.has(canonicalKey)) return "";
  }
  return resolveProductBenefitH2(productName, ...candidates);
}
