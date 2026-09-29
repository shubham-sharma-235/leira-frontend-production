"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { blogAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, MessageCircle, Eye, ThumbsUp, ThumbsDown, List } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { extractTocFromHtml, injectHeadingIds, normalizeBlogContent, type TocItem } from "./blog-toc";
import { resolveMediaUrl } from "@/lib/mediaUrl";

function getImageSrc(url: string) {
  return resolveMediaUrl(url);
}

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

const getCategoryPath = (category?: string) => `/blogs/category/${toSlug(category || "")}`;

/* ------------------------------------------------------------------
   BLOG_CONTENT_CLASS — every selector here is unchanged from the
   original (same [&_p], [&_h2], [&_.inci-name], [&_ul.check-list],
   etc.). Only the colour values were swapped for Leira's palette:
   magenta/blue headings → ink (#7a2c4e) and pink (#ec4899); the
   "tone-gold" h3 variant → Leira gold; INCI/check-list green is left
   untouched since it's a safety indicator, not a brand colour.
------------------------------------------------------------------- */
const BLOG_CONTENT_CLASS =
  "blog-content max-w-none text-[17px] leading-[1.9] text-[#5c4a52] [&_p]:mb-5 [&_p]:text-[#5c4a52] [&_strong]:font-semibold [&_strong]:text-[#7a2c4e] [&_ul]:mb-7 [&_ul]:list-disc [&_ul]:pl-6 [&_ul>li]:mb-2 [&_ol]:mb-7 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol>li]:mb-2 [&_h2:not(.blog-hero-subtitle)]:mt-12 [&_h2:not(.blog-hero-subtitle)]:mb-5 [&_h2:not(.blog-hero-subtitle)]:border-t [&_h2:not(.blog-hero-subtitle)]:border-[#ec4899]/30 [&_h2:not(.blog-hero-subtitle)]:pt-7 [&_h2:not(.blog-hero-subtitle)]:font-serif [&_h2:not(.blog-hero-subtitle)]:text-[clamp(1.65rem,2.1vw,2.05rem)] [&_h2:not(.blog-hero-subtitle)]:font-light [&_h2:not(.blog-hero-subtitle)]:leading-tight [&_h2:not(.blog-hero-subtitle)]:tracking-tight [&_h2:not(.blog-hero-subtitle)]:text-[#7a2c4e] [&_h3]:mt-7 [&_h3]:mb-3 [&_h3]:text-[1.05rem] [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:text-[#7a2c4e] [&_h3.tone-gold]:text-[#a8823f] [&_h3.tone-blue]:text-[#7a2c4e] [&_a]:text-[#ec4899] [&_a]:underline [&_a]:underline-offset-2 [&_h4]:mt-6 [&_h4]:mb-3 [&_h4]:text-[1.06rem] [&_h4]:font-semibold [&_h4]:text-[#7a2c4e] [&_.inci-name]:my-5 [&_.inci-name]:rounded-none [&_.inci-name]:border [&_.inci-name]:border-[#2f8f45] [&_.inci-name]:bg-[#f8fff9] [&_.inci-name]:px-4 [&_.inci-name]:py-2 [&_.inci-name]:text-[1.02rem] [&_.inci-name]:font-semibold [&_.inci-name]:text-[#24753a] [&_.inci-name_strong]:text-[#24753a] [&_ul.check-list]:list-none [&_ul.check-list]:pl-0 [&_ul.check-list>li]:relative [&_ul.check-list>li]:pl-8 [&_ul.check-list>li]:text-[#24753a] [&_ul.check-list>li]:font-medium [&_ul.check-list>li]:before:content-['✓'] [&_ul.check-list>li]:before:absolute [&_ul.check-list>li]:before:left-0 [&_ul.check-list>li]:before:top-0 [&_ul.check-list>li]:before:text-[#24753a] [&_ul.check-list>li_*]:text-[#24753a] [&_ul.check-list>li_strong]:font-medium [&_ul.check-list>li_strong]:text-[#24753a] [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-[#ec4899] [&_blockquote]:pl-5 [&_blockquote]:text-center [&_blockquote]:font-serif [&_blockquote]:text-[1.2rem] [&_blockquote]:font-normal [&_blockquote]:italic [&_blockquote]:text-[#7a2c4e] [&_.gold-box]:my-6 [&_.gold-box]:border [&_.gold-box]:border-[#ec4899] [&_.gold-box]:bg-[#fdf6e8] [&_.gold-box]:px-5 [&_.gold-box]:py-4 [&_.gold-box]:text-[#6b5230] [&_.gold-box]:text-[0.98rem] [&_.gold-box_p]:my-1 [&_.gold-box_strong]:text-[#6b5230] [&_.gold-box_strong]:font-semibold";

function markInciHeadingsAsBox(html: string): string {
  if (!html) return html;

  const addInciClassToH3 = html.replace(
    /<h3([^>]*)>([\s\S]*?)<\/h3>/gi,
    (full, attrs = "", inner = "") => {
      const plain = String(inner).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (!/^INCI\s*Name\s*:/i.test(plain)) return full;

      if (/class\s*=\s*"/i.test(attrs)) {
        return `<h3${String(attrs).replace(/class\s*=\s*"([^"]*)"/i, ' class="$1 inci-name"')}>${inner}</h3>`;
      }
      return `<h3${attrs} class="inci-name">${inner}</h3>`;
    }
  );

  const withInciParagraphs = addInciClassToH3.replace(
    /<p([^>]*)>\s*<strong>\s*(INCI\s*Name\s*:[\s\S]*?)<\/strong>\s*<\/p>/gi,
    `<p$1 class="inci-name"><strong>$2</strong></p>`
  );

  return withInciParagraphs.replace(/<ul class="check-list"/gi, '<ul class="check-list tone-green"');
}

export default function BlogPostDetailClient({ post, relatedPosts }: { post: any; relatedPosts: any[] }) {
  const router = useRouter();
  const imageSrc = getImageSrc(post.imageUrl);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [dislikes, setDislikes] = useState(post.dislikes ?? 0);
  const [views, setViews] = useState(post.views ?? 0);
  const [reacting, setReacting] = useState<"like" | "dislike" | null>(null);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(true);

  const { toc, contentWithIds, blocks } = useMemo(() => {
    const incomingBlocks = Array.isArray(post?.blocks) ? post.blocks : [];
    const sortedBlocks = incomingBlocks
      .slice()
      .sort((a: any, b: any) => (Number(a?.order) || 0) - (Number(b?.order) || 0));

    const blockHtml = sortedBlocks
      .map((b: any) => String(b?.html || ""))
      .filter(Boolean)
      .join("\n");

    const htmlSource = normalizeBlogContent(blockHtml || post.content || "");
    const tocList = extractTocFromHtml(htmlSource);
    const withIds = injectHeadingIds(htmlSource, tocList);
    const withInciBoxes = markInciHeadingsAsBox(withIds);
    return { toc: tocList, contentWithIds: withInciBoxes, blocks: sortedBlocks };
  }, [post.content, post?.blocks]);

  const renderedBlocks = useMemo(() => {
    if (!Array.isArray(blocks) || blocks.length === 0) return null;
    const imgSrc = (url: string) => getImageSrc(url);

    const calloutToneClass = (tone?: string) => {
      if (tone === "green") return "border-[#2f8f45] bg-[#f8fff9] text-[#24753a]";
      if (tone === "pink") return "border-[#ec4899]/40 bg-[#fdf1f5] text-[#7a2c4e]";
      return "border-[#7a2c4e]/15 bg-[#fdf6f8] text-[#5c4a52]";
    };

    return blocks.map((b: any, i: number) => {
      const type = String(b?.type || "richText");
      const caption = String(b?.caption || "").trim();
      const alt = String(b?.alt || "").trim() || "Blog image";
      const imageUrl = String(b?.imageUrl || "").trim();
      const html = String(b?.html || "");

      if (type === "image") {
        if (!imageUrl) return null;
        return (
          <figure key={`blk-${i}`} className="my-10">
            <div className="relative w-full overflow-hidden rounded-[20px]">
              <Image
                src={imgSrc(imageUrl)}
                alt={alt}
                width={1600}
                height={1000}
                className="h-auto w-full max-w-full object-cover object-center"
                sizes="(max-width: 768px) 100vw, min(896px, 100vw)"
                loading="lazy"
                unoptimized={imageUrl.startsWith("http")}
              />
            </div>
            {caption && <figcaption className="mt-3 text-center text-[12.5px] font-light text-[#6b5560]">{caption}</figcaption>}
          </figure>
        );
      }

      if (type === "imageLeft" || type === "imageRight") {
        if (!imageUrl) return null;
        const isRight = type === "imageRight";
        return (
          <section
            key={`blk-${i}`}
            className="my-12 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start"
          >
            <div className={`lg:col-span-5 ${isRight ? "lg:order-2" : "lg:order-1"}`}>
              <div className="relative aspect-4/5 min-h-[280px] w-full overflow-hidden rounded-[22px] border border-[#7a2c4e]/[0.1] bg-[#f7e6ee] shadow-[0_24px_48px_-32px_rgba(122,44,78,0.3)] lg:min-h-[360px]">
                <Image
                  src={imgSrc(imageUrl)}
                  alt={alt}
                  fill
                  className="object-contain object-center p-2"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  loading="lazy"
                  unoptimized={imageUrl.startsWith("http")}
                />
              </div>
              {caption && <div className="mt-3 text-center text-[12.5px] font-light text-[#6b5560]">{caption}</div>}
            </div>
            <div className={`lg:col-span-7 ${isRight ? "lg:order-1" : "lg:order-2"}`}>
              <div
                className={BLOG_CONTENT_CLASS}
                dangerouslySetInnerHTML={{ __html: injectHeadingIds(normalizeBlogContent(html), toc) }}
              />
            </div>
          </section>
        );
      }

      if (type === "callout") {
        const tone = String(b?.tone || "neutral");
        if (!html) return null;
        return (
          <section key={`blk-${i}`} className="my-10">
            <div
              className={`rounded-[22px] border px-6 py-6 md:px-8 md:py-7 ${calloutToneClass(tone)}`}
            >
              <div
                className="max-w-none text-[15.5px] leading-[1.85] [&_p]:my-3 [&_strong]:font-semibold [&_a]:text-[#ec4899] [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: normalizeBlogContent(html) }}
              />
            </div>
          </section>
        );
      }

      // richText
      if (!html) return null;
      return (
        <section key={`blk-${i}`} className="my-10">
          <div
            className={BLOG_CONTENT_CLASS}
            dangerouslySetInnerHTML={{ __html: normalizeBlogContent(html) }}
          />
        </section>
      );
    });
  }, [blocks, toc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await blogAPI.recordView(post._id);
        if (!cancelled && res?.data?.views != null) setViews(res.data.views);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [post._id]);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let role: string | null = null;
    try {
      role = rawUser ? JSON.parse(rawUser)?.role : null;
    } catch {
      role = null;
    }
    const canReact = !!token && role !== "admin";
    setIsLoggedIn(canReact);
    if (!canReact) {
      setUserReaction(null);
      return;
    }
    (async () => {
      try {
        const res = await blogAPI.getReaction(post._id);
        if (!cancelled) setUserReaction(res?.data?.reaction || null);
      } catch {
        if (!cancelled) setUserReaction(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [post._id]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleReact = async (type: "like" | "dislike") => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (reacting) return;
    setReacting(type);
    try {
      const res = await blogAPI.react(post._id, type);
      if (res?.data) {
        setLikes(res.data.likes ?? likes);
        setDislikes(res.data.dislikes ?? dislikes);
        setUserReaction(res.data.reaction ?? type);
      }
    } catch {
      // ignore
    } finally {
      setReacting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white leira-underlap-nav-spacer">
      {/* ------------------------------------------------------------
          Content-authored typography. Every selector below is the
          same one that shipped originally (.leira-summer-blog h2/h3,
          .hero, .gold, .banner, .muted, .stats, .red-bullets,
          .green-checks, .heat, .faq) — only colour values changed,
          swapped for Leira's palette. Green (safety) and the heat
          gradient are left as-is since they carry meaning unrelated
          to brand colour.
      ------------------------------------------------------------ */}
      <style>{`
        .leira-summer-blog {
          max-width: 760px;
          margin: 0 auto;
          color: #5c4a52;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          line-height: 1.18;
        }
        .blog-content .leira-summer-blog h2,
        .leira-summer-blog h2 {
          border-top: 1px solid #ec4899 !important;
          color: #7a2c4e !important;
          font-family: Georgia, "Times New Roman", serif !important;
          font-size: 30px !important;
          font-weight: 400 !important;
          line-height: 1.08 !important;
          margin: 42px 0 18px !important;
          padding-top: 26px !important;
        }
        .blog-content .leira-summer-blog h3,
        .leira-summer-blog h3 {
          color: #7a2c4e !important;
          font-family: Georgia, "Times New Roman", serif !important;
          font-size: 17px !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
          margin: 22px 0 10px !important;
        }
        .blog-content .leira-summer-blog h3.tone-gold,
        .leira-summer-blog h3.tone-gold {
          color: #a8823f !important;
        }
        .leira-summer-blog .hero {
          text-align: center;
        }
        .blog-content .leira-summer-blog .hero h2,
        .leira-summer-blog .hero h2 {
          border-top: 0 !important;
          font-size: 34px !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        .blog-content .leira-summer-blog .gold,
        .leira-summer-blog .gold {
          color: #a8823f !important;
          font-family: Georgia, "Times New Roman", serif !important;
          font-weight: 700 !important;
        }
        .blog-content .leira-summer-blog p,
        .leira-summer-blog p {
          margin: 0 0 14px !important;
        }
        .leira-summer-blog .banner {
          background: #7a2c4e;
          color: white;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.15;
          margin: 34px auto 22px;
          max-width: 650px;
          padding: 10px 18px;
          text-align: center;
        }
        .leira-summer-blog .muted {
          color: #6b5560;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          text-align: center;
        }
        .blog-content .leira-summer-blog blockquote,
        .leira-summer-blog blockquote {
          border-left: 4px solid #ec4899 !important;
          color: #7a2c4e !important;
          font-size: 16px !important;
          margin: 36px 0 30px !important;
          padding: 0 0 0 14px !important;
          text-align: left !important;
        }
        .leira-summer-blog table {
          border-collapse: collapse;
          font-size: 13px;
          line-height: 1.08;
          margin: 14px 0 18px;
          width: 100%;
        }
        .leira-summer-blog th {
          background: #7a2c4e;
          border: 1px solid #4a1c2c;
          color: white;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 600;
          padding: 3px 6px;
        }
        .leira-summer-blog td {
          border: 1px solid #7a2c4e;
          padding: 3px 6px;
        }
        .leira-summer-blog .heat {
          background: linear-gradient(90deg, #ff4b00, #ff9300);
          color: #fff;
          font-weight: 800;
          text-align: center;
        }
        .blog-content .leira-summer-blog ul,
        .leira-summer-blog ul {
          list-style: none !important;
          margin: 12px 0 28px !important;
          padding-left: 20px !important;
        }
        .blog-content .leira-summer-blog li,
        .leira-summer-blog li {
          margin: 8px 0 !important;
        }
        .leira-summer-blog .red-bullets li::before {
          color: #ec4899;
          content: "●";
          font-size: 18px;
          margin-right: 10px;
        }
        .leira-summer-blog .green-checks li::before {
          color: #167a25;
          content: "✓";
          font-weight: 900;
          margin-right: 8px;
        }
        .leira-summer-blog .stats {
          border-left: 2px solid #ec4899;
          padding-left: 16px !important;
        }
        .leira-summer-blog .stats li strong {
          color: #7a2c4e !important;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
        }
        .blog-content .leira-summer-blog .faq h3,
        .leira-summer-blog .faq h3,
        .blog-content h3.tone-blue,
        h3.tone-blue {
          color: #7a2c4e !important;
        }
        .blog-content h3:not(.tone-gold):not(.inci-name) {
          color: #7a2c4e !important;
          font-size: 1.05rem !important;
          font-weight: 600 !important;
        }
        .blog-content h2:not(.blog-hero-subtitle) {
          color: #7a2c4e !important;
          font-size: clamp(1.65rem, 2.1vw, 2.05rem) !important;
        }
        .blog-content a {
          color: #ec4899 !important;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-content .leira-summer-blog .faq h3,
        .leira-summer-blog .faq h3 {
          font-size: 17px !important;
        }
      `}</style>
      <MiniNavbar />

      {/* ---------------- hero ---------------- */}
      <section className="relative w-full overflow-hidden bg-[#f7e6ee]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-0"
        >
          <Image
            src={imageSrc}
            alt={post.title}
            width={1920}
            height={1080}
            className="mx-auto h-auto w-full max-w-full max-h-[min(88vh,920px)] object-contain object-center"
            style={{ width: "100%", height: "auto" }}
            priority
            sizes="100vw"
            unoptimized={post.imageUrl?.startsWith("http")}
          />
        </motion.div>

        <div className="absolute top-32 left-8 md:left-12">
          <Link
            href="/blogs"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/80 text-[#7a2c4e] shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white group"
            aria-label="Back to blogs"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.7} />
          </Link>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-6 py-20">
        {/* ---------------- author / share row ---------------- */}
        <div className={`mb-12 flex items-center justify-between border-b border-[#7a2c4e]/[0.1] pb-10`}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ec4899]/10 font-serif text-[17px] font-normal text-[#ec4899]">
              {(post.author || "L").charAt(0)}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a2c4e]">{post.author}</p>
              <p className="text-[11px] font-light text-[#6b5560]/60">Contributor</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full p-3 text-[#7a2c4e]/45 transition-colors duration-300 hover:bg-[#ec4899]/[0.06] hover:text-[#ec4899]"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.7} />
            </button>
            <button className="rounded-full p-3 text-[#7a2c4e]/45 transition-colors duration-300 hover:bg-[#ec4899]/[0.06] hover:text-[#ec4899]" aria-label="Bookmark">
              <Bookmark className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </div>
        </div>

        {/* ---------------- table of contents ---------------- */}
        {toc.length > 0 && (
          <nav
            className="mb-12 overflow-hidden rounded-[22px] border border-[#7a2c4e]/[0.1] bg-white shadow-[0_20px_40px_-30px_rgba(122,44,78,0.3)]"
            aria-label="Table of contents"
          >
            <div className="border-b border-[#7a2c4e]/[0.1] bg-gradient-to-b from-white to-[#fdf1f5] px-6 pb-4 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.18em] text-[#7a2c4e]/70">
                    <List className="h-4 w-4" strokeWidth={1.7} />
                    On this page
                  </h2>
                  <p className="mt-1 text-[11.5px] font-light text-[#6b5560]/60">Jump to any section.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTocOpen((v) => !v)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#7a2c4e]/15 bg-white px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#7a2c4e]/70 transition-colors duration-300 hover:border-[#ec4899]/40 hover:text-[#ec4899]"
                  aria-expanded={isTocOpen}
                  aria-controls="blog-toc"
                >
                  {isTocOpen ? "Hide" : "Show"}
                  <span
                    className={`inline-block transition-transform duration-200 ${isTocOpen ? "rotate-180" : "rotate-0"}`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>
              </div>
            </div>

            {(() => {
              const sections: Array<{ parent: TocItem; children: TocItem[] }> = [];
              let current: { parent: TocItem; children: TocItem[] } | null = null;

              for (const item of toc) {
                if (item.level === 2) {
                  current = { parent: item, children: [] };
                  sections.push(current);
                  continue;
                }
                if (!current) {
                  // If content starts with an H3, group it under a synthetic parent.
                  current = { parent: { id: item.id, text: "Highlights", level: 2 }, children: [] };
                  sections.push(current);
                }
                current.children.push(item);
              }

              return (
                <div
                  id="blog-toc"
                  className={`px-6 transition-[max-height,opacity] duration-300 ease-out ${
                    isTocOpen ? "max-h-[1200px] opacity-100 py-5" : "max-h-0 opacity-0 py-0"
                  } overflow-hidden`}
                >
                  <ol className="space-y-4">
                    {sections.map((section) => (
                      <li key={section.parent.id}>
                        <a
                          href={`#${section.parent.id}`}
                          onClick={() => setIsTocOpen(false)}
                          className="group flex items-start gap-3 text-[13px] font-medium text-[#7a2c4e] transition-colors duration-300 hover:text-[#ec4899]"
                        >
                          <span className="mt-[0.45rem] h-1.5 w-1.5 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#ec4899]/70 transition-colors duration-300 group-hover:bg-[#ec4899]" />
                          <span className="leading-snug">{section.parent.text}</span>
                        </a>

                        {section.children.length > 0 && (
                          <ol className="mt-2 ml-[0.35rem] space-y-2 border-l border-[#7a2c4e]/[0.1] pl-4">
                            {section.children.map((child) => (
                              <li key={child.id} className="relative">
                                <a
                                  href={`#${child.id}`}
                                  onClick={() => setIsTocOpen(false)}
                                  className="block text-[12.5px] font-light leading-snug text-[#6b5560] transition-colors duration-300 hover:text-[#ec4899]"
                                >
                                  {child.text}
                                </a>
                              </li>
                            ))}
                          </ol>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })()}
          </nav>
        )}

        {/* ---------------- article ---------------- */}
        <article className="prose prose-pink prose-lg max-w-none">
          <header className="not-prose mb-10">
            <h1 className="m-0 font-serif text-[clamp(1.9rem,3.4vw,2.5rem)] font-light leading-[1.15] tracking-tight text-[#7a2c4e]">
              {post.title}
            </h1>
            {String(post.subHeading || "").trim() ? (
              <p className="mb-0 mt-4 font-serif text-[1.05rem] font-light italic leading-relaxed text-[#7a2c4e]/60 md:text-[1.12rem]">
                {post.subHeading}
              </p>
            ) : null}
          </header>

          {renderedBlocks ? (
            <div className="not-prose">{renderedBlocks}</div>
          ) : contentWithIds ? (
            <div
              className={BLOG_CONTENT_CLASS}
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />
          ) : (
            <div className="space-y-6 text-[17px] font-light leading-[1.8] text-[#6b5560]">
              <p>No content available for this post.</p>
            </div>
          )}
        </article>

        {/* ---------------- reactions + publish info ---------------- */}
        <div className="mt-12 border-t border-[#7a2c4e]/[0.1] pt-10">
          <div className="mb-6 flex flex-wrap items-center gap-6 text-[13px] font-light text-[#6b5560]/70">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#ec4899]" strokeWidth={1.6} />
              Published {post.date}
            </span>
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#ec4899]" strokeWidth={1.6} />
              {views.toLocaleString()} views
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleReact("like")}
              disabled={!!reacting}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-light transition-colors duration-300 disabled:opacity-50 ${
                userReaction === "like"
                  ? "border-[#ec4899] bg-[#ec4899]/[0.08] text-[#ec4899]"
                  : "border-[#7a2c4e]/15 text-[#7a2c4e]/70 hover:border-[#ec4899]/40 hover:text-[#ec4899]"
              }`}
            >
              <ThumbsUp className="h-4 w-4" strokeWidth={1.7} />
              <span>{likes}</span>
            </button>
            <button
              type="button"
              onClick={() => handleReact("dislike")}
              disabled={!!reacting}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-light transition-colors duration-300 disabled:opacity-50 ${
                userReaction === "dislike"
                  ? "border-[#ec4899] bg-[#ec4899]/[0.08] text-[#ec4899]"
                  : "border-[#7a2c4e]/15 text-[#7a2c4e]/70 hover:border-[#ec4899]/40 hover:text-[#ec4899]"
              }`}
            >
              <ThumbsDown className="h-4 w-4" strokeWidth={1.7} />
              <span>{dislikes}</span>
            </button>
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#ec4899] px-8 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-transform duration-500 hover:-translate-y-0.5"
            >
              <span className="relative z-10">Shop now</span>
              <span aria-hidden className="absolute inset-0 translate-y-full bg-[#7a2c4e] transition-transform duration-500 group-hover:translate-y-0" />
            </Link>
          </div>
          {!isLoggedIn && (
            <p className="mt-3 text-[12px] font-light text-[#6b5560]/60">
              <Link href="/login" className="text-[#ec4899] hover:underline">Log in</Link> to react once per post.
            </p>
          )}
        </div>

        {/* ---------------- tags ---------------- */}
        <div className="mt-20 flex flex-wrap gap-2.5 border-t border-[#7a2c4e]/[0.1] pt-10">
          {["Beauty", "Lifestyle", "Scent", post.category].filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="cursor-pointer rounded-full bg-[#fdf1f5] px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#7a2c4e]/60 transition-colors duration-300 hover:bg-[#ec4899]/10 hover:text-[#ec4899]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* ---------------- footer cta ---------------- */}
        <footer className="mt-16 rounded-[26px] bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31] p-8 text-center text-white md:p-12">
          <h3 className="mb-4 font-serif text-[26px] font-light italic">Explore Leira</h3>
          <p className="mx-auto mb-8 max-w-md text-[13.5px] font-light text-[#f7dfe8]/70">
            Discover our collection of fragrances and find your signature scent.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.7} />
              More articles
            </Link>
          </div>
        </footer>
      </main>

      {/* ---------------- related posts ---------------- */}
      {relatedPosts.length > 0 && (
        <section className="bg-gradient-to-b from-[#fdeef4] via-[#fff5f9] to-[#fffdfc] px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-16 text-center font-serif text-[32px] font-light italic text-[#7a2c4e]">
              Continue reading
            </h2>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-2">
              {relatedPosts.map((p: any) => (
                <Link key={p._id} href={getBlogPath(p)} className="group space-y-5">
                  <div className="relative overflow-hidden rounded-[22px] bg-[#f7e6ee] shadow-[0_24px_48px_-32px_rgba(122,44,78,0.3)] transition-shadow duration-500 group-hover:shadow-[0_32px_64px_-36px_rgba(236,72,153,0.35)]">
                    <Image
                      src={getImageSrc(p.imageUrl)}
                      alt={p.title}
                      width={1200}
                      height={800}
                      className="h-auto w-full max-w-full object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      style={{ width: "100%", height: "auto" }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                      unoptimized={p.imageUrl?.startsWith("http")}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[#3a1424]/10 transition-colors duration-500 group-hover:bg-transparent" />
                  </div>
                  <div className="space-y-2">
                    <Link
                      href={getCategoryPath(p.category)}
                      className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#ec4899] underline decoration-[#ec4899]/30 underline-offset-4"
                    >
                      {p.category}
                    </Link>
                    <h3 className="font-serif text-[22px] font-light italic leading-tight text-[#7a2c4e] transition-colors duration-300 group-hover:text-[#ec4899]">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="bg-gradient-to-br from-[#2b0f1d] via-[#3a1526] to-[#4a1c31]">
        <Footer />
      </div>
    </div>
  );
}