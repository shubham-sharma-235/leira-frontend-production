"use client";

import React, { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   STEPS — content and image paths unchanged...
------------------------------------------------------------------- */
type Step = { n: string; title: string; copy: string; img: string };

const STEPS: Step[] = [
  {
    n: "1",
    title: "Cleanse Your Intimate Area",
    copy: "After your shower or bath, gently pat your vulva, bikini area, and sensitive skin completely dry. Leira absorbs best on clean, dry intimate skin.",
    img: "/images/how-to-use-s1-b.png",
  },
  {
    n: "2",
    title: "Apply to Your External Vulva",
    copy: "Using the precision dropper, apply 2–3 drops to your external vulva and private area. For external intimate area only — never internal.",
    img: "/images/how-to-use-s2.png",
  },
  {
    n: "3",
    title: "Massage & Absorb",
    copy: "Gently massage into your vulva and intimate skin. Allow the pure essential oils to absorb naturally. Do not rinse.",
    img: "/images/how-to-use-s3.JPG",
  },
  {
    n: "4",
    title: "Refresh Anytime",
    copy: "One application lasts all day. Reapply 1–2 drops mid-day for continued intimate freshness through India's heat and humidity.",
    img: "/images/how-to-use-s4.jpeg",
  },
];
const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap");

.huRoot {
  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Jost", system-ui, sans-serif;

  --dusty-rose: #D95B8A;
  --soft-pink: #F4B4CA;
  --deep-rose: #7A2C4E;
  --body-ink: #7A6570;
  --bg: #FFFFFF;
  --hair: rgba(122, 44, 78, 0.12);

  position: relative;
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--body-ink);
  overflow: hidden;
  padding: clamp(48px, 7vh, 88px) clamp(20px, 6vw, 72px);
}

/* ---------------- subtle organic blob background ---------------- */
.huBlob {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  border-radius: 42% 58% 63% 37% / 41% 45% 55% 59%;
  filter: blur(60px);
}
.huBlob--a {
  top: -12%;
  right: -8%;
  width: clamp(320px, 40vw, 620px);
  height: clamp(320px, 40vw, 620px);
  background: radial-gradient(circle at 35% 35%, rgba(244, 180, 202, 0.38), rgba(244, 180, 202, 0) 72%);
}
.huBlob--b {
  bottom: -16%;
  left: -10%;
  width: clamp(260px, 32vw, 480px);
  height: clamp(260px, 32vw, 480px);
  background: radial-gradient(circle at 60% 60%, rgba(217, 91, 138, 0.14), rgba(217, 91, 138, 0) 70%);
  border-radius: 55% 45% 39% 61% / 52% 40% 60% 48%;
}

/* ---------------- inner content ---------------- */
.huInner {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
}

.huHead {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: clamp(28px, 5vh, 52px);

}
.huTag {
  flex: none;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--dusty-rose);
}
.huTitle {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(30px, 3.6vw, 46px);
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--deep-rose);
}
.huTitle em {
  font-style: italic;
  color: var(--dusty-rose);
}


/* ---------------- layout ---------------- */
.huGrid {
  display: grid;
  grid-template-columns: 460px 460px;
  justify-content: center;
  gap: clamp(40px, 5vw, 70px);
  align-items: center;
}

/* ---- image ---- */
.huVisual {
  position: relative;
  aspect-ratio: 5 / 4;
  max-height: 560px;
  border-radius: 18px;
  overflow: hidden;
  background: #f7e9ee;
  box-shadow: 0 36px 70px -44px rgba(122, 44, 78, 0.55);
  outline: 1px solid rgba(217, 91, 138, 0.28);
  outline-offset: 10px;
}
.huVisual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: huImgIn 640ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.huVisual::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(58, 20, 36, 0) 58%, rgba(58, 20, 36, 0.42) 100%);
}
.huBadge {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 18px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 10px rgba(58, 20, 36, 0.4);
}
.huBadge i {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(150deg, #fff, var(--soft-pink));
}

/* ---- content pane ---- */
.huRight {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 460px;
}

.huPane {
  position: relative;
  min-height: clamp(200px, 26vh, 250px);
}

.huStep {
  animation: huFadeSlide 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.huGhost {
  display: block;
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(15px, 1.6vw, 19px);
  letter-spacing: 0.06em;
  color: var(--dusty-rose);
  margin-bottom: clamp(10px, 1.6vh, 16px);
}
.huGhost i {
  display: inline-block;
  width: 30px;
  height: 1px;
  margin-left: 12px;
  vertical-align: middle;
  background: linear-gradient(90deg, rgba(217, 91, 138, 0.8), rgba(217, 91, 138, 0.1));
}

.huName {
  margin: 0 0 clamp(12px, 2vh, 18px);
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.16;
  letter-spacing: -0.01em;
  color: var(--deep-rose);
  max-width: 18ch;
}

.huCopy {
  margin: 0;
  max-width: 46ch;
  font-size: clamp(14.5px, 1.05vw, 17px);
  font-weight: 300;
  line-height: 1.8;
  color: var(--body-ink);
}

/* ---------------- navigation: sliding "Step N" pill ---------------- */
.huNavPanel {
  display: inline-flex;
  align-self: flex-start; 
  background: linear-gradient(180deg, #fbdbe6, #f8c9da);
  border-radius: 999px;
  padding: 1px;
  margin-top: clamp(26px, 4vh, 40px);
  box-shadow: 0 18px 38px -22px rgba(122, 44, 78, 0.5);
}

.huNav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border-radius: 999px;
  padding: 7px;
  box-shadow: inset 0 0 0 1px rgba(122, 44, 78, 0.05);
}

.huNavHighlight {
  position: absolute;
  top: 6px;
  left: 6px;
  height: calc(100% - 12px);
  width: 20px;
  border-radius:89px;
  background: linear-gradient(135deg, #f8d9e4, #f4c1d6);
  box-shadow: 0 6px 16px -6px rgba(217, 91, 138, 0.55);
  will-change: transform, width;
  z-index: 0;
}

.huNavBtn {
  position: relative;
  z-index: 1;
  appearance: none;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  min-width: 38px;
  padding: 0 14px;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-size: 12.5px;
  letter-spacing: 0.02em;
  color: rgba(122, 44, 78, 0.4);
  transition: color 420ms ease, padding 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.huNavBtn:hover {
  color: var(--dusty-rose);
}
.huNavBtn:focus-visible {
  outline: 1px solid var(--dusty-rose);
  outline-offset: 3px;
}

.huNavBtn .huNavNum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  line-height: 1;
  transition: transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* word wrapper: its own width animates via grid-template-columns for a
   smooth, layout-safe reveal — the word slides + fades, it doesn't just
   pop in or out */
.huNavBtn .huNavWordWrap {
  display: grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.huNavBtn .huNavWordInner {
  overflow: hidden;
  min-width: 0;
}
.huNavBtn .huNavWord {
  display: inline-block;
  white-space: nowrap;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10.5px;
  margin-right: 6px;
}

.huNavBtn.active {
  color: var(--deep-rose);
  padding: 0 18px;
}
.huNavBtn.active .huNavNum {
  transform: scale(1.05);
}
.huNavBtn.active .huNavWordWrap {
  grid-template-columns: 1fr;
}

/* ---------------- footnote ---------------- */
.huNote {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  text-align: center;
  gap: 9px;
  width: 100%;
  max-width: none;
  padding-left: 0;
  padding-right: 0;
  margin: clamp(28px, 7vh, 48px) auto 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.65;
  color: rgba(122, 44, 78, 0.62);
}

.huNote span:first-child {
  flex: none;
  width: 6px;
  height: 6px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--dusty-rose);
  box-shadow: 0 0 0 3px rgba(217, 91, 138, 0.12);
}

.huNote b {
  font-weight: 500;
  color: var(--deep-rose);
}
/* ---------------- animations ---------------- */
@keyframes huFadeSlide {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes huImgIn {
  from {
    opacity: 0;
    transform: scale(1.03);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ---------------- responsive ---------------- */
@media (max-width: 900px) {
  .huRoot {
    padding: clamp(36px, 8vh, 56px) 20px;
  }
  .huHead {
    margin-bottom: 24px;
  }
  .huRule {
    display: none;
  }
  .huGrid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .huVisual {
    aspect-ratio: 4 / 4;
    max-height: 52vh;
  }
  .huPane {
    min-height: 0;
  }
  .huName {
    max-width: none;
    margin: 0 auto clamp(12px, 2vh, 18px);
  }
  .huCopy {
    margin: 0 auto;
  }
  .huRight {
    align-items: center;
    text-align: center;
    margin: 0 auto;
    width: 100%;
  }
  .huVisual {
    margin: 0 auto;
    width: 100%;
  }
  .huNavPanel {
    align-self: center;
    margin-top: 7px;
    padding: 5px;
  }
  .huNavBtn {
    height: 34px;
    min-width: 34px;
    padding: 0 12px;
    font-size: 12px;
  }
  .huNavBtn.active {
    padding: 0 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .huStep,
  .huVisual img {
    animation: none !important;
  }
}
`;

type Props = {
  className?: string;
};

export default function LeiraHowToUse({ className }: Props) {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  const navRef = useRef<HTMLDivElement | null>(null);
  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const pillRef = useRef({ x: 0, w: 0 });

  // keeps the pink pill glued to the active button's real size/position —
  // it re-measures every frame while the button itself is still resizing
  // (word reveal + padding change), and eases from the previous pill
  // position/width to the new one so it slides instead of snapping
  const placeHighlight = (
    e = 1,
    from: { x: number; w: number } = pillRef.current
  ) => {
    const nav = navRef.current;
    const btn = btnRefs.current[active];
    const highlight = highlightRef.current;
    if (!nav || !btn || !highlight) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const tx = btnRect.left - navRect.left - 6;
    const x = from.x + (tx - from.x) * e;
    const w = from.w + (btnRect.width - from.w) * e;
    pillRef.current = { x, w };
    highlight.style.width = `${w}px`;
    highlight.style.transform = `translateX(${x}px)`;
  };

  const trackWhileResizing = (duration = 420) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = { ...pillRef.current };
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
      placeHighlight(e, from);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    placeHighlight();
    const onResize = () => placeHighlight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackWhileResizing();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className={`huRoot${className ? " " + className : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <span className="huBlob huBlob--a" aria-hidden="true" />
      <span className="huBlob huBlob--b" aria-hidden="true" />

      <section aria-labelledby="how-to-use-title" className="huInner">
        <header className="huHead">
          <h2 className="huTitle" id="how-to-use-title">
            How to <em>use</em> Leira
          </h2>
          <span className="huRule" aria-hidden="true" />
        </header>

        <div className="huGrid">
          <div className="huVisual">
            <img key={step.img} src={step.img} alt={step.title} loading="lazy" />
            <span className="huBadge" aria-hidden="true">
              <i />
              <span>{step.title}</span>
            </span>
          </div>

          <div className="huRight">
            <div className="huPane">
              <article className="huStep" key={step.n}>
                <span className="huGhost" aria-hidden="true">
                  {step.n} <i />
                </span>
                <h3 className="huName">{step.title}</h3>
                <p className="huCopy">{step.copy}</p>
              </article>
            </div>

            <div className="huNavPanel">
              <nav
                className="huNav"
                ref={navRef}
                aria-label="How to use — steps"
                role="tablist"
              >
                <span className="huNavHighlight" ref={highlightRef} aria-hidden="true" />
                {STEPS.map((s, i) => (
                  <button
                    key={s.n}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-controls={`hu-step-panel-${s.n}`}
                    className={i === active ? "huNavBtn active" : "huNavBtn"}
                    ref={(el) => {
                      btnRefs.current[i] = el;
                    }}
                    onClick={() => setActive(i)}
                  >
                    <span className="huNavWordWrap">
                      <span className="huNavWordInner">
                        <span className="huNavWord">Step</span>
                      </span>
                    </span>
                    <span className="huNavNum">{i === active ? s.n : i + 1}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <p className="huNote">
          <span aria-hidden="true" />
          <span>
            <b>For external use only.</b> Avoid freshly shaved skin — wait 24 hours. Leira
            complements your daily cleansing, it doesn&apos;t replace it.
          </span>
        </p>
      </section>
    </div>
  );
}