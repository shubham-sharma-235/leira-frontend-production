"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse the edit and find what actually fits your day — no guesswork, just the right pick.",
  },
  {
    n: "02",
    title: "Personalise",
    body: "Choose your shade, size or set. Add a note at checkout and we tailor the small details.",
  },
  {
    n: "03",
    title: "Make It Yours",
    body: "Fold it into your routine with a few unfussy steps that fit around your day.",
  },
  {
    n: "04",
    title: "Enjoy",
    body: "Sit back and let it work. Real results — and we're a message away if you need us.",
  },
];

const INTRO_END = 0.16;
const REVEAL_SPAN = 0.75;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export default function HowToUseDemo() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number | null = null;

    function measure() {
      const el = sectionRef.current;
      raf = null;

      if (!el) return;

      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;

      setProgress(
        clamp01(total > 0 ? scrolled / total : 0)
      );
    }

    function onScroll() {
      if (raf === null) {
        raf = requestAnimationFrame(measure);
      }
    }

    measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  const stepSpan =
    (1 - INTRO_END) / (STEPS.length + 0.6);

  const windows = STEPS.map((_, i) => {
    const start = INTRO_END + i * stepSpan;

    return {
      start,
      end: start + stepSpan * REVEAL_SPAN,
    };
  });

  const holdStart =
    windows[windows.length - 1].end;

  const activeCount = windows.filter(
    (w) => progress >= w.start
  ).length;

  return (
    <div
      style={{
        fontFamily:
          "'Manrope', ui-sans-serif, system-ui",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@500;700&display=swap');
      `}</style>

      <div
        className="flex items-center justify-center bg-stone-100 text-stone-400 text-sm tracking-widest uppercase"
        style={{ height: "60vh" }}
      >
        Scroll down ↓
      </div>

      <section
        ref={sectionRef}
        style={{
          height: `${100 * (STEPS.length + 1.6)}vh`,
        }}
        className="relative"
      >
        <div
          className="sticky top-0 flex flex-col overflow-hidden"
          style={{ height: "100vh" }}
        >
          <img
            src="https://picsum.photos/seed/leira-howtouse/1600/1000"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(21,17,15,0.30) 0%, rgba(21,17,15,0.55) 55%, rgba(18,14,12,0.85) 100%)",
            }}
          />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6">
            <span className="text-amber-200 text-xs md:text-sm tracking-widest uppercase font-semibold mb-4">
              How It Works
            </span>

            <h2
              className="text-white text-4xl md:text-6xl leading-tight max-w-3xl"
              style={{
                fontFamily:
                  "'Fraunces', Georgia, serif",
              }}
            >
              How To Use Leira,
              <br />
              Start To Finish
            </h2>

            <div className="mt-8 flex items-center gap-3">
              <span className="text-sm font-mono text-white">
                {String(activeCount).padStart(2, "0")}
              </span>

              <span
                className="w-40 md:w-56 h-1 rounded-full relative overflow-hidden"
                style={{
                  backgroundColor:
                    "rgba(255,255,255,0.25)",
                }}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${
                      clamp01(
                        (progress - INTRO_END) /
                          (holdStart - INTRO_END)
                      ) * 100
                    }%`,
                    backgroundColor: "#C4573D",
                    transition: "width 80ms linear",
                  }}
                />
              </span>

              <span
                className="text-sm font-mono"
                style={{
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {String(STEPS.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="relative z-10 px-6 pb-10 md:pb-14">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
              {STEPS.map((step, i) => {
                const { start, end } = windows[i];

                const local = clamp01(
                  (progress - start) / (end - start)
                );

                return (
                  <div
                    key={step.n}
                    style={{
                      opacity: local,
                      transform: `translateY(${
                        (1 - local) * 28
                      }px)`,
                      backgroundColor: "#FBF6EC",
                      borderColor: "#C4573D",
                    }}
                    className="rounded-2xl border-2 px-5 py-6 md:px-6 md:py-7 text-left shadow-lg"
                  >
                    <span
                      className="block text-sm mb-2"
                      style={{
                        fontFamily:
                          "'Fraunces', Georgia, serif",
                        color: "#8A3A26",
                      }}
                    >
                      {step.n}
                    </span>

                    <h3
                      className="text-xl md:text-2xl mb-2"
                      style={{
                        fontFamily:
                          "'Fraunces', Georgia, serif",
                        color: "#241C18",
                      }}
                    >
                      {step.title}
                    </h3>

                    <p
                      className="text-sm leading-relaxed font-medium"
                      style={{
                        color: "#4A4038",
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
