"use client";

import { useEffect, useRef, useState } from "react";
import {
  Atom,
  Droplets,
  Feather,
  FlaskConical,
  Gem,
  Leaf,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

type Usp = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const usps: Usp[] = [
  { title: "pH Balanced", description: "Formulated to maintain your skin’s natural pH balance.", icon: FlaskConical },
  { title: "Dermatology Tested", description: "Carefully tested for skin compatibility and everyday use.", icon: Gem },
  { title: "Premium Ingredients", description: "Thoughtfully selected ingredients with exceptional quality.", icon: Leaf },
  { title: "High Absorption", description: "Designed for efficient absorption and everyday use.", icon: Droplets },
  { title: "Clean Formula", description: "A carefully considered formula without unnecessary additions.", icon: Feather },
  { title: "Advanced Formula", description: "Modern formulation combining science and premium ingredients.", icon: Atom },
  { title: "Everyday Wellness", description: "Simple nutrition designed to fit naturally into your daily routine.", icon: Sun },
  { title: "Quality Assured", description: "Produced with rigorous quality and consistency standards.", icon: ShieldCheck },
];

const leftUsps = usps.slice(0, 4);
const rightUsps = usps.slice(4, 8);

const VIDEO_SRC =
  "/videos/product-showcase.mp4";

/* ------------------------------------------------------------------ */
/* Design tokens                                                      */
/* ------------------------------------------------------------------ */

const token = {
  shell: "#fff5fa",
  ink: "#1E1C19",
  darkPink: "#999",
  sand: "#E4DCCE",
  pink: "#fe3ca2",
} as const;

const displayFont =
  'var(--font-display, ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif)';

const bodyFont =
  'var(--font-body, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif)';

/* ------------------------------------------------------------------ */
/* Scroll Reveal Hook                                                 */
/* ------------------------------------------------------------------ */

function useScrollReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/* ------------------------------------------------------------------ */
/* Product visual — the video + aperture rings, factored out so it    */
/* can render both on mobile (always visible, above the slider) and   */
/* on desktop (inside the two-column layout), instead of only living  */
/* inside a `hidden lg:grid` block where phones never saw it at all.  */
/* ------------------------------------------------------------------ */

function ProductVisual({ blendVideo }: { blendVideo: boolean }) {
  const { ref: videoRef, isVisible: videoVisible } = useScrollReveal<HTMLDivElement>(0.15);

  return (
    <div
      ref={videoRef}
      className={[
        "relative mx-auto w-full max-w-[360px] lg:max-w-none",
        "transform-gpu",
        "transition-all duration-[1200ms]",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        videoVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[0.965] opacity-0",
      ].join(" ")}
      style={{ backgroundColor: token.shell }}
    >
      {/* OUTER APERTURE RING */}
      {/* <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full",
          "transition-all duration-[1400ms] ease-out",
          videoVisible ? "scale-100 opacity-100" : "scale-[0.82] opacity-0",
        ].join(" ")}
        style={{ boxShadow: `inset 0 0 0 1px ${token.sand}` }}
      /> */}

      {/* INNER APERTURE RING */}
    

      {/* SOFT RADIAL LIGHT */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full",
          "transition-all duration-[1800ms] ease-out",
          videoVisible ? "scale-100 opacity-100" : "scale-[0.7] opacity-0",
        ].join(" ")}
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 42%, rgba(255,255,255,0) 70%)",
          transitionDelay: "250ms",
        }}
      />

      {/* CONTACT SHADOW */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute bottom-[6%] left-1/2 h-6 w-[46%] -translate-x-1/2 rounded-[50%] blur-xl",
          "transition-all duration-[1000ms] ease-out",
          videoVisible ? "scale-100 opacity-100" : "scale-[0.65] opacity-0",
        ].join(" ")}
        style={{ backgroundColor: "rgba(30,28,25,0.10)", transitionDelay: "350ms" }}
      />

      {/* VIDEO — `muted` is required alongside `autoPlay`; browsers
          block unmuted autoplay outright, especially on mobile. */}
      <video
        className={[
          "relative z-10 aspect-[4/5] w-full object-contain",
          "[&::-webkit-media-controls]:hidden",
          blendVideo ? "mix-blend-multiply" : "",
          "transition-transform duration-[1200ms] ease-out",
          videoVisible ? "scale-100" : "scale-[0.96]",
        ].join(" ")}
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* USP Item                                                           */
/*                                                                     */
/* `variant="column"` — desktop: reveal-on-scroll, side-aligned text, */
/* the little connector line pointing at the video.                  */
/* `variant="slide"` — mobile slider card: no animation at all, no    */
/* connector line, just the content, fully visible immediately.      */
/* ------------------------------------------------------------------ */

function UspItem({
  usp,
  side,
  index,
  variant = "column",
}: {
  usp: Usp;
  side: "left" | "right";
  index: number;
  variant?: "column" | "slide";
}) {
  const Icon = usp.icon;
  const isLeft = side === "left";
  const isSlide = variant === "slide";

  const { ref, isVisible } = useScrollReveal<HTMLLIElement>(0.2);
  const shown = isSlide ? true : isVisible;

  return (
    <li
      ref={ref}
      className={[
        "group relative flex flex-col items-center text-center",

        isSlide
          ? "w-[240px] shrink-0 snap-center sm:w-[260px]"
          : "mx-auto w-full max-w-[20rem] lg:mx-0 lg:max-w-[17rem]",

        !isSlide && (isLeft ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"),

        !isSlide && "transform-gpu transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        !isSlide &&
          (shown
            ? "translate-x-0 translate-y-0 opacity-100"
            : isLeft
              ? "-translate-x-10 translate-y-4 opacity-0"
              : "translate-x-10 translate-y-4 opacity-0"),
      ]
        .filter(Boolean)
        .join(" ")}
      style={!isSlide ? { transitionDelay: shown ? `${index * 100}ms` : "0ms" } : undefined}
    >
      {!isSlide && (
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute top-[1.4rem] hidden items-center lg:flex",
            isLeft ? "left-full ml-4 flex-row" : "right-full mr-4 flex-row-reverse",
          ].join(" ")}
        >
          <span
            className={["block h-px origin-center", "transition-all duration-700 ease-out", shown ? "w-9" : "w-0"].join(" ")}
            style={{ backgroundColor: token.sand, transitionDelay: shown ? `${index * 100 + 250}ms` : "0ms" }}
          />
          <span
            className={[
              "block h-[3px] w-[3px] rounded-full",
              "transition-all duration-500 ease-out",
              shown ? "scale-100 opacity-100" : "scale-0 opacity-0",
            ].join(" ")}
            style={{ backgroundColor: token.sand, transitionDelay: shown ? `${index * 100 + 350}ms` : "0ms" }}
          />
        </span>
      )}

      <span
        className={[
          "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full",
          !isSlide && "transition-all duration-500 ease-out",
          !isSlide && (shown ? "translate-y-0 scale-100 rotate-0 opacity-100" : "translate-y-3 scale-75 rotate-[-8deg] opacity-0"),
          !isSlide && "group-hover:-translate-y-[3px]",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: `inset 0 0 0 1px ${token.sand}, 0 1px 2px rgba(30,28,25,0.03)`,
          transitionDelay: !isSlide && shown ? `${index * 100 + 120}ms` : "0ms",
        }}
      >
        <Icon
          aria-hidden="true"
          strokeWidth={1.25}
          className={["h-[18px] w-[18px]", !isSlide && "transition-transform duration-500 ease-out"].filter(Boolean).join(" ")}
          style={{ color: token.pink }}
        />
      </span>

      <h3
        className={[
          "text-[0.95rem] leading-snug tracking-[0.005em]",
          !isSlide && "transition-all duration-500 ease-out",
          !isSlide && (shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"),
          !isSlide && (isLeft ? "lg:group-hover:translate-x-[3px]" : "lg:group-hover:-translate-x-[3px]"),
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          fontFamily: bodyFont,
          fontWeight: 500,
          color: token.ink,
          transitionDelay: !isSlide && shown ? `${index * 100 + 220}ms` : "0ms",
        }}
      >
        {usp.title}
      </h3>

      <p
        className={[
          "mt-2 text-[0.8125rem] leading-[1.7] [text-wrap:pretty]",
          !isSlide && "transition-all duration-600 ease-out",
          !isSlide && (shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"),
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          fontFamily: bodyFont,
          color: token.darkPink,
          transitionDelay: !isSlide && shown ? `${index * 100 + 300}ms` : "0ms",
        }}
      >
        {usp.description}
      </p>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                            */
/* ------------------------------------------------------------------ */

type ScienceUSPSectionProps = {
  blendVideo?: boolean;
};

export default function ScienceUSPSection({ blendVideo = true }: ScienceUSPSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const sliderRef = useRef<HTMLUListElement>(null);
  const slideIndexRef = useRef(0);
  const pausedUntilRef = useRef(0);

  useEffect(() => {
    let reduced = false;
    try {
      reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      reduced = false;
    }
    if (reduced) return;

    const advance = () => {
      const el = sliderRef.current;
      if (!el) return;
      if (Date.now() < pausedUntilRef.current) return;

      slideIndexRef.current = (slideIndexRef.current + 1) % usps.length;
      const card = el.children[slideIndexRef.current] as HTMLElement | undefined;
      if (!card) return;

      // Scroll only the slider's own horizontal overflow via scrollTo on
      // the slider element itself. `scrollIntoView` was used before, but
      // it walks up every scrollable ancestor — including the whole page
      // — to bring the target into view. That's what was hijacking the
      // page's vertical scroll position and snapping visitors to this
      // section every 3 seconds, regardless of where they'd scrolled to.
      const target = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
      el.scrollTo({ left: target, behavior: "smooth" });
    };

    const id = window.setInterval(advance, 3000);
    return () => window.clearInterval(id);
  }, []);

  const pauseAutoAdvance = () => {
    pausedUntilRef.current = Date.now() + 4000;
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="science-usp-heading"
      className="relative w-full overflow-hidden px-5 py-24 sm:px-8 lg:py-36"
      style={{ backgroundColor: token.shell }}
    >

    <style jsx>{`
      .heading {
        margin: 0;
        color: #7f2d55;
        font-size: clamp(2.8rem, 5vw, 4.2rem);
        font-weight: 400;
        line-height: 1.05;
        letter-spacing: -0.035em;
        text-align: center;
      }

      .heading .line {
        display: block;
        overflow: hidden;
      }

      .heading .line > span {
        display: block;
        transform: translateY(0);
        opacity: 1;
      }

      .heading .line em {
        color: #fe3ca2;
        font-style: italic;
        font-weight: 400;
      }
    `}</style>
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          {/* <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[#B39A70]" />
            <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[#7b1d4e]"></p>
            <span className="h-px w-8 bg-[#B39A70]" />
          </div>  */}

          <span className="inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#ec4899]">
            <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
            Why Choose Us
          </span>

          
          <h2
            id="science-usp-heading"
            className="heading mt-7"
            style={{ fontFamily: displayFont }}
          >
            <span
              className="line"
              style={{ "--l": 0 } as React.CSSProperties}
            >
              <span>Intimate care,</span>
            </span>
          
            <span
              className="line"
              style={{ "--l": 1 } as React.CSSProperties}
            >
              <span>Science Behind</span>
            </span>
          
            <span
              className="line"
              style={{ "--l": 2 } as React.CSSProperties}
            >
              <span>
                <em>Every Drop</em>
              </span>
            </span>
          </h2>
          
          <p className="mx-auto mt-7 max-w-xl text-[14px] leading-[1.9] tracking-[0.01em] text-[#777168] sm:text-[15px]">
            Every batch begins in the lab and ends in your daily ritual — researched ingredients, measured doses
            and nothing along for the ride.
          </p>
        </header>

        {/* MOBILE / TABLET — video stays visible, then a single
            auto-advancing slider carrying all 8 USP cards. Cards have
            no reveal animation here; only the edge fades and the
            automatic 3s advance move. */}
        <div className="lg:hidden">
          <ProductVisual blendVideo={blendVideo} />

          <div className="relative mt-14 -mx-5 sm:-mx-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 sm:w-20"
              style={{ background: `linear-gradient(90deg, ${token.shell} 0%, ${token.shell}00 100%)` }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 sm:w-20"
              style={{ background: `linear-gradient(270deg, ${token.shell} 0%, ${token.shell}00 100%)` }}
            />

            <ul
              ref={sliderRef}
              role="list"
              onTouchStart={pauseAutoAdvance}
              onPointerDown={pauseAutoAdvance}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[calc(50%-120px)] pb-2 overscroll-x-contain touch-pan-x [scrollbar-width:none] sm:px-[calc(50%-130px)] [&::-webkit-scrollbar]:hidden"
            >
              {usps.map((usp, index) => (
                <UspItem key={usp.title} usp={usp} side={index % 2 === 0 ? "left" : "right"} index={index} variant="slide" />
              ))}
            </ul>
          </div>
        </div>

        {/* DESKTOP — original two-column layout around the video */}
        <div className="mt-16 hidden lg:mt-24 lg:grid lg:grid-cols-[1fr_minmax(320px,460px)_1fr] lg:items-stretch lg:gap-x-12 xl:gap-x-20">
          <ul role="list" className="order-1 flex h-full flex-col justify-between">
            {leftUsps.map((usp, index) => (
              <UspItem key={usp.title} usp={usp} side="left" index={index} />
            ))}
          </ul>

          <div className="order-2">
            <ProductVisual blendVideo={blendVideo} />
          </div>

          <ul role="list" className="order-3 flex h-full flex-col justify-between">
            {rightUsps.map((usp, index) => (
              <UspItem key={usp.title} usp={usp} side="right" index={index} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}