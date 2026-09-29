"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/toast";
import { collaborationAPI } from "@/lib/api";

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

/* Reveal that can never leave content invisible. */
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
        { threshold: 0.15 }
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
        <span key={i} className="block overflow-hidden">
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

function Chip({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] ${
        dark ? "bg-[#ec4899]/25 text-[#f9a8d4]" : "bg-[#ec4899]/10 text-[#ec4899]"
      }`}
    >
      <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------
   Underline field. `placeholder=" "` drives the floating label —
   it must stay on every control.
------------------------------------------------------------------- */
const CTRL =
  "peer w-full bg-transparent pb-2.5 pt-7 text-[15.5px] font-light outline-none transition-colors border-b border-[#7a2c4e]/[0.18] text-[#7a2c4e]";
const LABEL =
  "pointer-events-none absolute left-0 top-7 origin-left text-[15px] font-light text-[#6b5560]/70 transition-all duration-500 peer-focus:-translate-y-6 peer-focus:scale-[0.72] peer-focus:text-[#ec4899] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.72]";
const SWEEP =
  "absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#ec4899] to-[#f9a8d4] transition-transform duration-500 peer-focus:scale-x-100";

function Field({
  id,
  name,
  label,
  type = "text",
  rows,
  className = "",
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required
          placeholder=" "
          className={`${CTRL} resize-none leading-[1.75]`}
        />
      ) : (
        <input id={id} name={name} type={type} required placeholder=" " className={CTRL} />
      )}
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <span aria-hidden className={SWEEP} />
    </div>
  );
}

/* the select keeps its label permanently lifted — it always has a value */
function SelectField({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <select
        id="collaborationType"
        name="collaborationType"
        defaultValue="influencer"
        required
        className={`${CTRL} appearance-none cursor-pointer pr-8`}
      >
        <option value="influencer">Influencer</option>
        <option value="brand">Brand</option>
        <option value="creator">Creator</option>
        <option value="affiliate">Affiliate</option>
        <option value="other">Other</option>
      </select>
      <label
        htmlFor="collaborationType"
        className="pointer-events-none absolute left-0 top-7 origin-left -translate-y-6 scale-[0.72] text-[15px] font-light text-[#6b5560]/70"
      >
        Collaboration type
      </label>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3.5 right-1 h-2 w-2 rotate-45 border-b border-r border-[#7a2c4e]/40"
      />
      <span aria-hidden className={SWEEP} />
    </div>
  );
}

/* ------------------------------------------------------------------
   Page content
------------------------------------------------------------------- */
const PARTNERS = [
  {
    n: "01",
    title: "Influencers",
    body: "Creators whose audience trusts them on personal care. You don't need a huge following — engagement and candour matter more to us than reach.",
  },
  {
    n: "02",
    title: "Creators",
    body: "Writers, photographers and video makers who can talk about intimate care without either clinical language or innuendo. That balance is rare.",
  },
  {
    n: "03",
    title: "Brands",
    body: "Salons, wellness studios, lingerie and clothing labels, and hotels whose customers overlap with ours. Bundles, gifting and co-branded editions.",
  },
  {
    n: "04",
    title: "Affiliates",
    body: "Publishers and community owners who would rather earn on what they recommend than take a flat fee. We share a tracked link and a rate.",
  },
];

const OFFER = [
  {
    n: "01",
    title: "The product, first",
    body: "Every partnership starts with you actually using Leira. We send the 15 ml bottle before anything is agreed, because we would rather you decline than post about something you don't like.",
  },
  {
    n: "02",
    title: "Creative freedom, within reason",
    body: "You know your audience. We won't hand you a script. We will ask you to keep three claims accurate — alcohol-free, pH-balanced, external use only — because they are about people's health.",
  },
  {
    n: "03",
    title: "A real conversation",
    body: "You will speak to someone on our team, not an agency inbox. We discuss what you'd be comfortable making before we discuss deliverables.",
  },
];

const STEPS = [
  { n: "01", title: "You apply", body: "Fill the form below. The more you tell us about your audience, the faster this moves." },
  { n: "02", title: "We read it properly", body: "Every application is read by our team. We reply either way, usually within a week." },
  { n: "03", title: "We plan it together", body: "A call or a thread to agree the idea, the timing and the terms before anything is signed." },
];

/* ==================================================================
   Page
   ================================================================== */
export default function CollaborationPage() {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const collaborationType = String(formData.get("collaborationType") || "influencer").trim() as
      | "influencer"
      | "brand"
      | "creator"
      | "affiliate"
      | "other";
    const brandOrChannel = String(formData.get("brandOrChannel") || "").trim();
    const socialHandle = String(formData.get("socialHandle") || "").trim();
    const followers = String(formData.get("followers") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (
      !fullName ||
      !email ||
      !phone ||
      !collaborationType ||
      !brandOrChannel ||
      !socialHandle ||
      !followers ||
      !message
    ) {
      error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await collaborationAPI.submit({
        fullName,
        email,
        phone,
        collaborationType,
        brandOrChannel,
        socialHandle,
        followers,
        message,
      });
      success("Your collaboration request has been submitted.");
      form.reset();
    } catch (err: any) {
      error(err.message || "Could not submit collaboration request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MiniNavbar />
      <main className="min-h-screen bg-white leira-underlap-nav-spacer">
        {/* ============ 1 · masthead ============ */}
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
              <Chip label="Partnerships" />
            </Reveal>

            <MaskedHeading
              as="h1"
              onMount
              className="mt-6 font-serif text-[clamp(32px,5vw,64px)] font-light leading-[1.08] tracking-tight text-[#7a2c4e]"
              lines={[
                "Collaborate",
                <>
                  with <em className="not-italic text-[#ec4899]">Leira</em>.
                </>,
              ]}
            />

            <Reveal delay={0.4} onMount>
              <p className="mx-auto mt-6 max-w-[50ch] text-[15px] font-light leading-[1.85] text-[#6b5560] md:text-base">
                Brand and influencer collaborations for India&apos;s first essential oil based
                intimate perfume. If you can talk about intimate care with warmth and accuracy, we
                would like to hear from you.
              </p>
            </Reveal>

            <Reveal delay={0.5} onMount>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
                <a
                  href="#apply"
                  className="group relative overflow-hidden rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-9 py-4 text-[11px] uppercase tracking-[0.22em] text-white shadow-[0_18px_34px_-20px_rgba(236,72,153,0.9)] transition-transform duration-500 hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Apply to partner</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0"
                  />
                </a>
                <a
                  href="mailto:support@leiraindia.com"
                  className="border-b border-[#ec4899]/70 pb-1 font-serif text-[20px] text-[#7a2c4e] transition-colors duration-300 hover:border-[#ec4899] hover:text-[#ec4899]"
                >
                  Or email us directly
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ 2 · who we work with ============ */}
        <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <Grain />
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <Reveal>
                <Chip label="Who we work with" />
              </Reveal>
              <MaskedHeading
                className="mt-6 font-serif text-[clamp(27px,3.6vw,48px)] font-light leading-[1.12] tracking-tight text-[#7a2c4e]"
                lines={[
                  "Four ways to",
                  <>
                    work <em className="not-italic text-[#ec4899]">together</em>.
                  </>,
                ]}
              />
              <Reveal delay={0.3}>
                <p className="mt-6 max-w-[54ch] text-[15px] font-light leading-[1.9] text-[#6b5560] md:text-[16.5px]">
                  Partner with Leira on brand and influencer collaborations for intimate perfume in
                  India. Pick whichever description fits you best — it is the same form either way.
                </p>
              </Reveal>
            </div>

            <dl className="mt-12 grid gap-px overflow-hidden rounded-[22px] border border-[#7a2c4e]/[0.1] bg-[#7a2c4e]/[0.08] md:mt-16 md:grid-cols-2">
              {PARTNERS.map((p, i) => (
                <Reveal
                  key={p.n}
                  delay={i * 0.07}
                  className="bg-[#fffdfc] p-8 transition-colors duration-500 hover:bg-[#fff5f9] md:p-10"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ec4899]/10 text-[10.5px] tracking-[0.08em] text-[#ec4899]">
                    {p.n}
                  </span>
                  <dt className="mt-4 font-serif text-[clamp(20px,2vw,28px)] font-normal leading-[1.25] text-[#7a2c4e]">
                    {p.title}
                  </dt>
                  <dd className="mt-3 max-w-[46ch] text-[14.5px] font-light leading-[1.85] text-[#6b5560]">
                    {p.body}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ 3 · what you get · plum band ============ */}
        <section className="relative isolate [overflow:clip] bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <Grain opacity={0.05} />
          <span
            aria-hidden
            className="pointer-events-none absolute -left-28 top-1/3 -z-10 h-[38vw] max-h-[480px] w-[38vw] max-w-[480px] rounded-full bg-[#ec4899]/20 blur-[110px]"
          />

          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Chip label="What to expect" dark />
              </Reveal>
              <MaskedHeading
                className="mt-6 font-serif text-[clamp(27px,3.4vw,44px)] font-light leading-[1.12] tracking-tight text-white"
                lines={[
                  "How we treat",
                  <>
                    our <em className="not-italic text-[#f9a8d4]">partners</em>.
                  </>,
                ]}
              />
            </div>

            <dl className="border-t border-white/[0.14]">
              {OFFER.map((o, i) => (
                <Reveal
                  key={o.n}
                  delay={i * 0.08}
                  className="border-b border-white/[0.14] py-7 md:py-9"
                >
                  <span className="text-[11px] tracking-[0.2em] text-[#ec4899]">{o.n}</span>
                  <dt className="mt-2 font-serif text-[clamp(19px,2vw,27px)] font-normal leading-[1.28] text-white">
                    {o.title}
                  </dt>
                  <dd className="mt-3 max-w-[52ch] text-[14.5px] font-light leading-[1.85] text-[#f7dfe8]/72 md:text-[15.5px]">
                    {o.body}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ 4 · how it works ============ */}
        <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
          <Grain />
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <Chip label="The process" />
            </Reveal>

            <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.09} className="relative">
                  {/* connecting hairline */}
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute right-[-16px] top-4 hidden h-px w-8 bg-gradient-to-r from-[#ec4899]/70 to-transparent md:block"
                    />
                  )}
                  <span className="font-serif text-[15px] tracking-[0.1em] text-[#ec4899]">
                    {s.n}
                  </span>
                  <h3 className="mt-3 font-serif text-[clamp(20px,2vw,27px)] font-light leading-[1.25] text-[#7a2c4e]">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-[38ch] text-[14.5px] font-light leading-[1.85] text-[#6b5560]">
                    {s.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 5 · the form ============ */}
        <section
          id="apply"
          className="relative isolate scroll-mt-24 [overflow:clip] bg-gradient-to-b from-[#fffdfc] to-[#fdeef4] px-5 py-20 sm:px-8 md:py-28 lg:px-12"
        >
          <Grain />
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Chip label="Apply" />
              </Reveal>
              <MaskedHeading
                className="mt-6 font-serif text-[clamp(27px,3.4vw,44px)] font-light leading-[1.12] tracking-tight text-[#7a2c4e]"
                lines={["Tell us about", "your audience."]}
              />
              <Reveal delay={0.3}>
                <p className="mt-6 max-w-[40ch] text-[15px] font-light leading-[1.9] text-[#6b5560]">
                  Everything here is required, and all of it helps us answer properly. If a field
                  doesn&apos;t apply to you, write &ldquo;n/a&rdquo; rather than leaving it blank.
                </p>
              </Reveal>
              <Reveal delay={0.4}>
                <p className="mt-6 border-l-2 border-[#ec4899] pl-5 text-[13px] font-light leading-[1.8] text-[#6b5560]/80">
                  Your details are used to assess and contact you about a collaboration. We
                  don&apos;t add applicants to a marketing list.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <div className="rounded-[26px] border border-[#ec4899]/[0.12] bg-white/75 p-6 shadow-[0_40px_80px_-56px_rgba(122,44,78,0.55)] backdrop-blur-sm sm:p-9 md:p-11">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-x-8 md:grid-cols-2">
                    <Field id="fullName" name="fullName" label="Full name" className="mb-6" />
                    <Field id="email" name="email" type="email" label="Email" className="mb-6" />
                    <Field id="phone" name="phone" type="tel" label="Phone" className="mb-6" />
                    <SelectField className="mb-6" />
                    <Field
                      id="brandOrChannel"
                      name="brandOrChannel"
                      label="Brand or channel name"
                      className="mb-6"
                    />
                    <Field
                      id="socialHandle"
                      name="socialHandle"
                      label="Instagram or social handle"
                      className="mb-6"
                    />
                  </div>

                  <Field
                    id="followers"
                    name="followers"
                    label="Followers or audience size"
                    className="mb-6"
                  />

                  <Field
                    id="message"
                    name="message"
                    label="Your collaboration idea"
                    rows={5}
                    className="mb-8"
                  />

                  <div className="flex flex-wrap items-center gap-5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative overflow-hidden rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-9 py-4 text-[11px] uppercase tracking-[0.22em] text-white shadow-[0_18px_34px_-20px_rgba(236,72,153,0.9)] transition-all duration-500 hover:-translate-y-0.5 disabled:opacity-55"
                    >
                      <span className="relative z-10">
                        {isSubmitting ? "Submitting…" : "Submit application"}
                      </span>
                      <span
                        aria-hidden
                        className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0"
                      />
                    </button>
                    <span className="text-[12px] font-light text-[#6b5560]/70">
                      We reply either way, usually within a week.
                    </span>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}