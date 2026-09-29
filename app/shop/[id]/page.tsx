"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    ShoppingBag,
    Minus,
    Plus,
    Star,
    ChevronDown,
    Leaf,
    Droplet,
    Scale,
    Stethoscope,
    Sparkles,
    Package,
    Timer,
    ShieldCheck,
    Copy,
    Check,
    Share2,
    Flower2,
    Sun,
    Moon,
    Tag,
    Truck,
    RotateCcw,
} from "lucide-react";

import { resolveMediaUrl } from "@/lib/mediaUrl";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { useProduct } from "@/hooks/useProduct";
import { useProducts } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useProductReviews";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/toast";
import { reviewAPI } from "@/lib/api";
import { cn, strikethroughPriceIfHigher } from "@/lib/utils";
import { resolvePdpHeroLine, resolveProductSeoCopy } from "@/lib/seo/productCopy";
import { parseInrPrice, trackMetaEvent } from "@/lib/analytics/metaPixel";
import { trackViewItem } from "@/lib/analytics/ecommerce";
import { isRecommendableProduct } from "@/lib/product-filters";
import { getFlagshipSiblingsExcluding } from "@/lib/shop-flagship-discovery";
import { pickShopCardPath } from "@/lib/product-card-images";
import { getImageUrl } from "@/lib/imageUtils";
import { canonicalProductSlug, getProductShopPath } from "@/lib/product-slugs";

const INK = "text-[#7a2c4e]";
const BODY = "text-[#6b5560]";
const HAIR = "border-[#7a2c4e]/[0.12]";
const EASE = [0.22, 1, 0.36, 1] as const;

/* Canonical blush gradient — used for every "light" section below the
   hero so the whole page shares one consistent background rhythm
   instead of several slightly different gradients pointing different
   directions. */
const BLUSH = "bg-gradient-to-b from-[#fdf1f5] via-[#fff7fa] to-[#fffdfc]";

const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

function Grain({ opacity = 0.03 }: { opacity?: number }) {
    return <span aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: GRAIN, opacity }} />;
}

function Mark({ className = "" }: { className?: string }) {
    return <span aria-hidden className={cn("inline-block h-1.5 w-1.5 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#ec4899]", className)} />;
}

function useStickyTopOffset(shown = 96, hidden = 16) {
    const [top, setTop] = useState(shown);
    useEffect(() => {
        let lastY = typeof window !== "undefined" ? window.scrollY : 0;
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const y = window.scrollY;
                const goingDown = y > lastY;
                if (y < 8) setTop(shown);
                else if (goingDown && y > shown) setTop(hidden);
                else if (!goingDown) setTop(shown);
                lastY = y;
                raf = 0;
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [shown, hidden]);
    return top;
}

function useReveal<T extends HTMLElement>() {
    const ref = React.useRef<T | null>(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let reduced = false;
        try {
            reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        } catch {
            reduced = false;
        }
        if (reduced || typeof IntersectionObserver === "undefined") {
            setShown(true);
            return;
        }
        let io: IntersectionObserver | null = null;
        try {
            io = new IntersectionObserver(
                (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io?.disconnect(); } }),
                { threshold: 0.15 }
            );
            io.observe(el);
        } catch {
            setShown(true);
            return;
        }
        const bail = window.setTimeout(() => setShown(true), 1400);
        return () => { io?.disconnect(); window.clearTimeout(bail); };
    }, []);
    return { ref, shown };
}

function Reveal({ children, delay = 0, className = "", style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
    const { ref, shown } = useReveal<HTMLDivElement>();
    return (
        <div
            ref={ref}
            className={cn("transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]", className)}
            style={{
                ...style,
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(28px) scale(0.97)",
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

function SafeImg({ src, alt, label, className }: { src: string; alt: string; label?: string; className?: string }) {
    const [broken, setBroken] = useState(false);
    if (!src || broken) {
        return (
            <div className={cn("flex items-center justify-center bg-[#f7e6ee]", className)}>
                <span className="font-serif text-[26px] font-light italic text-[#7a2c4e]/25">
                    {(label || alt || "L").trim().charAt(0).toUpperCase()}
                </span>
            </div>
        );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setBroken(true)} />;
}

const renderFormattedDescription = (value: string) => {
    const parts = String(value || "").split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
            <strong key={index} className="font-medium text-[#ec4899]">{part.slice(2, -2)}</strong>
        ) : (
            part
        )
    );
};

function isLoggedInCustomer(): boolean {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
        const raw = localStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        return !!user && user.role !== "admin";
    } catch {
        return false;
    }
}

/**
 * Normalises both internal and absolute Leira product URLs to their pathname.
 * This lets the "Explore more" cards match discovery links such as
 * "/shop/ylang-ylang" and "https://leiraindia.com/shop/jasmine" back to
 * the real product objects returned by useProducts().
 */
function normalizeShopHref(href: string): string {
    const value = String(href || "").trim();
    if (!value) return "";

    try {
        const url = new URL(value, "https://leiraindia.com");
        const pathname = url.pathname.replace(/\/+$/, "");
        return pathname || "/";
    } catch {
        const pathname = value.split(/[?#]/)[0].replace(/\/+$/, "");
        return pathname || "/";
    }
}

const USPS = [
    { label: "Alcohol-free", icon: Droplet, tint: "#ec4899" },
    { label: "pH-balanced", icon: Scale, tint: "#ec4899" },
    { label: "Dermatologist tested", icon: Stethoscope, tint: "#b23a63" },
    { label: "100% natural oils", icon: Leaf, tint: "#7a9b5c" },
];

const SPECS = [
    { icon: Package, label: "Volume", value: "15 ml" },
    { icon: Droplet, label: "Format", value: "Precision dropper" },
    { icon: ShieldCheck, label: "Skin type", value: "All, incl. sensitive" },
    { icon: Timer, label: "Usage", value: "1–2 drops daily" },
    { icon: Scale, label: "pH", value: "Balanced" },
    { icon: Sparkles, label: "Alcohol", value: "None" },
];

const INGREDIENTS = [
    { name: "Damask Rose", tint: "#b23a63", note: "Anti-inflammatory, softening, deeply hydrating." },
    { name: "Jasmine", tint: "#ec4899", note: "Calming, antibacterial, naturally uplifting." },
    { name: "Ylang Ylang", tint: "#ec4899", note: "Balancing, antioxidant-rich, quietly grounding." },
];

const NOTES = [
    { tier: "Top note", icon: Sun, tint: "#ec4899", body: "The first impression — light and immediate, fading within minutes." },
    { tier: "Heart note", icon: Flower2, tint: "#ec4899", body: "The scent's true character, emerging as the top note settles." },
    { tier: "Base note", icon: Moon, tint: "#7a2c4e", body: "The lasting trace that stays close to skin through the day." },
];

const FAQS = [
    { q: "Is this safe for daily use?", a: "Yes. Leira is dermatologically tested and pH-balanced for daily use on the external intimate area." },
    { q: "Can I use it after shaving or waxing?", a: "Wait 24 hours after shaving or waxing before applying, to avoid irritation on freshly exposed skin." },
    { q: "How long does one bottle last?", a: "With one or two drops per use, a bottle typically lasts 6–8 weeks." },
    { q: "Is it safe during pregnancy?", a: "As with any intimate care product, check with your doctor before use during pregnancy." },
];

const BENEFITS = [
    { title: "Natural essence", description: "100% natural, skin-friendly essential oils.", icon: Leaf, tint: "#7a9b5c" },
    { title: "External use only", description: "Made exclusively for the outer intimate area.", icon: ShieldCheck, tint: "#b23a63" },
    { title: "pH-balanced", description: "Works with your skin's natural balance.", icon: Scale, tint: "#ec4899" },
    { title: "Dermatologist tested", description: "Verified gentle for daily intimate use.", icon: Stethoscope, tint: "#ec4899" },
];

/* ------------------------------------------------------------------
   HOW TO USE — the horizontal step-flow built earlier, inlined here
   (rather than imported from a separate file whose path in your repo
   I can't verify) so the accordion below can render it directly in
   place of the old static infographic image.
------------------------------------------------------------------- */
type UsageStep = { n: string; title: string; copy: string; img: string };

const USAGE_STEPS: UsageStep[] = [
     {
    n: "01",
    title: "Cleanse",
    copy: "After bathing, pat your vulva, bikini area, and sensitive intimate skin completely dry.",
    img: "/images/how-to-use-s1-b.png",
  },
  {
    n: "02",
    title: "Apply",
    copy: "Apply 2–3 drops from the precision dropper to your external vulva, bikini line, or inner thighs. For external intimate use only — never internal.",
    img: "/images/how-to-use-s2.png",
  },
  {
    n: "03",
    title: "Absorb",
    copy: "Massage gently into your intimate area or private area. Allow the pure essential oil to absorb naturally. Do not rinse.",
    img: "/images/how-to-use-s3.JPG",
  },
  {
    n: "04",
    title: "Refresh",
    copy: "Reapply throughout the day for lasting freshness in your private area and sensitive skin.",
    img: "/images/how-to-use-s4.jpeg",
  },
];

function useRevealOnce<T extends HTMLElement>() {
    const ref = React.useRef<T | null>(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let reduced = false;
        try {
            reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        } catch {
            reduced = false;
        }
        if (reduced || typeof IntersectionObserver === "undefined") {
            setShown(true);
            return;
        }
        let io: IntersectionObserver | null = null;
        try {
            io = new IntersectionObserver(
                (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io?.disconnect(); } }),
                { threshold: 0.15 }
            );
            io.observe(el);
        } catch {
            setShown(true);
            return;
        }
        const bail = window.setTimeout(() => setShown(true), 1200);
        return () => { io?.disconnect(); window.clearTimeout(bail); };
    }, []);
    return { ref, shown };
}

function HowToUseSteps() {
    const { ref, shown } = useRevealOnce<HTMLDivElement>();
    return (
        <div ref={ref} className="relative">
            <span
                aria-hidden
                className="pointer-events-none absolute left-[12%] right-[12%] top-9 hidden h-px bg-gradient-to-r from-[#ec4899]/40 via-[#ec4899]/60 to-[#ec4899]/40 md:block"
            />
            <ol className="grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-0">
                {USAGE_STEPS.map((step, i) => (
                    <li
                        key={step.n}
                        className="relative flex gap-4 text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex-col md:items-center md:gap-0 md:text-center"
                        style={{
                            opacity: shown ? 1 : 0,
                            transform: shown ? "none" : "translateY(16px)",
                            transitionDelay: shown ? `${i * 100}ms` : "0ms",
                        }}
                    >
                        <div className="relative shrink-0 md:mx-auto">
                            <div className="relative h-[60px] w-[60px] overflow-hidden rounded-full border-4 border-[#fffdfc] shadow-[0_12px_24px_-12px_rgba(122,44,78,0.5)]">
                                <SafeImg src={step.img} alt="" label={step.title} className="h-full w-full object-cover" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ec4899] font-serif text-[10px] font-light text-white shadow-sm">
                                {i + 1}
                            </span>
                        </div>

                        {i < USAGE_STEPS.length - 1 && (
                            <span
                                aria-hidden
                                className="absolute left-[30px] top-[60px] block h-9 w-px bg-gradient-to-b from-[#ec4899]/50 to-transparent md:hidden"
                            />
                        )}

                        <div className="pt-0.5 md:pt-4">
                            <span className="hidden text-[10px] font-light uppercase tracking-[0.18em] text-[#ec4899] md:block">
                                Step {step.n}
                            </span>
                            <h4 className={cn("font-serif text-[15.5px] font-light leading-tight md:mt-1.5", INK)}>
                                {step.title}
                            </h4>
                            <p className={cn("mt-1 max-w-[28ch] text-[12.5px] font-light leading-[1.6] md:mx-auto", BODY)}>
                                {step.copy}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

const ALL_COMBOS = {
    "jasmine-damask-rose": { label: "Jasmine × Damask Rose", href: "/shop/jasmine-damask-rose-duo", scents: ["jasmine", "damask rose"] },
    "damask-rose-ylang-ylang": { label: "Damask Rose × Ylang Ylang", href: "/shop/damask-rose-ylang-ylang-duo", scents: ["damask rose", "ylang ylang"] },
    "jasmine-ylang-ylang": { label: "Jasmine × Ylang Ylang", href: "/shop/jasmine-ylang-ylang-duo", scents: ["jasmine", "ylang ylang"] },
};
const DUO_PRICE = "₹3,599";
const DUO_ORIGINAL = "₹5,998";
const TRIO_PRICE = "₹4,949";
const TRIO_ORIGINAL = "₹8,997";
const TRIO_HREF = "/shop/complete-trio-full-mother-s-day-description";

function relevantDuos(productName: string) {
    const n = productName.toLowerCase();
    return Object.values(ALL_COMBOS).filter((c) => c.scents.some((s) => n.includes(s)));
}

/* ------------------------------------------------------------------
   DELIVERY ESTIMATOR — a real pincode input, not decorative. There's
   no live carrier API wired in, so this resolves to a state using
   India Post's published PIN prefix ranges (the first 2–3 digits),
   which is what actually identifies a single state — the first digit
   alone only identifies a broad zone spanning several states, which
   was the mistake in an earlier version of this.

   Covers all 28 states and all 8 union territories. A handful of
   borders (UP/Uttarakhand, Bihar/Jharkhand — both carved from a
   single state whose PIN ranges were never fully renumbered) don't
   split cleanly on digits alone; those are called out below. Any
   prefix that isn't a real assigned Indian PIN range returns null,
   which the component below surfaces as an actual validation error
   rather than a fake fallback estimate. */
function resolveStateFromPin(pin: string): string | null {
    const full = parseInt(pin, 10);
    const p3 = parseInt(pin.slice(0, 3), 10);
    const p2 = Math.floor(p3 / 10);

    if (p2 === 11) return "Delhi";
    if (p3 === 160) return "Chandigarh"; // carved out of Punjab's range
    if (p2 >= 12 && p2 <= 13) return "Haryana";
    if (p2 >= 14 && p2 <= 16) return "Punjab";
    if (p2 === 17) return "Himachal Pradesh";
    if (p3 === 194) return "Ladakh"; // carved out of J&K's range (separate UT since 2019)
    if (p2 >= 18 && p2 <= 19) return "Jammu & Kashmir";
    // Uttarakhand's range (244–263) overlaps Uttar Pradesh's (201–285) —
    // both were one state until 2000, and PIN codes were never fully
    // re-split. This narrower band catches the common Uttarakhand
    // prefixes; everything else in 20x–28x defaults to UP.
    if (p3 >= 244 && p3 <= 263) return "Uttarakhand";
    if (p2 >= 20 && p2 <= 28) return "Uttar Pradesh";
    if (p2 >= 30 && p2 <= 34) return "Rajasthan";
    if (p3 === 403) return "Goa"; // sits inside Maharashtra's 40x range
    if (p3 === 396) return "Dadra & Nagar Haveli and Daman & Diu"; // sits inside Gujarat's 39x range
    if (p2 >= 40 && p2 <= 44) return "Maharashtra";
    if (p2 >= 36 && p2 <= 39) return "Gujarat";
    if (p2 >= 45 && p2 <= 48) return "Madhya Pradesh";
    if (p2 === 49) return "Chhattisgarh";
    if (p2 === 50) return "Telangana";
    if (p2 >= 51 && p2 <= 53) return "Andhra Pradesh";
    if (p2 >= 56 && p2 <= 59) return "Karnataka";
    if (p3 === 605 || p3 === 609) return "Puducherry"; // enclaves inside Tamil Nadu's range
    if (p2 >= 60 && p2 <= 64) return "Tamil Nadu";
    // Lakshadweep's actual range (682551–682559) sits inside Kochi's own
    // 682xxx postal area, so this needs a full 6-digit check rather than
    // a 3-digit prefix — the two are only distinguishable at that level.
    if (full >= 682551 && full <= 682559) return "Lakshadweep";
    if (p2 >= 67 && p2 <= 69) return "Kerala";
    if (p3 === 737) return "Sikkim"; // carved out of West Bengal's range
    if (p3 === 744) return "Andaman & Nicobar Islands"; // carved out of West Bengal's range
    if (p2 >= 70 && p2 <= 74) return "West Bengal";
    if (p2 >= 75 && p2 <= 77) return "Odisha";
    if (p2 === 78) return "Assam";
    if (p3 >= 790 && p3 <= 792) return "Arunachal Pradesh";
    if (p3 >= 793 && p3 <= 794) return "Meghalaya";
    if (p3 === 795) return "Manipur";
    if (p3 === 796) return "Mizoram";
    if (p3 >= 797 && p3 <= 798) return "Nagaland";
    if (p3 === 799) return "Tripura";
    // Jharkhand's range (813–835) overlaps Bihar's (800–855) for the
    // same reason as UP/Uttarakhand — carved from Bihar in 2000.
    if (p3 >= 813 && p3 <= 835) return "Jharkhand";
    if (p2 >= 80 && p2 <= 85) return "Bihar";
    return null; // no real Indian PIN range starts with this prefix
}

const STATE_DELIVERY_DAYS: Record<string, string> = {
    "Delhi": "1–2 business days",
    "Chandigarh": "1–2 business days",
    "Uttar Pradesh": "1–2 business days",
    "Haryana": "1–2 business days",
    "Uttarakhand": "2–3 business days",
    "Punjab": "2–3 business days",
    "Rajasthan": "2–3 business days",
    "Himachal Pradesh": "3–4 business days",
    "Jammu & Kashmir": "4–5 business days",
    "Ladakh": "5–7 business days",
    "Madhya Pradesh": "2–3 business days",
    "Chhattisgarh": "3–4 business days",
    "Bihar": "2–3 business days",
    "Jharkhand": "2–3 business days",
    "Gujarat": "3–4 business days",
    "Dadra & Nagar Haveli and Daman & Diu": "3–4 business days",
    "Maharashtra": "3–4 business days",
    "Goa": "4–5 business days",
    "West Bengal": "3–4 business days",
    "Sikkim": "5–7 business days",
    "Odisha": "4–5 business days",
    "Telangana": "4–5 business days",
    "Andhra Pradesh": "4–5 business days",
    "Karnataka": "4–5 business days",
    "Tamil Nadu": "5–6 business days",
    "Puducherry": "5–6 business days",
    "Kerala": "5–6 business days",
    "Lakshadweep": "7–9 business days",
    "Assam": "5–7 business days",
    "Arunachal Pradesh": "6–8 business days",
    "Meghalaya": "6–8 business days",
    "Manipur": "6–8 business days",
    "Mizoram": "6–8 business days",
    "Nagaland": "6–8 business days",
    "Tripura": "6–8 business days",
    "Andaman & Nicobar Islands": "7–9 business days",
};
const DEFAULT_DAYS = "3–5 business days";

function DeliveryEstimator() {
    const [pin, setPin] = useState("");
    const [estimate, setEstimate] = useState<{ days: string; state: string } | null>(null);
    const [pinError, setPinError] = useState("");

    const checkPin = () => {
        const clean = pin.replace(/\D/g, "").slice(0, 6);
        if (clean.length !== 6) {
            setPinError("Enter a valid pin");
            setEstimate(null);
            return;
        }
        const state = resolveStateFromPin(clean);
        if (!state) {
            setPinError("Enter a valid pin");
            setEstimate(null);
            return;
        }
        setPinError("");
        setEstimate({ state, days: STATE_DELIVERY_DAYS[state] || DEFAULT_DAYS });
    };

    return (
        <div className={cn("mt-6 rounded-[14px] border p-4", HAIR)}>
            <div className="flex items-center gap-2">
                <Truck className="h-[14px] w-[14px] text-[#ec4899]" strokeWidth={1.7} />
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#7a2c4e]/70">Check delivery time</span>
            </div>
            <div className="mt-3 flex gap-2">
                <input
                    value={pin}
                    onChange={(e) => {
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setPinError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && checkPin()}
                    placeholder="Enter pincode"
                    inputMode="numeric"
                    maxLength={6}
                    aria-label="Delivery pincode"
                    className="h-11 flex-1 rounded-full border border-[#7a2c4e]/15 bg-white px-4 text-[13px] text-[#7a2c4e] outline-none focus:border-[#ec4899]/50"
                />
                <button
                    type="button"
                    onClick={checkPin}
                    className="h-11 shrink-0 rounded-full bg-[#7a2c4e] px-5 text-[11px] uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-[#5c2338]"
                >
                    Check
                </button>
            </div>
            {pinError && <p className="mt-2 text-[12px] font-light text-[#c14a4a]">{pinError}</p>}
            {estimate && (
                <div className="mt-2.5">
                    <p className="text-[13px] font-medium text-[#2f8f45]">
                        Estimated delivery: {estimate.days}
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-light text-[#6b5560]">
                        {estimate.state}
                    </p>
                </div>
            )}
        </div>
    );
}

function PackSelector({ product, currentPrice }: { product: { name: string; price?: string }; currentPrice: string }) {
    const duos = useMemo(() => relevantDuos(product.name), [product.name]);
    return (
        <div className={cn("mt-6 border-t pt-6", HAIR)}>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#ec4899]">Choose your set</span>
            <div className="mt-3 grid gap-2.5">
                <div className="flex items-center justify-between rounded-[12px] border-2 border-[#ec4899] bg-[#ec4899]/[0.06] px-4 py-3.5">
                    <div>
                        <p className={cn("font-serif text-[15px] font-normal", INK)}>Single — {product.name}</p>
                        <p className="text-[11.5px] font-light text-[#6b5560]/70">This bottle only</p>
                    </div>
                    <span className="font-serif text-[16px] font-normal text-[#ec4899]">{currentPrice}</span>
                </div>

                {duos.map((duo) => (
                    <Link key={duo.href} href={duo.href}
                        className="flex items-center justify-between rounded-[12px] border border-[#7a2c4e]/15 px-4 py-3.5 transition-colors duration-300 hover:border-[#7a2c4e]/30 hover:bg-[#7a2c4e]/[0.02]">
                        <div>
                            <p className={cn("font-serif text-[15px] font-normal", INK)}>{duo.label}</p>
                            <p className="text-[11.5px] font-light text-[#6b5560]/70">Save ₹2,399</p>
                        </div>
                        <div className="text-right">
                            <span className="font-serif text-[16px] font-normal text-[#7a2c4e]">{DUO_PRICE}</span>
                            <span className="ml-1.5 text-[11px] font-light text-[#6b5560]/45 line-through">{DUO_ORIGINAL}</span>
                        </div>
                    </Link>
                ))}

                <Link href={TRIO_HREF}
                    className="relative flex items-center justify-between overflow-hidden rounded-[12px] border-2 border-[#ec4899] bg-gradient-to-br from-[#fdf3e0] to-[#fdeef4] px-4 py-3.5 transition-transform duration-300 hover:-translate-y-0.5">
                    <span className="absolute -right-1 -top-1 rounded-bl-[10px] bg-[#ec4899] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">Best value</span>
                    <div>
                        <p className={cn("font-serif text-[15px] font-normal", INK)}>Complete Trio — all 3</p>
                        <p className="text-[11.5px] font-medium text-[#a8823f]">Save ₹4,048</p>
                    </div>
                    <div className="text-right">
                        <span className="font-serif text-[16px] font-normal text-[#7a2c4e]">{TRIO_PRICE}</span>
                        <span className="ml-1.5 text-[11px] font-light text-[#6b5560]/45 line-through">{TRIO_ORIGINAL}</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
   Share row — WhatsApp / Facebook / X / Instagram all shown as the
   same lettered circle. Instagram has no public share-intent URL for
   arbitrary web content (a platform limitation, not something a link
   can work around), so its button opens the native share sheet
   instead — which does cover Instagram directly on phones — or copies
   the link on desktop.
------------------------------------------------------------------- */
function ShareRow({ productName, price }: { productName: string; price: string }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${productName} — ${price} · Leira`;
    const links = [
        { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, color: "#25D366" },
        { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: "#1877F2" },
        { label: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, color: "#111111" },
    ];
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {}
    };
    const nativeShare = async () => {
        if (navigator.share) {
            try { await navigator.share({ title: productName, text, url }); } catch {}
        } else copyLink();
    };
    return (
        <div className="flex flex-wrap items-center gap-2">
  <span
    className={cn(
      "mr-1 text-[11px] uppercase tracking-[0.16em]",
      BODY
    )}
  >
    Share this scent
  </span>

  {links.map((l) => (
    <a
      key={l.label}
      href={l.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${l.label}`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#7a2c4e]/15 text-[#7a2c4e]/70 transition-all duration-300 hover:-translate-y-0.5 hover:text-white"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = l.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {l.label.toLowerCase() === "facebook" && (
        <svg
          viewBox="0 0 24 24"
          className="h-[15px] w-[15px]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.55.45-1 1-1Z" />
        </svg>
      )}

      {(l.label.toLowerCase() === "twitter" ||
        l.label.toLowerCase() === "x") && (
        <svg
          viewBox="0 0 24 24"
          className="h-[14px] w-[14px]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.6l-5.17-6.76L5.06 22H1.8l7.6-8.69L1.25 2H8l4.67 6.17L18.244 2Zm-1.14 17.85h1.8L6.98 4.03H5.05L17.104 19.85Z" />
        </svg>
      )}

      {l.label.toLowerCase() === "pinterest" && (
        <svg
          viewBox="0 0 24 24"
          className="h-[15px] w-[15px]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.15 2 11.27c0 3.8 2.15 7.1 5.36 8.73-.07-.74-.01-1.63.18-2.34l1.01-4.28s-.26-.52-.26-1.29c0-1.21.7-2.12 1.57-2.12.74 0 1.1.55 1.1 1.21 0 .74-.47 1.84-.71 2.86-.2.85.43 1.54 1.27 1.54 1.52 0 2.69-1.6 2.69-3.91 0-2.04-1.47-3.46-3.57-3.46-2.43 0-3.85 1.82-3.85 3.7 0 .73.28 1.51.64 1.94.07.08.08.15.06.24l-.24.95c-.04.15-.13.19-.29.12-1.08-.5-1.76-2.06-1.76-3.31 0-2.69 1.95-5.16 5.63-5.16 2.96 0 5.26 2.11 5.26 4.93 0 2.94-1.85 5.3-4.42 5.3-.86 0-1.67-.45-1.95-.98l-.53 2.03c-.19.74-.7 1.67-1.04 2.24.78.24 1.61.37 2.46.37 5.52 0 10-4.15 10-9.27S17.52 2 12 2Z" />
        </svg>
      )}

      {l.label.toLowerCase() === "whatsapp" && (
        <svg
          viewBox="0 0 24 24"
          className="h-[15px] w-[15px]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.49 0 .15 5.34.15 11.91c0 2.1.55 4.15 1.6 5.96L.05 24l6.27-1.65a11.9 11.9 0 0 0 5.74 1.46h.01c6.56 0 11.9-5.34 11.9-11.91 0-3.18-1.24-6.17-3.45-8.42ZM12.07 21.8a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.86 9.86 0 0 1-1.51-5.28c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.01 2.91a9.84 9.84 0 0 1 2.9 7.02c-.01 5.46-4.46 9.88-9.96 9.88Zm5.43-7.41c-.3-.15-1.77-.87-2.05-.97-.28-.1-.49-.15-.7.15-.21.3-.8.97-.98 1.17-.18.2-.36.22-.66.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.2-.31.3-.51.1-.2.05-.38-.03-.53-.08-.15-.7-1.68-.96-2.3-.25-.6-.51-.52-.7-.53h-.59c-.2 0-.53.07-.81.38-.28.3-1.06 1.04-1.06 2.54s1.09 2.95 1.24 3.15c.15.2 2.15 3.28 5.2 4.6.73.32 1.3.51 1.74.65.73.23 1.4.2 1.93.12.59-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.4-.08-.12-.28-.19-.59-.34Z" />
        </svg>
      )}

      {l.label.toLowerCase() === "linkedin" && (
        <svg
          viewBox="0 0 24 24"
          className="h-[15px] w-[15px]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.75 9.5h4.45V21H2.75V9.5ZM9.25 9.5h4.27v1.57h.06c.59-1.12 2.04-2.3 4.2-2.3 4.49 0 5.32 2.95 5.32 6.78V21h-4.45v-4.84c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.84 1.25-1.84 2.54V21H9.25V9.5Z" />
        </svg>
      )}
    </a>
  ))}

  {/* Instagram */}
  <button
    type="button"
    onClick={nativeShare}
    aria-label="Share on Instagram"
    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#7a2c4e]/15 text-[#7a2c4e]/70 transition-all duration-300 hover:-translate-y-0.5     hover:border-[#ec4899]/60 hover:bg-[#7a2c4e] hover:text-white"
  >
    <svg
      viewBox="0 0 24 24"
      className="h-[15px] w-[15px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />
  
      <circle
        cx="12"
        cy="12"
        r="4"
      />
  
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  </button>

  {/* Copy Link */}
  <button
    type="button"
    onClick={copyLink}
    aria-label="Copy link"
    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#7a2c4e]/15 text-[#7a2c4e]/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ec4899]/60 hover:text-[#a8823f]"
  >
    <AnimatePresence mode="wait" initial={false}>
      {copied ? (
        <motion.span
          key="check"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
        >
          <Check
            className="h-[14px] w-[14px]"
            strokeWidth={1.8}
          />
        </motion.span>
      ) : (
        <motion.span
          key="copy"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
        >
          <Copy
            className="h-[14px] w-[14px]"
            strokeWidth={1.7}
          />
        </motion.span>
      )}
    </AnimatePresence>
  </button>
</div>
    );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={cn("border-b", HAIR)}>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-5 text-left">
                <span className={cn("font-serif text-[19px] font-light", INK)}>{title}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-[#ec4899]/70 transition-transform duration-500", open && "rotate-180")} strokeWidth={1.4} />
            </button>
            <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                <div className="overflow-hidden"><div className="pb-6">{children}</div></div>
            </div>
        </div>
    );
}

function FlipCard({ tint, front, back }: { tint: string; front: string; back: string }) {
    const [flipped, setFlipped] = useState(false);
    return (
        <div className="group relative h-[220px] cursor-pointer [perspective:1200px]" onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)} onClick={() => setFlipped((f) => !f)}>
            <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]" style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[18px] border border-[#7a2c4e]/[0.1] p-6 text-center [backface-visibility:hidden]" style={{ background: `linear-gradient(160deg, ${tint}14, #fffdfc)` }}>
                    <span className="h-2 w-2 rotate-[-45deg] rounded-[50%_50%_50%_0]" style={{ background: tint }} />
                    <p className="font-serif text-[22px] font-light italic" style={{ color: tint }}>{front}</p>
                    <span className={cn("text-[11px] font-light uppercase tracking-[0.14em]", BODY)}>Hover to reveal</span>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[18px] p-7 text-center text-white [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)", background: `linear-gradient(160deg, ${tint}, #2b0f1d)` }}>
                    <p className="text-[14px] font-light leading-[1.7]">{back}</p>
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { product, loading, error: fetchError } = useProduct(id as string);
    const { products: allProducts } = useProducts();
    const { reviews, stats: reviewStats, refetch: refetchReviews } = useProductReviews(product?._id || "");
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { success, error } = useToast();

    const stickyTop = useStickyTopOffset();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const currentParam = String(id || "");

    const toSlug = (value: string) =>
        String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
    const getProductPath = (item: { id?: string; _id?: string; name?: string }) => getProductShopPath(item);

    useEffect(() => {
        if (!product) return;
        const canonical = canonicalProductSlug(product.id, product.name);
        if (canonical && currentParam && currentParam !== canonical) router.replace(`/shop/${canonical}`);
    }, [product, currentParam, router]);

    useEffect(() => {
        if (!product) return;
        const pid = String(product._id || product.id || "");
        if (!pid) return;
        const price = parseInrPrice(product.price);
        trackViewItem({ item_id: pid, item_name: product.name, price, quantity: 1 });
        trackMetaEvent("ViewContent", { content_ids: [pid], content_name: product.name, content_type: "product", currency: "INR", value: price });
    }, [product?._id, product?.id]);

    const detailMrp = useMemo(
        () => strikethroughPriceIfHigher(product?.price ?? "", product?.originalPrice),
        [product?.price, product?.originalPrice]
    );

    const handleAddToCart = async () => {
        if (!product) return;
        const isOutOfStock = product.status === "inactive" || Number(product.stock ?? 0) <= 0;
        if (isOutOfStock) { error("This product is out of stock"); return; }
        try {
            const thumbPath = pickShopCardPath(product);
            const productImage = getImageUrl(thumbPath || product.images?.[0] || "");
            const snapshot = { name: product.name, price: product.price, imageUrl: productImage };
            await addToCart(product._id || product.id, quantity, snapshot);
            success("Added to your bag");
        } catch (e: any) {
            if (e.message?.includes("log in")) { error("Please log in to shop"); router.push("/login"); }
            else error(e.message || "Could not add to cart");
        }
    };

    const toggleWishlist = async () => {
        if (!product) return;
        const pid = product._id || product.id;
        try {
            if (isInWishlist(pid)) { await removeFromWishlist(pid); success("Removed from wishlist"); }
            else { await addToWishlist(pid); success("Added to wishlist"); }
        } catch (e: any) {
            error(e.message || "Failed to update wishlist");
        }
    };

    const handleSubmitReview = async () => {
        if (!product) return;
        const pid = product._id || product.id;
        if (!isLoggedInCustomer()) { error("Please log in to leave a review"); router.push("/login"); return; }
        setReviewSubmitting(true);
        try {
            await reviewAPI.create(pid, reviewRating, reviewComment);
            success("Thank you — your review was submitted for approval.");
            setReviewComment("");
            setReviewRating(5);
            refetchReviews();
        } catch (e: any) {
            error(e.message || "Could not submit review");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <MiniNavbar />
                <div className="leira-underlap-nav-spacer flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fdf1f5] to-[#fffdfc]">
                    <span className="block h-9 w-9 animate-spin rounded-full border border-[#7a2c4e]/15 border-t-[#ec4899]" />
                    <p className={cn("mt-6 font-serif text-[19px] font-light italic", INK)}>Preparing your fragrance…</p>
                </div>
            </>
        );
    }

    if (fetchError || !product) {
        return (
            <>
                <MiniNavbar />
                <div className="leira-underlap-nav-spacer flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fdf1f5] to-[#fffdfc] px-6 text-center">
                    <h2 className={cn("font-serif text-[clamp(28px,4vw,44px)] font-light", INK)}>Fragrance not found</h2>
                    <p className={cn("mt-4 max-w-[42ch] text-[15px] font-light leading-[1.8]", BODY)}>This scent may be unavailable or has been removed.</p>
                    <Link href="/shop" className="group relative mt-9 inline-block overflow-hidden rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-9 py-4 text-[11px] uppercase tracking-[0.22em] text-white transition-transform duration-500 hover:-translate-y-0.5">
                        <span className="relative z-10">Return to shop</span>
                        <span aria-hidden className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0" />
                    </Link>
                </div>
            </>
        );
    }

    const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [getImageUrl(pickShopCardPath(product) || "")];
    const isOutOfStock = product.status === "inactive" || Number(product.stock ?? 0) <= 0;
    const seoCopy = resolveProductSeoCopy(currentParam, String(product?.id || ""), String(product?.name || ""));
    const benefitH2 = resolvePdpHeroLine(String(product?.name || ""), product?.detailTagline, currentParam, String(product?.id || ""), String(product?.name || ""));
    const productDescription =
        product.description && product.description.trim().length > 3
            ? product.description
            : seoCopy?.longDescription || "Experience the essence of luxury with this exclusive fragrance.";
    const descriptionParagraphs = String(productDescription).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

    const secondaryPhoto = images.length > 1 ? images[1] : images[0];
    const tertiaryPhoto = images.length > 2 ? images[2] : images[0];

    return (
        <div className="leira-underlap-nav-spacer min-h-screen bg-white pb-24 lg:pb-0">
            <MiniNavbar />

            {/* ================= hero — image left / info right ================= */}
            <main className="relative isolate [overflow:clip] bg-gradient-to-b from-[#fdf1f5] via-[#fff7fa] to-[#fffdfc] px-4 pb-16 pt-12 sm:px-8 md:pb-24 lg:px-12">
                <Grain />
                <div className="mx-auto max-w-6xl">
                    <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
                        <div className="min-w-0 w-full lg:sticky lg:self-start" style={{ top: stickyTop }}>
                            <div className="flex gap-3">
                                {images.length > 1 && (
                                    <div className="hidden w-[72px] shrink-0 flex-col gap-3 lg:flex">
                                        {images.map((img, i) => (
                                            <button key={i} onClick={() => setActiveImage(i)} aria-label={`View image ${i + 1}`}
                                                className={cn("relative h-[72px] w-[72px] overflow-hidden rounded-[12px] border transition-all duration-400",
                                                    activeImage === i ? "border-[#ec4899]" : "border-[#7a2c4e]/10 opacity-55 hover:opacity-100")}>
                                                <SafeImg src={img} alt={`${product.name} ${i + 1}`} label={product.name} className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="relative min-w-0 flex-1 overflow-hidden rounded-[24px] bg-[#f7e6ee] shadow-[0_44px_84px_-56px_rgba(122,44,78,0.55)]">
                                    <div className="relative aspect-[3/4] w-full">
                                        <AnimatePresence mode="wait">
                                            <motion.div key={activeImage} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="absolute inset-0">
                                                <SafeImg src={images[activeImage]} alt={product.name} label={product.name} className="h-full w-full object-cover object-center" />
                                            </motion.div>
                                        </AnimatePresence>
                                        {isOutOfStock && <div className="absolute left-5 top-5 rounded-full bg-[#7a2c4e] px-4 py-1.5 text-[10.5px] uppercase tracking-[0.16em] text-white">Out of stock</div>}
                                        <button onClick={toggleWishlist} aria-label={isInWishlist(product._id || product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                            className={cn("absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 active:scale-90",
                                                isInWishlist(product._id || product.id) ? "border-transparent bg-[#ec4899] text-white" : "border-white/70 bg-white/70 text-[#7a2c4e]/60 hover:border-[#ec4899]/50 hover:text-[#ec4899]")}>
                                            <Heart className={cn("h-[18px] w-[18px]", isInWishlist(product._id || product.id) && "fill-current")} strokeWidth={1.6} />
                                        </button>
                                        <span className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3.5 py-2 text-[10.5px] font-medium text-[#7a2c4e] backdrop-blur-md">
                                            <Truck className="h-[13px] w-[13px]" strokeWidth={1.8} />
                                            Delivery in 3–5 days
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="scrollbar-hide mt-3 flex gap-3 overflow-x-auto pb-1 lg:hidden">
                                    {images.map((img, i) => (
                                        <button key={i} onClick={() => setActiveImage(i)} aria-label={`View image ${i + 1}`}
                                            className={cn("relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border transition-all duration-400",
                                                activeImage === i ? "border-[#ec4899]" : "border-[#7a2c4e]/10 opacity-55")}>
                                            <SafeImg src={img} alt={`${product.name} ${i + 1}`} label={product.name} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <motion.div className="relative z-10 min-w-0 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
                            {/* <span className="inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#ec4899]">
                                <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />Leira exclusive
                            </span> */}

                            <h1 className={cn("mt-4 font-serif text-[clamp(30px,3.6vw,44px)] font-light leading-[1.1] tracking-tight", INK)}>{product.name}</h1>
                            {benefitH2 && <p className="mt-2 max-w-[42ch] font-serif text-[16px] font-light italic text-[#7a2c4e]/55">{benefitH2}</p>}

                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <Star key={r} className={cn("h-[14px] w-[14px]", reviewStats.totalCount > 0 && r <= Math.round(reviewStats.avgRating) ? "fill-[#ec4899] text-[#ec4899]" : "text-[#7a2c4e]/20")} strokeWidth={1.4} />
                                    ))}
                                </span>
                                <span className={cn("text-[12.5px] font-light", BODY)}>
                                    {reviewStats.totalCount === 0 ? "No reviews yet" : `${reviewStats.avgRating.toFixed(1)} · ${reviewStats.totalCount} reviews`}
                                </span>
                            </div>

                            {/* price — highlighted in its own tinted panel so it
                                leads the whole info column, not just another line */}
                            <div className="mt-5 rounded-[16px] bg-gradient-to-br from-[#ec4899]/[0.08] to-[#f9a8d4]/[0.12] p-5">
                                <div className="flex items-baseline gap-3">
                                    <span className="font-serif text-[clamp(34px,4vw,44px)] font-normal leading-none text-[#ec4899] tabular-nums">{product.price}</span>
                                    {detailMrp && <span className="text-[16px] font-light tabular-nums text-[#6b5560]/60 line-through">{detailMrp}</span>}
                                </div>
                                <span className="mt-1.5 block text-[11.5px] font-light text-[#6b5560]/60">Inclusive of taxes</span>
                            </div>

                            <div className="mt-6 flex flex-row gap-3 sm:flex-row">
                                <div className={cn("flex h-14 items-center rounded-full border bg-white/70", HAIR)}>
                                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-full w-12 items-center justify-center text-[#7a2c4e]/60 hover:text-[#ec4899]" aria-label="Decrease quantity"><Minus className="h-4 w-4" strokeWidth={1.6} /></button>
                                    <span className={cn("min-w-9 text-center font-serif text-[18px] tabular-nums", INK)}>{quantity}</span>
                                    <button type="button" onClick={() => setQuantity((q) => q + 1)} className="flex h-full w-12 items-center justify-center text-[#7a2c4e]/60 hover:text-[#ec4899]" aria-label="Increase quantity"><Plus className="h-4 w-4" strokeWidth={1.6} /></button>
                                </div>
                                <button onClick={handleAddToCart} disabled={isOutOfStock}
                                    className={cn("group relative flex h-14 flex-1 items-center justify-center gap-3 overflow-hidden rounded-full text-[11px] uppercase tracking-[0.22em] transition-transform duration-500",
                                        isOutOfStock ? "cursor-not-allowed bg-[#7a2c4e]/15 text-[#7a2c4e]/50" : "bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] text-white shadow-[0_18px_34px_-20px_rgba(236,72,153,0.9)] hover:-translate-y-0.5")}>
                                    <span className="relative z-10 flex items-center gap-3"><ShoppingBag className="h-4 w-4" strokeWidth={1.6} />{isOutOfStock ? "Out of stock" : "Add to bag"}</span>
                                    {!isOutOfStock && <span aria-hidden className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0" />}
                                </button>
                            </div>

                            <DeliveryEstimator />

                            <PackSelector product={product} currentPrice={product.price || ""} />

                            {/* offers — minimal, a few lines, nothing heavier */}
                            {/* <div className={cn("mt-5 rounded-[12px] border p-4", HAIR)}>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-[13px] w-[13px] text-[#ec4899]" strokeWidth={1.7} />
                                    <span className="text-[11px] uppercase tracking-[0.14em] text-[#7a2c4e]/60">Offers</span>
                                </div>
                                <ul className="mt-2 space-y-1.5">
                                    {OFFERS.map((offer) => (
                                        <li key={offer} className={cn("text-[12.5px] font-light leading-[1.5]", BODY)}>{offer}</li>
                                    ))}
                                </ul>
                            </div> */}
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* ================= sub info: highlights + share, full width ================= */}
            <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-10 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 border-b border-[#7a2c4e]/[0.1] pb-10 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2.5">
                        {USPS.map((u, i) => {
                            const Icon = u.icon;
                            return (
                                <Reveal key={u.label} delay={i * 90}>
                                    <div className="flex items-center gap-2 rounded-full px-3.5 py-2" style={{ background: `${u.tint}12` }}>
                                        <Icon className="h-3.5 w-3.5" strokeWidth={1.7} style={{ color: u.tint }} />
                                        <span className="text-[11px] font-medium" style={{ color: u.tint }}>{u.label}</span>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                    <ShareRow productName={product.name} price={product.price || ""} />
                </div>
            </section>

            {/* ================= about — description/how-to-use/faq beside a photo ================= */}
            <section className={cn("relative isolate [overflow:clip] px-5 py-16 sm:px-8 md:py-20 lg:px-12", BLUSH)}>
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
                    <Reveal className="lg:sticky lg:top-24 lg:self-start">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#f7e6ee] shadow-[0_36px_70px_-48px_rgba(122,44,78,0.4)]">
                            <SafeImg src={secondaryPhoto} alt={`${product.name} lifestyle`} label={product.name} className="h-full w-full object-cover" />
                        </div>
                    </Reveal>

                    <div>
                        <Reveal>
                            <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">About this fragrance</span>
                            <h2 className={cn("mt-3 font-serif text-[clamp(24px,3vw,34px)] font-light leading-[1.15]", INK)}>{product.name}, in detail</h2>
                        </Reveal>
                        <div className="mt-6">
                            <Section title="Description" defaultOpen>
                                <div className={cn("space-y-4 text-[14.5px] font-light leading-[1.85]", BODY)}>
                                    {descriptionParagraphs.map((p, i) => <p key={i}>{renderFormattedDescription(p)}</p>)}
                                </div>
                            </Section>
                            <Section title="How to use">
                                <HowToUseSteps />
                            </Section>
                            <Section title="Frequently asked questions">
                                <div className="space-y-5">
                                    {FAQS.map((f) => (
                                        <div key={f.q}>
                                            <p className={cn("text-[14px] font-medium", INK)}>{f.q}</p>
                                            <p className={cn("mt-1.5 text-[13px] font-light leading-[1.7]", BODY)}>{f.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= key notes — a fragrance pyramid, not another card grid ================= */}
            <section className="relative isolate [overflow:clip] bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
                <Grain opacity={0.05} />
                <span aria-hidden className="pointer-events-none absolute -right-24 top-0 -z-10 h-[32vw] max-h-[400px] w-[32vw] max-w-[400px] rounded-full bg-[#ec4899]/18 blur-[110px]" />
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
                    <div>
                        <Reveal>
                            <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#f9a8d4]">Key notes</span>
                            <h2 className="mt-3 font-serif text-[clamp(24px,3vw,34px)] font-light leading-[1.15] text-white">How this scent unfolds</h2>
                            <p className="mt-3 max-w-[52ch] text-[14px] font-light leading-[1.85] text-[#f7dfe8]/70">
                                Like any fine fragrance, {product.name} reveals itself in stages — not all at once.
                            </p>
                        </Reveal>

                        <div className="mt-10 space-y-4">
                            {NOTES.map((n, i) => {
                                const Icon = n.icon;
                                return (
                                    <Reveal key={n.tier} delay={i * 160} className="origin-left" style={{ width: `${72 + i * 14}%` }}>
                                        <div className="flex items-center gap-4 rounded-r-[16px] border-l-4 py-4 pl-5 pr-6" style={{ borderColor: n.tint, background: `${n.tint}14` }}>
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${n.tint}22` }}>
                                                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} style={{ color: n.tint }} />
                                            </span>
                                            <div>
                                                <p className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: n.tint }}>{n.tier}</p>
                                                <p className="mt-0.5 text-[13.5px] font-light leading-[1.6] text-white/85">{n.body}</p>
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>

                    <Reveal delay={200} className="relative hidden overflow-hidden rounded-[22px] lg:block">
                        <SafeImg src={tertiaryPhoto} alt={`${product.name} botanicals`} label={product.name} className="h-full min-h-[440px] w-full object-cover" />
                        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2b0f1d]/60 via-transparent to-transparent" />
                    </Reveal>
                </div>
            </section>

            {/* ================= specifications ================= */}
            <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
                <Grain />
                <div className="mx-auto max-w-8xl">
                    <Reveal>
                        <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">Specifications</span>
                        <h2 className={cn("mt-3 font-serif text-[clamp(24px,3vw,34px)] font-light leading-[1.15]", INK)}>The details that matter</h2>
                    </Reveal>
                    <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {SPECS.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Reveal key={s.label} delay={i * 110}>
                                    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: EASE }} className="flex flex-col items-center gap-2 rounded-[16px] border border-[#7a2c4e]/[0.1] bg-white p-5 text-center shadow-[0_16px_32px_-26px_rgba(122,44,78,0.3)]">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ec4899]/10"><Icon className="h-[18px] w-[18px] text-[#ec4899]" strokeWidth={1.6} /></span>
                                        <span className="text-[10px] uppercase tracking-[0.14em] text-[#7a2c4e]/50">{s.label}</span>
                                        <span className={cn("font-serif text-[14px] font-normal leading-tight", INK)}>{s.value}</span>
                                    </motion.div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ================= ingredients ================= */}
            <section className={cn("relative isolate [overflow:clip] px-5 py-16 sm:px-8 md:py-20 lg:px-12", BLUSH)}>
                <Grain />
                <div className="mx-auto max-w-7xl">
                    <Reveal>
                        <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">Ingredients</span>
                        <h2 className={cn("mt-3 font-serif text-[clamp(24px,3vw,34px)] font-light leading-[1.15]", INK)}>Crafted with three essential oils</h2>
                        <p className={cn("mt-3 max-w-[54ch] text-[14px] font-light leading-[1.85]", BODY)}>Hover a card to see what each oil actually does for your skin.</p>
                    </Reveal>
                    <div className="mt-9 grid gap-6 sm:grid-cols-3">
                        {INGREDIENTS.map((ing, i) => (
                            <Reveal key={ing.name} delay={i * 140}><FlipCard tint={ing.tint} front={ing.name} back={ing.note} /></Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= full-bleed photo break — a moment, not a card ================= */}
            <section className="relative isolate flex min-h-[46vh] items-center justify-center overflow-hidden px-5 py-20 sm:px-8">
                <SafeImg src={secondaryPhoto} alt="" label={product.name} className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden className="absolute inset-0 bg-[#2b0f1d]/60" />
                <Reveal className="relative z-10 mx-auto max-w-2xl text-center">
                    <p className="font-serif text-[clamp(22px,3vw,32px)] font-light italic leading-[1.4] text-white">
                        "A quiet ritual, every morning two drops, and confidence that lasts the day."
                    </p>
                </Reveal>
            </section>

            {/* ================= key features & benefits ================= */}
            <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
                <Grain />
                <div className="mx-auto max-w-7xl">
                    <Reveal>
                        <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">Key features & benefits</span>
                        <h2 className={cn("mt-3 font-serif text-[clamp(24px,3vw,34px)] font-light leading-[1.15]", INK)}>Why it works</h2>
                    </Reveal>
                    <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {BENEFITS.map((p, i) => {
                            const Icon = p.icon;
                            return (
                                <Reveal key={p.title} delay={i * 130}>
                                    <motion.div whileHover={{ y: -5, boxShadow: "0 24px 48px -30px rgba(122,44,78,0.35)" }} transition={{ duration: 0.3, ease: EASE }} className="h-full rounded-[18px] border border-[#7a2c4e]/[0.1] bg-white p-6">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ background: `${p.tint}15` }}><Icon className="h-5 w-5" strokeWidth={1.6} style={{ color: p.tint }} /></span>
                                        <h3 className={cn("mt-4 font-serif text-[17px] font-normal leading-tight", INK)}>{p.title}</h3>
                                        <p className={cn("mt-2 text-[13px] font-light leading-[1.65]", BODY)}>{p.description}</p>
                                    </motion.div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ================= explore ================= */}
            <section
              className={cn(
                "relative isolate [overflow:clip] px-5 py-16 sm:px-8 md:py-20 lg:px-12",
                BLUSH
              )}
              aria-labelledby="explore-leira-heading"
            >
              <Grain />
            
              <div className="mx-auto max-w-7xl">
                <Reveal>
                  <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">
                    The collection
                  </span>
            
                  <h2
                    id="explore-leira-heading"
                    className={cn(
                      "mt-3 font-serif text-[clamp(24px,3vw,36px)] font-light leading-[1.15]",
                      INK
                    )}
                  >
                    Explore more from Leira
                  </h2>
                </Reveal>
            
                <div className="mt-8 grid gap-px overflow-hidden rounded-[20px] border border-[#7a2c4e]/[0.1] bg-[#7a2c4e]/[0.08] sm:grid-cols-2 xl:grid-cols-4">
            
                  {getFlagshipSiblingsExcluding({
                    canonicalPath: getProductPath(product),
                    urlParam: currentParam,
                    slugFromProduct: toSlug(
                      product?.id || product?.name || ""
                    ),
                  }).map((item) => {
                    /*
                     * getFlagshipSiblingsExcluding() returns lightweight
                     * navigation-card data ({ href, label, line }), not a
                     * ProductImageFields object. Match the card back to the
                     * real product before calling pickShopCardPath().
                     */
                    const itemPath = normalizeShopHref(item.href);

                    const siblingProduct = allProducts.find((candidate) => {
                      const candidatePath = normalizeShopHref(
                        getProductPath(candidate)
                      );

                      const samePath = candidatePath === itemPath;
                      const sameName =
                        toSlug(candidate?.name || "") ===
                        toSlug(item.label || "");

                      return samePath || sameName;
                    });

                    const imagePath = siblingProduct
                      ? pickShopCardPath(siblingProduct)
                      : "";

                    const fallbackProductImage =
                      siblingProduct &&
                      Array.isArray(siblingProduct.images) &&
                      siblingProduct.images.length > 0
                        ? siblingProduct.images[0]
                        : "";

                    const imageUrl = imagePath
                      ? resolveMediaUrl(imagePath)
                      : fallbackProductImage
                        ? resolveMediaUrl(fallbackProductImage)
                        : "/images/placeholder.png";

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex flex-col overflow-hidden bg-[#fffdfc] transition-colors duration-500 hover:bg-[#fff5f9]"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f6f4f2]">
                          <SafeImg
                            src={imageUrl}
                            alt={item.label}
                            label={item.label}
                            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                          />
            
                          {/* Image overlay */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#7a2c4e]/10 via-transparent to-transparent opacity-60" />
            
                          {/* Category */}
                          <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[#7a2c4e] backdrop-blur-sm">
                            Fragrance
                          </span>
                        </div>
            
                        {/* Content */}
                        <div className="flex flex-1 flex-col justify-between p-6">
                          <div>
                            <p
                              className={cn(
                                "font-serif text-[19px] font-light leading-[1.25]",
                                INK
                              )}
                            >
                              {item.label}
                            </p>
            
                            <p
                              className={cn(
                                "mt-1.5 text-[12.5px] font-light leading-[1.65]",
                                BODY
                              )}
                            >
                              {item.line}
                            </p>
                          </div>
            
                          <span className="mt-5 inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-[#7a2c4e]/70 transition-colors duration-300 group-hover:text-[#ec4899]">
                            View product
            
                            <Mark className="transition-transform duration-500 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
            
                  {/* Benefits Card */}
                  <Link
                    href="/benefits"
                    className="group flex flex-col overflow-hidden bg-[#fff5f9] transition-colors duration-500 hover:bg-[#fdeef4]"
                  >
                    {/* Benefits Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#fbeef3]">
                      <img
                        src="/images/leira-benefits.webp"
                        alt="Discover the benefits of Leira"
                        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
            
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#7a2c4e]/10 via-transparent to-transparent" />
            
                      <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[#7a2c4e] backdrop-blur-sm">
                        Learn
                      </span>
                    </div>
            
                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <p
                          className={cn(
                            "font-serif text-[19px] font-light leading-[1.25]",
                            INK
                          )}
                        >
                          Why Leira — benefits
                        </p>
            
                        <p
                          className={cn(
                            "mt-1.5 text-[12.5px] font-light leading-[1.65]",
                            BODY
                          )}
                        >
                          Safety, ingredients, and how it fits your routine.
                        </p>
                      </div>
            
                      <span className="mt-5 inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-[#7a2c4e]/70 transition-colors duration-300 group-hover:text-[#ec4899]">
                        Read benefits
            
                        <Mark className="transition-transform duration-500 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            {/* ================= reviews ================= */}
            <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
                <Grain />
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-16">
                        <div className="lg:sticky lg:self-start" style={{ top: stickyTop }}>
                            <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">In their words</span>
                            <h2 className={cn("mt-3 font-serif text-[clamp(24px,3vw,36px)] font-light leading-[1.15]", INK)}>Customer reviews</h2>
                            {reviewStats.totalCount > 0 && (
                                <div className={cn("mt-6 flex items-end gap-4 border-t pt-5", HAIR)}>
                                    <span className="font-serif text-[40px] font-light leading-none text-[#ec4899]">{reviewStats.avgRating.toFixed(1)}</span>
                                    <span className={cn("pb-1 text-[12.5px] font-light", BODY)}>from {reviewStats.totalCount} review{reviewStats.totalCount === 1 ? "" : "s"}</span>
                                </div>
                            )}
                            {!isLoggedInCustomer() && (
                                <p className={cn("mt-5 text-[13.5px] font-light", BODY)}>
                                    <Link href="/login" className="border-b border-[#ec4899]/40 pb-0.5 text-[#ec4899] hover:border-[#ec4899]">Log in</Link> to leave a review.
                                </p>
                            )}
                        </div>

                        <div>
                            {isLoggedInCustomer() && (
                                <div className="mb-8 rounded-[20px] border border-[#ec4899]/[0.12] bg-white/70 p-6 md:p-8">
                                    <h3 className={cn("font-serif text-[19px] font-light", INK)}>Write a review</h3>
                                    <div className="mt-4 flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((r) => (
                                            <button key={r} type="button" onClick={() => setReviewRating(r)} aria-label={`${r} stars`} className={cn("p-1", reviewRating >= r ? "text-[#ec4899]" : "text-[#7a2c4e]/20 hover:text-[#f9a8d4]")}>
                                                <Star className={cn("h-6 w-6", reviewRating >= r && "fill-current")} strokeWidth={1.4} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} maxLength={1000} placeholder="Share your experience (optional)"
                                        className={cn("mt-4 w-full resize-none rounded-[12px] border bg-transparent p-3.5 text-[14.5px] font-light leading-[1.75] outline-none focus:border-[#ec4899]/50", HAIR, INK)} />
                                    <button type="button" onClick={handleSubmitReview} disabled={reviewSubmitting}
                                        className="mt-4 rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition-transform duration-500 hover:-translate-y-0.5 disabled:opacity-55">
                                        {reviewSubmitting ? "Submitting…" : "Submit review"}
                                    </button>
                                </div>
                            )}

                            {reviews.length === 0 ? (
                                <p className="font-serif text-[18px] font-light italic text-[#7a2c4e]/45">No approved reviews yet.</p>
                            ) : (
                                <ul className={cn("border-t", HAIR)}>
                                    {reviews.map((rev) => (
                                        <li key={rev._id} className={cn("border-b py-5", HAIR)}>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                                <span className={cn("font-serif text-[16px]", INK)}>{rev.user?.name || "Customer"}</span>
                                                <span className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((r) => <Star key={r} className={cn("h-3.5 w-3.5", r <= rev.rating ? "fill-[#ec4899] text-[#ec4899]" : "text-[#7a2c4e]/20")} strokeWidth={1.4} />)}
                                                </span>
                                                <span className="text-[11px] uppercase tracking-[0.12em] text-[#7a2c4e]/40">
                                                    {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                            {rev.comment && <p className={cn("mt-2.5 max-w-[62ch] text-[13.5px] font-light leading-[1.8]", BODY)}>{rev.comment}</p>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= related ================= */}
            {(() => {
                const currentId = product._id || product.id;
                const related = allProducts
                    .filter((p) => (p._id || p.id) !== currentId)
                    .filter((p) => isRecommendableProduct({ id: p.id, _id: p._id, name: p.name, status: p.status, showInShopSection: p.showInShopSection, showInComboSection: p.showInComboSection }))
                    .slice(0, 4);
                if (related.length === 0) return null;
                return (
                    <section className={cn("relative isolate [overflow:clip] px-5 py-16 sm:px-8 md:py-20 lg:px-12", BLUSH)}>
                        <Grain />
                        <div className="mx-auto max-w-7xl">
                            <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">You may also like</span>
                            <h2 className={cn("mt-3 font-serif text-[clamp(24px,3vw,36px)] font-light leading-[1.15]", INK)}>More to discover</h2>
                            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6">
                                {related.map((p) => {
                                    const pid = p._id || p.id;
                                    const img = getImageUrl(pickShopCardPath(p) || p.images?.[0] || "");
                                    const relMrp = strikethroughPriceIfHigher(p.price || "", p.originalPrice);
                                    return (
                                        <Link key={pid} href={getProductPath(p)} className="group block">
                                            <div className="relative overflow-hidden rounded-[16px] bg-[#f7e6ee]">
                                                <SafeImg src={img} alt={p.name} label={p.name} className="aspect-[4/5] w-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
                                            </div>
                                            <h3 className={cn("mt-3 line-clamp-2 font-serif text-[15px] font-light capitalize leading-[1.3] group-hover:text-[#ec4899] md:text-[17px]", INK)}>{p.name}</h3>
                                            <div className="mt-1 flex flex-wrap items-baseline gap-2">
                                                <span className="text-[14px] font-light tabular-nums text-[#ec4899]">{p.price}</span>
                                                {relMrp && <span className="text-[11.5px] font-light tabular-nums text-[#6b5560]/55 line-through">{relMrp}</span>}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            })()}

            <Footer />

            {/* ================= sticky mobile add-to-cart bar ================= */}
            <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-[#7a2c4e]/10 bg-white/95 px-4 py-3 backdrop-blur-md sm:hidden">
                <div className={cn("flex h-12 items-center rounded-full border bg-white/70", HAIR)}>
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-full w-10 items-center justify-center text-[#7a2c4e]/60" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" strokeWidth={1.6} /></button>
                    <span className={cn("min-w-7 text-center font-serif text-[15px] tabular-nums", INK)}>{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => q + 1)} className="flex h-full w-10 items-center justify-center text-[#7a2c4e]/60" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" strokeWidth={1.6} /></button>
                </div>
                <button onClick={handleAddToCart} disabled={isOutOfStock}
                    className={cn("flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[11px] uppercase tracking-[0.2em] transition-colors duration-400",
                        isOutOfStock ? "bg-[#7a2c4e]/15 text-[#7a2c4e]/50" : "bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] text-white")}>
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />{isOutOfStock ? "Out of stock" : `Add · ${product.price}`}
                </button>
            </div>
        </div>
    );
}