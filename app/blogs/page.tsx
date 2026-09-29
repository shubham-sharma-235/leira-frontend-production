"use client";

import React, { useState, useEffect } from "react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { blogAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Eye, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Mark({ className = "" }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block h-1.5 w-1.5 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#ec4899]", className)} />;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function Grain() {
  return <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: GRAIN }} />;
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.28em] text-[#ec4899]">
      <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
      {label}
    </span>
  );
}

/** Same reveal used across the site. `onMount` plays immediately on
    mount (for above-the-fold content, which never gets a scroll
    intersection event since it's already on screen) instead of
    waiting for `whileInView`. */
function Reveal({
  children,
  delay = 0,
  onMount = false,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  onMount?: boolean;
  className?: string;
}) {
  const animProps = onMount
    ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" } };
  return (
    <motion.div {...animProps} transition={{ duration: 0.8, delay, ease: EASE }} className={className}>
      {children}
    </motion.div>
  );
}

/** Masked-line heading — each line slides up from behind an
    overflow-hidden mask, matching the Collaboration/About pages. */
function MaskedHeading({
  lines,
  className = "",
  as: Tag = "h1",
  onMount = false,
}: {
  lines: (string | React.ReactNode)[];
  className?: string;
  as?: "h1" | "h2";
  onMount?: boolean;
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.16em] block overflow-hidden pb-[0.16em]">
          <motion.span
            className="block"
            initial={{ y: "108%" }}
            {...(onMount ? { animate: { y: 0 } } : { whileInView: { y: 0 }, viewport: { once: true, margin: "-60px" } })}
            transition={{ duration: 1, delay: 0.1 + i * 0.11, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

const CATEGORIES = ["All", "Scent Guide", "Self Care", "Lifestyle", "Science", "Ethics"];

const INK = "text-[#7a2c4e]";
const BODY = "text-[#6b5560]";
const HAIR = "border-[#7a2c4e]/[0.12]";

const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const getBlogPath = (post: { slug?: string; _id?: string; title?: string }) => {
  const slug = toSlug(post?.slug || post?.title || "");
  return `/blogs/${slug || post?._id || ""}`;
};

function getImageSrc(url: string) {
  if (!url) return "/images/placeholder.png";
  if (url.startsWith("http")) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return url.startsWith("/") ? `${base}${url}` : url;
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await blogAPI.getAll();
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setPosts(res.data);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load blog posts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const displayPosts = filteredPosts;

  if (loading) {
    return (
      <div className="leira-underlap-nav-spacer flex min-h-screen flex-col bg-gradient-to-b from-[#fdf1f5] to-[#fffdfc]">
        <MiniNavbar />
        <main className="flex flex-1 items-center justify-center pb-20">
          <span className="block h-10 w-10 animate-spin rounded-full border border-[#7a2c4e]/15 border-t-[#ec4899]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="leira-underlap-nav-spacer flex min-h-screen flex-col bg-gradient-to-b from-[#fdf1f5] to-[#fffdfc]">
        <MiniNavbar />
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
          <FileText className="mb-4 h-12 w-12 text-[#7a2c4e]/25" strokeWidth={1.3} />
          <h2 className={cn("font-serif text-[22px] font-light", INK)}>Something went wrong</h2>
          <p className={cn("mt-2 mb-6 max-w-[42ch] text-[14px] font-light leading-[1.7]", BODY)}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="group relative overflow-hidden rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition-transform duration-500 hover:-translate-y-0.5"
          >
            <span className="relative z-10">Try again</span>
            <span aria-hidden className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0" />
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="leira-underlap-nav-spacer min-h-screen bg-white">
      <MiniNavbar />

      {/* ---------------- masthead ---------------- */}
      <section
        className={cn(
          "relative isolate [overflow:clip] bg-[#fffdfc] px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24 lg:px-12",
          "before:pointer-events-none before:absolute before:inset-x-0 before:-top-24 before:-z-10",
          "before:h-[calc(100%+6rem)] before:bg-gradient-to-b before:from-[#fdf1f5] before:via-[#fff7fa] before:to-[#fffdfc] before:content-['']"
        )}
      >
        <Grain />
        <motion.span
          aria-hidden
          animate={{ x: [0, 40, 0], y: [0, -34, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-24 -top-28 -z-10 h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full bg-[#f9a8d4]/30 blur-[95px]"
        />

        <div className="mx-auto max-w-3xl text-center mt-15">
          <Reveal onMount>
            <Chip label="Scent · Care · Stories" />
          </Reveal>

          <MaskedHeading
            as="h1"
            onMount
            className={cn("mt-6 font-serif text-[clamp(32px,5vw,64px)] font-light leading-[1.08] tracking-tight", INK)}
            lines={[
              "The Leira",
              <em key="journal" className="not-italic text-[#ec4899]">
                Journal
              </em>,
            ]}
          />

          <Reveal delay={0.4} onMount>
            <p className={cn("mx-auto mt-6 max-w-[52ch] text-[15px] font-light leading-[1.85] md:text-base", BODY)}>
              Guides, rituals, and quiet science behind India&apos;s first intimate perfume — written for your most sensitive skin.
            </p>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* ---------------- filters ---------------- */}
        <div className={cn("mb-12 flex flex-col justify-between gap-6 border-t pt-10 md:flex-row md:items-center", HAIR)}>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full border px-5 py-2 text-[10.5px] font-light uppercase tracking-[0.16em] transition-all duration-300",
                  activeCategory === cat
                    ? "border-transparent bg-[#7a2c4e] text-white"
                    : cn("border-[#7a2c4e]/15 bg-white hover:border-[#ec4899]/50 hover:text-[#ec4899]", BODY)
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="text-[10.5px] font-light uppercase tracking-[0.2em] text-[#7a2c4e]/45">
            {filteredPosts.length} article{filteredPosts.length === 1 ? "" : "s"} found
          </span>
        </div>

        {/* ---------------- grid / empty state ---------------- */}
        {filteredPosts.length === 0 ? (
          <div className={cn("rounded-[24px] border bg-[#fdf6f8] py-20 text-center", HAIR)}>
            <FileText className="mx-auto mb-4 h-11 w-11 text-[#7a2c4e]/25" strokeWidth={1.3} />
            <h3 className={cn("font-serif text-[20px] font-light", INK)}>No articles yet</h3>
            <p className={cn("mt-1.5 text-[13.5px] font-light", BODY)}>Check back soon for new posts in this category.</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              <AnimatePresence mode="popLayout">
                {displayPosts.map((post: any, index: number) => (
                  <motion.article
                    key={post._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="group h-full"
                  >
                    <Link href={getBlogPath(post)} className="flex h-full flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[#f7e6ee]">
                        <Image
                          src={getImageSrc(post.imageUrl)}
                          alt={post.title}
                          width={1200}
                          height={800}
                          className="h-full w-full object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={post.imageUrl?.startsWith("http")}
                        />
                      </div>

                      <div className="mt-4 flex flex-1 flex-col">
                        <div className={cn("flex items-center gap-4 text-[11px] font-light", BODY)}>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#ec4899]" strokeWidth={1.6} />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#ec4899]" strokeWidth={1.6} />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className={cn("mt-3 font-serif text-[20px] font-light italic leading-tight transition-colors duration-300 group-hover:text-[#ec4899]", INK)}>
                          {post.title}
                        </h3>

                        <p className={cn("mt-2 line-clamp-2 text-[13.5px] font-light leading-[1.65]", BODY)}>
                          {post.subHeading || post.excerpt}
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-[11px] font-light text-[#7a2c4e]/45">
                          <span className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.6} />
                            {(post.views ?? 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.6} />
                            {post.likes ?? 0}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.6} />
                            {post.dislikes ?? 0}
                          </span>
                        </div>

                        <span className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#7a2c4e]">
                          Read entry
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
        )}
      </main>

      <div className="bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31]">
        <Footer />
      </div>
    </div>
  );
}