"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import HowToUse from "@/components/home/Howtouse";

const EASE = [0.22, 1, 0.36, 1] as const;

/* fine grain, reused by the light and dark panels alike */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

function Grain({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{ backgroundImage: GRAIN, opacity }}
    />
  );
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // motion off, or no observer available → show immediately
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
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setShown(true);
              io?.disconnect();
            }
          }),
        { threshold: 0.15 }
      );
      io.observe(el);
    } catch {
      setShown(true);
      return;
    }

    /* Safety net: if the observer never fires — element already on screen at
       mount, a stale layout, a browser quirk — show the content anyway.
       Text must never be permanently invisible. */
    const bail = window.setTimeout(() => setShown(true), 1600);

    return () => {
      io?.disconnect();
      window.clearTimeout(bail);
    };
  }, []);

  return { ref, shown };
}

function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MaskedHeading({
  lines,
  className = "",
}: {
  lines: (string | ReactNode)[];
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLHeadingElement>();
  return (
    <h2 ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "108%" }}
            animate={shown ? { y: 0 } : { y: "108%" }}
            transition={{ duration: 1, delay: 0.08 + i * 0.11, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

/** Row-level reveal (list items, pillars) on the same safe hook. */
function RevealItem({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      ref={ref as never}
      initial={{ opacity: 0, y: 20 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Image frame that wipes open from the bottom. */
function Wipe({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
      animate={
        shown
          ? { clipPath: "inset(0 0 0% 0)", opacity: 1 }
          : { clipPath: "inset(0 0 100% 0)", opacity: 0 }
      }
      transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Pink chip — the recurring colour punch that marks each chapter. */
function Chapter({
  index,
  label,
  dark = false,
}: {
  index: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <Reveal className="flex items-center gap-4">
      <span
        className={`inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] ${
          dark ? "bg-[#ec4899]/25 text-[#f9a8d4]" : "bg-[#ec4899]/10 text-[#ec4899]"
        }`}
      >
        <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
        {label}
      </span>
      <span className="font-serif text-[15px] tracking-[0.1em] text-[#ec4899]">{index}</span>
    </Reveal>
  );
}

function GoldRule({ className = "" }: { className?: string }) {
  const { ref, shown } = useReveal<HTMLSpanElement>();
  return (
    <motion.span
      ref={ref}
      aria-hidden
      initial={{ scaleX: 0 }}
      animate={shown ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
      className={`block h-px origin-left bg-gradient-to-r from-[#ec4899] to-[#ec4899]/10 ${className}`}
    />
  );
}

/* ==================================================================
   01 — THE GAP  ·  deep plum panel
   ================================================================== */
const GAP_ITEMS = [
  "Loaded with alcohol that irritated sensitive skin",
  "Made with synthetic fragrances that disrupted the natural pH balance of the intimate area",
  "Designed with clinical language that made self-care feel like a medical procedure",
  "Simply not created with the delicate bikini area and private area in mind",
];

function TheGap() {
  return (
    <section className="relative isolate [overflow:clip] bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
      <Grain opacity={0.05} />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full bg-[#ec4899]/20 blur-[110px]"
      />

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Chapter index="01" label="The gap" dark />
          <MaskedHeading
            className="mt-6 font-serif text-[clamp(28px,3.6vw,46px)] font-light leading-[1.12] tracking-tight text-white"
            lines={[
              "We saw a gap.",
              <>
                We built the <em className="not-italic text-[#f9a8d4]">solution.</em>
              </>,
            ]}
          />
          <Reveal delay={0.3}>
            <GoldRule className="mt-7 w-20" />
          </Reveal>
        </div>

        <div>
          <Reveal>
            <p className="text-[15px] font-light leading-[1.95] text-[#f7dfe8]/80 md:text-[16.5px]">
              Women in India have incredible options for skincare, haircare and fragrance. But when it
              came to the intimate area — the bikini area, the private area, the sensitive skin that
              needs the most gentle care — the market offered almost nothing worth using.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 text-[12px] uppercase tracking-[0.22em] text-[#ec4899]">
              What existed was
            </p>
          </Reveal>

          <ul className="mt-4 border-t border-white/[0.14]">
            {GAP_ITEMS.map((item, i) => (
              <RevealItem
                key={item}
                as="li"
                delay={0.15 + i * 0.09}
                className="flex gap-5 border-b border-white/[0.14] py-4"
              >
                <span className="pt-[3px] text-[11px] tracking-[0.18em] text-[#f9a8d4]/80">
                  0{i + 1}
                </span>
                <span className="text-[14.5px] font-light leading-[1.78] text-[#f7dfe8]/70 md:text-[15.5px]">
                  {item}
                </span>
              </RevealItem>
            ))}
          </ul>

          <Reveal delay={0.2}>
            <p className="mt-8 text-[15px] font-light leading-[1.95] text-[#f7dfe8]/80 md:text-[16.5px]">
              Leira was founded to fill that gap — with a product that treats your intimate area with
              the same elegance, care and ingredient integrity as the best skincare brands in the
              world.
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.1} className="mx-auto mt-20 max-w-4xl text-center md:mt-28">
        <p className="font-serif text-[clamp(21px,2.7vw,38px)] font-light italic leading-[1.42] text-white">
          &ldquo;Intimate care is personal hygiene. Personal hygiene is self-love. And self-love
          should never feel like a compromise.&rdquo;
        </p>
      </Reveal>
    </section>
  );
}

/* ==================================================================
   02 — THE DIFFERENCE  ·  ivory
   ================================================================== */
const PILLARS = [
  {
    n: "01",
    title: "pH-balanced for your intimate area",
    body: "The intimate area has a naturally delicate pH balance. Most conventional products — even those marketed for feminine care — disrupt it with harsh chemicals or alcohol. Leira is balanced to work in harmony with your body's own chemistry, keeping sensitive skin comfortable and fresh all day.",
  },
  {
    n: "02",
    title: "100% natural essential oils, no synthetics",
    body: "Pure Damask Rose, Jasmine and Ylang Ylang — three of nature's most celebrated botanicals. No artificial fragrance, no parabens, no alcohol. Only clean ingredients gentle enough for your most sensitive skin and your bikini area.",
  },
  {
    n: "03",
    title: "Alcohol-free, safe for sensitive skin",
    body: "Alcohol is among the most common causes of irritation in the intimate and private area. It strips natural oils, disrupts moisture balance and leaves delicate skin dry. Leira is completely alcohol-free, so it is safe for daily use.",
  },
  {
    n: "04",
    title: "Long-lasting freshness",
    body: "One application delivers all-day freshness. A long workday, a workout, a special evening — Leira keeps you feeling confident, clean and effortlessly fresh from morning to midnight.",
  },
];

function WhatMakesItDifferent() {
  return (
    <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
      <Grain />

      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <Chapter index="02" label="The difference" />
          <MaskedHeading
            className="mt-6 font-serif text-[clamp(27px,3.6vw,48px)] font-light leading-[1.12] tracking-tight text-[#7a2c4e]"
            lines={[
              "Not a wash. Not a spray.",
              <>
                Something <em className="not-italic text-[#ec4899]">else</em> entirely.
              </>,
            ]}
          />
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-[54ch] text-[15px] font-light leading-[1.9] text-[#6b5560] md:text-[16.5px]">
              There are plenty of feminine care products on the market. Leira is not a feminine wash,
              a deodorant spray or a synthetic perfume. It is an essential oil based intimate perfume,
              formulated exclusively for the external intimate area, bikini area and sensitive skin of
              modern women.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
          <Wipe
            className="relative h-[46vh] overflow-hidden rounded-[22px] shadow-[0_44px_84px_-56px_rgba(122,44,78,0.6)] outline outline-1 outline-offset-[14px] outline-[#ec4899]/[0.45] lg:sticky lg:top-28 lg:h-[70vh] lg:self-start"
          >
            <Image
              src="/images/about3.png"
              alt="Why Leira stands out"
              fill
              className="object-cover object-center"
              loading="lazy"
            />
          </Wipe>

          <dl className="border-t border-[#7a2c4e]/[0.12]">
            {PILLARS.map((p, i) => (
              <RevealItem
                key={p.n}
                delay={i * 0.06}
                className="-mx-4 border-b border-[#7a2c4e]/[0.12] px-4 py-7 transition-colors duration-500 hover:bg-[#fff5f9] md:py-9"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ec4899]/10 text-[10.5px] tracking-[0.08em] text-[#ec4899]">
                  {p.n}
                </span>
                <dt className="mt-3 font-serif text-[clamp(19px,2vw,27px)] font-normal leading-[1.28] text-[#7a2c4e]">
                  {p.title}
                </dt>
                <dd className="mt-3 max-w-[52ch] text-[14.5px] font-light leading-[1.85] text-[#6b5560] md:text-[15.5px]">
                  {p.body}
                </dd>
              </RevealItem>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
   03 — THE STORY  ·  soft blush
   ================================================================== */
const STORY = [
  "Women were managing their private area and bikini area care with products never designed for it — body sprays, generic deodorants, harsh soaps that irritated sensitive skin rather than nurturing it. The gap was obvious. The solution required a completely new approach.",
  "We founded Leira with one clear mission: to create an intimate perfume that honours the sensitivity of the intimate area, respects the body's natural chemistry, and makes personal hygiene feel like an act of self-love rather than a chore.",
  "We started with the best ingredients nature offers — Damask Rose, Jasmine and Ylang Ylang. Three essential oils known for centuries for their skin-soothing, confidence-building, naturally aromatic properties. We formulated them alcohol-free, pH-balanced, and gentle enough for the most sensitive skin.",
  "The result is India's first luxury intimate perfume. Not a product that masks — a product that elevates. One that supports your natural freshness, nourishes your intimate area, and gives you the confidence to own every moment of your day.",
];

function TheStory() {
  return (
    <section className="relative isolate [overflow:clip] bg-gradient-to-t from-[#fdeef4] via-[#fff5f9] to-[#fffdfc] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
      <Grain />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-20">
          <div>
            <Chapter index="03" label="The story" />
            <MaskedHeading
              className="mt-6 font-serif text-[clamp(27px,3.6vw,48px)] font-light leading-[1.12] tracking-tight text-[#7a2c4e]"
              lines={[
                "The story",
                <>
                  behind <em className="not-italic text-[#ec4899]">Leira.</em>
                </>,
              ]}
            />

            <Reveal delay={0.3}>
              <p className="mt-7 text-[15px] font-light leading-[1.95] text-[#6b5560] md:text-[16.5px] [&>span]:float-left [&>span]:mr-3 [&>span]:mt-1 [&>span]:font-serif [&>span]:text-[54px] [&>span]:font-light [&>span]:leading-[0.8] [&>span]:text-[#ec4899]">
                <span>L</span>
                eira was born from a simple but powerful observation: the intimate area — one of the
                most sensitive and personal parts of a woman&apos;s body — was being completely
                ignored by the beauty and personal care industry in India.
              </p>
            </Reveal>

            {STORY.map((para, i) => (
              <Reveal key={i} delay={0.1 + i * 0.05}>
                <p className="mt-5 text-[15px] font-light leading-[1.95] text-[#6b5560] md:text-[16.5px]">
                  {para}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <p className="mt-10 border-l-2 border-[#ec4899] bg-white/60 py-3 pl-6 pr-4 font-serif text-[clamp(19px,2.1vw,27px)] font-light italic leading-[1.45] text-[#7a2c4e]">
                Self-love is not just a feeling. It is a ritual. And Leira is yours.
              </p>
            </Reveal>
          </div>

          <Wipe
            className="relative h-[52vh] overflow-hidden rounded-[22px] shadow-[0_44px_84px_-56px_rgba(122,44,78,0.6)] lg:sticky lg:top-28 lg:h-[74vh] lg:self-start"
          >
            <Image
              src="/images/model5.png"
              alt="The story behind Leira"
              fill
              className="object-cover object-center"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3a1424]/45 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 right-5 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-white/95">
              <i
                aria-hidden
                className="block h-2 w-2 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-gradient-to-br from-white to-[#f9a8d4]"
              />
              Damask Rose · Jasmine · Ylang Ylang
            </span>
          </Wipe>
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
   04 — CLOSING  ·  full-bleed image
   ================================================================== */
function Closing() {
  return (
    <section className="relative isolate [overflow:clip] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <Image
        src="/images/model6.png"
        alt=""
        fill
        className="-z-20 object-cover object-center"
        loading="lazy"
      />
      <div className="absolute inset-0 -z-10 bg-[#2b0f1d]/[0.68]" />
      <Grain opacity={0.05} />

      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.12] px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#f9a8d4] backdrop-blur">
            <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#f9a8d4]" />
            Your ritual
          </span>
        </Reveal>

        <MaskedHeading
          className="mt-6 font-serif text-[clamp(28px,4.2vw,54px)] font-light leading-[1.1] tracking-tight text-white"
          lines={[
            "Ready to redefine",
            <>
              your intimate <em className="not-italic text-[#f9a8d4]">self-care?</em>
            </>,
          ]}
        />

        <Reveal delay={0.35}>
          <p className="mx-auto mt-7 max-w-[52ch] text-[15px] font-light leading-[1.9] text-white/85">
            Your bikini area, private area and sensitive skin deserve more than what the market has
            offered until now. Join thousands of Indian women who have made Leira their daily ritual.
          </p>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <a
              href="/shop"
              className="rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-9 py-4 text-[11px] uppercase tracking-[0.22em] text-white shadow-[0_18px_34px_-20px_rgba(236,72,153,0.9)] transition-transform duration-500 hover:-translate-y-0.5"
            >
              Shop the collection
            </a>
            <a
              href="/contact"
              className="border-b border-[#ec4899]/70 pb-1 font-serif text-[21px] text-white transition-colors duration-300 hover:border-[#f9a8d4] hover:text-[#f9a8d4]"
            >
              Talk to us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}


/* ==================================================================
   Scent ribbon — a slow drifting band that separates the chapters
   ================================================================== */
const RIBBON = [
  "Damask Rose",
  "Jasmine",
  "Ylang Ylang",
  "Alcohol-free",
  "pH-balanced",
  "100% organic",
  "Made in India",
];

function ScentRibbon() {
  const items = [...RIBBON, ...RIBBON]; // duplicated so the loop is seamless
  return (
    <div
      aria-hidden
      className="relative isolate [overflow:clip] border-y border-[#ec4899]/25 bg-[#fdeef4] py-5"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes leiraRibbon { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
.leiraRibbonTrack { animation: leiraRibbon 38s linear infinite; }
.leiraRibbonTrack:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .leiraRibbonTrack { animation: none; } }`,
        }}
      />
      {/* the band fades out at both edges instead of cutting off */}
      <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#fdeef4] to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#fdeef4] to-transparent" />

      <div className="leiraRibbonTrack flex w-max items-center gap-10 whitespace-nowrap will-change-transform">
        {items.map((word, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-serif text-[clamp(17px,1.9vw,25px)] font-light italic text-[#7a2c4e]/70">
              {word}
            </span>
            <i
              aria-hidden
              className="block h-1.5 w-1.5 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#ec4899]/60"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ==================================================================
   Credentials — figures that count up once they are seen
   ================================================================== */
const STATS: { to: number; suffix?: string; label: string }[] = [
  { to: 3, label: "Botanical essential oils" },
  { to: 0, suffix: "%", label: "Alcohol, parabens, synthetics" },
  { to: 15, suffix: " ml", label: "Precision dropper bottle" },
  { to: 100, suffix: "%", label: "Organic, pH-balanced formula" },
];

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const { ref, shown } = useReveal<HTMLSpanElement>();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!shown || to === 0) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shown, to]);

  return (
    <span ref={ref}>
      {to === 0 ? 0 : n}
      {suffix}
    </span>
  );
}

function Credentials() {
  return (
    <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <Grain />
      <dl className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-[22px] border border-[#7a2c4e]/[0.1] bg-[#7a2c4e]/[0.08] sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <RevealItem
            key={s.label}
            delay={i * 0.08}
            className="bg-[#fffdfc] px-6 py-9 text-center transition-colors duration-500 hover:bg-[#fff5f9] md:px-8 md:py-12"
          >
            <dt className="font-serif text-[clamp(38px,4.6vw,62px)] font-light leading-none text-[#ec4899]">
              <Counter to={s.to} suffix={s.suffix} />
            </dt>
            <dd className="mx-auto mt-4 max-w-[22ch] text-[12.5px] font-light leading-[1.7] text-[#6b5560]">
              {s.label}
            </dd>
          </RevealItem>
        ))}
      </dl>
    </section>
  );
}

/* ==================================================================
   Page
   ================================================================== */
export function AboutBrandStorySection() {
  return (
    <>
      <TheGap />
      {/* <ScentRibbon /> */}
      <WhatMakesItDifferent />
      <HowToUse />
      <TheStory />
      {/* <Credentials /> */}
      <Closing />
    </>
  );
}

export default AboutBrandStorySection;