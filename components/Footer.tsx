"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Package,
  Truck,
  Globe,
  UserRound,
  Heart,
} from "lucide-react";
import { blogAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Set to false if /images/logo.png is already light. When true the mark
   is forced to solid white, which is what a dark footer needs.
------------------------------------------------------------------- */
const INVERT_LOGO = true;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* soft blush (#f0c3d6) replaces the gold; nothing here is meant to shout */
const heading = "font-serif text-[17px] font-light italic text-[#fff]/80";
const bodyInk = "text-[#f7dfe8]/62";
const hair = "border-white/[0.10]";

/** the small drop used throughout the site, at label scale */
function Mark() {
  return (
    <span
      aria-hidden
      className="mr-2 inline-block h-[5px] w-[5px] translate-y-[-2px] rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#f0c3d6]/70 align-middle"
    />
  );
}

/** hairline with a small drop resting on it */
function Divider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative h-px w-full bg-white/[0.10]", className)}>
      <span className="absolute left-1/2 top-1/2 block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#f0c3d6]/45" />
    </div>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Newsletter — now a full-width band at the top of the footer
------------------------------------------------------------------- */
function FooterNewsletter() {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    window.location.href = `mailto:support@leiraindia.com?subject=${encodeURIComponent(
      "Newsletter signup"
    )}&body=${encodeURIComponent(`Please add me to your newsletter.\n\nEmail: ${trimmed}`)}`;
  };

  return (
    <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <span className="text-[10px] uppercase tracking-[0.26em] text-[#f0c3d6]/55">
          Stay confident
        </span>
        <h3 className="mt-4 font-serif text-[clamp(24px,2.7vw,36px)] font-light leading-[1.16] text-[#fdf2f6]">
          Offers and quiet wellness
          <br className="hidden sm:block" /> notes, <em className="not-italic text-[#f0c3d6]">once a month</em>.
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email for newsletter
        </label>

        {/* underline field, not a boxed input */}
        <div className="relative flex items-end gap-4">
          <input
            id="footer-newsletter-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="peer min-h-11 w-full flex-1 border-b border-white/[0.18] bg-transparent pb-3 text-[15px] font-light text-[#fdf2f6] outline-none transition-colors placeholder:text-[#f7dfe8]/35"
          />
          <button
            type="submit"
            className="group relative shrink-0 overflow-hidden rounded-full border border-[#f0c3d6]/40 px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-[#f0c3d6] transition-colors duration-500 hover:border-[#f0c3d6]/80 hover:text-[#3a1526]"
          >
            <span className="relative z-10">Subscribe</span>
            <span
              aria-hidden
              className="absolute inset-0 translate-y-full bg-[#f0c3d6] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
            />
          </button>
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[#f0c3d6]/60 transition-transform duration-500 peer-focus:scale-x-100"
          />
        </div>

        <p className="mt-3 text-[12px] font-light text-[#f7dfe8]/45">
          No spam, and you can leave whenever you like.
        </p>
      </form>
    </div>
  );
}

export default function Footer() {
  const [showBlogsLink, setShowBlogsLink] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await blogAPI.getAll();
        if (!mounted) return;
        const hasBlogs = !!(res?.success && Array.isArray(res?.data) && res.data.length > 0);
        setShowBlogsLink(hasBlogs);
      } catch {
        if (mounted) setShowBlogsLink(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Collaboration", href: "/collaboration" },
    ...(showBlogsLink ? [{ label: "Blogs", href: "/blogs" }] : []),
  ];

  const collectionLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Benefits", href: "/benefits" },
  ];

  const privacyTermsLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return & Exchange Policy", href: "/return-exchange-policy" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Account Deletion", href: "/account-deletion" },
  ];

  const socialLinks = [
    {
      icon: <Instagram className="size-[18px]" strokeWidth={1.6} />,
      label: "Instagram",
      href: "https://www.instagram.com/leiraindia?igsh=MXBmY2R2MjNjdzBlaA==",
    },
    {
      icon: <Facebook className="size-[18px]" strokeWidth={1.6} />,
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61581120730884",
    },
    {
      icon: <PinterestIcon className="size-[18px]" />,
      label: "Pinterest",
      href: "https://in.pinterest.com/LeiraIndia/",
    },
    {
      icon: <Linkedin className="size-[18px]" strokeWidth={1.6} />,
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/130554752/",
    },
    {
      icon: <Twitter className="size-[18px]" strokeWidth={1.6} />,
      label: "X (Twitter)",
      href: "https://x.com/LeiraIndiaxe8",
    },
  ];

  const trustItems = [
    { icon: <Package className="size-5 shrink-0" strokeWidth={1.4} />, line1: "COD available", line2: "Across India" },
    { icon: <Truck className="size-5 shrink-0" strokeWidth={1.4} />, line1: "Free shipping", line2: "On orders ₹1999+" },
    { icon: <Globe className="size-5 shrink-0" strokeWidth={1.4} />, line1: "Pan-India", line2: "Delivery" },
    { icon: <UserRound className="size-5 shrink-0" strokeWidth={1.4} />, line1: "Trusted by", line2: "10,000+ women" },
  ];

  const linkClass = cn(
    "group relative inline-block py-[5px] text-[13.5px] font-light leading-relaxed transition-colors duration-500",
    bodyInk,
    "hover:text-[#f0c3d6]"
  );

  return (
    <footer className="relative isolate [overflow:clip] bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31] text-left">
      {/* a hairline of light along the very top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c3d6]/35 to-transparent"
      />

      {/* grain + soft glows, same treatment as the page sections */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{ backgroundImage: GRAIN }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 -z-10 h-[34vw] max-h-[420px] w-[34vw] max-w-[420px] rounded-full bg-[#f0c3d6]/[0.09] blur-[120px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[30vw] max-h-[360px] w-[30vw] max-w-[360px] rounded-full bg-[#c98aa6]/[0.10] blur-[130px]"
      />
      {/* vignette — keeps the corners from feeling flat */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(20,7,13,0.45) 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        {/* ---------------- newsletter band ---------------- */}
        <div className="py-16 md:py-20">
          <FooterNewsletter />
        </div>
        <Divider />

        {/* ---------------- columns: 4 + 2 + 2 + 2 + 2 = 12 ---------------- */}
        <div className="grid gap-14 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10 md:py-20">
          {/* brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="Leira"
                width={160}
                height={52}
                className={cn(
                  "h-10 w-auto object-contain object-left",
                  INVERT_LOGO && "brightness-0 invert"
                )}
                loading="lazy"
              />
            </Link>

            <p className="mt-6 max-w-[26ch] font-serif text-[clamp(19px,1.7vw,23px)] font-light leading-[1.4] text-[#fdf2f6]/85">
              Every part of you deserves self-care.
            </p>
            <p className={cn("mt-4 max-w-[36ch] text-[13px] font-light leading-[1.85]", bodyInk)}>
              India&apos;s first essential oil based intimate perfume — for natural intimate care,
              lasting freshness and quiet everyday confidence.
            </p>

            {/* socials as hairline circles rather than bare glyphs */}
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              {socialLinks.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] text-[#f7dfe8]/60 backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-[#f0c3d6]/45 hover:bg-[#f0c3d6]/[0.08] hover:text-[#f0c3d6]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <nav className="lg:col-span-2" aria-label="Quick links">
            <h4 className={heading}>
              <Mark /> Explore
            </h4>
            <ul className="mt-6 space-y-0.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                    <span
                      aria-hidden
                      className="absolute bottom-[4px] left-0 h-px w-full origin-left scale-x-0 bg-[#f0c3d6]/55 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* collection */}
          <nav className="lg:col-span-2" aria-label="Collection links">
            <h4 className={heading}>
              <Mark /> Collection
            </h4>
            <ul className="mt-6 space-y-0.5">
              {collectionLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                    <span
                      aria-hidden
                      className="absolute bottom-[4px] left-0 h-px w-full origin-left scale-x-0 bg-[#f0c3d6]/55 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* policies */}
          <nav className="lg:col-span-2" aria-label="Privacy and terms links">
            <h4 className={heading}>
              <Mark /> Policies
            </h4>
            <ul className="mt-6 space-y-0.5">
              {privacyTermsLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                    <span
                      aria-hidden
                      className="absolute bottom-[4px] left-0 h-px w-full origin-left scale-x-0 bg-[#f0c3d6]/55 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact */}
          <div className="lg:col-span-2">
            <h4 className={heading}>
              <Mark /> Get in touch
            </h4>
            <div className="mt-6 space-y-5 text-[13.5px] font-light leading-[1.75]">
              <p className={bodyInk} data-nosnippet>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[#f0c3d6]/45">
                  Address
                </span>
                <span className="mt-1.5 block">
                  Aoman Services Private Limited
                  <br />
                  Office No. 48, 7th Floor, ETT Tower 2
                  <br />
                  Sector 132, Noida, UP 201304
                </span>
              </p>

              <p className={bodyInk}>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[#f0c3d6]/45">
                  Phone
                </span>
                <a
                  href="tel:+919810822968"
                  className="mt-1.5 inline-block transition-colors duration-300 hover:text-[#f0c3d6]"
                >
                  +91 98108 22968
                </a>
              </p>

              <p className={bodyInk}>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[#f0c3d6]/45">
                  Email
                </span>
                <a
                  href="mailto:support@leiraindia.com"
                  className="mt-1.5 inline-block break-all transition-colors duration-300 hover:text-[#f0c3d6]"
                >
                  support@leiraindia.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- trust strip ---------------- */}
        <Divider className="mb-2" />
        <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.08] sm:grid-cols-4 sm:divide-y-0">
          {trustItems.map((item) => (
            <div
              key={item.line1}
              className="group flex items-center gap-3.5 px-5 py-7 transition-colors duration-700 hover:bg-white/[0.035] sm:px-6"
            >
              <span className="text-[#f0c3d6]/60 transition-colors duration-500 group-hover:text-[#f0c3d6]" aria-hidden="true">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-normal leading-tight text-[#fdf2f6]">{item.line1}</p>
                {item.line2 ? (
                  <p className="mt-1 text-[11.5px] font-light leading-tight text-[#f7dfe8]/45">
                    {item.line2}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- bottom bar ---------------- */}
        <Divider className="mt-12" />
        <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] font-light text-[#f7dfe8]/40">
            © 2026 Leira · Powered by Aoman Services Private Limited
          </p>

          <p className="flex items-center gap-1.5 text-[12.5px] font-light text-[#f7dfe8]/40">
            Made with
            <Heart className="inline size-3.5 fill-[#f0c3d6] text-[#f0c3d6]" aria-hidden="true" />
            in India
          </p>
        </div>
      </div>

      {/* the mark, oversized and barely there, half off the bottom edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 translate-y-[24%] select-none text-center font-serif text-[26vw] font-light leading-[0.72] tracking-tight text-white/[0.035]"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 55%)",
          maskImage: "linear-gradient(to bottom, transparent, #000 55%)",
        }}
      >
        Leira
      </span>
    </footer>
  );
}