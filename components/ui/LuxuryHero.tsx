'use client';

/**
 * LuxuryHero — full-viewport editorial hero.
 * ---------------------------------------------------------------------------
 * Built for Next 16 / React 19 / Tailwind v4.
 *
 * ⚠️ ONE LINE YOU MAY NEED TO CHANGE — the animation import below.
 *    package.json has "framer-motion"  → leave it alone.
 *    package.json has "motion"         → change 'framer-motion' to 'motion/react'.
 *
 * The motion is one continuous camera push. A sliver of product imagery sits in
 * the gap between the two headline words; it expands to a banner, then to an
 * inset frame, then to full bleed, while the scattered cards drift outward and
 * fade and the two words slide apart. The type translates — it never scales.
 * Then it reverses and the composition returns with fresh imagery.
 *
 * Self-contained: no global CSS, no scroll hijacking, no layout shift.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

/* ───────────────────────────── types ───────────────────────────── */

export type Media = { src: string; alt: string };

/**
 * One position in the scatter. `x`/`y` are the card's CENTRE as a percentage of
 * the section box, `w` its width as a percentage of section width. Height comes
 * from `ratio`, so a card reserves its space before the image loads.
 */
export type CardSlot = {
  id: string;
  x: number;
  y: number;
  w: number;
  /** tablet overrides (≥768px) */
  md?: Partial<Pick<CardSlot, 'x' | 'y' | 'w'>>;
  /** mobile overrides (<768px) */
  sm?: Partial<Pick<CardSlot, 'x' | 'y' | 'w'>>;
  /** width ÷ height */
  ratio: number;
  /** parallax and drift strength. 0 = pinned, 1.2 = very loose */
  depth: number;
  /** smallest breakpoint at which this card appears */
  from: 'sm' | 'md' | 'lg';
  /** entrance stagger, in seconds */
  delay: number;
};

export type Scene = {
  /** the image that expands to full bleed */
  feature: Media;
  /** one entry per CARD_SLOTS index */
  cards: Media[];
};

export type NavItem = { label: string; href: string };

export interface LuxuryHeroProps {
  brandName?: string;
  /** the small caps line under the wordmark */
  brandTagline?: string;
  /** two words, with the featured sliver between them */
  headline?: [string, string];
  ctaLabel?: string;
  ctaHref?: string;
  scenes?: Scene[];
  slots?: CardSlot[];
  /** false freezes the composition on the first scene */
  autoPlay?: boolean;
  /** turn off if your global <Header /> already sits over the hero */
  showNav?: boolean;
  nav?: { topLeft?: NavItem; topRight?: NavItem; bottomLeft?: NavItem; cart?: NavItem };
  /**
   * Set true if you hit "hostname ... is not configured under images" and would
   * rather not touch next.config. Skips the Next optimizer entirely.
   */
  unoptimizedImages?: boolean;
  className?: string;
}

/* ─────────────────────── card geometry ───────────────────────
   Measured off the reference composition. Nothing sits on a grid: widths
   cluster near 10% but the vertical rhythm is deliberately uneven and three
   cards bleed past the viewport edge. That asymmetry is the entire look, so
   resist the urge to tidy these numbers. */

export const CARD_SLOTS: CardSlot[] = [
  {
    id: 'texture-top-left',
    x: 25.3, y: 16.6, w: 10.3, ratio: 1.69, depth: 0.55, from: 'md', delay: 0.06,
    md: { x: 22, y: 15, w: 16 },
  },
  {
    id: 'model-upper-left',
    x: 31.8, y: 28.6, w: 10.0, ratio: 0.9, depth: 0.95, from: 'sm', delay: 0,
    md: { x: 24, y: 27, w: 18 },
    sm: { x: 21, y: 20, w: 30 },
  },
  {
    id: 'treatment-far-left',
    x: 3.5, y: 41.2, w: 7.1, ratio: 0.71, depth: 0.4, from: 'lg', delay: 0.22,
  },
  {
    id: 'products-bottom-left',
    x: 13.8, y: 86.2, w: 10.3, ratio: 1.88, depth: 0.7, from: 'md', delay: 0.3,
    md: { x: 15, y: 87, w: 18 },
  },
  {
    id: 'still-life-left',
    x: 27.7, y: 71, w: 10.4, ratio: 0.82, depth: 1.05, from: 'sm', delay: 0.14,
    md: { x: 20, y: 70, w: 18 },
    sm: { x: 20, y: 77, w: 30 },
  },
  {
    id: 'face-center-bottom',
    x: 50.5, y: 81.2, w: 10.5, ratio: 0.75, depth: 1.2, from: 'md', delay: 0.1,
    md: { x: 50, y: 79, w: 17 },
  },
  {
    id: 'cream-upper-right',
    x: 87.5, y: 17.2, w: 10.1, ratio: 1.21, depth: 0.6, from: 'md', delay: 0.18,
    md: { x: 84, y: 16, w: 17 },
  },
  {
    id: 'group-right-center',
    x: 77.9, y: 43.8, w: 10.3, ratio: 1.83, depth: 0.85, from: 'sm', delay: 0.26,
    md: { x: 78, y: 40, w: 18 },
    sm: { x: 79, y: 20, w: 30 },
  },
  {
    id: 'orchid-bottom-right',
    x: 88.9, y: 67.2, w: 10, ratio: 0.71, depth: 1, from: 'sm', delay: 0.08,
    md: { x: 82, y: 70, w: 17 },
    sm: { x: 80, y: 77, w: 30 },
  },
  {
    id: 'texture-bottom-right',
    x: 80.9, y: 82.7, w: 10, ratio: 1.33, depth: 0.75, from: 'lg', delay: 0.34,
  },
];

/* ───────────────────────────── imagery ─────────────────────────────
   Placeholders. Swap for your own art direction — the shape of the data is all
   the component cares about. Local files under /public need no config at all:
   { src: '/hero/model.jpg', alt: '…' } */

const remote = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;

const card = (id: string, alt: string): Media => ({ src: remote(id, 900), alt });
const hero = (id: string, alt: string): Media => ({ src: remote(id, 2000), alt });

const P = {
  tank: 'photo-1581182800629-7d90925ad072',
  dropper: 'photo-1573461160327-b450ce3d8e7f',
  glass: 'photo-1555820585-c5ae44394b79',
  smearBeige: 'photo-1585945037805-5fd82c2e60b1',
  petals: 'photo-1580870069867-74c57ee1bb07',
  bokeh: 'photo-1581182815808-b6eb627a8798',
  ritual: 'photo-1552046122-03184de85e08',
  amber: 'photo-1608571423902-eed4a5ad8108',
  lotion: 'photo-1619451427882-6aaaded0cc61',
  noir: 'photo-1620916297397-a4a5402a3c6c',
  smearWhite: 'photo-1608068811588-3a67006b7489',
  linen: 'photo-1609357912334-e96886c0212b',
  massage: 'photo-1643684391140-c5056cfd3436',
  swatch: 'photo-1603401712778-ab0575182f12',
  spa: 'photo-1570172619644-dfd03ed5d881',
};

/** Each scene supplies one image per slot, in slot order. */
export const SCENES: Scene[] = [
  {
    feature: hero(P.petals, 'The complete line arranged with orchid stems'),
    cards: [
      card(P.smearBeige, 'Cream texture on a beige surface'),
      card(P.tank, 'Model with luminous skin'),
      card(P.spa, 'A facial treatment in progress'),
      card(P.petals, 'The product line-up with petals'),
      card(P.amber, 'Amber serum bottle on stone'),
      card(P.massage, 'Close-up of a facial massage'),
      card(P.smearWhite, 'A swatch of rich cream'),
      card(P.bokeh, 'Portrait in soft light'),
      card(P.ritual, 'Jar, serum and mask'),
      card(P.swatch, 'Cream applied to skin'),
    ],
  },
  {
    feature: hero(P.ritual, 'The evening ritual: cleansing jar, serum and mask'),
    cards: [
      card(P.smearWhite, 'A swatch of rich cream'),
      card(P.glass, 'Portrait behind glass'),
      card(P.massage, 'Close-up of a facial massage'),
      card(P.ritual, 'Jar, serum and mask'),
      card(P.noir, 'Dark glass serum bottle'),
      card(P.lotion, 'Lotion dispensed into the palm'),
      card(P.swatch, 'Cream applied to skin'),
      card(P.linen, 'Model in natural daylight'),
      card(P.amber, 'Amber serum bottle on stone'),
      card(P.smearBeige, 'Cream texture on a beige surface'),
    ],
  },
  {
    feature: hero(P.amber, 'Botanical serum resting on a stone pedestal'),
    cards: [
      card(P.swatch, 'Cream applied to skin'),
      card(P.linen, 'Model in natural daylight'),
      card(P.lotion, 'Lotion dispensed into the palm'),
      card(P.dropper, 'Serum drawn into a pipette'),
      card(P.petals, 'The product line-up with petals'),
      card(P.glass, 'Portrait behind glass'),
      card(P.smearBeige, 'Cream texture on a beige surface'),
      card(P.tank, 'Model with luminous skin'),
      card(P.amber, 'Amber serum bottle on stone'),
      card(P.smearWhite, 'A swatch of rich cream'),
    ],
  },
];

/* ─────────────────────── timing and easing ─────────────────────── */

const HOLD_SCATTER = 3.4;
const ZOOM_IN = 2.6;
const HOLD_FULL = 2.6;
const ZOOM_OUT = 1.9;
const CYCLE = HOLD_SCATTER + ZOOM_IN + HOLD_FULL + ZOOM_OUT;

type Bezier = [number, number, number, number];
/** Long and symmetrical. There is no overshoot anywhere in this component. */
const EASE: Bezier = [0.65, 0, 0.35, 1];
const EASE_OUT: Bezier = [0.22, 1, 0.36, 1];

/** Zoom keyframes sampled from the reference: sliver → banner → inset → bleed. */
const Z_STOPS = [0, 0.35, 0.75, 1];
const FEATURE_W = ['2.6%', '19%', '78%', '100%'];
const FEATURE_H = ['4.7%', '19%', '78%', '100%'];
const WORD_LEFT = ['0%', '-9.7%', '-39%', '-54%'];
const WORD_RIGHT = ['0%', '9.7%', '39%', '54%'];

/** Static strings so the Tailwind scanner can see them. */
const VISIBILITY: Record<CardSlot['from'], string> = {
  sm: 'block',
  md: 'hidden md:block',
  lg: 'hidden lg:block',
};

/**
 * Resolves each card's inline breakpoint variables. One rule for every card,
 * written as plain CSS because Tailwind cannot express per-instance values.
 */
const RESPONSIVE_CSS = `
.lux-card{left:var(--x-sm);top:var(--y-sm);width:var(--w-sm)}
@media(min-width:768px){.lux-card{left:var(--x-md);top:var(--y-md);width:var(--w-md)}}
@media(min-width:1024px){.lux-card{left:var(--x-lg);top:var(--y-lg);width:var(--w-lg)}}
`;

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.55'/></svg>\")";

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

const TICKS = 44;

/* ─────────────────────────── component ─────────────────────────── */

export default function LuxuryHero({
  brandName = 'nymphaea',
  brandTagline = 'Cosmetics',
  headline = ['Nymphaea', 'Cosmetics'],
  ctaLabel = 'Discover the line',
  ctaHref = '/products',
  scenes = SCENES,
  slots = CARD_SLOTS,
  autoPlay = true,
  showNav = true,
  nav,
  unoptimizedImages = false,
  className = '',
}: LuxuryHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();

  /* Cards swap while they are invisible; the feature swaps while it is a
     sliver. Two indices, so neither change is ever caught on screen. */
  const [cardScene, setCardScene] = useState(0);
  const [featureScene, setFeatureScene] = useState(0);

  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const running = autoPlay && !reduced && inView && pageVisible;

  /** 0 = scatter, 1 = full bleed. Drives every transform below. */
  const zoom = useMotionValue(0);
  /** 0 → 1 across the full tour of every scene. Drives the progress readout. */
  const tour = useMotionValue(0);

  /* Pointer, normalised to −0.5…0.5, then smoothed. */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 55, damping: 22, mass: 0.6 });
  const my = useSpring(rawY, { stiffness: 55, damping: 22, mass: 0.6 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    const sync = () => setPageVisible(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    let cancelled = false;
    const pending: { stop: () => void }[] = [];

    const play = (
      value: MotionValue<number>,
      to: number,
      duration: number,
      ease: Bezier | 'linear',
    ) =>
      new Promise<void>((resolve) => {
        pending.push(animate(value, to, { duration, ease, onComplete: () => resolve() }));
      });

    const wait = (seconds: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, seconds * 1000);
        pending.push({ stop: () => clearTimeout(id) });
      });

    const run = async () => {
      let index = cardScene;

      /* Paused mid-push? Ease back rather than snapping. */
      if (zoom.get() > 0.001) {
        await play(zoom, 0, 0.7, EASE);
        if (cancelled) return;
      }

      while (!cancelled) {
        const from = index / scenes.length;
        tour.set(from);
        void play(tour, from + 1 / scenes.length, CYCLE, 'linear');

        await wait(HOLD_SCATTER);
        if (cancelled) return;

        await play(zoom, 1, ZOOM_IN, EASE);
        if (cancelled) return;

        await wait(HOLD_FULL);
        if (cancelled) return;

        /* Scatter is fully faded here — restock it unseen. */
        index = (index + 1) % scenes.length;
        setCardScene(index);

        await play(zoom, 0, ZOOM_OUT, EASE);
        if (cancelled) return;

        /* Feature is back to a ~40px sliver — swap it too. */
        setFeatureScene(index);
      }
    };

    void run();
    return () => {
      cancelled = true;
      pending.forEach((p) => p.stop());
    };
    // cardScene is read once as a starting point, deliberately not a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, scenes.length]);

  /* Derived motion. Every hook here runs unconditionally, in order. */
  const stageScale = useTransform(zoom, [0, 1], [1, 2.3]);
  const stageOpacity = useTransform(zoom, [0, 0.35, 0.62], [1, 1, 0]);
  const featureW = useTransform(zoom, Z_STOPS, FEATURE_W);
  const featureH = useTransform(zoom, Z_STOPS, FEATURE_H);
  const featureRadius = useTransform(zoom, [0, 0.9, 1], ['3px', '14px', '0px']);
  const featureShadow = useTransform(
    zoom,
    [0, 0.4, 1],
    [
      '0 10px 30px rgba(64,52,36,0.10)',
      '0 22px 60px rgba(64,52,36,0.20)',
      '0 30px 90px rgba(64,52,36,0.32)',
    ],
  );
  const scrimOpacity = useTransform(zoom, [0.55, 1], [0, 1]);
  const leftWordX = useTransform(zoom, Z_STOPS, WORD_LEFT);
  const rightWordX = useTransform(zoom, Z_STOPS, WORD_RIGHT);
  const wordOpacity = useTransform(zoom, [0.82, 1], [1, 0]);
  const percent = useTransform(tour, (v) => {
    const wrapped = (((v % 1) + 1) % 1) * 100;
    return `${String(Math.round(wrapped)).padStart(2, '0')}%`;
  });

  const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  const resetPointer = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const cards = scenes[cardScene]?.cards ?? [];
  const feature = scenes[featureScene]?.feature;

  const topLeft = nav?.topLeft ?? { label: 'Home', href: '/' };
  const topRight = nav?.topRight ?? { label: 'Products', href: '/products' };
  const bottomLeft = nav?.bottomLeft ?? { label: 'Brand', href: '/about' };
  const cart = nav?.cart ?? { label: 'Cart', href: '/cart' };

  return (
    <section
      ref={sectionRef}
      aria-label={`${headline[0]} ${headline[1]} — featured collection`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={{ height: '100svh' }}
      className={`relative isolate h-screen min-h-[560px] w-full overflow-hidden bg-[#B5AC97] text-white antialiased ${className}`}
    >
      <style>{RESPONSIVE_CSS}</style>

      {/* Warm champagne ground. Light falls from the upper right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_105%_at_78%_6%,#CFC0A6_0%,#BEB49E_38%,#B0A791_68%,#9F977F_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />

      {/* ── the scatter ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={reduced ? undefined : { scale: stageScale, opacity: stageOpacity }}
      >
        {slots.map((slot, i) => (
          <FloatingCard
            key={slot.id}
            slot={slot}
            media={cards[i]}
            mx={mx}
            my={my}
            reduced={reduced}
            unoptimized={unoptimizedImages}
          />
        ))}
      </motion.div>

      {/* ── featured image: sliver → banner → inset → full bleed ── */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={
          reduced
            ? { width: '2.6%', height: '4.7%', borderRadius: '3px' }
            : {
                width: featureW,
                height: featureH,
                borderRadius: featureRadius,
                boxShadow: featureShadow,
              }
        }
      >
        <AnimatePresence initial={false}>
          {feature && (
            <motion.div
              key={feature.src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Image
                src={feature.src}
                alt={feature.alt}
                fill
                priority={featureScene === 0}
                unoptimized={unoptimizedImages}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keeps the wordmark, CTA and nav legible once the image fills the frame. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(60,48,33,0.34)_0%,rgba(60,48,33,0)_28%,rgba(60,48,33,0)_60%,rgba(60,48,33,0.42)_100%)]"
          style={reduced ? { opacity: 0 } : { opacity: scrimOpacity }}
        />
      </motion.div>

      {/* ── headline: the words translate outward, the type never scales ── */}
      <div className="pointer-events-none absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center">
        <motion.h1
          className="flex w-full items-center justify-center text-[clamp(1.75rem,4.6vw,4.6rem)] font-extralight leading-[1.05] tracking-[-0.012em] [text-shadow:0_1px_28px_rgba(72,58,40,0.3)]"
          style={reduced ? undefined : { opacity: wordOpacity }}
        >
          {/* Equal halves keep the sliver exactly on centre whatever the words. */}
          <motion.span
            className="flex-1 pr-[1.2%] text-right"
            style={reduced ? undefined : { x: leftWordX }}
          >
            {headline[0]}
          </motion.span>
          <span aria-hidden className="w-[2.6%] shrink-0" />
          <motion.span
            className="flex-1 pl-[1.2%] text-left"
            style={reduced ? undefined : { x: rightWordX }}
          >
            {headline[1]}
          </motion.span>
        </motion.h1>
      </div>

      {/* ── brand lockup ── */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[4.4%] flex -translate-x-1/2 flex-col items-center gap-[0.35rem]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.15 }}
      >
        <Droplet />
        <span className="text-[clamp(0.95rem,1.55vw,1.45rem)] font-light lowercase leading-none">
          {brandName}
        </span>
        <span className="ml-[0.62em] text-[0.5rem] font-normal uppercase tracking-[0.62em] text-[#EBDCC3]/70">
          {brandTagline}
        </span>
      </motion.div>

      {/* ── call to action ── */}
      <motion.div
        className="absolute left-1/2 top-[82%] -translate-x-1/2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE_OUT, delay: 0.55 }}
      >
        <Link
          href={ctaHref}
          className={`group relative inline-flex items-center gap-[0.7em] overflow-hidden rounded-full border border-white/45 px-[1.9em] py-[0.85em] text-[clamp(0.58rem,0.78vw,0.72rem)] uppercase tracking-[0.24em] backdrop-blur-[2px] transition-colors duration-500 ease-out hover:border-white/80 ${FOCUS}`}
        >
          <span
            aria-hidden
            className="absolute inset-0 origin-bottom scale-y-0 bg-white/[0.14] transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-y-100"
          />
          <span className="relative">{ctaLabel}</span>
          <span
            aria-hidden
            className="relative transition-transform duration-500 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </motion.div>

      {/* ── progress ── */}
      <div className="pointer-events-none absolute bottom-[5.4%] left-1/2 flex w-[min(36vw,420px)] -translate-x-1/2 flex-col items-center gap-[0.45rem]">
        <motion.span
          aria-hidden
          className="text-[0.55rem] font-light tabular-nums tracking-[0.18em] text-white/75"
        >
          {reduced ? '00%' : percent}
        </motion.span>
        <div
          className="flex h-[11px] w-full items-end justify-between"
          role="progressbar"
          aria-label="Collection tour"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: TICKS }, (_, i) => (
            <Tick key={i} index={i} total={TICKS} tour={tour} reduced={reduced} />
          ))}
        </div>
      </div>

      {/* ── navigation ── */}
      {showNav && (
        <nav
          aria-label="Hero"
          className="absolute inset-0 text-[clamp(0.53rem,0.7vw,0.66rem)] uppercase tracking-[0.26em]"
        >
          <NavLink href={topLeft.href} className="left-6 top-6 sm:left-10 sm:top-8">
            {topLeft.label}
          </NavLink>
          <NavLink href={topRight.href} className="right-6 top-6 sm:right-10 sm:top-8">
            {topRight.label}
          </NavLink>
          <NavLink href={bottomLeft.href} className="bottom-6 left-6 sm:bottom-8 sm:left-10">
            {bottomLeft.label}
          </NavLink>
          <div className="absolute bottom-6 right-6 flex items-center gap-[0.85em] sm:bottom-8 sm:right-10">
            <Link
              href={cart.href}
              className={`transition-opacity duration-300 hover:opacity-60 ${FOCUS}`}
            >
              {cart.label}
            </Link>
            <span aria-hidden className="h-[0.85em] w-px bg-white/35" />
            <button
              type="button"
              lang="it"
              className={`uppercase tracking-[0.26em] transition-opacity duration-300 hover:opacity-60 ${FOCUS}`}
            >
              IT
            </button>
            <span aria-hidden className="opacity-45">
              ·
            </span>
            <button
              type="button"
              lang="en"
              aria-current="true"
              className={`uppercase tracking-[0.26em] opacity-55 transition-opacity duration-300 hover:opacity-100 ${FOCUS}`}
            >
              EN
            </button>
          </div>
        </nav>
      )}

      {!reduced && <CursorRing mx={mx} my={my} />}
    </section>
  );
}

/* ───────────────────────────── pieces ───────────────────────────── */

function FloatingCard({
  slot,
  media,
  mx,
  my,
  reduced,
  unoptimized,
}: {
  slot: CardSlot;
  media?: Media;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  reduced: boolean;
  unoptimized: boolean;
}) {
  const sm = { ...slot, ...slot.sm };
  const md = { ...slot, ...slot.md };

  /* Parallax: deeper cards travel further. */
  const px = useTransform(mx, (v) => v * slot.depth * -30);
  const py = useTransform(my, (v) => v * slot.depth * -20);

  /* Each card drifts on its own period, so the field never pulses in sync. */
  const drift = useMemo(
    () => ({
      distance: 5 + slot.depth * 7,
      duration: 8.5 + slot.depth * 4.5,
      delay: slot.delay * 3.2,
    }),
    [slot.depth, slot.delay],
  );

  if (!media) return null;

  return (
    /* Outer element owns the geometry and never animates, so a card can never
       shift layout — only its descendants transform. */
    <div
      className={`lux-card absolute -translate-x-1/2 -translate-y-1/2 ${VISIBILITY[slot.from]}`}
      style={
        {
          '--x-sm': `${sm.x}%`,
          '--y-sm': `${sm.y}%`,
          '--w-sm': `${sm.w}%`,
          '--x-md': `${md.x}%`,
          '--y-md': `${md.y}%`,
          '--w-md': `${md.w}%`,
          '--x-lg': `${slot.x}%`,
          '--y-lg': `${slot.y}%`,
          '--w-lg': `${slot.w}%`,
          aspectRatio: `${slot.ratio}`,
        } as CSSProperties
      }
    >
      <motion.div className="h-full w-full" style={reduced ? undefined : { x: px, y: py }}>
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0, scale: 0.93, y: 26 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.25, ease: EASE_OUT, delay: slot.delay }}
        >
          <motion.div
            className="relative h-full w-full overflow-hidden rounded-[10px] shadow-[0_16px_40px_-18px_rgba(62,50,34,0.55)] md:rounded-[13px]"
            animate={reduced ? undefined : { y: [0, -drift.distance, 0] }}
            transition={
              reduced
                ? undefined
                : {
                    duration: drift.duration,
                    delay: drift.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={media.src}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.07 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ duration: 0.95, ease: EASE }}
              >
                <Image
                  src={media.src}
                  alt=""
                  fill
                  unoptimized={unoptimized}
                  sizes="(max-width:767px) 34vw, (max-width:1023px) 20vw, 12vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** One mark on the progress rule. Ticks near the head stand slightly taller. */
function Tick({
  index,
  total,
  tour,
  reduced,
}: {
  index: number;
  total: number;
  tour: MotionValue<number>;
  reduced: boolean;
}) {
  const at = index / (total - 1);

  const opacity = useTransform(tour, (v) => (at <= (((v % 1) + 1) % 1) ? 0.92 : 0.24));
  const height = useTransform(tour, (v) => {
    const d = Math.abs(at - (((v % 1) + 1) % 1));
    return `${d < 0.14 ? 11 - (d / 0.14) * 4 : 7}px`;
  });

  return (
    <motion.span
      aria-hidden
      className="w-[1.5px] rounded-full bg-white"
      style={reduced ? { opacity: index === 0 ? 0.92 : 0.24, height: 7 } : { opacity, height }}
    />
  );
}

function NavLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`absolute transition-opacity duration-300 hover:opacity-60 ${FOCUS} ${className}`}
    >
      {children}
    </Link>
  );
}

function Droplet() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 40"
      className="h-[clamp(24px,2.4vw,34px)] w-auto"
      fill="none"
      stroke="#EBDCC3"
      strokeWidth="1.1"
      strokeLinecap="round"
      opacity="0.85"
    >
      <path d="M16 3.2C16 3.2 28.6 18.4 28.6 25.6A12.6 12.6 0 1 1 3.4 25.6C3.4 18.4 16 3.2 16 3.2Z" />
      <path d="M8.6 29.6 23.4 18.4" />
    </svg>
  );
}

/** Thin ring trailing the pointer. Fine pointers only — never on touch. */
function CursorRing({ mx, my }: { mx: MotionValue<number>; my: MotionValue<number> }) {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const q = window.matchMedia('(pointer: fine)');
    const sync = () => setFine(q.matches);
    sync();
    q.addEventListener('change', sync);
    return () => q.removeEventListener('change', sync);
  }, []);

  const left = useTransform(mx, (v) => `${(v + 0.5) * 100}%`);
  const top = useTransform(my, (v) => `${(v + 0.5) * 100}%`);

  if (!fine) return null;

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute z-20 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/55"
      style={{ left, top }}
    />
  );
}