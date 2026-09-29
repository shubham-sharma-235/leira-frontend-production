"use client";

import React, { useEffect, useRef, useState } from "react";

const COMPANY = "Aoman Services Private Limited";
const ADDRESS = ["Office No. 48, 7th Floor", "ETT Tower 2", "Sector 132, Noida, UP 201304"];
const PHONE_DISPLAY = "+91 98108 22968";
const PHONE_HREF = "tel:+919810822968";
const EMAIL = "support@leiraindia.com";

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap");

.ctRoot {
  font-family: "Jost", system-ui, sans-serif;
  --font-serif: "Cormorant Garamond", Georgia, serif;

  --pink: #ec4899;
  --pink-soft: #f9a8d4;
  --rose-ink: #7a2c4e;
  --body-ink: #6b5560;
  --gold: #ec4899;
  --hair: rgba(122, 44, 78, 0.14);

  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: clamp(76px, 11vw, 160px) clamp(20px, 6vw, 88px);
  background: linear-gradient(180deg, #fffdfc 0%, #fff5f9 55%, #fdeef4 100%);
  color: var(--body-ink);
  -webkit-font-smoothing: antialiased;
}

/* drifting glow + grain, same treatment as the other sections */
.ctRoot::before {
  content: "";
  position: absolute;
  bottom: -14%;
  left: -8%;
  width: 44vw;
  height: 44vw;
  max-width: 600px;
  max-height: 600px;
  border-radius: 50%;
  background: rgba(236, 72, 153, 0.13);
  filter: blur(95px);
  z-index: -2;
  pointer-events: none;
  animation: ctDrift 26s ease-in-out infinite;
}
@keyframes ctDrift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(46px, -38px, 0) scale(1.1); }
}
.ctRoot::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.035;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ---------------- heading ---------------- */
.ctHead {
  max-width: 660px;
  margin: 0 auto clamp(46px, 6vw, 78px);
  text-align: center;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.9s ease, transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.in .ctHead { opacity: 1; transform: none; }

.ctTag {
  display: inline-block;
  margin-bottom: clamp(10px, 1.4vh, 16px);
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--pink);
}
.ctTitle {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(30px, 3.8vw, 52px);
  line-height: 1.08;
  letter-spacing: -0.014em;
  color: var(--rose-ink);
}
.ctTitle em { font-style: italic; color: var(--pink); }
.ctLead {
  margin: clamp(12px, 1.6vh, 18px) auto 0;
  max-width: 46ch;
  font-size: clamp(14px, 1.05vw, 16px);
  font-weight: 300;
  line-height: 1.75;
  color: rgba(107, 85, 96, 0.85);
}
.ctRule {
  display: block;
  width: clamp(48px, 6vw, 78px);
  height: 1px;
  margin: clamp(16px, 2.4vh, 26px) auto 0;
  background: linear-gradient(90deg, rgba(216,176,106,0.1), rgba(216,176,106,0.95), rgba(216,176,106,0.1));
  transform: scaleX(0);
  transition: transform 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.25s;
}
.in .ctRule { transform: scaleX(1); }

/* ---------------- layout ---------------- */
.ctWrap {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  gap: clamp(38px, 6vw, 92px);
  align-items: start;
}

/* ---------------- left: the details ---------------- */
.ctDetails {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.9s ease 0.1s, transform 1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
}
.in .ctDetails { opacity: 1; transform: none; }

.ctBlock {
  padding: clamp(16px, 2vw, 22px) 0;
  border-top: 1px solid var(--hair);
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.7s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.3s + var(--l) * 0.1s);
}
.in .ctBlock { opacity: 1; transform: none; }
.ctBlock:last-of-type { border-bottom: 1px solid var(--hair); }

.ctKey {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #7a2c4e;
  font-family: var(--font-serif);
}
.ctVal {
  margin: 0;
  // font-family: var(--font-serif);
  font-size: clamp(18px, 1.4vw, 20px);
  line-height: 1.42;
  color: var(--rose-ink);
  font-weight: 100;
}
.ctVal a {
  color: inherit;
  text-decoration: none;
  background-image: linear-gradient(var(--pink), var(--pink));
  background-size: 0% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.5s cubic-bezier(0.22, 1, 0.36, 1), color 0.35s ease;
  padding-bottom: 2px;
}
.ctVal a:hover { color: var(--pink); background-size: 100% 1px; }
.ctVal span { display: block; }

.ctSmall {
  margin: clamp(20px, 2.4vw, 28px) 0 0;
  font-size: 12.5px;
  font-weight: 300;
  line-height: 1.7;
  color: rgba(107, 85, 96, 0.72);
  opacity: 0;
  transition: opacity 0.9s ease 0.8s;
}
.in .ctSmall { opacity: 1; }

/* ---------------- right: the form ---------------- */
.ctForm {
  position: relative;
  padding: clamp(26px, 3.4vw, 46px);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(236, 72, 153, 0.12);
  backdrop-filter: blur(8px);
  box-shadow: 0 40px 80px -54px rgba(122, 44, 78, 0.55);
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease 0.2s, transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}
.in .ctForm { opacity: 1; transform: none; }

.ctRow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 clamp(18px, 2.4vw, 32px);
}

/* underline fields — no boxes */
.ctField {
  position: relative;
  padding-top: 22px;
  margin-bottom: clamp(18px, 2.2vw, 26px);
}
.ctField input,
.ctField textarea {
  width: 100%;
  padding: 6px 0 10px;
  border: 0;
  border-bottom: 1px solid var(--hair);
  background: none;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 300;
  color: var(--rose-ink);
  outline: none;
  resize: none;
  transition: border-color 0.4s ease;
}
.ctField textarea { min-height: 92px; line-height: 1.7; }

.ctField label {
  position: absolute;
  left: 0;
  top: 26px;
  font-size: 15px;
  font-weight: 300;
  color: rgba(107, 85, 96, 0.7);
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), color 0.4s ease;
}
/* label lifts once the field has focus or content */
.ctField input:focus + label,
.ctField textarea:focus + label,
.ctField.filled label {
  transform: translateY(-24px) scale(0.72);
  color: var(--pink);
}

/* the underline that sweeps in on focus */
.ctField i {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--pink), var(--pink-soft));
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.ctField input:focus ~ i,
.ctField textarea:focus ~ i { transform: scaleX(1); }

.ctField.error input,
.ctField.error textarea { border-bottom-color: rgba(214, 69, 69, 0.55); }
.ctField em {
  position: absolute;
  right: 0;
  bottom: -17px;
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #c14a4a;
}

/* ---------------- button ---------------- */
.ctSend {
  position: relative;
  overflow: hidden;
  margin-top: 8px;
  padding: 15px 40px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--pink-soft), var(--pink));
  color: #fff;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 18px 34px -20px rgba(236, 72, 153, 0.85);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease;
}
.ctSend span { position: relative; z-index: 1; }
.ctSend::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--rose-ink);
  transform: translateY(101%);
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.ctSend:hover { transform: translateY(-2px); box-shadow: 0 24px 40px -20px rgba(236, 72, 153, 0.9); }
.ctSend:hover::before { transform: translateY(0); }
.ctSend:disabled { opacity: 0.55; cursor: default; transform: none; }

.ctFoot {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: clamp(8px, 1.4vw, 14px);
}
.ctReply {
  font-size: 12px;
  font-weight: 300;
  color: rgba(107, 85, 96, 0.72);
}

/* ---------------- sent state ---------------- */
.ctDone {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 30px;
  border-radius: 26px;
  background: rgba(255, 253, 252, 0.96);
  backdrop-filter: blur(6px);
  text-align: center;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.98);
  transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 0.6s;
}
.ctForm.sent .ctDone {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
  transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s;
}
.ctDone b {
  width: 15px;
  height: 15px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(150deg, var(--pink-soft), var(--pink));
  box-shadow: 0 0 0 7px rgba(236, 72, 153, 0.1);
}
.ctDone h3 {
  margin: 6px 0 0;
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(24px, 2.4vw, 32px);
  color: var(--rose-ink);
}
.ctDone p {
  margin: 0;
  max-width: 34ch;
  font-size: 14px;
  font-weight: 300;
  line-height: 1.75;
  color: rgba(107, 85, 96, 0.85);
}

/* ---------------- responsive ---------------- */
@media (max-width: 900px) {
  .ctWrap { grid-template-columns: 1fr; gap: 34px; }
  .ctRow { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .ctRoot *, .ctRoot *::before, .ctRoot *::after {
    transition: none !important;
    animation: none !important;
  }
  .ctHead, .ctDetails, .ctBlock, .ctForm, .ctSmall {
    opacity: 1;
    transform: none;
  }
  .ctRule { transform: none; }
}
`;

type Values = { name: string; email: string; phone: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

type Props = {
  /** Hook this up to your own endpoint. If omitted, the form opens the
      visitor's mail client with the message pre-filled. */
  onSubmit?: (values: Values) => Promise<void> | void;
};

export default function LeiraContact({ onSubmit }: Props) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [v, setV] = useState<Values>({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let reduced = false;
    try {
      reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      reduced = false;
    }
    if (reduced || typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }

    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        (es, o) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              el.classList.add("in");
              o.disconnect();
            }
          }),
        { threshold: 0.15 }
      );
      io.observe(el);
    } catch {
      el.classList.add("in");
    }
    return () => io?.disconnect();
  }, []);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setV((prev) => ({ ...prev, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!v.name.trim()) next.name = "Required";
    if (!v.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) next.email = "Check this";
    if (!v.message.trim()) next.message = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !validate()) return;
    setSending(true);
    try {
      if (onSubmit) {
        await onSubmit(v);
      } else {
        const body = `Name: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone || "—"}\n\n${v.message}`;
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
          "Enquiry from leiraindia.com"
        )}&body=${encodeURIComponent(body)}`;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const field = (k: keyof Values) => `ctField${v[k] ? " filled" : ""}${errors[k] ? " error" : ""}`;

  return (
    <section className="ctRoot" ref={rootRef} aria-labelledby="contact-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="ctHead">
        <span className="ctTag">Contact</span>
        <h2 className="ctTitle" id="contact-title">
          We&apos;re here, <em>discreetly</em>.
        </h2>
        <p className="ctLead">
          Questions about your order, your skin, or whether Leira is right for you — write to us and
          a real person will answer.
        </p>
        <span className="ctRule" aria-hidden="true" />
      </header>

      <div className="ctWrap">
        <div className="ctDetails">
          <div className="ctBlock" style={{ "--l": 0 } as React.CSSProperties}>
            <span className="ctKey">Company</span>
            <p className="ctVal">{COMPANY}</p>
          </div>

          <div className="ctBlock" style={{ "--l": 1 } as React.CSSProperties}>
            <span className="ctKey">Address</span>
            <p className="ctVal">
              {ADDRESS.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>

          <div className="ctBlock" style={{ "--l": 2 } as React.CSSProperties}>
            <span className="ctKey">Phone</span>
            <p className="ctVal">
              <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
            </p>
          </div>

          <div className="ctBlock" style={{ "--l": 3 } as React.CSSProperties}>
            <span className="ctKey">Email</span>
            <p className="ctVal">
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
          </div>

          <p className="ctSmall">
            Orders and returns are handled by the same team, so there&apos;s no queue to be passed
            along.
          </p>
        </div>

        <form className={`ctForm${sent ? " sent" : ""}`} onSubmit={submit} noValidate>
          <div className="ctRow">
            <div className={field("name")}>
              <input id="ctName" type="text" value={v.name} onChange={set("name")} autoComplete="name" />
              <label htmlFor="ctName">Your name</label>
              <i aria-hidden="true" />
              {errors.name && <em>{errors.name}</em>}
            </div>

            <div className={field("email")}>
              <input id="ctEmail" type="email" value={v.email} onChange={set("email")} autoComplete="email" />
              <label htmlFor="ctEmail">Email</label>
              <i aria-hidden="true" />
              {errors.email && <em>{errors.email}</em>}
            </div>
          </div>

          <div className={field("phone")}>
            <input id="ctPhone" type="tel" value={v.phone} onChange={set("phone")} autoComplete="tel" />
            <label htmlFor="ctPhone">Phone (optional)</label>
            <i aria-hidden="true" />
          </div>

          <div className={field("message")}>
            <textarea id="ctMsg" rows={4} value={v.message} onChange={set("message")} />
            <label htmlFor="ctMsg">How can we help?</label>
            <i aria-hidden="true" />
            {errors.message && <em>{errors.message}</em>}
          </div>

          <div className="ctFoot">
            <button className="ctSend" type="submit" disabled={sending}>
              <span>{sending ? "Sending" : "Send message"}</span>
            </button>
            <span className="ctReply">We reply within one business day.</span>
          </div>

          <div className="ctDone" aria-live="polite">
            <b aria-hidden="true" />
            <h3>Thank you</h3>
            <p>Your message is with us. We&apos;ll be in touch at the address you gave.</p>
          </div>
        </form>
      </div>
    </section>
  );
}