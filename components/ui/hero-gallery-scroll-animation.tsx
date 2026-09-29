"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Cormorant_Garamond, Playfair_Display, Montserrat } from "next/font/google";
import { Droplet, Flower2, Leaf, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heroPlayfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

const heroMontserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const heroCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

/** Reference palette */
const MD = {
  gold: "#C5A059",
  maroon: "#B85C5C",
  /** CTA pill — reference dusty rose */
  ctaBg: "#ec4899",
  ink: "#8B4A5C",
  body: "#5C4033",
  cream: "#F9F3EB",
  creamBorder: "#E8DDD0",
} as const;

const HERO_TITLE = "India's First Intimate Luxury Perfume for Women.";
const HERO_KICKER = "Confidence down there";
const HERO_SUBTITLE =
  "Essential oil-based, alcohol-free & pH-balanced — designed for your most sensitive skin. Natural intimate freshness that seduces, lasts, and feels like you.";

type HeroGalleryProps = {
  /** When true, show a CTA that scrolls to the Combo section on the homepage */
  showComboSectionLink?: boolean;
};

type HeroGallerySlide = {
  src: string;
  alt: string;
  className: string;
  overlay: string;
  mobileSrc?: string;
  mobileClassName?: string;
  href?: string;
  /** Skip Next image optimizer for maximum PNG sharpness (large hero creatives). */
  unoptimized?: boolean;
  /** When false, banner art includes copy — hide left text column and heavy scrims. */
  showTextOverlay?: boolean;
  /**
   * `fill` = image covers a tall min-height box (may crop). `intrinsic` = full art, 100vw wide, height from aspect ratio (premium campaign banners).
   */
  imageLayout?: "fill" | "intrinsic";
  /** Native pixel size of desktop asset (for aspect ratio only with `intrinsic`). */
  intrinsicDesktop?: { width: number; height: number };
  /** Native pixel size of mobile asset. */
  intrinsicMobile?: { width: number; height: number };
  /** Editable HTML campaign block (fonts + colors); sits over intrinsic banner. */
  campaignCopy?: "mothers-day";
};

const MOTHERS_DAY_DESKTOP = "/bandesk.png";
const MOTHERS_DAY_MOBILE = "/banmob1.png";
const SUMMER_DESKTOP = "/Summer Banner- Desktop - Copy.png";
const SUMMER_MOBILE = "/Summer Banner Phone.png";

/** Display aspect for desktop (optimizer resizes from source). */
const HERO_DESKTOP_LAYOUT = { width: 1024, height: 576 } as const;
/** Match `public/banmob.png` native ratio so full art height renders (no bottom clip). */
const HERO_MOBILE_LAYOUT = { width: 576, height: 1024 } as const;
const HERO_IMAGE_QUALITY = 82;

function GoldHeartOutline({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("inline-block h-[0.5em] w-[0.5em] shrink-0 align-baseline text-[#C5A059]", className)}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const goldSerifClip =
  "bg-linear-to-br from-[#C5A059] via-[#B8924A] to-[#8A6B35] bg-clip-text text-transparent [-webkit-background-clip:text]";

/** "Confidence" with heart over the i — used alone or after "Intimate". */
function ConfidenceOnly({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span className={goldSerifClip}>Conf</span>
      <span className="relative inline-block px-[0.03em]">
        <GoldHeartOutline className="absolute -top-[0.55em] left-1/2 h-[0.42em] w-[0.42em] -translate-x-1/2 text-[#C5A059]" />
        <span className={goldSerifClip}>i</span>
      </span>
      <span className={goldSerifClip}>dence</span>
    </span>
  );
}

function ConfidenceWithHeart({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1", className)}>
      <span className={cn(goldSerifClip, "inline")}>Intimate&nbsp;</span>
      <ConfidenceOnly />
    </span>
  );
}

function MothersDayBenefitFooter() {
  const items = [
    { Icon: Leaf, label: "Premium hygiene" },
    { Icon: Flower2, label: "Long-lasting freshness" },
    { Icon: Droplet, label: "Gentle & safe for daily use" },
    { Icon: UserRound, label: "Made for women, by women" },
  ] as const;

  return (
    <div
      className={cn(
        "pointer-events-none hidden w-full border-t px-2 py-2.5 sm:block sm:px-4 sm:py-3 md:py-3.5",
        heroMontserrat.className
      )}
      style={{
        backgroundColor: MD.cream,
        borderColor: MD.creamBorder,
      }}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-stretch justify-center gap-y-2 sm:justify-between sm:gap-y-0">
        {items.map(({ Icon, label }, i) => (
          <div
            key={label}
            className={cn(
              "flex min-w-[45%] flex-1 items-center justify-center gap-2 px-1 sm:min-w-0 sm:flex-1 sm:px-3",
              i > 0 && "sm:border-l sm:border-[#D4C4B0]/90"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 sm:h-[1.05rem] sm:w-[1.05rem]" style={{ color: MD.gold }} strokeWidth={1.35} aria-hidden />
            <span
              className="text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-black sm:text-[10px] sm:tracking-[0.14em] md:text-[11px] md:tracking-[0.16em]"
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Reference layout: desktop editorial hero with live copy + icon benefits. */
function MothersDayCampaignOverlay() {
  const benefits = [
    { Icon: Leaf, label: "Alcohol-Free" },
    { Icon: Droplet, label: "pH-Balanced" },
    { Icon: ShieldCheck, label: "Dermatologist Tested" },
  ] as const;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10",
        heroMontserrat.className
      )}
    >
      <div className="pointer-events-none hidden absolute inset-0 bg-linear-to-r from-[#f8e1d2]/55 via-[#f8e1d2]/25 to-transparent sm:block" />

      <div className="relative z-10 flex h-full min-h-0 justify-start">
        <div
          className={cn(
            "pointer-events-auto hidden w-full max-w-[min(100%,22rem)] px-5 pb-2 text-left sm:max-w-md sm:px-6 md:max-w-lg md:px-8",
            /* Mobile: top-left column width (no background scrim — text sits on banner art). */
            "max-sm:ml-4 max-sm:mr-auto max-sm:w-auto max-sm:max-w-[min(18.5rem,calc(100vw-2rem))] max-sm:px-3 max-sm:pb-3 max-sm:pr-4",
            "max-sm:pt-[min(32vw,9rem)] sm:px-5 sm:pt-12 md:pt-14 lg:pt-16",
            "sm:flex sm:w-[46%] sm:max-w-[660px] sm:flex-col sm:justify-start sm:pb-4 sm:pl-[4%] sm:pr-0 sm:pt-[1.2%] md:w-[50%] lg:w-[46%] xl:pl-[2.5%] xl:pt-[1.5%]"
          )}
        >
          <Image
            src="/bannerloggo.png"
            alt="Leira Eau De Bijou"
            width={240}
            height={102}
            className="mb-3 hidden h-auto w-[150px] translate-x-4 object-contain sm:block md:w-[170px] lg:mb-4 lg:w-[200px] xl:mb-5 xl:w-[220px]"
          />

          <h1
            className={cn(
              heroMontserrat.className,
              "mt-10 text-balance font-bold uppercase max-sm:mt-0 max-sm:text-left sm:mt-0 sm:max-w-[31rem] sm:text-[clamp(0.78rem,1.35vw,1.56rem)] sm:leading-[1.3] sm:tracking-[0.13em]"
            )}
            style={{ color: "#6E2224" }}
          >
            <span className={cn(heroPlayfair.className, "block text-[2.1rem] font-medium normal-case leading-[1.02] max-sm:max-w-[17.5rem] max-sm:text-[1.62rem] max-sm:leading-[1.05] sm:hidden")} style={{ color: "#B01E5A" }}>
              {HERO_TITLE}
            </span>
            <span className="hidden sm:block">
              LEIRA — INDIA&apos;S FIRST INTIMATE
              <br />
              LUXURY PERFUME FOR WOMEN.
            </span>
          </h1>

          <div className="my-2 hidden w-[min(100%,380px)] items-center gap-3 text-[#B98A3D] sm:flex lg:my-4 lg:w-[min(100%,420px)]">
            <span className="h-px flex-1 bg-[#B98A3D]" />
            <Flower2 className="h-6 w-6 shrink-0" strokeWidth={1.3} aria-hidden />
            <span className="h-px flex-1 bg-[#B98A3D]" />
          </div>

          <h2
            className={cn(
              heroPlayfair.className,
              "mt-3 max-w-[31rem] font-bold leading-snug max-sm:text-[0.86rem] sm:mt-0 sm:text-[clamp(2.85rem,5.2vw,6.5rem)] sm:font-normal sm:leading-[0.9]"
            )}
          >
            <span className="max-sm:inline sm:block" style={{ color: "#241A15" }}>
              Confidence,
            </span>
            <span className="max-sm:ml-1 sm:ml-0 sm:block" style={{ color: "#B75463" }}>
              down there.
            </span>
          </h2>

          <h3
            className={cn(
              heroCormorant.className,
              "mt-2 max-w-[34rem] text-pretty text-[0.82rem] font-normal leading-relaxed tracking-tight text-white max-sm:max-w-[14.5rem] max-sm:text-[0.72rem] max-sm:leading-[1.35] sm:mt-2 sm:max-w-[500px] sm:text-[clamp(0.86rem,1.55vw,1.5rem)] sm:font-medium sm:leading-[1.22] sm:text-[#2A201B] lg:mt-3 lg:max-w-[560px] lg:leading-[1.28]"
            )}
          >
            {HERO_SUBTITLE}
          </h3>

          <div className="mt-3 hidden items-start gap-6 sm:flex lg:mt-5 lg:gap-10 xl:gap-16">
            {benefits.map(({ Icon, label }) => (
              <div key={label} className="w-[6.5rem] text-center lg:w-[7.5rem]">
                <div className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#A8792B] text-[#A8792B] md:h-12 md:w-12 lg:mb-2 lg:h-16 lg:w-16 xl:h-[72px] xl:w-[72px]">
                  <Icon className="h-4 w-4 md:h-5 md:w-5 lg:h-7 lg:w-7 xl:h-8 xl:w-8" strokeWidth={1.35} aria-hidden />
                </div>
                <p className="text-[10px] leading-tight text-[#241A15] md:text-[11px] lg:text-[13px] xl:text-base">
                  {label === "Dermatologist Tested" ? (
                    <>
                      Dermatologist
                      <br />
                      Tested
                    </>
                  ) : (
                    label
                  )}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/shop"
            className={cn(
              "mt-4 inline-flex w-auto max-w-none shrink-0 items-center justify-center self-start rounded-md px-6 py-3 text-center text-[0.875rem] font-medium leading-tight tracking-normal text-white shadow-[0_4px_14px_rgba(166,84,99,0.22)] transition-[opacity,box-shadow,background-color] hover:opacity-95 hover:shadow-[0_6px_18px_rgba(166,84,99,0.28)] sm:mt-4 sm:rounded-[12px] sm:px-10 sm:py-2.5 sm:text-xs sm:font-bold sm:tracking-[0.12em] lg:mt-6 lg:px-16 lg:py-4 lg:text-base xl:mt-8 xl:px-[78px] xl:py-[18px] xl:text-lg"
            )}
            style={{ backgroundColor: "#B94E5D", color: "#FFF8F1" }}
          >
            SHOP NOW
          </Link>
        </div>

        <div className="pointer-events-auto absolute left-[7%] top-[4%] z-10 w-[58%] max-w-[15.75rem] text-left sm:hidden max-[375px]:left-[6%] max-[375px]:top-[3.5%] max-[375px]:w-[56%]">
          <Image
            src="/bannerloggo.png"
            alt="Leira Eau De Bijou"
            width={160}
            height={68}
            className="mb-4 h-auto w-[118px] max-w-[52vw] translate-x-4 object-contain max-[375px]:mb-3 max-[375px]:w-[104px]"
          />

          <h1
            className={cn(
              heroMontserrat.className,
              "mb-3 text-[14px] font-bold uppercase leading-[1.2] tracking-[1.2px] max-[375px]:text-[12.5px] max-[375px]:tracking-[1px]"
            )}
            style={{ color: "#6E2224" }}
          >
            INDIA&apos;S FIRST
            <br />
            INTIMATE LUXURY
            <br />
            PERFUME FOR WOMEN
          </h1>

          <div className="mb-3 flex w-full items-center gap-3 text-[#B98A3D]">
            <span className="h-px flex-1 bg-[#B98A3D]" />
            <Flower2 className="h-4 w-4 shrink-0" strokeWidth={1.3} aria-hidden />
            <span className="h-px flex-1 bg-[#B98A3D]" />
          </div>

          <h2
            className={cn(
              heroPlayfair.className,
              "mb-3 text-[clamp(31px,8.5vw,38px)] font-normal leading-[0.92] max-[375px]:text-[29px]"
            )}
          >
            <span className="block" style={{ color: "#241A15" }}>
              Confidence,
            </span>
            <span className="block" style={{ color: "#B75463" }}>
              down there.
            </span>
          </h2>

          <p className="mb-4 max-w-[82%] text-[9.5px] font-normal leading-[1.28] text-[#2A201B] max-[375px]:max-w-[78%] max-[375px]:text-[9px]">
            {HERO_SUBTITLE}
          </p>

          <div className="mb-9 flex items-start gap-2">
            {benefits.map(({ Icon, label }) => (
              <div key={label} className="w-[60px] text-center max-[375px]:w-[54px]">
                <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#B98A3D] text-[#B98A3D] max-[375px]:h-8 max-[375px]:w-8">
                  <Icon className="h-4 w-4 max-[375px]:h-3.5 max-[375px]:w-3.5" strokeWidth={1.25} aria-hidden />
                </div>
                <p className="text-[9px] font-normal leading-[1.12] text-[#2A201B] max-[375px]:text-[8px]">
                  {label === "Dermatologist Tested" ? (
                    <>
                      Dermatologist
                      <br />
                      Tested
                    </>
                  ) : label === "pH-Balanced" ? (
                    <>
                      pH-
                      <br />
                      Balanced
                    </>
                  ) : (
                    label
                  )}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-[12px] bg-[#B94E5D] px-7 py-2.5 text-[13px] font-bold tracking-[1.2px] text-[#FFF8F1] transition-colors hover:bg-[#A84250] max-[375px]:px-6 max-[375px]:py-2 max-[375px]:text-xs"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HeroGalleryScrollAnimation({ showComboSectionLink = false }: HeroGalleryProps) {
  const slides = React.useMemo((): HeroGallerySlide[] => {
    return [
      {
        src: SUMMER_DESKTOP,
        mobileSrc: SUMMER_MOBILE,
        alt: "Leira summer offer: up to 45% off intimate freshness",
        className: "bg-[#faf7f2]",
        mobileClassName: "bg-[#faf7f2]",
        overlay: "pointer-events-none bg-transparent",
        showTextOverlay: false,
        href: "/shop",
        imageLayout: "intrinsic",
        intrinsicDesktop: { width: HERO_DESKTOP_LAYOUT.width, height: HERO_DESKTOP_LAYOUT.height },
        intrinsicMobile: { width: HERO_MOBILE_LAYOUT.width, height: HERO_MOBILE_LAYOUT.height },
      },
      {
        src: MOTHERS_DAY_DESKTOP,
        mobileSrc: MOTHERS_DAY_MOBILE,
        alt: "Leira — Mother's Day offer: premium intimate perfume, Eau de Bijou",
        className: "bg-[#faf7f2]",
        mobileClassName: "bg-[#faf7f2]",
        overlay: "pointer-events-none bg-transparent",
        showTextOverlay: false,
        imageLayout: "intrinsic",
        intrinsicDesktop: { width: HERO_DESKTOP_LAYOUT.width, height: HERO_DESKTOP_LAYOUT.height },
        intrinsicMobile: { width: HERO_MOBILE_LAYOUT.width, height: HERO_MOBILE_LAYOUT.height },
        campaignCopy: "mothers-day",
      },
    ];
  }, []);

  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const slide = slides[active];
  const isIntrinsic = slide?.imageLayout === "intrinsic";
  const skipHeroEnterMotion = isIntrinsic || slides.length <= 1;

  React.useEffect(() => {
    if (slides.length <= 1) return;
    if (paused) return;
    const t = window.setInterval(() => {
      setActive((v) => (v + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [slides.length, paused]);

  React.useEffect(() => {
    slides.forEach(({ src, mobileSrc }) => {
      [src, mobileSrc].filter(Boolean).forEach((imageSrc) => {
        const img = new window.Image();
        img.src = imageSrc as string;
      });
    });
  }, [slides]);

  return (
    <section className="relative w-full min-w-0 max-w-none overflow-x-hidden overflow-y-visible bg-[#faf7f2]">
      <div
        className={cn(
          "relative w-full min-w-0",
          !isIntrinsic && "min-h-[78svh] sm:min-h-[76vh] lg:min-h-[82vh]"
        )}
        style={{
          // Let hero underlap the fixed navbar so no visible gap shows.
          paddingTop: "0px",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="sync">
          {isIntrinsic &&
          slide?.intrinsicDesktop &&
          slide?.intrinsicMobile &&
          slide.mobileSrc ? (
            <motion.div
              key={`intrinsic:${slide.src}`}
              className="relative w-full leading-none"
              initial={skipHeroEnterMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={skipHeroEnterMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.href ? (
                <Link href={slide.href} className="block" aria-label="Shop Leira collection">
                  {slide.campaignCopy === "mothers-day" ? (
                    <div className="relative min-h-[760px] w-full overflow-hidden bg-[#faf7f2] sm:hidden max-[375px]:min-h-[700px]">
                      <Image
                        src={slide.mobileSrc}
                        alt={slide.alt}
                        fill
                        priority={active === 0}
                        fetchPriority={active === 0 ? "high" : undefined}
                        sizes="100vw"
                        quality={HERO_IMAGE_QUALITY}
                        unoptimized={slide.unoptimized}
                        className={cn("object-cover object-[58%_center]", slide.mobileClassName)}
                      />
                    </div>
                  ) : (
                    <Image
                      src={slide.mobileSrc}
                      alt={slide.alt}
                      width={slide.intrinsicMobile.width}
                      height={slide.intrinsicMobile.height}
                      priority={active === 0}
                      fetchPriority={active === 0 ? "high" : undefined}
                      sizes="100vw"
                      quality={HERO_IMAGE_QUALITY}
                      unoptimized={slide.unoptimized}
                      className={cn(
                        "sm:hidden h-auto w-full max-w-none align-top object-contain object-top",
                        slide.mobileClassName
                      )}
                    />
                  )}
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={slide.intrinsicDesktop.width}
                    height={slide.intrinsicDesktop.height}
                    priority={active === 0}
                    fetchPriority={active === 0 ? "high" : undefined}
                    sizes="(min-width: 1920px) 1920px, 100vw"
                    quality={HERO_IMAGE_QUALITY}
                    unoptimized={slide.unoptimized}
                    className={cn(
                      "hidden h-auto w-full align-top sm:block",
                      slide.className
                    )}
                  />
                </Link>
              ) : (
                <>
                  <Image
                    src={slide.mobileSrc}
                    alt={slide.alt}
                    width={slide.intrinsicMobile.width}
                    height={slide.intrinsicMobile.height}
                    priority={active === 0}
                    fetchPriority={active === 0 ? "high" : undefined}
                    sizes="100vw"
                    quality={HERO_IMAGE_QUALITY}
                    unoptimized={slide.unoptimized}
                    className={cn(
                      "sm:hidden h-auto w-full max-w-none align-top object-contain object-top",
                      slide.mobileClassName
                    )}
                  />
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={slide.intrinsicDesktop.width}
                    height={slide.intrinsicDesktop.height}
                    priority={active === 0}
                    fetchPriority={active === 0 ? "high" : undefined}
                    sizes="(min-width: 1920px) 1920px, 100vw"
                    quality={HERO_IMAGE_QUALITY}
                    unoptimized={slide.unoptimized}
                    className={cn(
                      "hidden h-auto w-full align-top sm:block",
                      slide.className
                    )}
                  />
                </>
              )}
              {slide.campaignCopy === "mothers-day" ? <MothersDayCampaignOverlay /> : null}
            </motion.div>
          ) : (
            <motion.div
              key={slide?.src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide?.mobileSrc ? (
                <>
                  <Image
                    src={slide.mobileSrc}
                    alt={slide.alt}
                    fill
                    priority={active === 0}
                    fetchPriority={active === 0 ? "high" : undefined}
                    sizes="100vw"
                    quality={100}
                    unoptimized={slide.unoptimized}
                    className={`sm:hidden ${slide.mobileClassName || slide.className}`}
                  />
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={active === 0}
                    fetchPriority={active === 0 ? "high" : undefined}
                    sizes="100vw"
                    quality={100}
                    unoptimized={slide.unoptimized}
                    className={`hidden sm:block ${slide.className}`}
                  />
                </>
              ) : slide ? (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={active === 0}
                  fetchPriority={active === 0 ? "high" : undefined}
                  sizes="100vw"
                  quality={100}
                  unoptimized={slide.unoptimized}
                  className={slide.className}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {!isIntrinsic ? (
          <>
            <AnimatePresence mode="sync">
              <motion.div
                key={`overlay:${slide?.src}`}
                className={`absolute inset-0 ${slide?.overlay || ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              />
            </AnimatePresence>
            {slide?.showTextOverlay !== false ? (
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#2c1818]/12 via-transparent to-transparent sm:from-[#2c1818]/10" />
            ) : null}
          </>
        ) : null}

        {/* Pagination dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-md">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === active ? "w-6 bg-white" : "bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {active === 0 && slide?.showTextOverlay !== false && (
          <div className="relative z-10 flex w-full min-h-[78svh] items-center px-3 py-16 sm:min-h-[76vh] sm:px-4 sm:py-20 lg:min-h-[82vh] lg:pl-6 lg:pr-8 xl:pl-10">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-[min(78%,420px)] bg-linear-to-r from-white/18 to-transparent sm:w-[min(48%,520px)] lg:w-[min(42%,480px)]"
              aria-hidden
            />
            <div className="relative w-full max-w-xl pointer-events-auto sm:max-w-lg lg:max-w-[min(480px,42vw)]">
              <p className="font-serif text-4xl font-semibold italic tracking-tight text-[#8b4a5c] sm:text-5xl lg:text-6xl">
                LEIRA
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5c3d35]/85">
                Charm.Allure.Luscious
              </p>
              <h1 className="mt-5 font-serif text-2xl font-semibold leading-[1.15] tracking-tight text-[#5c2d2d] sm:text-3xl lg:text-[2.35rem] lg:leading-[1.12]">
                {HERO_TITLE}
              </h1>
              <div className="mt-4 h-px w-32 bg-linear-to-r from-amber-700/50 via-pink-400/60 to-transparent" />
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#4a3a35] sm:text-base lg:text-lg">
                {HERO_SUBTITLE}
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  asChild
                  className="h-11 w-full rounded-full border border-[#8b4a5c]/20 bg-[#8b4a5c] px-6 py-2.5 font-medium text-white shadow-[0_12px_32px_rgba(139,74,92,0.28)] hover:bg-[#7a4050] sm:h-auto sm:w-auto"
                >
                  <Link href="/shop">Shop Now</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-full border-[#c4a08a]/80 bg-white/90 px-6 py-2.5 font-medium text-[#5c2d2d] hover:border-[#8b4a5c] hover:bg-white sm:h-auto sm:w-auto"
                >
                  <Link href="/shop">Discover Your Scent</Link>
                </Button>
                {showComboSectionLink ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full rounded-full border-neutral-300/80 bg-white/90 px-6 py-2.5 font-medium text-neutral-800 hover:border-pink-400 hover:bg-white hover:text-pink-700 sm:h-auto sm:w-auto"
                  >
                    <Link href="/combo">Combo</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
