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
import { contactAPI } from "@/lib/api";

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
  /** true for anything above the fold */
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
   Underline field — no boxes. `placeholder=" "` is what drives the
   floating label, so it must stay.
------------------------------------------------------------------- */
function Field({
  id,
  name,
  label,
  type = "text",
  rows,
  required = true,
  dark = false,
  className = "",
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  rows?: number;
  required?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const base =
    "peer w-full bg-transparent pb-2.5 pt-7 text-[15.5px] font-light outline-none transition-colors";
  const light = "border-b border-[#7a2c4e]/[0.18] text-[#7a2c4e]";
  const onDark = "border-b border-white/25 text-white";

  const labelBase =
    "pointer-events-none absolute left-0 top-7 origin-left text-[15px] font-light transition-all duration-500 peer-focus:-translate-y-6 peer-focus:scale-[0.72] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.72]";
  const labelLight = "text-[#6b5560]/70 peer-focus:text-[#ec4899]";
  const labelDark = "text-[#f7dfe8]/60 peer-focus:text-[#f9a8d4]";

  return (
    <div className={`relative ${className}`}>
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          placeholder=" "
          className={`${base} ${dark ? onDark : light} resize-none leading-[1.75]`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder=" "
          className={`${base} ${dark ? onDark : light}`}
        />
      )}

      <label htmlFor={id} className={`${labelBase} ${dark ? labelDark : labelLight}`}>
        {label}
      </label>

      {/* rule that sweeps in on focus */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#ec4899] to-[#f9a8d4] transition-transform duration-500 peer-focus:scale-x-100"
      />
    </div>
  );
}

function SubmitButton({
  busy,
  children,
  dark = false,
}: {
  busy: boolean;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`group relative overflow-hidden rounded-full px-9 py-4 text-[11px] uppercase tracking-[0.22em] transition-all duration-500 disabled:opacity-55 ${
        dark
          ? "bg-white text-[#7a2c4e] hover:-translate-y-0.5"
          : "bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] text-white shadow-[0_18px_34px_-20px_rgba(236,72,153,0.9)] hover:-translate-y-0.5"
      }`}
    >
      <span className="relative z-10">{busy ? "Sending…" : children}</span>
      {!dark && (
        <span
          aria-hidden
          className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0"
        />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------
   Contact details
------------------------------------------------------------------- */
const DETAILS: { key: string; value: ReactNode }[] = [
  { key: "Company", value: "Aoman Services Private Limited" },
  {
    key: "Address",
    value: (
      <>
        <span className="block">Office No. 48, 7th Floor</span>
        <span className="block">ETT Tower 2</span>
        <span className="block">Sector 132, Noida, UP 201304</span>
      </>
    ),
  },
  {
    key: "Phone",
    value: (
      <a
        href="tel:+919810822968"
        className="bg-gradient-to-r from-[#ec4899] to-[#ec4899] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,color] duration-500 hover:bg-[length:100%_1px] hover:text-[#ec4899]"
      >
        +91 98108 22968
      </a>
    ),
  },
  {
    key: "Email",
    value: (
      <a
        href="mailto:support@leiraindia.com"
        className="bg-gradient-to-r from-[#ec4899] to-[#ec4899] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,color] duration-500 hover:bg-[length:100%_1px] hover:text-[#ec4899]"
      >
        support@leiraindia.com
      </a>
    ),
  },
];

/* ==================================================================
   Page
   ================================================================== */
export default function ContactPage() {
  const { success, error } = useToast();
  const [isMessageSubmitting, setIsMessageSubmitting] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isMessageSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      error("Please fill all required fields.");
      return;
    }

    setIsMessageSubmitting(true);
    try {
      await contactAPI.submitMessage({ name, email, message });
      success("Your message has been sent successfully.");
      form.reset();
    } catch (err: any) {
      error(err.message || "Could not submit your message.");
    } finally {
      setIsMessageSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReviewSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const firstName = String(formData.get("first-name") || "").trim();
    const lastName = String(formData.get("last-name") || "").trim();
    const email = String(formData.get("review-email") || "").trim();
    const review = String(formData.get("review-text") || "").trim();

    if (!firstName || !lastName || !email || !review) {
      error("Please fill all required fields.");
      return;
    }

    setIsReviewSubmitting(true);
    try {
      await contactAPI.submitReview({ firstName, lastName, email, review });
      success("Your review has been sent for approval.");
      form.reset();
    } catch (err: any) {
      error(err.message || "Could not submit your review.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  return (
    <>
      <MiniNavbar />
      <main className="min-h-screen bg-white leira-underlap-nav-spacer">
        {/* ============ 1 · masthead + message form + details ============ */}
        <section className="relative isolate [overflow:clip] bg-[linear-gradient(180deg,#fffdfc_0%,#fff7fa_50%,#fdf1f5_100%)] px-5 pb-20 pt-16 sm:px-8 md:pb-28 md:pt-24 lg:px-12">
          <Grain />
          <motion.span
            aria-hidden
            animate={{ x: [0, 40, 0], y: [0, -34, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-24 -top-28 -z-10 h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full bg-[#f9a8d4]/30 blur-[95px]"
          />

          <div className="mx-auto max-w-3xl text-center mt-15">
            <Reveal onMount>
              <Chip label="Get in touch" />
            </Reveal>

            <MaskedHeading
              as="h1"
              onMount
              className="mt-6 font-serif text-[clamp(32px,5vw,64px)] font-light leading-[1.08] tracking-tight text-[#7a2c4e]"
              lines={[
                "We’re here,",
                <>
                  <em className="not-italic text-[#ec4899]">discreetly</em>.
                </>,
              ]}
            />

            <Reveal delay={0.4} onMount>
              <p className="mx-auto mt-6 max-w-[46ch] text-[15px] font-light leading-[1.8] text-[#6b5560] md:text-base">
                Questions about your order, your skin, or whether Leira is right for you — write to
                us and a real person will answer.
              </p>
            </Reveal>

            <Reveal delay={0.5} onMount>
              <span
                aria-hidden
                className="mx-auto mt-8 block h-px w-16 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent"
              />
            </Reveal>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-12 md:mt-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            {/* details ledger */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <p className="font-serif text-[12px] uppercase tracking-[0.22em] text-[#ec4899]">
                  Contact details
                </p>
              </Reveal>

              <dl className="mt-5 border-t border-[#7a2c4e]/[0.12]">
                {DETAILS.map((d, i) => (
                  <Reveal
                    key={d.key}
                    delay={0.1 + i * 0.08}
                    className="border-b border-[#7a2c4e]/[0.12] py-5"
                  >
                    <dt className="font-serif text-[10.5px] uppercase tracking-[0.22em] text-[#ec4899]">
                      {d.key}
                    </dt>
                    <dd className="mt-2 font-sans text-[clamp(18px,1.6vw,18px)] leading-[1.42] text-[#7a2c4e]">
                      {d.value}
                    </dd>
                  </Reveal>
                ))}
              </dl>

              <Reveal delay={0.5}>
                <p className="mt-7 text-[12.5px] font-light leading-[1.75] text-[#6b5560]/75">
                  Orders and returns are handled by the same small team, so nothing gets passed
                  along. We reply within one business day.
                </p>
              </Reveal>
            </div>

            {/* message form */}
            <Reveal delay={0.15}>
              <div className="rounded-[26px] border border-[#ec4899]/[0.12] bg-white/70 p-6 shadow-[0_40px_80px_-56px_rgba(122,44,78,0.55)] backdrop-blur-sm sm:p-9 md:p-11">
                <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">
                  Send a message
                </p>
                <h2 className="mt-3 font-serif text-[clamp(24px,2.6vw,34px)] font-light leading-[1.15] text-[#7a2c4e]">
                  Tell us how we can help.
                </h2>

                <form className="mt-8" onSubmit={handleContactSubmit}>
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <Field id="name" name="name" label="Your name" className="mb-6" />
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      label="Email"
                      className="mb-6"
                    />
                  </div>

                  <Field id="message" name="message" label="Your message" rows={5} className="mb-8" />

                  <div className="flex flex-wrap items-center gap-5">
                    <SubmitButton busy={isMessageSubmitting}>Send message</SubmitButton>
                    <span className="text-[12px] font-light text-[#6b5560]/70">
                      Your note reaches our team only.
                    </span>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ 2 · review, on the plum band ============ */}
        <section className="relative isolate [overflow:clip] bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <Grain opacity={0.05} />
          <span
            aria-hidden
            className="pointer-events-none absolute -left-28 bottom-0 -z-10 h-[38vw] max-h-[480px] w-[38vw] max-w-[480px] rounded-full bg-[#ec4899]/20 blur-[110px]"
          />

          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Chip label="Product review" dark />
              </Reveal>

              <MaskedHeading
                className="mt-6 font-serif text-[clamp(27px,3.4vw,44px)] font-light leading-[1.12] tracking-tight text-white"
                lines={[
                  "Share your",
                  <>
                    Leira <em className="not-italic text-[#f9a8d4]">experience.</em>
                  </>,
                ]}
              />

              <Reveal delay={0.3}>
                <p className="mt-6 max-w-[42ch] text-[15px] font-light leading-[1.9] text-[#f7dfe8]/75">
                  Reviews are read by us before they go live, and published with your first name
                  only. If you would rather not appear on the site at all, say so in your review and
                  we will keep it private.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <form onSubmit={handleReviewSubmit}>
                <div className="grid gap-x-8 sm:grid-cols-2">
                  <Field id="first-name" name="first-name" label="First name" dark className="mb-6" />
                  <Field id="last-name" name="last-name" label="Last name" dark className="mb-6" />
                </div>

                <Field
                  id="review-email"
                  name="review-email"
                  type="email"
                  label="Email"
                  dark
                  className="mb-6"
                />

                <Field
                  id="review-text"
                  name="review-text"
                  label="Your review"
                  rows={5}
                  dark
                  className="mb-8"
                />

                <div className="flex flex-wrap items-center gap-5">
                  <SubmitButton busy={isReviewSubmitting} dark>
                    Submit review
                  </SubmitButton>
                  <span className="text-[12px] font-light text-[#f7dfe8]/60">
                    Published only after approval.
                  </span>
                </div>
              </form>
            </Reveal>
          </div>
        </section>

        {/* ============ 3 · closing line ============ */}
        <section className="relative isolate [overflow:clip] bg-[#fffdfc] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
          <Grain />
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="font-serif text-[clamp(20px,2.4vw,32px)] font-light italic leading-[1.45] text-[#7a2c4e]">
              &ldquo;Every part of you deserves self-care. Not just the visible parts.&rdquo;
            </p>
            <span
              aria-hidden
              className="mx-auto mt-8 block h-px w-16 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent"
            />
          </Reveal>
        </section>

        <Footer />
      </main>
    </>
  );
}






















// "use client";

// import { FormEvent, useState } from "react";
// import { MiniNavbar } from "@/components/ui/mini-navbar";
// import Footer from "@/components/Footer";
// import { motion } from "framer-motion";
// import { Building2, MapPin, Phone, Mail } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/toast";
// import { contactAPI } from "@/lib/api";

// export default function ContactPage() {
//   const { success, error } = useToast();
//   const [isMessageSubmitting, setIsMessageSubmitting] = useState(false);
//   const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

//   const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (isMessageSubmitting) return;

//     const form = e.currentTarget;
//     const formData = new FormData(form);
//     const name = String(formData.get("name") || "").trim();
//     const email = String(formData.get("email") || "").trim();
//     const message = String(formData.get("message") || "").trim();

//     if (!name || !email || !message) {
//       error("Please fill all required fields.");
//       return;
//     }

//     setIsMessageSubmitting(true);
//     try {
//       await contactAPI.submitMessage({ name, email, message });
//       success("Your message has been sent successfully.");
//       form.reset();
//     } catch (err: any) {
//       error(err.message || "Could not submit your message.");
//     } finally {
//       setIsMessageSubmitting(false);
//     }
//   };

//   const handleReviewSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (isReviewSubmitting) return;

//     const form = e.currentTarget;
//     const formData = new FormData(form);
//     const firstName = String(formData.get("first-name") || "").trim();
//     const lastName = String(formData.get("last-name") || "").trim();
//     const email = String(formData.get("review-email") || "").trim();
//     const review = String(formData.get("review-text") || "").trim();

//     if (!firstName || !lastName || !email || !review) {
//       error("Please fill all required fields.");
//       return;
//     }

//     setIsReviewSubmitting(true);
//     try {
//       await contactAPI.submitReview({ firstName, lastName, email, review });
//       success("Your review has been sent for approval.");
//       form.reset();
//     } catch (err: any) {
//       error(err.message || "Could not submit your review.");
//     } finally {
//       setIsReviewSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <MiniNavbar />
//       <main className="min-h-screen bg-white leira-underlap-nav-spacer">
//         <div className="relative z-10">
//           <div className="bg-white">
//             <div className="pb-16">
//               {/* Hero Section */}
//               <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
//                 <motion.div
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
//                   className="text-center space-y-6"
//                 >
//                   {/* Small decorative text */}
//                   <motion.p
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.2 }}
//                     className="text-xs md:text-sm text-gray-400 font-medium tracking-[0.2em] uppercase"
//                   >
//                     Get in Touch
//                   </motion.p>
                  
//                   {/* Main Heading */}
//                   <motion.h1
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.3 }}
//                     className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-[1.1] tracking-tight"
//                   >
//                     <span className="font-serif italic">Contact</span>{" "}
//                     <span className="font-semibold text-pink-600">Us</span>
//                   </motion.h1>
                  
//                   {/* Decorative line */}
//                   <motion.div
//                     initial={{ opacity: 0, scaleX: 0 }}
//                     animate={{ opacity: 1, scaleX: 1 }}
//                     transition={{ duration: 0.8, delay: 0.4 }}
//                     className="w-24 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"
//                   />
                  
//                   {/* Description */}
//                   <motion.p
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.5 }}
//                     className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed font-light"
//                   >
//                     We'd love to hear from you. Send us a message and we'll respond as soon as possible.
//                   </motion.p>
//                 </motion.div>
//               </section>

//               {/* Forms Section */}
//               <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
//                   {/* Contact Form - Left */}
//                   <motion.div
//                     initial={{ opacity: 0, x: -50 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true, margin: "-100px" }}
//                     transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
//                     className="h-full space-y-8 rounded-2xl border border-gray-100 bg-white/70 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 p-8"
//                   >
//                     <div className="space-y-1">
//                       <h2 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">
//                         Contact Us
//                       </h2>
//                       <h3 className="text-2xl md:text-3xl font-semibold text-pink-600">
//                         Send us a Message
//                       </h3>
//                     </div>
                    
//                     <form className="space-y-6" onSubmit={handleContactSubmit}>
//                       <div className="space-y-2">
//                         <label htmlFor="name" className="text-sm font-medium text-gray-700">
//                           Name <span className="text-pink-600">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           id="name"
//                           name="name"
//                           required
//                           className="w-full px-4 py-3 border border-gray-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
//                           placeholder="Your name"
//                         />
//                       </div>
                      
//                       <div className="space-y-2">
//                         <label htmlFor="email" className="text-sm font-medium text-gray-700">
//                           Email <span className="text-pink-600">*</span>
//                         </label>
//                         <input
//                           type="email"
//                           id="email"
//                           name="email"
//                           required
//                           className="w-full px-4 py-3 border border-gray-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
//                           placeholder="your.email@example.com"
//                         />
//                       </div>
                      
//                       <div className="space-y-2">
//                         <label htmlFor="message" className="text-sm font-medium text-gray-700">
//                           Message <span className="text-pink-600">*</span>
//                         </label>
//                         <textarea
//                           id="message"
//                           name="message"
//                           rows={6}
//                           required
//                           className="w-full px-4 py-3 border border-gray-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
//                           placeholder="Tell us how we can help you..."
//                         />
//                       </div>
                      
//                       <div className="pt-2">
//                         <Button
//                           type="submit"
//                           size="lg"
//                           className="w-full bg-pink-600 text-white hover:bg-pink-700 rounded-full px-8 py-5 text-sm font-semibold tracking-wide uppercase shadow-md hover:shadow-lg transition-all duration-300"
//                         >
//                           Send
//                         </Button>
//                       </div>
//                     </form>
//                   </motion.div>

//                   {/* Product Review Form - Right */}
//                   <motion.div
//                     initial={{ opacity: 0, x: 50 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true, margin: "-100px" }}
//                     transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
//                     className="h-full space-y-8 rounded-2xl border border-gray-100 bg-white/70 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 p-8"
//                   >
//                     <div className="space-y-1">
//                       <h2 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">
//                         Product Review
//                       </h2>
//                       <h3 className="text-2xl md:text-3xl font-semibold text-pink-600">
//                         Share Your Leira Experience With Us
//                       </h3>
//                     </div>
                    
//                     <form className="space-y-6" onSubmit={handleReviewSubmit}>
//                       <div className="space-y-2">
//                         <label htmlFor="review-name" className="text-sm font-medium text-gray-700">
//                           Name <span className="text-pink-600">*</span>
//                         </label>
//                         <div className="grid grid-cols-2 gap-4">
//                           <input
//                             type="text"
//                             id="first-name"
//                             name="first-name"
//                             required
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
//                             placeholder="First"
//                           />
//                           <input
//                             type="text"
//                             id="last-name"
//                             name="last-name"
//                             required
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
//                             placeholder="Last"
//                           />
//                         </div>
//                       </div>
                      
//                       <div className="space-y-2">
//                         <label htmlFor="review-email" className="text-sm font-medium text-gray-700">
//                           Email <span className="text-pink-600">*</span>
//                         </label>
//                         <input
//                           type="email"
//                           id="review-email"
//                           name="review-email"
//                           required
//                           className="w-full px-4 py-3 border border-gray-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
//                           placeholder="your.email@example.com"
//                         />
//                       </div>
                      
//                       <div className="space-y-2">
//                         <label htmlFor="review-text" className="text-sm font-medium text-gray-700">
//                           Review <span className="text-pink-600">*</span>
//                         </label>
//                         <textarea
//                           id="review-text"
//                           name="review-text"
//                           rows={6}
//                           required
//                           className="w-full px-4 py-3 border border-gray-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
//                           placeholder="Share your experience with Leira..."
//                         />
//                       </div>
                      
//                       <div className="pt-2">
//                         <Button
//                           type="submit"
//                           size="lg"
//                           className="w-full bg-pink-600 text-white hover:bg-pink-700 rounded-full px-8 py-5 text-sm font-semibold tracking-wide uppercase shadow-md hover:shadow-lg transition-all duration-300"
//                         >
//                           Send
//                         </Button>
//                       </div>
//                     </form>
//                   </motion.div>
//                 </div>
//               </section>

//               {/* Contact Information Section - Below Forms */}
//               <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
//                 <motion.div
//                   initial={{ opacity: 0, y: 50 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true, margin: "-100px" }}
//                   transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
//                   className="space-y-12"
//                 >
//                   <div className="text-center">
//                     <motion.p
//                       initial={{ opacity: 0, y: 20 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.6, delay: 0.2 }}
//                       className="text-xs md:text-sm text-gray-400 font-medium tracking-[0.2em] uppercase mb-4"
//                     >
//                       Get in Touch
//                     </motion.p>
//                     <motion.h2
//                       initial={{ opacity: 0, y: 20 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.6, delay: 0.3 }}
//                       className="text-4xl md:text-5xl font-light text-gray-900 mb-6"
//                     >
//                       <span className="font-semibold text-pink-600">Contact</span> Information
//                     </motion.h2>
//                     <motion.p
//                       initial={{ opacity: 0, y: 20 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.6, delay: 0.4 }}
//                       className="text-sm md:text-base text-gray-500 leading-relaxed max-w-2xl mx-auto font-light"
//                     >
//                       Reach out to us through any of these channels. We're here to help and answer any questions you may have.
//                     </motion.p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {/* Company Card */}
//                     <motion.div
//                       initial={{ opacity: 0, y: 30 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.6, delay: 0.1 }}
//                       className="group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 hover:-translate-y-1"
//                     >
//                       <div className="flex flex-col items-start space-y-4">
//                         <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
//                           <Building2 className="h-7 w-7 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-semibold text-gray-900 mb-2">Company</h3>
//                           <p className="text-sm text-gray-600 leading-relaxed">
//                             AOMAN SERVICES PRIVATE LIMITED
//                           </p>
//                         </div>
//                       </div>
//                     </motion.div>

//                     {/* Address Card */}
//                     <motion.div
//                       initial={{ opacity: 0, y: 30 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.6, delay: 0.2 }}
//                       className="group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 hover:-translate-y-1"
//                     >
//                       <div className="flex flex-col items-start space-y-4">
//                         <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
//                           <MapPin className="h-7 w-7 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
//                           <p className="text-sm text-gray-600 leading-relaxed">
//                             Office No. 48, 7th Floor,<br />
//                             ETT Tower 2,<br />
//                             Sector -132, Noida, UP - 201304
//                           </p>
//                         </div>
//                       </div>
//                     </motion.div>

//                     {/* Phone Card */}
//                     <motion.div
//                       initial={{ opacity: 0, y: 30 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.6, delay: 0.3 }}
//                       className="group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 hover:-translate-y-1"
//                     >
//                       <div className="flex flex-col items-start space-y-4">
//                         <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
//                           <Phone className="h-7 w-7 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
//                           <a
//                             href="tel:+919810822968"
//                             className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors inline-block"
//                           >
//                             9810822968
//                           </a>
//                         </div>
//                       </div>
//                     </motion.div>

//                     {/* Email Card */}
//                     <motion.div
//                       initial={{ opacity: 0, y: 30 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true }}
//                       transition={{ duration: 0.6, delay: 0.4 }}
//                       className="group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 hover:-translate-y-1"
//                     >
//                       <div className="flex flex-col items-start space-y-4">
//                         <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
//                           <Mail className="h-7 w-7 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
//                           <a
//                             href="mailto:support@leiraindia.com"
//                             className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors inline-block break-all"
//                           >
//                             support@leiraindia.com
//                           </a>
//                         </div>
//                       </div>
//                     </motion.div>
//                   </div>
//                 </motion.div>
//               </section>
//             </div>
//           </div>
//           <Footer />
//         </div>
//       </main>
//     </>
//   );
// }

