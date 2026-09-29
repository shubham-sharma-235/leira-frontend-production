"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type Review = {
  name: string;
  city: string;
  scent: string;
  rating: number;
  quote: string;
  image: string;
};

/* Replace these with your real, verified customer reviews before publishing. */
const REVIEWS: Review[] = [
  {
    name: "Ananya R.",
    city: "Mumbai",
    scent: "Damask Rose",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1726076583859-3651d36c587e?auto=format&fit=crop&w=160&h=160&q=85",
    quote:
      "I was nervous about using anything scented there. Two drops after my shower and it just felt clean — no burning, no heaviness, and the rose stays soft all day.",
  },
  {
    name: "Meher K.",
    city: "Bengaluru",
    scent: "Jasmine",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1624610806703-99c0852c31c0?auto=format&fit=crop&w=160&h=160&q=85",
    quote:
      "Bengaluru humidity used to mean checking myself every few hours. I stopped doing that. It's a small thing, but it changed how I get through a workday.",
  },
  {
    name: "Ritika S.",
    city: "New Delhi",
    scent: "Ylang Ylang",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1769275061786-c33ab1a284c8?auto=format&fit=crop&w=160&h=160&q=85",
    quote:
      "The dropper is what sold me. Nothing spills, nothing is wasted, and it feels like a proper ritual rather than another product on the shelf.",
  },
  {
    name: "Fatima A.",
    city: "Hyderabad",
    scent: "Damask Rose",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1771992224087-c1f910e71ac8?auto=format&fit=crop&w=160&h=160&q=85",
    quote:
      "My skin reacts to almost everything, so I patch tested. No redness at all. I've been using it every morning since.",
  },
  {
    name: "Simran B.",
    city: "Chandigarh",
    scent: "Jasmine",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1759840278511-f73a3d62fb9f?auto=format&fit=crop&w=160&h=160&q=85",
    quote:
      "It's expensive for what it is, and I still bought a second bottle. The scent is genuinely lovely and it lasts far longer than I expected it to.",
  },
];

const DURATION = 8000;
const AVERAGE_RATING = 4.9;

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex(((next % REVIEWS.length) + REVIEWS.length) % REVIEWS.length);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      setPaused(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setReady(true);
            io.disconnect();
          }
        }),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || paused) return;
    const t = window.setTimeout(() => go(index + 1), DURATION);
    return () => window.clearTimeout(t);
  }, [ready, paused, index, go]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  };

  const active = REVIEWS[index];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-labelledby="testimonials-title"
      className={`tst${ready ? " ready" : ""}${paused ? " paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="glow" aria-hidden="true" />

      <div className="wrap">
        <div className="side">
          <span className="eyebrow">
            <i aria-hidden="true" />
            In their words
          </span>
          <h2 className="title" id="testimonials-title">
            Trusted by
            <br />
           10 thousand <em>women</em>.
          </h2>

          <div className="score">
            <span className="scoreNum">{AVERAGE_RATING}</span>
            <span className="scoreMeta">
              <Stars value={AVERAGE_RATING} size={16} />
              <span className="scoreText">Average rating across verified purchases</span>
            </span>
          </div>
        </div>

        <div
          className="stage"
          onKeyDown={onKey}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
        >
          <span className="quoteMark" aria-hidden="true">
            &ldquo;
          </span>

          <div className="slides" aria-live="polite">
            {REVIEWS.map((r, i) => (
              <blockquote
                key={r.name}
                className={`slide${i === index ? " on" : ""}${i < index ? " past" : ""}`}
                aria-hidden={i !== index}
              >
                <p className="quote">{r.quote}</p>
              </blockquote>
            ))}
          </div>

          <figcaption className="meta">
            <span className="metaName">{active.name}</span>
            <span className="metaLine" aria-hidden="true" />
            <span className="metaCity">{active.city}</span>
            <span className="metaScent">{active.scent}</span>
          </figcaption>

          <div className="rating">
            <Stars value={active.rating} />
            <span className="verified">Verified purchase</span>
          </div>

          <ul className="dots" role="tablist" aria-label="Choose a review">
            {REVIEWS.map((r, i) => (
              <li key={r.name}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Review from ${r.name}, ${r.city}`}
                  className={`avatar${i === index ? " on" : ""}`}
                  onClick={() => go(i)}
                >
                  <img src={r.image} alt="" className="avatarImage" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .tst {
          --pink: #ec4899;
          --pink-soft: #f9a8d4;
          --rose-ink: #7a2c4e;
          --body-ink: #6b5560;
          --gold: #ec4899;
          --hair: rgba(122, 44, 78, 0.14);

          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: clamp(42px, 7vw, 50px) clamp(20px, 6vw, 88px);
          background: linear-gradient(180deg, #fffdfc 0%, #fff5f8 50%, #fdf1f5 100%);
          color: var(--body-ink);
          -webkit-font-smoothing: antialiased;
        }

        .glow {
          position: absolute;
          bottom: -200px;
          left: -160px;
          width: 540px;
          height: 540px;
          border-radius: 50%;
          filter: blur(100px);
          background: rgba(236, 72, 153, 0.14);
          z-index: -1;
          pointer-events: none;
          animation: drift 24s ease-in-out infinite;
        }
        @keyframes drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(36px, -30px, 0) scale(1.1);
          }
        }

        .wrap {
          max-width: 1140px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: clamp(40px, 7vw, 100px);
          align-items: center;
        }

        /* ---------------- left ---------------- */
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 12.5px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--pink);
          opacity: 0;
          transform: translateY(14px);
        }
        .eyebrow i {
          width: 34px;
          height: 1px;
          background: linear-gradient(90deg, var(--pink-soft), transparent);
        }

        .title {
          margin: 18px 0 0;
          font-family: var(--font-serif, "Cormorant Garamond", "Playfair Display", Georgia, serif);
          font-weight: 300;
          font-size: clamp(36px, 4.4vw, 58px);
          line-height: 1.04;
          letter-spacing: -0.012em;
          color: var(--rose-ink);
          opacity: 0;
          transform: translateY(18px);
        }
        .title em {
          font-style: italic;
          color: var(--pink);
        }

        .score {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: clamp(26px, 3vw, 38px);
          padding-top: clamp(22px, 2.6vw, 30px);
          border-top: 1px solid var(--hair);
          opacity: 0;
          transform: translateY(18px);
        }
        .scoreNum {
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: clamp(42px, 4vw, 58px);
          line-height: 1;
          color: var(--rose-ink);
        }
        .scoreMeta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .scoreText {
          max-width: 24ch;
          font-size: 12.8px;
          font-weight: 300;
          line-height: 1.6;
          color: rgba(107, 85, 96, 0.75);
        }

        .ready .eyebrow {
          animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ready .title {
          animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.08s forwards;
        }
        .ready .score {
          animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.18s forwards;
        }
        @keyframes rise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ---------------- stage ---------------- */
        .stage {
          position: relative;
          padding-left: clamp(0px, 2vw, 26px);
          outline: none;
          opacity: 0;
          transform: translateY(20px);
        }
        .ready .stage {
          animation: rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.26s forwards;
        }
        .stage:focus-visible {
          outline: 1px solid var(--gold);
          outline-offset: 18px;
          border-radius: 6px;
        }

        .quoteMark {
          position: absolute;
          top: -46px;
          left: -10px;
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: 150px;
          line-height: 1;
          color: rgba(236, 72, 153, 0.13);
          pointer-events: none;
        }

        .slides {
          position: relative;
          min-height: clamp(180px, 21vw, 230px);
        }

        .slide {
          position: absolute;
          inset: 0;
          margin: 0;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .slide.past {
          transform: translateY(-24px);
        }
        .slide.on {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .quote {
          margin: 0;
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-weight: 300;
          font-size: clamp(21px, 2.3vw, 32px);
          line-height: 1.45;
          letter-spacing: -0.005em;
          color: var(--rose-ink);
        }

        .meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: clamp(20px, 2.4vw, 30px);
        }
        .metaName {
          font-size: 14px;
          letter-spacing: 0.06em;
          color: var(--rose-ink);
        }
        .metaLine {
          width: 22px;
          height: 1px;
          background: rgba(216, 176, 106, 0.8);
        }
        .metaCity {
          font-size: 13.5px;
          font-weight: 300;
          color: rgba(107, 85, 96, 0.8);
        }
        .metaScent {
          margin-left: 4px;
          padding: 5px 13px;
          border-radius: 999px;
          border: 1px solid rgba(236, 72, 153, 0.22);
          background: rgba(255, 255, 255, 0.7);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pink);
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 16px;
        }
        .verified {
          font-size: 11.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7a2c4e;
        }

        /* ---------------- selector ---------------- */
        .dots {
          display: flex;
          gap: 14px;
          list-style: none;
          margin: clamp(30px, 3.4vw, 44px) 0 0;
          padding-top: clamp(24px, 2.8vw, 32px);
          border-top: 1px solid var(--hair);
        }

        .avatar {
          position: relative;
          display: block;
          width: 52px;
          height: 52px;
          padding: 0;
          border: none !important;
          outline: none;
          border-radius: 50%;
          overflow: hidden;
          background: transparent;
          cursor: pointer;
          opacity: 0.62;
          transform: scale(0.94);
          transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.4s ease;
        }

        .avatar:hover {
          opacity: 1;
          transform: translateY(-2px) scale(1);
        }

        .avatar.on {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 10px 26px -12px rgba(236, 72, 153, 0.75);
        }

        .avatarImage {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          filter: saturate(0.92);
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s ease;
        }

        .avatar:hover .avatarImage {
          transform: scale(1.06);
          filter: saturate(1);
        }

        .avatar.on .avatarImage {
          filter: saturate(1);
        }

        .avatar:focus-visible {
          outline: 1px solid var(--pink);
          outline-offset: 4px;
        }

        /* ---------------- responsive ---------------- */
        @media (max-width: 900px) {
          .wrap {
            grid-template-columns: 1fr;
            gap: 34px;
            align-items: start;
          }
          .quoteMark {
            top: -34px;
            font-size: 104px;
          }
          .stage {
            padding-left: 0;
          }
          .slides {
            min-height: 220px;
          }
        }

        @media (max-width: 520px) {
          .slides {
            min-height: 260px;
          }
          .dots {
            gap: 10px;
          }
          .avatar {
            width: 40px;
            height: 40px;
          }
          .metaScent {
            margin-left: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tst :global(*) {
            animation: none !important;
            transition: none !important;
          }
          .eyebrow,
          .title,
          .score,
          .stage {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

/* ---------------- star rating (pink theme, supports fractional values e.g. 4.9) ---------------- */
const STAR_PATH =
  "M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.21l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.6z";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const clamped = Math.max(0, Math.min(5, value));
  const gradId = `pinkStar-${useId().replace(/[^a-zA-Z0-9-_]/g, "")}`;

  return (
    <span
      role="img"
      aria-label={`Rated ${clamped} out of 5`}
      style={{ display: "inline-flex", gap: 4, alignItems: "center", lineHeight: 0 }}
    >
      {/* shared pink gradient for the filled stars */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="55%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
        </defs>
      </svg>

      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, clamped - i));
        return (
          <span
            key={i}
            aria-hidden="true"
            style={{ position: "relative", display: "inline-block", width: size, height: size }}
          >
            {/* empty star: pale pink */}
            <svg viewBox="0 0 20 20" width={size} height={size} style={{ display: "block" }}>
              <path
                d={STAR_PATH}
                fill="#fce7f3"
                stroke="#f9a8d4"
                strokeWidth={1.1}
                strokeLinejoin="round"
              />
            </svg>
            {/* filled portion: pink gradient with a soft pink glow */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${fill * 100}%`,
                overflow: "hidden",
              }}
            >
              <svg
                viewBox="0 0 20 20"
                width={size}
                height={size}
                style={{
                  display: "block",
                  maxWidth: "none",
                  filter: "drop-shadow(0 1px 3px rgba(236, 72, 153, 0.35))",
                }}
              >
                <path
                  d={STAR_PATH}
                  fill={`url(#${gradId})`}
                  stroke="#ec4899"
                  strokeWidth={1.1}
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}