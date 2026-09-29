"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";

const EASE = [0.22, 1, 0.36, 1] as const;

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

/* Reveal that can never leave content invisible — if the observer never
   fires, a timer shows it anyway. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
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
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setShown(true);
              io?.disconnect();
            }
          }),
        { threshold: 0.12 }
      );
      io.observe(el);
    } catch {
      setShown(true);
      return;
    }

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
  y = 24,
  className = "",
  onMount = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  onMount?: boolean;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const visible = onMount ? true : shown;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
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
  onMount = false,
  as: Tag = "h2",
}: {
  lines: (string | ReactNode)[];
  className?: string;
  onMount?: boolean;
  as?: "h1" | "h2";
}) {
  const { ref, shown } = useReveal<HTMLHeadingElement>();
  const visible = onMount ? true : shown;
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        /* pb/-mb pair keeps descenders from being clipped by the mask */
        <span key={i} className="-mb-[0.16em] block overflow-hidden pb-[0.16em]">
          <motion.span
            className="block"
            initial={{ y: "108%" }}
            animate={visible ? { y: 0 } : { y: "108%" }}
            transition={{ duration: 1, delay: 0.1 + i * 0.11, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

function Wipe({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
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
      transition={{ duration: 1.25, delay, ease: [0.76, 0, 0.24, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Variant data — copy unchanged from your page. Emoji removed from the
   titles; the numeral does that job.
------------------------------------------------------------------- */
type Benefit = { title: string; description: string };

type Variant = {
  slug: string;
  eyebrow: string;
  name: string;
  poetic: string;
  headline: string;
  accent: string;
  tone: "ivory" | "blush" | "plum";
  reverse: boolean;
  lead: string;
  paras: string[];
  perfectFor: string;
  gallery: string[];
  benefitsTitle: string;
  benefits: Benefit[];
};

const VARIANTS: Variant[] = [
  {
    slug: "jasmine",
    eyebrow: "The collection · 01",
    name: "Leira Jasmine",
    poetic: "Essence of Purity",
    headline: "Natural care for sensitive skin",
    accent: "#ec4899",
    tone: "ivory",
    reverse: false,
    lead: "A gentle, light floral intimate perfume for your bikini area and sensitive skin — crafted with pure jasmine essential oil.",
    paras: [
      "Leira Jasmine is your everyday intimate companion: light, romantic and effortlessly fresh. Formulated with pure jasmine essential oil, this alcohol-free intimate perfume is designed for the delicate skin of your bikini area and sensitive intimate area. Soft enough for daily use, yet effective enough to keep you confident from morning to midnight.",
      "Jasmine has been used for centuries in Ayurvedic and traditional feminine care for its soothing, antibacterial and mood-lifting properties. In Leira, it becomes your daily ritual of self-care — gentle, natural and luxurious.",
    ],
    perfectFor: "Daily use, sensitive skin, bikini area care, and intimate freshness.",
    gallery: ["/images/j7.jpg", "/images/j2.jpg", "/images/j5.jpg", "/images/j6.png"],
    benefitsTitle: "Benefits of Leira Jasmine for your intimate area",
    benefits: [
      { title: "Cooling sensation", description: "Delivers a gentle, non-irritating cooling effect to the bikini area and intimate skin, relieving discomfort and heat — especially during warm weather or physical activity." },
      { title: "Freshness & odour control", description: "Naturally controls unwanted odour in your intimate area and private area by refreshing the skin and reducing moisture without disrupting your body's natural scent." },
      { title: "Soothes mild discomfort", description: "Jasmine's anti-inflammatory properties gently soothe minor irritation, itching and redness in the sensitive area and outer intimate skin." },
      { title: "Long-lasting sensory effect", description: "A single application delivers hours of intimate freshness — keeping your bikini area feeling clean and confident throughout the day." },
      { title: "Natural tightening effect", description: "Rich in natural tannins, Leira Jasmine gently supports tightening and toning of intimate area skin and bikini area skin — a popular choice for postpartum intimate care and everyday feminine wellness." },
      { title: "Supports intimate dryness relief", description: "Helps nourish and hydrate the sensitive intimate area, supporting comfort and relief from external dryness in the bikini area." },
      { title: "Antibacterial & antifungal", description: "Jasmine's natural antibacterial properties help keep the intimate area clean and protected, reducing the risk of external infection on sensitive skin." },
      { title: "Aromatherapy & mood uplift", description: "The delicate jasmine scent has a calming and uplifting effect — boosting confidence and reducing stress, especially during menstruation or intimate moments." },
      { title: "Anti-inflammatory care", description: "Soothes inflammation on the outer intimate area and sensitive skin, making it ideal for women with reactive or easily irritated bikini area skin." },
      { title: "Improves skin barrier", description: "Jasmine essential oil nourishes and strengthens the delicate skin barrier of the intimate area, keeping sensitive skin soft, protected and healthy." },
      { title: "Kiss-friendly natural lubricant", description: "Edible-grade, kiss-friendly formulation makes Leira Jasmine a safe and sensual addition to your intimate self-care and romantic wellness routine." },
    ],
  },
  {
    slug: "ylang-ylang",
    eyebrow: "The collection · 02",
    name: "Leira Ylang Ylang",
    poetic: "Exotic Bliss",
    headline: "Private area & bikini care",
    accent: "#ec4899",
    tone: "plum",
    reverse: true,
    lead: "A bold, sensual intimate perfume for your private area — crafted with rich Cananga Odorata (Ylang Ylang) essential oil.",
    paras: [
      "Leira Ylang Ylang is for the woman who owns every room she walks into. Bold, exotic and deeply sensual — this intimate perfume for the private area and bikini area is formulated with pure Cananga Odorata essential oil, known globally for rich floral, musky depth and intimate wellness properties.",
      "Ylang Ylang has long been celebrated as a natural aphrodisiac and mood elevator. In Leira, it is transformed into a concentrated intimate care oil that nourishes your sensitive area, controls odour, and builds deep, lasting confidence in your most private moments.",
    ],
    perfectFor: "Intimate occasions, private area care, mood enhancement, and long-lasting sensual freshness.",
    gallery: ["/images/black.JPEG", "/images/y2.jpg", "/images/y3.jpg", "/images/y4.jpg"],
    benefitsTitle: "Benefits of Leira Ylang Ylang for your private area",
    benefits: [
      { title: "Long-lasting cooling sensation", description: "Provides an extended cooling and refreshing effect to the private area and bikini area — keeping intimate skin comfortable and fresh for hours." },
      { title: "Soothing & refreshing care", description: "Gently soothes and refreshes the sensitive intimate area, relieving discomfort, dryness and irritation on delicate private area skin." },
      { title: "Mild & non-irritating formula", description: "Specially formulated to be gentle on the most sensitive intimate skin — safe for daily use on the bikini area and private area without causing redness or reaction." },
      { title: "Odour control for private area", description: "Ylang Ylang's natural deodorising properties effectively control unwanted odour in the private area and intimate area, keeping you fresh from morning to evening." },
      { title: "Helps tone intimate skin", description: "Supports gentle tightening and toning of intimate area skin — a popular benefit for postpartum intimate care and everyday feminine confidence." },
      { title: "Reduces excess discharge", description: "Helps manage and reduce excess intimate discharge, keeping the bikini area feeling dry, clean and comfortable throughout the day." },
      { title: "Maintains intimate pH balance", description: "Ylang Ylang's natural properties help support the sensitive area's healthy pH balance — protecting the intimate area from disruption caused by harsh chemicals." },
      { title: "Anti-inflammatory & healing", description: "Reduces inflammation and supports skin healing on the outer intimate area and sensitive bikini area skin after irritation, shaving or waxing." },
      { title: "Rich in antioxidants", description: "Protects intimate area skin from oxidative stress and environmental damage — keeping sensitive skin in the bikini area looking and feeling healthy." },
      { title: "Antibacterial & antifungal", description: "Natural antibacterial and antifungal properties keep the intimate area and private area protected, clean and balanced every day." },
      { title: "Mental & mood uplift", description: "The rich, exotic ylang ylang aroma is recognised for boosting confidence, reducing anxiety and elevating mood — especially during intimate or stressful moments." },
      { title: "Natural aphrodisiac", description: "Ylang Ylang is one of nature's most celebrated aphrodisiacs — Leira harnesses this to create a sensual intimate care experience that enhances confidence and romantic wellness." },
    ],
  },
  {
    slug: "damask-rose",
    eyebrow: "The collection · 03",
    name: "Leira Damask Rose",
    poetic: "Romantic Essence",
    headline: "Sensitive area feminine care",
    accent: "#b23a63",
    tone: "blush",
    reverse: false,
    lead: "A sophisticated, elegant intimate perfume for your sensitive area — crafted with pure Damask Rose essential oil.",
    paras: [
      "Leira Damask Rose is the ultimate expression of feminine luxury. Sophisticated, warm and deeply nourishing — this intimate perfume for the sensitive area and bikini area is crafted with pure Damask Rose essential oil, one of the world's most prized botanical ingredients in feminine care.",
      "Damask Rose is celebrated in skincare for its anti-inflammatory, skin-hydrating and pH-balancing properties. In Leira, it becomes a daily intimate care ritual — protecting your sensitive area, reducing irritation, and leaving your private area feeling luxuriously soft, fresh and deeply confident.",
    ],
    perfectFor: "Sensitive area care, post-menstruation recovery, hydration, and elegant intimate freshness.",
    gallery: ["/images/d1.jpg", "/images/intro3.png", "/images/d4.jpg", "/images/d3.jpg"],
    benefitsTitle: "Benefits of Leira Damask Rose for your sensitive area",
    benefits: [
      { title: "Cooling effect for sensitive area", description: "Provides a gentle, soothing cooling sensation to the sensitive intimate area and bikini area — relieving heat, friction discomfort and irritation effectively." },
      { title: "Soothes irritation & itchiness", description: "Damask Rose's anti-inflammatory properties calm itching, redness and irritation on the outer sensitive area and bikini area skin." },
      { title: "Moisture & sweat control", description: "Absorbs excess moisture and sweat from the intimate area and private area, keeping sensitive skin feeling dry, fresh and comfortable all day." },
      { title: "Odour-fighting freshness", description: "Naturally fights odour in the intimate area and private area — Damask Rose's fresh floral scent gently neutralises unwanted odour without overpowering." },
      { title: "Post-menstruation care", description: "Specially beneficial for sensitive area care during and after menstruation — soothes inflammation, reduces discomfort and restores freshness to the intimate area." },
      { title: "Natural skin tightening effect", description: "Rich in natural astringents, Leira Damask Rose gently supports toning and tightening of intimate area skin and sensitive bikini area skin — widely used in traditional postpartum intimate care across India." },
      { title: "Reduces excess discharge", description: "Helps manage and reduce excess intimate discharge, keeping your private area and bikini area feeling clean, dry and comfortable." },
      { title: "Supports healthy intimate pH", description: "Carefully formulated to support the natural pH balance of the sensitive area — protecting intimate skin from disruption and maintaining everyday comfort." },
      { title: "Rich in antioxidants", description: "Damask Rose is packed with natural antioxidants that protect sensitive area skin from damage, keeping your intimate skin looking and feeling youthful and healthy." },
      { title: "Improves skin elasticity & firmness", description: "Nourishes and improves the elasticity of delicate intimate area skin — keeping your sensitive area soft, supple and resilient with daily use." },
      { title: "Supports wound healing", description: "Accelerates the natural healing of minor skin irritation, micro-tears and post-shaving sensitivity in the bikini area and intimate area." },
      { title: "Natural aphrodisiac", description: "Damask Rose is one of the most romantic scents in the world — Leira's Damask Rose variant enhances intimate confidence and sensual wellness naturally." },
      { title: "Supports skin barrier function", description: "Strengthens and protects the delicate skin barrier of the sensitive area and intimate skin — locking in hydration and keeping irritants out." },
      { title: "Hydrating & softening", description: "Deeply hydrates and softens the skin of the intimate area and bikini area, preventing dryness and keeping sensitive skin comfortable throughout the day." },
    ],
  },
];

const TONES: Record<
  Variant["tone"],
  { section: string; heading: string; body: string; hair: string; sub: string; card: string }
> = {
  ivory: {
    section: "bg-[#fffdfc]",
    heading: "text-[#7a2c4e]",
    body: "text-[#6b5560]",
    hair: "border-[#7a2c4e]/[0.12]",
    sub: "text-[#7a2c4e]/45",
    card: "hover:bg-[#fff5f9]",
  },
  blush: {
    section: "bg-gradient-to-b from-[#fdeef4] via-[#fff5f9] to-[#fffdfc]",
    heading: "text-[#7a2c4e]",
    body: "text-[#6b5560]",
    hair: "border-[#7a2c4e]/[0.12]",
    sub: "text-[#7a2c4e]/45",
    card: "hover:bg-white/60",
  },
  plum: {
    section: "bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31]",
    heading: "text-white",
    body: "text-[#f7dfe8]/75",
    hair: "border-white/[0.14]",
    sub: "text-white/40",
    card: "hover:bg-white/[0.04]",
  },
};

/* ------------------------------------------------------------------
   One variant: intro + gallery, then the benefits ledger
------------------------------------------------------------------- */
function VariantSection({ v }: { v: Variant }) {
  const [expanded, setExpanded] = useState(false);
  const t = TONES[v.tone];
  const dark = v.tone === "plum";
  const accentText = dark ? "#f9a8d4" : v.accent;
  const visible = expanded ? v.benefits : v.benefits.slice(0, 6);

  return (
    <section
      id={v.slug}
      className={`relative isolate scroll-mt-24 [overflow:clip] px-5 py-20 sm:px-8 md:py-28 lg:px-12 ${t.section}`}
    >
      <Grain opacity={dark ? 0.05 : 0.035} />
      <span
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[38vw] max-h-[460px] w-[38vw] max-w-[460px] rounded-full blur-[110px]"
        style={
          {
            background: `${v.accent}${dark ? "33" : "22"}`,
            [v.reverse ? "right" : "left"]: "-8rem",
            top: "18%",
          } as CSSProperties
        }
      />

      <div className="mx-auto max-w-7xl">
        {/* ---- intro + gallery ---- */}
        <div
          className={`grid items-center gap-12 lg:gap-20 ${
            v.reverse
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]"
              : "lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]"
          }`}
        >
          <div className={v.reverse ? "lg:order-2" : ""}>
            <Reveal>
              <span
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em]"
                style={{ background: `${v.accent}1f`, color: accentText }}
              >
                <i aria-hidden className="block h-1.5 w-1.5 rounded-full" style={{ background: v.accent }} />
                {v.eyebrow}
              </span>
            </Reveal>

            <MaskedHeading
              className={`mt-6 font-serif text-[clamp(28px,3.6vw,48px)] font-light leading-[1.1] tracking-tight ${t.heading}`}
              lines={[
                v.name,
                <span key="h" style={{ color: accentText }}>
                  {v.headline}
                </span>,
              ]}
            />

            <Reveal delay={0.25}>
              <p className={`mt-3 font-serif text-[clamp(22px,2.4vw,32px)] font-light italic ${t.sub}`}>
                {v.poetic}
              </p>
            </Reveal>

            <Reveal delay={0.32}>
              <p className={`mt-7 max-w-[46ch] text-[15.5px] font-light leading-[1.85] ${t.body} md:text-[17px]`}>
                {v.lead}
              </p>
            </Reveal>

            {v.paras.map((p, i) => (
              <Reveal key={i} delay={0.38 + i * 0.06}>
                <p className={`mt-4 max-w-[52ch] text-[14.5px] font-light leading-[1.9] ${t.body}`}>{p}</p>
              </Reveal>
            ))}

            <Reveal delay={0.5}>
              <p className={`mt-7 border-t pt-5 text-[13px] font-light leading-[1.75] ${t.hair} ${t.body}`}>
                <span className="uppercase tracking-[0.2em]" style={{ color: dark ? "#ec4899" : v.accent }}>
                  Perfect for
                </span>
                <span className="mt-2 block">{v.perfectFor}</span>
              </p>
            </Reveal>

            <Reveal delay={0.56}>
              <Link
                href={`/shop/${v.slug}`}
                className="group relative mt-8 inline-block overflow-hidden rounded-full px-9 py-4 text-[11px] uppercase tracking-[0.22em] text-white transition-transform duration-500 hover:-translate-y-0.5"
                style={{ background: v.accent }}
              >
                <span className="relative z-10">Shop {v.name}</span>
                <span
                  aria-hidden
                  className="absolute inset-0 translate-y-full bg-[#2b0f1d] transition-transform duration-500 group-hover:translate-y-0"
                />
              </Link>
            </Reveal>
          </div>

          {/* gallery: one wide frame with three beneath */}
          <div className={`grid grid-cols-3 gap-3 md:gap-4 ${v.reverse ? "lg:order-1" : ""}`}>
            <Wipe className="col-span-3 relative aspect-[16/10] overflow-hidden rounded-[20px] bg-[#f7e6ee] shadow-[0_40px_80px_-56px_rgba(122,44,78,0.6)]">
              <Image
                src={v.gallery[0]}
                alt={`${v.name} intimate perfume`}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center"
                priority
              />
            </Wipe>

            {v.gallery.slice(1, 4).map((src, i) => (
              <Wipe
                key={src}
                delay={0.12 + i * 0.09}
                className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f7e6ee] shadow-[0_24px_50px_-40px_rgba(122,44,78,0.6)]"
              >
                <Image
                  src={src}
                  alt={`${v.name} gallery image ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 15vw"
                  className="object-cover object-center"
                  loading="lazy"
                />
              </Wipe>
            ))}
          </div>
        </div>

        {/* ---- benefits ledger ---- */}
        <div className="mt-16 md:mt-24">
          <Reveal>
            <h3 className={`font-serif text-[clamp(20px,2.2vw,30px)] font-light leading-[1.25] ${t.heading}`}>
              {v.benefitsTitle}
            </h3>
          </Reveal>

          <dl className={`mt-8 grid gap-x-12 border-t md:grid-cols-2 ${t.hair}`}>
            {visible.map((b, i) => (
              <Reveal
                key={b.title}
                delay={(i % 6) * 0.05}
                className={`-mx-4 border-b px-4 py-5 transition-colors duration-500 md:py-6 ${t.hair} ${t.card}`}
              >
                <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
                  <span
                    className="text-[11px] leading-[1.75] tracking-[0.16em]"
                    style={{ color: dark ? "#ec4899" : v.accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <dt className={`font-serif text-[clamp(17px,1.5vw,21px)] leading-[1.3] ${t.heading}`}>
                      {b.title}
                    </dt>
                    <dd className={`mt-2 text-[14px] font-light leading-[1.8] ${t.body}`}>
                      {b.description}
                    </dd>
                  </div>
                </div>
              </Reveal>
            ))}
          </dl>

          {v.benefits.length > 6 && (
            <Reveal delay={0.1}>
              <button
                type="button"
                onClick={() => setExpanded((x) => !x)}
                aria-expanded={expanded}
                className={`mt-8 inline-flex items-center gap-3 border-b pb-1 font-serif text-[19px] transition-colors duration-300 ${t.heading} ${t.hair}`}
              >
                {expanded ? "Show fewer benefits" : `Show all ${v.benefits.length} benefits`}
                <span
                  aria-hidden
                  className={`block h-1.5 w-1.5 rotate-45 border-b border-r transition-transform duration-500 ${
                    expanded ? "-translate-y-0.5 rotate-[225deg]" : ""
                  }`}
                  style={{ borderColor: dark ? "#ec4899" : v.accent }}
                />
              </button>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
   Page
   ================================================================== */
const MATCH = [
  { label: "Everyday freshness", name: "Leira Jasmine", body: "Best for sensitive skin and daily bikini area care.", accent: "#ec4899", slug: "jasmine" },
  { label: "Bold confidence", name: "Leira Ylang Ylang", body: "Best for private area confidence and intimate occasions.", accent: "#ec4899", slug: "ylang-ylang" },
  { label: "Nourishing recovery", name: "Leira Damask Rose", body: "Best for sensitive area care and post-menstruation recovery.", accent: "#b23a63", slug: "damask-rose" },
];

export default function BenefitsPage() {
  return (
    <>
      <MiniNavbar />
      <main className="min-h-screen bg-white leira-underlap-nav-spacer">
        {/* ---------------- masthead ---------------- */}
        <section className="relative isolate [overflow:clip] bg-gradient-to-b from-[#fdf1f5] via-[#fff7fa] to-[#fffdfc] px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24 lg:px-12">
          <Grain />
          <motion.span
            aria-hidden
            animate={{ x: [0, 40, 0], y: [0, -34, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-24 -top-28 -z-10 h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full bg-[#f9a8d4]/30 blur-[95px]"
          />

          <div className="mx-auto max-w-3xl text-center mt-15">
            <Reveal onMount>
              <span className="inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#ec4899]">
                <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
                Natural care benefits
              </span>
            </Reveal>

            <MaskedHeading
              as="h1"
              onMount
              className="mt-6 font-serif text-[clamp(30px,4.6vw,58px)] font-light leading-[1.08] tracking-tight text-[#7a2c4e]"
              lines={[
                "Benefits of intimate",
                "perfume for everyday",
                <>
                  feminine <em className="not-italic text-[#ec4899]">confidence</em>.
                </>,
              ]}
            />

            <Reveal delay={0.5} onMount>
              <p className="mx-auto mt-7 max-w-[58ch] text-[15px] font-light leading-[1.9] text-[#6b5560] md:text-base">
                Every woman deserves to feel fresh, comfortable and confident — every single day.
                Leira is India&apos;s first essential oil based intimate perfume, crafted for the
                delicate external intimate skin, including the bikini area and other sensitive areas.
                Dermatologically tested and alcohol-free, it works in harmony with your body&apos;s
                natural chemistry rather than overpowering it.
              </p>
            </Reveal>
          </div>

          {/* jump links to the three variants */}
          <Reveal delay={0.6} onMount className="mx-auto mt-12 max-w-6xl">
            <div className="grid gap-px overflow-hidden rounded-[20px] border border-[#7a2c4e]/[0.1] bg-[#7a2c4e]/[0.08] sm:grid-cols-3">
              {MATCH.map((m) => (
                <a
                  key={m.slug}
                  href={`#${m.slug}`}
                  className="group bg-[#fffdfc] px-6 py-6 text-center transition-colors duration-500 hover:bg-[#fff5f9]"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: m.accent }}>
                    {m.label}
                  </span>
                  <span className="mt-2 block font-serif text-[21px] font-light text-[#7a2c4e]">
                    {m.name}
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------------- the three variants ---------------- */}
        {VARIANTS.map((v) => (
          <VariantSection key={v.slug} v={v} />
        ))}

        {/* ---------------- find your match ---------------- */}
        <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <Grain />
          <div className="mx-auto max-w-7xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#ec4899]">
                <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
                Signature match
              </span>
            </Reveal>

            <MaskedHeading
              className="mt-6 font-serif text-[clamp(27px,3.6vw,46px)] font-light leading-[1.12] tracking-tight text-[#7a2c4e]"
              lines={[
                "Find your",
                <>
                  perfect <em className="not-italic text-[#ec4899]">scent</em>.
                </>,
              ]}
            />

            <Reveal delay={0.3}>
              <p className="mx-auto mt-6 max-w-[56ch] text-[15px] font-light leading-[1.9] text-[#6b5560] md:text-[16.5px]">
                Every woman is different, and every intimate care need is unique. That is why Leira
                offers three distinct variants — each crafted to address specific needs of your
                intimate area, bikini area, sensitive area and private area.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-px overflow-hidden rounded-[22px] border border-[#7a2c4e]/[0.1] bg-[#7a2c4e]/[0.08] text-left md:grid-cols-3">
              {MATCH.map((m, i) => (
                <Reveal
                  key={m.slug}
                  delay={i * 0.08}
                  className="bg-[#fffdfc] p-8 transition-colors duration-500 hover:bg-[#fff5f9]"
                >
                  <span className="text-[10.5px] uppercase tracking-[0.2em]" style={{ color: m.accent }}>
                    {m.label}
                  </span>
                  <p className="mt-3 font-serif text-[clamp(21px,2vw,27px)] font-light text-[#7a2c4e]">
                    {m.name}
                  </p>
                  <p className="mt-3 text-[14px] font-light leading-[1.8] text-[#6b5560]">{m.body}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <Link
                href="/shop"
                className="group relative mt-12 inline-block overflow-hidden rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-10 py-4 text-[11px] uppercase tracking-[0.22em] text-white shadow-[0_18px_34px_-20px_rgba(236,72,153,0.9)] transition-transform duration-500 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Shop all Leira variants</span>
                <span
                  aria-hidden
                  className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0"
                />
              </Link>
            </Reveal>

            {/* required for a cosmetic making skin claims */}
            <Reveal delay={0.4}>
              <p className="mx-auto mt-14 max-w-[70ch] border-t border-[#7a2c4e]/[0.12] pt-7 text-[12px] font-light leading-[1.75] text-[#6b5560]/70">
                Leira is a cosmetic product for external use on the bikini line and outer intimate
                area only. It is not a medicine and is not intended to diagnose, treat, cure or
                prevent any condition. Patch test before first use, avoid freshly shaved or waxed
                skin, and stop use if irritation occurs. If you have a persistent symptom, please
                speak to a doctor.
              </p>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}