"use client";

import { useEffect, useRef, useState } from "react";

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "Is this a substitute for hygiene?",
    a: "No. Leira is a finishing touch — it complements your daily cleansing rather than replacing it. Think of it the way you think of perfume: the last step, not the first.",
  },
  {
    q: "Can I use it every day?",
    a: "Yes. Begin with a patch test on less sensitive skin, and once you're comfortable, wear it daily as part of your self-care ritual.",
  },
  {
    q: "What if my skin is sensitive?",
    a: "Apply sparingly, starting somewhere less delicate such as the hip line. Avoid freshly shaved skin and allow at least 24 hours before use.",
  },
  {
    q: "Is Leira safe for daily use?",
    a: "Yes. It's formulated with 100% organic essential oils, alcohol-free and pH-balanced for gentle everyday use. Start with a small amount and continue daily once your skin feels comfortable.",
  },
  {
    q: "Does it help with odour control?",
    a: "Yes. By keeping the area fresh and balanced, Leira may help reduce unwanted odour when it's used as part of your daily routine.",
  },
  // {
  //   q: "How long does the scent last?",
  //   a: "The oils are undiluted, so they open slowly and stay close to the skin through the day. One or two drops after your shower is enough.",
  // },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
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
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-labelledby="faq-title"
      className={`faq${ready ? " ready" : ""}`}
    >
      <span className="glow" aria-hidden="true" />

      <div className="wrap">
        <div className="side">
          <span className="eyebrow">
            <i aria-hidden="true" />
            Questions
          </span>
          <h2 className="title" id="faq-title">
            Everything you
            <br />
            wanted to <em>ask</em>.
          </h2>
          <p className="lead">
            Still unsure about something? Our team answers personally, and discreetly.
          </p>
          <a className="contact" href="https://wa.me/919810822968" target="_blank" rel="noreferrer">
            Message us on WhatsApp
          </a>
        </div>

        <ul className="list">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={item.q}
                className={`row${isOpen ? " open" : ""}`}
                style={{ ["--i" as string]: i }}
              >
                <h3 className="qWrap">
                  <button
                    type="button"
                    className="q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="idx" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="qText">{item.q}</span>
                    <span className="mark" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>
                </h3>

                <div
                  className="panel"
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                >
                  <div className="panelInner">
                    <p>{item.a}</p>
                  </div>
                </div>

                <span className="underline" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .faq {
          --pink: #ec4899;
          --pink-soft: #f9a8d4;
          --rose-ink: #7a2c4e;
          --body-ink: #6b5560;
          --gold: #ec4899;
          --hair: rgba(122, 44, 78, 0.14);

          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: clamp(42px, 6vw, 100px) clamp(20px, 6vw, 88px);
          background: linear-gradient(180deg, #fdf1f5 0%, #fff7fa 40%, #fffdfc 100%);
          color: var(--body-ink);
          -webkit-font-smoothing: antialiased;
        }

        .glow {
          position: absolute;
          top: -180px;
          right: -160px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(100px);
          background: rgba(249, 168, 212, 0.28);
          z-index: -1;
          pointer-events: none;
          animation: drift 22s ease-in-out infinite;
        }
        @keyframes drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-30px, 36px, 0) scale(1.1);
          }
        }

        .wrap {
          max-width: 1340px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: clamp(38px, 7vw, 104px);
          align-items: start;
        }

        /* ---------------- left column ---------------- */
        .side {
          position: sticky;
          top: 110px;
        }

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
          font-size: clamp(36px, 4.6vw, 60px);
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

        .lead {
          margin: 18px 0 0;
          max-width: 32ch;
          font-size: clamp(14.5px, 1.1vw, 16.5px);
          font-weight: 300;
          line-height: 1.75;
          opacity: 0;
          transform: translateY(18px);
        }

        .contact {
          display: inline-block;
          margin-top: 26px;
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: 21px;
          color: var(--rose-ink);
          text-decoration: none;
          padding-bottom: 5px;
          border-bottom: 1px solid rgba(216, 176, 106, 0.7);
          transition: color 0.35s ease, border-color 0.35s ease;
          opacity: 0;
          transform: translateY(18px);
        }
        .contact:hover,
        .contact:focus-visible {
          color: var(--pink);
          border-color: var(--pink);
        }

        .ready .eyebrow {
          animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ready .title {
          animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.08s forwards;
        }
        .ready .lead {
          animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.16s forwards;
        }
        .ready .contact {
          animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.24s forwards;
        }
        @keyframes rise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ---------------- list ---------------- */
        .list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid var(--hair);
        }

        .row {
          position: relative;
          border-bottom: 1px solid var(--hair);
          opacity: 0;
          transform: translateY(18px);
        }
        .ready .row {
          animation: rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: calc(0.2s + var(--i) * 0.07s);
        }

        /* pink hairline that draws across the open row */
        .underline {
          position: absolute;
          left: 0;
          bottom: -1px;
          height: 1px;
          width: 100%;
          background: linear-gradient(90deg, var(--pink), var(--pink-soft));
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .row.open .underline {
          transform: scaleX(1);
        }

        .qWrap {
          margin: 0;
          font-weight: inherit;
        }

        .q {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: clamp(14px, 2vw, 26px);
          width: 100%;
          padding: clamp(20px, 2.2vw, 28px) 4px;
          background: none;
          border: 0;
          text-align: left;
          cursor: pointer;
          color: inherit;
          font: inherit;
        }
        .q:focus-visible {
          outline: 1px solid var(--gold);
          outline-offset: 4px;
          border-radius: 4px;
        }

        .idx {
          font-size: 11.5px;
          letter-spacing: 0.16em;
          color: rgba(216, 176, 106, 0.9);
          transition: color 0.4s ease;
        }
        .row.open .idx {
          color: var(--pink);
        }

        .qText {
          font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
          font-size: clamp(19px, 1.75vw, 25px);
          font-weight: 400;
          line-height: 1.3;
          color: rgba(122, 44, 78, 0.72);
          transition: color 0.4s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .q:hover .qText {
          color: var(--rose-ink);
        }
        .row.open .qText {
          color: var(--rose-ink);
          transform: translateX(4px);
        }

        /* plus that turns into a minus */
        .mark {
          position: relative;
          flex: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(236, 72, 153, 0.28);
          transition: border-color 0.45s ease, background 0.45s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mark i {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 1px;
          background: var(--pink);
          transform: translate(-50%, -50%);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s ease;
        }
        .mark i:last-child {
          transform: translate(-50%, -50%) rotate(90deg);
        }
        .q:hover .mark {
          border-color: rgba(236, 72, 153, 0.5);
        }
        .row.open .mark {
          background: linear-gradient(150deg, var(--pink-soft), var(--pink));
          border-color: transparent;
          transform: rotate(180deg);
        }
        .row.open .mark i {
          background: #fff;
        }
        .row.open .mark i:last-child {
          transform: translate(-50%, -50%) rotate(0deg);
        }

        /* smooth open/close without measuring heights */
        .panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .row.open .panel {
          grid-template-rows: 1fr;
        }
        .panelInner {
          overflow: hidden;
        }
        .panelInner p {
          margin: 0;
          padding: 0 46px clamp(22px, 2.4vw, 30px) calc(clamp(14px, 2vw, 26px) + 22px);
          max-width: 58ch;
          font-size: clamp(15px, 1.15vw, 16.5px);
          font-weight: 300;
          line-height: 1.78;
          color: rgba(107, 85, 96, 0.78);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.45s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .row.open .panelInner p {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.12s;
        }

        /* ---------------- responsive ---------------- */
        @media (max-width: 900px) {
          .wrap {
            grid-template-columns: 1fr;
            gap: 34px;
          }
          .side {
            position: static;
          }
          .lead {
            max-width: 42ch;
          }
          .panelInner p {
            padding-right: 8px;
            padding-left: calc(clamp(14px, 2vw, 26px) + 20px);
          }
          .contact{
            font-size: 14px!important;
          }
        }

        @media (max-width: 520px) {
          .idx {
            display: none;
          }
          .q {
            grid-template-columns: 1fr auto;
          }
          .panelInner p {
            padding-left: 4px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq :global(*) {
            animation: none !important;
            transition: none !important;
          }
          .eyebrow,
          .title,
          .lead,
          .contact,
          .row {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}