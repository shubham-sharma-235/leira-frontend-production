"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   STEPS — swap `img` for your own shots when you have them.
------------------------------------------------------------------- */
type Step = { n: string; title: string; copy: string; img: string };

const STEPS: Step[] = [
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

const INK = "text-[#7a2c4e]";
const BODY = "text-[#6b5560]";

/** One-time fade-up when scrolled into view. No scroll-position math,
    no custom CSS properties — a plain IntersectionObserver flag and a
    Tailwind transition. A safety timeout guarantees content is never
    stuck hidden if the observer fails to fire. */
function useRevealOnce<T extends HTMLElement>() {
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

export default function LeiraHowToUse() {
    const { ref, shown } = useRevealOnce<HTMLDivElement>();

    return (
        <section className="bg-gradient-to-b from-[#fdeef4] via-[#fff5f9] to-[#fffdfc] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
            <div className="mx-auto max-w-8xl">
                {/* ---------------- heading ---------------- */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="text-[11px] font-light uppercase tracking-[0.3em] text-[#ec4899]/75">The ritual</span>
                    <h2 className={`mt-4 font-serif text-[clamp(28px,4vw,42px)] font-light leading-[1.15] ${INK}`}>
                        How to use Leira
                    </h2>
                    <span aria-hidden className="mx-auto mt-5 block h-px w-14 bg-gradient-to-r from-transparent via-[#7a2c4e] to-transparent" />
                    <p className={`mx-auto mt-5 max-w-[48ch] text-[14.5px] font-light leading-[1.8] ${BODY}`}>
                        Four simple steps. A few drops, and all-day confidence.
                    </p>
                </div>

                {/* ---------------- horizontal step flow ---------------- */}
                <div ref={ref} className="relative mt-16 md:mt-20">
                    {/* the connecting line — horizontal across the row on
                        desktop, running behind the photo badges */}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute left-[12%] right-[12%] top-9 hidden h-px bg-gradient-to-r from-[#ec4899]/40 via-[#7a2c4e]/60 to-[#ec4899]/40 md:block"
                    />

                    <ol className="grid grid-cols-1 gap-y-12 md:grid-cols-4 md:gap-x-6 md:gap-y-0">
                        {STEPS.map((step, i) => (
                            <li
                                key={step.n}
                                className="relative flex gap-5 text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex-col md:items-center md:gap-0 md:text-center"
                                style={{
                                    opacity: shown ? 1 : 0,
                                    transform: shown ? "none" : "translateY(18px)",
                                    transitionDelay: shown ? `${i * 110}ms` : "0ms",
                                }}
                            >
                                {/* photo badge — circular, sitting on the connecting
                                    line, with the step number overlapping its edge */}
                                <div className="relative shrink-0 md:mx-auto">
                                    <div className="relative h-[92px] w-[92px] overflow-hidden rounded-full border-4 border-[#fffdfc] shadow-[0_14px_28px_-14px_rgba(122,44,78,0.5)]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={step.img} alt="" loading="lazy" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#ec4899] font-serif text-[11px] font-light text-white shadow-sm">
                                        {i + 1}
                                    </span>
                                </div>

                                {/* mobile-only vertical connector between steps */}
                                {i < STEPS.length - 1 && (
                                    <span
                                        aria-hidden
                                        className="absolute left-9 top-[72px] block h-11 w-px bg-gradient-to-b from-[#7a2c4e]/50 to-transparent md:hidden"
                                    />
                                )}

                                <div className="pt-1 md:pt-5">
                                    <span className="hidden text-[10.5px] font-light uppercase tracking-[0.2em] text-[#7a2c4e] md:block">
                                        Step {step.n}
                                    </span>
                                    <h3 className={`font-serif text-[18px] font-light leading-tight md:mt-2 md:text-[19px] ${INK}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`mt-1.5 max-w-[30ch] text-[13px] font-light leading-[1.65] md:mx-auto md:mt-2.5 ${BODY}`}>
                                        {step.copy}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                <p className={`mx-auto mt-14 max-w-2xl text-center text-[12.5px] font-light leading-[1.7] ${BODY}`}>
                    <b className={`font-medium ${INK}`}>For external use only.</b> Avoid freshly shaved skin — wait 24
                    hours. Leira complements your daily cleansing, it doesn&apos;t replace it.
                </p>
            </div>
        </section>
    );
}