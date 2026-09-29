"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface AboutHeroSectionProps {
  imageSrc: string;
  imageAlt?: string;
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
  /** true for anything above the fold — plays immediately instead of
      waiting for a scroll that may never come */
  onMount?: boolean;
}) {
  const anim = onMount
    ? { animate: { opacity: 1, y: 0 } }
    : {
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-70px" } as const,
      };

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...anim}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FACTS = ["Alcohol-free", "pH-balanced", "100% natural essential oils"];

export function AboutHeroSection({
  imageSrc,
  imageAlt = "About Leira",
}: AboutHeroSectionProps) {
  const headline = [
    "India’s first perfume",
    "designed for your",
    <>
      most <em className="not-italic text-[#ec4899]">intimate</em> self.
    </>,
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf1f5] via-[#fff7fa] to-[#fffdfc] px-5 pb-16 pt-20 sm:px-8 md:pb-24 md:pt-28 lg:px-12 pt-16">
      {/* soft drifting glow */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 40, 0], y: [0, -34, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[42vw] max-h-[560px] w-[42vw] max-w-[560px] rounded-full bg-[#f9a8d4]/30 blur-[95px]"
      />

      {/* ---------- masthead ---------- */}
      <div className="mx-auto max-w-3xl text-center mt-15">
        <Reveal onMount>
          <span className="inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#ec4899]">
            <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
            Discover Leira
          </span>
        </Reveal>

        <h1 className="mt-6 font-serif text-[clamp(31px,5.2vw,66px)] font-light leading-[1.08] tracking-tight text-[#7a2c4e]">
          {headline.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.1 + i * 0.11, ease: EASE }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <Reveal delay={0.5} onMount>
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.55, ease: EASE }}
            className="mx-auto mt-8 block h-px w-16 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent"
          />
        </Reveal>
      </div>

      {/* ---------- the image ---------- */}
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
        animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.25, ease: [0.76, 0, 0.24, 1] }}
        className="relative mx-auto mt-12 h-[44vh] max-w-6xl overflow-hidden rounded-[26px] shadow-[0_50px_90px_-58px_rgba(122,44,78,0.62)] md:mt-16 md:h-[60vh]"
      >
        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, delay: 0.25, ease: EASE }}
          className="absolute inset-0"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3a1424]/50 via-transparent to-transparent" />

        {/* caption on the photograph */}
        <Reveal delay={0.9} onMount className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-8 md:right-8">
          <span className="flex items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-white/95 drop-shadow">
            <i
              aria-hidden
              className="block h-2 w-2 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-gradient-to-br from-white to-[#f9a8d4]"
            />
            Damask Rose · Jasmine · Ylang Ylang
          </span>
        </Reveal>
      </motion.div>

      {/* ---------- lede + manifesto ---------- */}
      <div className="mx-auto mt-14 grid max-w-6xl gap-10 md:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)] lg:gap-20">
        <div>
          <Reveal>
            <p className="text-[15px] font-light leading-[1.92] text-[#6b5560] md:text-[16.5px]">
              Self-care has always been about the details — the moisturiser you choose, the fragrance
              you wear, the rituals that make you feel like yourself. But for most women in India,
              one area of personal care has always been overlooked: the intimate area.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-5 text-[15px] font-light leading-[1.92] text-[#6b5560] md:text-[16.5px]">
              At Leira, we asked a simple question: why should your bikini area, private area and
              sensitive skin settle for anything less than luxury?
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 text-[15px] font-light leading-[1.92] text-[#6b5560] md:text-[16.5px]">
              That question became our answer — India&apos;s first essential oil based intimate
              perfume, crafted specifically for the delicate skin of your intimate area. Not harsh.
              Not clinical. Not overwhelming. Just pure, botanical confidence, bottled.
            </p>
          </Reveal>
        </div>

        <div className="lg:pt-1">
          <Reveal delay={0.2}>
            <p className="border-l-2 border-[#ec4899] pl-6 font-serif text-[clamp(20px,2.3vw,30px)] font-light italic leading-[1.42] text-[#7a2c4e]">
              Because every part of you deserves self-care. Not just the visible parts.
            </p>
          </Reveal>

          {/* three quiet credentials */}
          <dl className="mt-9 border-t border-[#7a2c4e]/[0.12]">
            {FACTS.map((fact, i) => (
              <motion.div
                key={fact}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: 0.35 + i * 0.09, ease: EASE }}
                className="flex items-baseline gap-5 border-b border-[#7a2c4e]/[0.12] py-3.5"
              >
                <dt className="text-[10.5px] tracking-[0.2em] text-[#ec4899]">0{i + 1}</dt>
                <dd className="font-serif text-[17px] text-[#7a2c4e] md:text-[19px]">{fact}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default AboutHeroSection;