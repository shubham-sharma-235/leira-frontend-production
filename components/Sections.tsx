"use client";

import { Product } from "@/data/products";
import { useProducts, type Product as HookProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/ui/product-card";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { reviewAPI } from "@/lib/api";
import { strikethroughPriceIfHigher } from "@/lib/utils";
import { pickDetailGalleryPaths, pickHomeCardPath, pickShopCardPath } from "@/lib/product-card-images";
import { pickHomeCardDescription, pickHomeCardTagline, pickShopCardDescription, pickShopCardTagline } from "@/lib/product-card-copy";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { getProductShopPath } from "@/lib/product-slugs";
import {
    Snowflake,
    Leaf,
    Sparkles,
    Heart,
    Wind,
    TreePine,
    ArrowRight,
    Droplets,
    Pipette,
    UserRound,
    WineOff,
    ShieldCheck,
    ThermometerSun,
} from "lucide-react";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";
import { Testimonials } from "@/components/ui/testimonials-columns-1";
import FAQs from "@/components/ui/faq";

export const IntroducingSection = ({ product }: { product: Product }) => {
    const quoteText = "Welcome to the essence of you.";
    const introGallery = [
        {
            src: "/images/Intro.JPEG",
            alt: "Leira intimate perfume collection with rose jasmine and ylang-ylang botanicals",
        },
        {
            src: "/images/intro.png",
            alt: "Leira intro blend with essential oils and botanicals",
        },
        {
            src: "/images/intro2.png",
            alt: "Leira jasmine bottle with white floral notes",
        },
        {
            src: "/images/intro3.png",
            alt: "Leira ylang-ylang bottle with botanical accents",
        },
    ];
    const [activeIntroImage, setActiveIntroImage] = useState(0);
    const paragraph3Raw = product.introducingSection.paragraph3 || "";
    const paragraph3Trimmed = paragraph3Raw.trim();
    const paragraph3WithoutQuote = paragraph3Trimmed.endsWith(quoteText)
        ? paragraph3Trimmed.slice(0, -quoteText.length).trim()
        : paragraph3Raw;

    return (
        <section className="relative z-10 overflow-hidden bg-[#faf7f2] px-4 py-14 sm:px-4 sm:py-16 md:py-20 lg:pl-6 lg:pr-8 xl:pl-10">
            <div className="relative mx-auto w-full min-w-0 max-w-7xl">
                <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-14 xl:gap-16">
                    <div className="relative w-full lg:w-[42%] lg:pt-11">
                        <div className="relative mx-auto aspect-4/3 max-w-2xl overflow-hidden rounded-2xl border border-[#e8ddd4]/90 bg-white shadow-[0_20px_48px_rgba(44,24,24,0.08)]">
                            <Image
                                src={introGallery[activeIntroImage]?.src || "/images/Intro.JPEG"}
                                alt={introGallery[activeIntroImage]?.alt || "Leira intro image"}
                                fill
                                sizes="(max-width: 1280px) 100vw, 42vw"
                                quality={74}
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#2c1818]/10 via-transparent to-transparent" />
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
                            {introGallery.map((img, idx) => (
                                <button
                                    key={img.src}
                                    type="button"
                                    onClick={() => setActiveIntroImage(idx)}
                                    className={`relative aspect-square overflow-hidden rounded-lg border bg-white shadow-[0_8px_22px_rgba(44,24,24,0.07)] transition-all ${
                                        activeIntroImage === idx
                                            ? "border-[#8b4a5c] ring-2 ring-[#8b4a5c]/25"
                                            : "border-[#e8ddd4]/80 hover:border-[#c4a08a]/70"
                                    }`}
                                    aria-label={`Show intro image ${idx + 1}`}
                                >
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        fill
                                        sizes="(max-width: 1280px) 33vw, 12vw"
                                        quality={74}
                                        className="object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <div className="w-full max-w-xs rounded-full border border-[#c4a08a]/50 bg-white/95 px-6 py-3 text-center shadow-[0_12px_28px_rgba(44,24,24,0.08)] backdrop-blur-[2px]">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#5c2d2d]">
                                    BOTANICAL MASTERPIECE
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-[58%]">
                        <div className="space-y-5 sm:space-y-6">
                            <p className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5c3d35]/85">
                                {product.introducingSection.subtitle}
                            </p>
                            <div className="h-px w-32 bg-linear-to-r from-amber-700/50 via-pink-400/60 to-transparent" />

                            <h2 className="max-w-4xl text-balance font-serif text-2xl font-semibold leading-[1.18] tracking-tight text-[#5c2d2d] md:text-3xl lg:text-[clamp(1.65rem,2.2vw,2.15rem)]">
                                {product.introducingSection.title}
                            </h2>

                            <div className="max-w-none space-y-4 text-left text-base leading-relaxed text-[#4a3a35] md:text-lg">
                                <p>{product.introducingSection.paragraph1}</p>
                                <p>{product.introducingSection.paragraph2}</p>
                                {paragraph3WithoutQuote ? <p>{paragraph3WithoutQuote}</p> : null}
                                <blockquote className="rounded-lg border border-[#e8ddd4] bg-[#f5ebe3]/75 px-4 py-3 font-serif text-lg italic font-semibold text-[#8b4a5c] md:text-xl">
                                    {quoteText}
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/** When API/CDN paths fail, use bundled public assets (matches `public/images/{Jasmine,Damask,Yang}`). */
const DISCOVER_CARD_IMAGE_FALLBACK: Record<string, string> = {
    jasmine: "/images/Jasmine/1.jpg",
    "leira-jasmine": "/images/Jasmine/1.jpg",
    "jasmine-inner-perfume-for-women": "/images/Jasmine/1.jpg",
    "damask-rose": "/images/Damask/1.jpg",
    "leira-damask-rose": "/images/Damask/1.jpg",
    "ylang-ylang": "/images/Yang/1.jpg",
    "leira-ylang-ylang": "/images/Yang/1.jpg",
};

function renderDiscoverCardText(value: string) {
    const parts = String(value || "").split(/(\*\*[^*]+\*\*|~~[^~]+~~)/g);

    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={index} className="font-bold text-white">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith("~~") && part.endsWith("~~")) {
            return (
                <span key={index} className="text-white/80 line-through decoration-pink-300 decoration-2">
                    {part.slice(2, -2)}
                </span>
            );
        }
        return part;
    });
}

function DiscoverEditorialCard({
    href,
    productName,
    imageCandidates,
    teaserAlt,
    teaserDescription,
    tagline,
    overlayGradient,
    isOutOfStock,
    index,
}: {
    href: string;
    productName: string;
    imageCandidates: string[];
    teaserAlt: string;
    teaserDescription?: string;
    tagline?: string;
    overlayGradient: string;
    isOutOfStock: boolean;
    index: number;
}) {
    const deduped = [...new Set(imageCandidates.filter(Boolean))];
    const candidates = deduped.length ? deduped : ["/images/placeholder.png"];
    const [srcIndex, setSrcIndex] = useState(0);
    const src = candidates[Math.min(srcIndex, candidates.length - 1)] ?? "/images/placeholder.png";
    const displayName = productName.replace(/^leira\s+/i, "").toUpperCase();

    return (
        <Link
            href={href}
            className="group relative block aspect-[3/5] w-full overflow-hidden rounded-xl shadow-[0_14px_34px_rgba(44,24,24,0.12)] ring-1 ring-[#d9bfae]/55 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(44,24,24,0.16)]"
        >
            {/* eslint-disable-next-line @next/next/no-img-element -- responsive fallbacks + avoids optimizer/host mismatch on upload URLs */}
            <img
                src={src}
                alt={teaserAlt}
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                onError={() => setSrcIndex((i) => (i < candidates.length - 1 ? i + 1 : i))}
            />
            <div
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
                style={{ background: overlayGradient }}
                aria-hidden
            />
            {isOutOfStock ? (
                <div className="absolute top-3 right-3 z-[2] rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md">
                    Out of Stock
                </div>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col justify-end p-3 pb-4 font-sans text-white sm:p-4 sm:pb-5">
                <p className="font-serif text-[13px] font-semibold uppercase tracking-[0.08em] text-white drop-shadow-sm sm:text-[16px]">
                    {displayName}
                </p>
                {tagline ? (
                    <p className="mt-1 font-serif text-[12px] italic leading-snug text-white/92 drop-shadow-sm sm:text-[14px]">
                        {tagline}
                    </p>
                ) : null}
                {teaserDescription ? (
                    <p className="mt-2 line-clamp-3 break-words text-[10px] leading-snug text-white/90 drop-shadow-sm sm:text-[12px]">
                        {renderDiscoverCardText(teaserDescription)}
                    </p>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white drop-shadow-sm sm:text-[10px]">
                    Shop now
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </span>
            </div>
        </Link>
    );
}

/** Same grid + headers as homepage; parent should call `useProducts` once and pass `products` + `loading` for both combo + default strips. */
export const ProductCardsSectionContent = ({
    products,
    loading,
    variant = "default",
}: {
    products: HookProduct[];
    loading: boolean;
    /** `combo` = homepage strip above “Loved by women”; same cards, only products flagged in admin */
    variant?: "default" | "combo";
}) => {
    const toSlug = (value: string) =>
        String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .replace(/-{2,}/g, "-");

    const gridProducts = useMemo(() => {
        if (variant === "combo") {
            const safeOrder = (v: unknown) => {
                const n = Number(v);
                return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
            };
            return [...products]
                .filter((p) => Boolean(p.showInComboSection))
                .sort((a, b) => {
                    const byOrder = safeOrder(a.comboSectionOrder) - safeOrder(b.comboSectionOrder);
                    if (byOrder !== 0) return byOrder;
                    return String(a.name || "").localeCompare(String(b.name || ""));
                });
        }
        const isShopVisible = (p: HookProduct) => {
            if (typeof p.showInShopSection === "boolean") return p.showInShopSection;
            return !Boolean(p.showInComboSection);
        };
        const safeOrder = (v: unknown) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
        };
        return [...products]
            .filter(isShopVisible)
            .sort((a, b) => {
                const byOrder = safeOrder(a.shopSectionOrder) - safeOrder(b.shopSectionOrder);
                if (byOrder !== 0) return byOrder;
                return String(a.name || "").localeCompare(String(b.name || ""));
            });
    }, [products, variant]);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { success, error } = useToast();
    const router = useRouter();
    const [reviewStatsMap, setReviewStatsMap] = useState<Record<string, { avgRating: number; totalCount: number }>>({});
    // NOTE: Removed `useScroll` parallax due to hydration issues in Next/Turbopack.
    // Keep layout stable without scroll-bound transforms.
    const backgroundOpacity = 0.35;

    useEffect(() => {
        let mounted = true;
        const productIds = gridProducts.map((p) => p._id).filter((id): id is string => !!id);
        const loadReviewStats = async () => {
            if (!productIds.length) {
                setReviewStatsMap({});
                return;
            }
            try {
                const res = await reviewAPI.getStatsByProducts(productIds);
                if (mounted && res?.success) setReviewStatsMap(res.data || {});
            } catch {
                if (mounted) setReviewStatsMap({});
            }
        };
        loadReviewStats();
        return () => {
            mounted = false;
        };
    }, [gridProducts]);

    const handleWishlistToggle = async (product: { _id?: string; id?: string }) => {
        const productId = product._id || product.id;
        if (!productId) return;
        try {
            if (isInWishlist(productId)) {
                await removeFromWishlist(productId);
                success("Removed from wishlist");
            } else {
                await addToWishlist(productId);
                success("Added to wishlist");
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (msg.includes("log in")) {
                error("Please log in to add to wishlist");
                router.push("/login");
            } else {
                error(msg || "Could not update wishlist");
            }
        }
    };

    const handleAddToCart = async (product: {
        _id?: string;
        id?: string;
        name: string;
        price?: string;
        images?: string[];
        folderPath?: string;
        homeCardImage?: string;
        shopCardImage?: string;
        stock?: number;
        status?: string;
    }) => {
        const productId = product._id || product.id;
        if (!productId) return;
        const isOutOfStock = product.status === "inactive" || Number(product.stock ?? 0) <= 0;
        if (isOutOfStock) {
            error("This product is out of stock");
            return;
        }
        const thumbPath = pickShopCardPath(product);
        const imageUrl = thumbPath
            ? resolveMediaUrl(thumbPath)
            : "/images/placeholder.png";
        const snapshot = { name: product.name, price: product.price || "₹0", imageUrl };
        try {
            await addToCart(productId, 1, snapshot);
            success("Added to cart");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (msg.includes("customer to add to cart")) {
                error("Please log in as a customer to add to cart");
                router.push("/login");
            } else if (msg.includes("Not authorized") || msg.includes("User not found")) {
                error("Please log in to add to cart");
                router.push("/login");
            } else {
                error(msg || "Could not add to cart");
            }
        }
    };

    const getProductPath = (product: { id?: string; _id?: string; name?: string }) =>
        getProductShopPath(product);

    const defaultDiscoverOverlay =
        "linear-gradient(to top, rgba(92,45,45,0.93) 0%, rgba(92,45,45,0.48) 42%, rgba(92,45,45,0.1) 65%, transparent 78%)";

    /** Bottom image overlay gradient for homepage “Discover” editorial cards (text sits on photo). */
    const discoverCardOverlayBySlug: Record<string, string> = {
        "damask-rose":
            "linear-gradient(to top, rgba(74,44,42,0.94) 0%, rgba(110,83,72,0.55) 38%, rgba(110,83,72,0.12) 62%, transparent 78%)",
        "leira-damask-rose":
            "linear-gradient(to top, rgba(74,44,42,0.94) 0%, rgba(110,83,72,0.55) 38%, rgba(110,83,72,0.12) 62%, transparent 78%)",
        jasmine:
            "linear-gradient(to top, rgba(47,52,44,0.93) 0%, rgba(90,99,85,0.52) 40%, rgba(90,99,85,0.12) 63%, transparent 78%)",
        "leira-jasmine":
            "linear-gradient(to top, rgba(47,52,44,0.93) 0%, rgba(90,99,85,0.52) 40%, rgba(90,99,85,0.12) 63%, transparent 78%)",
        "jasmine-inner-perfume-for-women":
            "linear-gradient(to top, rgba(47,52,44,0.93) 0%, rgba(90,99,85,0.52) 40%, rgba(90,99,85,0.12) 63%, transparent 78%)",
        "ylang-ylang":
            "linear-gradient(to top, rgba(58,48,32,0.94) 0%, rgba(107,90,61,0.54) 38%, rgba(107,90,61,0.12) 62%, transparent 78%)",
        "leira-ylang-ylang":
            "linear-gradient(to top, rgba(58,48,32,0.94) 0%, rgba(107,90,61,0.54) 38%, rgba(107,90,61,0.12) 62%, transparent 78%)",
    };

    if (variant === "combo" && gridProducts.length === 0) {
        return null;
    }

    return (
        <section 
            id={variant === "combo" ? "leira-combo-section" : undefined}
            aria-labelledby={variant === "combo" ? "leira-combo-heading" : undefined}
            className={`relative z-10 overflow-hidden ${
                variant === "combo"
                    ? "scroll-mt-28 bg-[#faf7f2] px-4 py-14 sm:px-6 sm:py-16 md:py-24"
                    : "bg-[#fbf2ed] px-4 py-10 sm:px-6 md:py-12 lg:px-8 xl:px-10"
            }`}
        >
            {variant === "combo" ? (
                <>
                    {/* Animated Background Gradient */}
                    <motion.div 
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: "radial-gradient(circle at 20% 30%, rgba(255, 20, 147, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 165, 0, 0.08) 0%, transparent 50%)",
                            opacity: backgroundOpacity,
                        }}
                    />

                    {/* Floating Decorative Elements */}
                    <motion.div
                        className="absolute top-10 left-10 h-40 w-40 rounded-full bg-linear-to-br from-pink-200/15 to-pink-300/15 blur-3xl"
                        animate={{
                            y: [0, 40, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="absolute right-10 bottom-10 h-48 w-48 rounded-full bg-linear-to-br from-orange-200/15 to-amber-200/15 blur-3xl"
                        animate={{
                            y: [0, -50, 0],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.5,
                        }}
                    />
                </>
            ) : (
                <>
                    <div
                        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 max-w-[min(45vw,320px)] bg-[radial-gradient(ellipse_at_bottom_left,rgba(196,160,138,0.14),transparent_70%)]"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 max-w-[min(45vw,320px)] bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,74,92,0.09),transparent_70%)]"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(ellipse_at_bottom,rgba(196,160,138,0.20),transparent_68%)]"
                        aria-hidden
                    />
                </>
            )}

            <div className="relative mx-auto min-w-0 max-w-7xl" data-nosnippet>

                {/* Combo strip: centered header */}
                {variant === "combo" ? (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ 
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    className="mb-10 text-center sm:mb-12 md:mb-14"
                >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-pink-200/60 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-600 shadow-sm backdrop-blur-sm sm:mb-6 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
                            >
                                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                The curated edit
                            </motion.div>
                            <motion.h2
                                id="leira-combo-heading"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="mb-5 break-words px-1 text-balance text-2xl leading-tight font-semibold text-pink-600 sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl"
                            >
                                Shop Leira Combo &amp; Intimate Perfume Sets — India
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="mx-auto max-w-2xl px-1 text-base leading-relaxed font-light text-neutral-600 md:text-lg"
                            >
                                2 drops for all-day freshness
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.55, duration: 0.6 }}
                                className="mt-6"
                            >
                                <Link
                                    href="/combo"
                                    className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-pink-600 transition-colors decoration-pink-300/80 underline-offset-4 hover:text-pink-700 hover:decoration-pink-500"
                                >
                                    View the full curated collection
                                    <span aria-hidden className="translate-y-px">→</span>
                                </Link>
                            </motion.div>
                </motion.div>
                ) : null}

                {/* Product grid: default = editorial two-column; combo = reveal cards */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#8b4a5c] border-t-transparent" />
                        <p className="text-[#4a3a35]">Loading products...</p>
                    </div>
                ) : variant === "default" ? (
                <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-3 xl:gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full shrink-0 lg:max-w-[min(32%,360px)] xl:max-w-[380px]"
                    >
                        <div className="flex h-full w-full flex-col items-center justify-center text-center lg:items-start lg:text-left">
                            <div className="flex w-full max-w-[15rem] flex-col items-center text-center">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#5c3d35]/90">
                                    The Leira Collection
                                </p>
                                <div className="mt-3 flex w-24 items-center justify-center gap-2 text-[#9b7652]">
                                    <span className="h-px flex-1 bg-[#c8ad97]" />
                                    <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                    <span className="h-px flex-1 bg-[#c8ad97]" />
                                </div>
                            </div>
                            <h2 className="mt-6 max-w-[25rem] px-1 font-serif text-[clamp(1.65rem,4.2vw,2.55rem)] font-medium leading-[1.08] tracking-[-0.025em] text-[#33211f] text-balance text-center lg:max-w-none lg:px-0 lg:text-left">
                                Intimate Odour Meet a Gentle Solution
                            </h2>
                            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-[#4a3a35] text-pretty md:text-base lg:max-w-[18rem] lg:text-left">
                                Infused with pure essential oils, each fragrance is carefully created to keep you fresh confident and unstoppable
                            </p>
                            <Link
                                href="/shop"
                                className="mt-8 inline-flex items-center gap-4 rounded-lg border border-[#9b6b61]/60 bg-transparent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5c2d2d] transition-colors hover:bg-[#8b4a5c]/10"
                            >
                                Explore collection
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                        </div>
                    </motion.div>

                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 min-[520px]:grid-cols-3 lg:gap-3">
                    {gridProducts.map((product, index) => {
                        const detailPaths = pickDetailGalleryPaths(product);
                        const imageGallery = detailPaths.map((pth) => resolveMediaUrl(pth));
                        const homePath = pickHomeCardPath(product);
                        const imageUrl = homePath ? resolveMediaUrl(homePath) : imageGallery[0] || "/images/placeholder.png";
                        const isOutOfStock = product.status === 'inactive' || Number(product.stock ?? 0) <= 0;
                        const slug = toSlug(product.id || product.name || "");
                        const teaserDescription = pickHomeCardDescription(product);
                        const teaserAltBySlug: Record<string, string> = {
                            jasmine: "Leira Jasmine Intimate Perfume Teaser",
                            "leira-jasmine": "Leira Jasmine Intimate Perfume Teaser",
                            "damask-rose": "Leira Damask Rose Intimate Perfume Teaser",
                            "leira-damask-rose": "Leira Damask Rose Intimate Perfume Teaser",
                            "ylang-ylang": "Leira Ylang Ylang Intimate Perfume Teaser",
                            "leira-ylang-ylang": "Leira Ylang Ylang Intimate Perfume Teaser",
                        };
                        const teaserAlt = teaserAltBySlug[slug] || `${product.name} Intimate Perfume Teaser`;
                        const overlayGradient = discoverCardOverlayBySlug[slug] || defaultDiscoverOverlay;
                        const homepageTagline = pickHomeCardTagline(product);
                        const discoverCandidates = [
                            imageUrl,
                            DISCOVER_CARD_IMAGE_FALLBACK[slug],
                            "/images/placeholder.png",
                        ].filter(Boolean) as string[];

                        return (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, y: 48 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ 
                                    delay: index * 0.12,
                                    duration: 0.65,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                className="relative w-full"
                            >
                                <DiscoverEditorialCard
                                    href={getProductPath(product)}
                                    productName={product.name}
                                    imageCandidates={discoverCandidates}
                                    teaserAlt={teaserAlt}
                                    teaserDescription={teaserDescription || undefined}
                                    tagline={homepageTagline || undefined}
                                    overlayGradient={overlayGradient}
                                    isOutOfStock={isOutOfStock}
                                    index={index}
                                />
                            </motion.div>
                        );
                    })}
                    </div>
                </div>
                ) : (
                <motion.div
                    className="mx-auto grid min-w-0 max-w-6xl grid-cols-2 justify-items-stretch gap-4 sm:gap-8 lg:grid-cols-3"
                >
                    {gridProducts.map((product, index) => {
                        const detailPaths = pickDetailGalleryPaths(product);
                        const detailGallery = detailPaths.map((pth) => resolveMediaUrl(pth));
                        const homePath = pickHomeCardPath(product);
                        const homeResolved = homePath ? resolveMediaUrl(homePath) : detailGallery[0] || "/images/placeholder.png";
                        const carouselUrls = [
                            homeResolved,
                            ...detailGallery.filter((u) => u !== homeResolved),
                        ].filter(Boolean);
                        const safeCarousel = carouselUrls.length > 0 ? carouselUrls : ["/images/placeholder.png"];

                        const currentPrice = product.price || "₹2,999.00";
                        const cardOriginal = strikethroughPriceIfHigher(
                            currentPrice,
                            product.originalPrice
                        );
                        const isOutOfStock = product.status === 'inactive' || Number(product.stock ?? 0) <= 0;
                        const stats = product._id ? reviewStatsMap[product._id] : undefined;
                        const rating = stats?.avgRating || 0;
                        const reviewCount = stats?.totalCount || 0;
                        const slug = toSlug(product.id || product.name || "");
                        const cardTagline = pickShopCardTagline(product);
                        const cardDescription = pickShopCardDescription(product);
                        const teaserAltBySlug: Record<string, string> = {
                            jasmine: "Leira Jasmine Intimate Perfume Teaser",
                            "leira-jasmine": "Leira Jasmine Intimate Perfume Teaser",
                            "damask-rose": "Leira Damask Rose Intimate Perfume Teaser",
                            "leira-damask-rose": "Leira Damask Rose Intimate Perfume Teaser",
                            "ylang-ylang": "Leira Ylang Ylang Intimate Perfume Teaser",
                            "leira-ylang-ylang": "Leira Ylang Ylang Intimate Perfume Teaser",
                        };
                        const teaserAlt = teaserAltBySlug[slug] || `${product.name} Intimate Perfume Teaser`;
                        
                        return (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ 
                                    delay: 0.6 + index * 0.15,
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="relative w-full max-w-full lg:max-w-sm lg:mx-auto"
                            >
                                {isOutOfStock && (
                                    <div className="absolute top-4 right-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                        Out of Stock
                                    </div>
                                )}
                                <ProductRevealCard
                                    images={safeCarousel}
                                    imageAlt={teaserAlt}
                                    name={product.name}
                                    price={currentPrice}
                                    originalPrice={cardOriginal}
                                    tagline={cardTagline}
                                    description={cardDescription}
                                    rating={rating}
                                    reviewCount={reviewCount}
                                    showReviewsOnCard={Boolean(product.showReviewsOnCard)}
                                    onFavorite={() => handleWishlistToggle(product)}
                                    isFavorite={isInWishlist(product._id || product.id || "")}
                                    onAdd={() => !isOutOfStock && handleAddToCart(product)}
                                    onViewDetails={() => router.push(getProductPath(product))}
                                    className="mx-auto w-full max-w-full"
                                />
                            </motion.div>
                        );
                    })}
                </motion.div>
                )}

                {variant === "default" ? (
                <>
                {/* How to use + care (editorial two-column) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-14 border-t border-[#e8ddd4]/35 pt-12 md:mt-16 md:pt-16"
                >
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-x-12">
                            {/* How to use */}
                            <div className="border-[#e8ddd4]/40 border-b pb-12 lg:border-r lg:border-b-0 lg:pb-0 lg:pr-10">
                                <h2 className="text-center font-serif text-base font-semibold uppercase tracking-[0.14em] text-[#5c2d2d] sm:text-lg md:text-xl lg:text-left">
                                    How to use
                                </h2>

                                <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:mt-10 lg:grid-cols-4 lg:gap-x-2">
                                    {(
                                        [
                                            {
                                                icon: (
                                                    <Droplets
                                                        className="h-6 w-6 text-[#8b4a5c]"
                                                        aria-hidden
                                                        strokeWidth={1.35}
                                                    />
                                                ),
                                                step: "Step 1",
                                                text: "Apply after shower on clean, dry skin for the best results.",
                                            },
                                            {
                                                icon: (
                                                    <Pipette
                                                        className="h-6 w-6 text-[#8b4a5c]"
                                                        aria-hidden
                                                        strokeWidth={1.35}
                                                    />
                                                ),
                                                step: "Step 2",
                                                text: "Use the precision dropper for 1–2 drops, clean and controlled.",
                                            },
                                            {
                                                icon: (
                                                    <UserRound
                                                        className="h-6 w-6 text-[#8b4a5c]"
                                                        aria-hidden
                                                        strokeWidth={1.35}
                                                    />
                                                ),
                                                step: "Step 3",
                                                text: "Apply to the external intimate or private area. Let it absorb.",
                                            },
                                            {
                                                icon: (
                                                    <Sparkles
                                                        className="h-6 w-6 text-[#8b4a5c]"
                                                        aria-hidden
                                                        strokeWidth={1.35}
                                                    />
                                                ),
                                                step: "Step 4",
                                                text: "Do a patch test on less sensitive skin first; once comfortable, use daily as part of your routine.",
                                            },
                                        ] as const
                                    ).map((item) => (
                                        <div
                                            key={item.step}
                                            className="flex flex-col items-center text-center"
                                        >
                                            <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#c5a07d]/55 bg-transparent">
                                                {item.icon}
                                            </div>
                                            <p className="font-serif text-[10px] font-bold uppercase tracking-[0.18em] text-[#5c2d2d] sm:text-xs sm:tracking-[0.2em]">
                                                {item.step}
                                            </p>
                                            <p className="mt-2 text-[11px] leading-relaxed text-[#4a3a35] sm:text-xs">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-10 text-center text-[11px] text-[#5c3d35]/75 lg:text-left">
                                    For external use only.
                                </p>
                            </div>

                            {/* Made with care */}
                            <div className="lg:pl-10">
                                <h2 className="text-center font-serif text-base font-semibold uppercase tracking-[0.14em] text-[#5c2d2d] sm:text-lg md:text-xl lg:text-left">
                                    Made with care, just for you
                                </h2>
                                <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 min-[420px]:grid-cols-3 lg:grid-cols-5 lg:gap-x-3">
                                    {(
                                        [
                                            {
                                                label: "100% organic essential oils",
                                                icon: <Leaf className="h-5 w-5" strokeWidth={1.35} aria-hidden />,
                                            },
                                            {
                                                label: "Alcohol & paraben free",
                                                icon: <WineOff className="h-5 w-5" strokeWidth={1.35} aria-hidden />,
                                            },
                                            {
                                                label: "pH balanced formula",
                                                icon: (
                                                    <span className="text-sm font-bold leading-none text-[#8b4a5c]">pH</span>
                                                ),
                                            },
                                            {
                                                label: "Dermatologist tested",
                                                icon: <ShieldCheck className="h-5 w-5" strokeWidth={1.35} aria-hidden />,
                                            },
                                            {
                                                label: "Made for Indian climate & skin",
                                                icon: <ThermometerSun className="h-5 w-5" strokeWidth={1.35} aria-hidden />,
                                            },
                                        ] as { label: string; icon: ReactNode }[]
                                    ).map((row) => (
                                        <div key={row.label} className="flex flex-col items-center text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#8b4a5c]/25 bg-transparent text-[#8b4a5c]">
                                                {row.icon}
                                            </div>
                                            <p className="max-w-[9.5rem] text-[11px] font-medium leading-snug text-[#5c3d35] sm:text-xs">
                                                {row.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-[#e8ddd4]/70 bg-[#faf7f2]/40 px-4 py-5 sm:px-6 lg:mt-14">
                            <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-5">
                                <div className="flex shrink-0 justify-center sm:justify-start">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#8b4a5c]/30 bg-transparent text-[#8b4a5c]">
                                        <Heart className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1 text-center sm:text-left">
                                    <p className="font-semibold text-[#5c2d2d]">We are here for you!</p>
                                    <p className="mt-1 text-sm leading-relaxed text-[#4a3a35]">
                                        Have questions? Our experts are just a message away.
                                    </p>
                                </div>
                                <a
                                    href="https://wa.me/919810822968"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-[#8b4a5c] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(139,74,92,0.25)] transition-colors hover:bg-[#7a4050] sm:w-auto sm:self-center"
                                >
                                    WhatsApp us
                                </a>
                            </div>
                        </div>
                </motion.div>
                </>
                ) : null}
            </div>
        </section>
    );
};

/** Use when this is the only product grid on the page (one internal fetch). Homepage uses `HomeProductSections` + `ProductCardsSectionContent` instead. */
export const ProductCardsSection = ({
    initialProducts = [],
    variant = "default",
}: {
    initialProducts?: HookProduct[];
    variant?: "default" | "combo";
}) => {
    const { products, loading } = useProducts(initialProducts);
    return <ProductCardsSectionContent products={products} loading={loading} variant={variant} />;
};

export const BenefitsSection = ({ product }: { product: Product }) => {
    // Removed `useScroll` parallax due to hydration issues in Next/Turbopack.
    const panelsY = 0;
    const imageScale = 1;
    const backgroundOpacity = 0.08;

    return (
        <section 
            className="py-32 md:py-40 px-6 relative z-10 bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden"
        >
            {/* Decorative Background Elements */}
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    background: "radial-gradient(circle at 10% 20%, rgba(13, 74, 58, 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)",
                    opacity: backgroundOpacity,
                }}
            />

            {/* Thin blue vertical line on left with glow */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-400 shadow-lg shadow-blue-500/50" />

            {/* Floating decorative elements */}
            <motion.div
                className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-teal-200/10 to-green-200/10 blur-3xl"
                animate={{
                    y: [0, 30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="container mx-auto max-w-7xl relative">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
                    {/* Leftmost Panel - Dark Teal with Premium Effects */}
                    <motion.div
                        style={{ y: panelsY }}
                        initial={{ opacity: 0, x: -80, scale: 0.95 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="md:col-span-1 rounded-3xl bg-gradient-to-br from-[#0d4a3a] to-[#0a3d2e] text-white p-10 flex flex-col justify-between shadow-2xl border border-teal-900/30 relative overflow-hidden group"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-teal-600/0 group-hover:from-teal-400/10 group-hover:to-teal-600/10 transition-all duration-500 rounded-3xl" />
                        
                        {/* Top Section - Cooling Sensation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="mb-10 relative z-10"
                        >
                            <motion.div
                                whileHover={{ rotate: 180, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className="mb-6"
                            >
                                <Snowflake className="w-10 h-10 text-white drop-shadow-lg" />
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">COOLING SENSATION</h3>
                            <p className="text-sm text-white/90 leading-relaxed font-light">
                                Provides a gentle, non-irritating cooling effect, which can help relieve discomfort, itchiness, or a feeling of heat in the intimate area.
                            </p>
                        </motion.div>
                        
                        <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-8" />
                        
                        {/* Bottom Section - Mental & Mood Uplift */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="relative z-10"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6"
                            >
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                                    </svg>
                                </div>
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">MENTAL & MOOD UPLIFT</h3>
                            <p className="text-sm text-white/90 leading-relaxed font-light">
                                The aroma of peppermint has a calming and energizing effect, which can help boost confidence and reduce stress—especially during menstruation or intimacy.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Central Product Image with Premium Effects */}
                    <motion.div
                        style={{ scale: imageScale }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="md:col-span-1 flex items-stretch relative z-10 w-full h-full"
                    >
                        <div className="relative group w-full h-full flex items-center justify-center">
                            {/* Glow effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden w-full h-full flex items-center justify-center p-8">
                                {/* Decorative lines */}
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                                <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                                
                                <div className="w-full h-full relative flex items-center justify-center">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full relative"
                                    >
                                        <Image
                                            src="/images/open.JPEG"
                                            alt={product.name}
                                            fill
                                            className="object-contain drop-shadow-2xl"
                                            loading="lazy"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Section - Split into two */}
                    <div className="md:col-span-2 flex flex-col gap-8">
                        {/* Upper Right - Blue Background with Premium Effects */}
                        <motion.div
                            style={{ y: panelsY }}
                            initial={{ opacity: 0, x: 80, scale: 0.95 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 flex flex-col justify-between shadow-2xl border border-blue-500/30 relative overflow-hidden group"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-500/0 group-hover:from-blue-400/20 group-hover:to-blue-500/20 transition-all duration-500 rounded-3xl" />
                            
                            {/* Top Section - Soothing Irritation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="mb-10 relative z-10"
                            >
                                <motion.div
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-6"
                                >
                                    <Wind className="w-10 h-10 text-white drop-shadow-lg" />
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">SOOTHING IRRITATION</h3>
                                <p className="text-sm text-white/90 leading-relaxed font-light">
                                    Its anti-inflammatory properties can soothe minor irritation, itching, or redness on the outer genital skin (vulva).
                                </p>
                            </motion.div>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-8" />
                            
                            {/* Bottom Section - Odor Control */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                                className="relative z-10"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-6"
                                >
                                    <TreePine className="w-10 h-10 text-white drop-shadow-lg" />
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">ODOR CONTROL</h3>
                                <p className="text-sm text-white/90 leading-relaxed font-light">
                                    By refreshing the area and reducing moisture, it may help with odor control when used in combination with other deodorizing or antibacterial ingredients.
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Lower Right - Light Gray Background with Premium Effects */}
                        <motion.div
                            style={{ y: panelsY }}
                            initial={{ opacity: 0, x: 80, scale: 0.95 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.01 }}
                            className="rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 text-black p-10 flex flex-col shadow-xl border border-gray-300/50 relative overflow-hidden"
                        >
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                                className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-8 leading-tight"
                            >
                                WHY LEIRA IS GOOD FOR YOU?
                            </motion.h2>
                            
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ delay: 0.8, duration: 0.3 }}
                                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl mb-10 transition-all duration-300 w-fit shadow-lg hover:shadow-xl"
                            >
                                MORE BENEFITS
                            </motion.button>
                            
                            {/* Alcohol-Free & Organic */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-6"
                                >
                                    <Leaf className="w-10 h-10 text-black" />
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">ALCOHOL-FREE & 100% ORGANIC</h3>
                                <p className="text-sm text-gray-700 leading-relaxed font-light">
                                    Leira is formulated with 100% organic essential oils and is completely alcohol-free — making it safe for daily use on your most sensitive intimate area and bikini area. No harsh chemicals. No synthetic additives. Just pure botanical cares your skin can trust.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const DetailsSection = ({ product }: { product: Product }) => (
    <section className="py-24 px-6 container mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24 relative z-10">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 aspect-square rounded-3xl bg-neutral-900 border border-white/10 overflow-hidden shadow-2xl relative group"
        >
            <div className="absolute inset-0 flex items-center justify-center text-neutral-600 font-medium bg-neutral-900">
                [ Image: {product.detailsSection.imageAlt} ]
            </div>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8"
        >
            <h3 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {product.detailsSection.title}
            </h3>
            <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed font-light">
                {product.detailsSection.description}
            </p>
        </motion.div>
    </section>
);

export const FreshnessSection = ({ product }: { product: Product }) => (
    <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 text-center max-w-5xl">
            <motion.h3
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold mb-8 text-white tracking-tight"
            >
                {product.freshnessSection.title}
            </motion.h3>
            <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-neutral-400 leading-relaxed max-w-3xl mx-auto"
            >
                {product.freshnessSection.description}
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                {product.stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-white/5 hover:border-white/20 transition-colors"
                    >
                        <div
                            className="text-5xl md:text-6xl font-bold mb-3"
                            style={{ color: product.themeColor }}
                        >
                            {stat.val}
                        </div>
                        <div className="text-sm uppercase tracking-[0.2em] text-neutral-500 font-bold">
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export const BuyNowSection = ({ product }: { product: Product }) => (
    <section className="py-32 px-6 container mx-auto relative z-10">
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-20 shadow-2xl flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-10">
                <h3 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                    Pure. Simple. <br />
                    <span style={{ color: product.themeColor }}>Fast.</span>
                </h3>
                <div className="flex flex-wrap gap-4">
                    {product.buyNowSection.processingParams.map((p, i) => (
                        <span
                            key={i}
                            className="px-6 py-2 rounded-full border border-white/20 text-sm font-bold text-neutral-300 tracking-wider uppercase"
                        >
                            {p}
                        </span>
                    ))}
                </div>
                <div className="space-y-4 text-neutral-400 font-medium text-lg">
                    <p className="flex items-center gap-4">
                        <span className="text-2xl">🚚</span>{" "}
                        {product.buyNowSection.deliveryPromise}
                    </p>
                    <p className="flex items-center gap-4">
                        <span className="text-2xl">🛡️</span>{" "}
                        {product.buyNowSection.returnPolicy}
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full max-w-md flex flex-col items-center p-10 bg-black rounded-3xl border border-white/10 shadow-inner ring-1 ring-white/5">
                <div className="text-xs uppercase text-neutral-500 font-bold tracking-[0.2em] mb-4">
                    One-Time Purchase
                </div>
                <div
                    className="text-7xl font-bold mb-2 tracking-tighter"
                    style={{ color: product.themeColor }}
                >
                    {product.buyNowSection.price}
                </div>
                <div className="text-neutral-500 mb-10 font-medium">
                    {product.buyNowSection.unit}
                </div>
                <button
                    className="w-full py-5 rounded-2xl text-black font-bold text-xl shadow-[0_0_40px_-10px] transform hover:scale-[1.02] active:scale-[0.98] transition-all"
                    style={{
                        background: product.themeColor,
                        boxShadow: `0 0 30px -5px ${product.themeColor}40`
                    }}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    </section>
);

export const FeaturesSection = () => {
    const contentY = 0;

    return (
        <section className="relative z-10 overflow-hidden bg-[#faf7f2] px-4 py-14 sm:px-4 sm:py-20 md:py-24 lg:pl-6 lg:pr-8 xl:pl-10">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.55]"
                aria-hidden
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,74,92,0.06), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(197,160,138,0.07), transparent 50%)",
                }}
            />

            <div className="relative mx-auto min-w-0 max-w-7xl">
                <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-10 px-1 text-center font-sans text-xl font-bold uppercase tracking-[0.06em] text-[#8b4a5c] text-balance sm:mb-12 sm:text-2xl md:mb-16 md:text-3xl lg:text-4xl"
                >
                    Why Leira is good for you?
                </motion.h2>
                <motion.div style={{ y: contentY }}>
                    <FeaturesSectionWithHoverEffects />
                </motion.div>
            </div>
        </section>
    );
};

export const TestimonialsSection = () => {
    return <Testimonials />;
};

export const FAQSection = () => {
    return <FAQs />;
};

export const ProductsSection = () => {
    const { products, loading } = useProducts();
    // Original prices for discount display
    const productPrices = {
        "jasmine": { original: "₹3,000.00", current: "₹2,999.00" },
        "ylang-ylang": { original: "₹3,200.00", current: "₹2,999.00" },
        "damask-rose": { original: "₹3,200.00", current: "₹2,999.00" },
    };

    return (
        <section className="py-24 md:py-32 px-6 relative z-10 bg-white">
            <div className="container mx-auto max-w-7xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-gray-500 text-sm uppercase tracking-[0.3em] font-semibold mb-4">
                        DISCOVER OUR PRODUCTS
                    </p>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 leading-tight">
                        Loved by Women Everywhere
                    </h2>
                </motion.div>

                {/* Product Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading products...</p>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {products.map((product, index) => {
                        const prices = productPrices[product.id as keyof typeof productPrices] || { original: "₹3,000.00", current: product.price };
                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <ProductCard
                                    imageUrl={`${product.folderPath}/1.jpg`}
                                    title={product.name.toUpperCase()}
                                    originalPrice={prices.original}
                                    currentPrice={prices.current}
                                    href={`#${product.id}`}
                                    showDiscount={true}
                                    discountPercent={10}
                                />
                            </motion.div>
                        );
                    })}
                </div>
                )}
            </div>
        </section>
    );
};
