import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import BlogPostDetailClient from "./BlogPostDetailClient";
import BlogSchema from "./BlogSchema";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leiraindia.com/api";

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const getBlogSlugOrId = (post: { slug?: string; title?: string; _id?: string } | null | undefined) =>
  toSlug(post?.slug || post?.title || "") || String(post?._id || "");

function toPlainText(value: string): string {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAutoMetaDescription(post: any): string {
  const fromContent = toPlainText(post?.content || "");
  const fromExcerpt = toPlainText(post?.excerpt || "");
  const source = fromContent || fromExcerpt;
  if (!source) return "Read the latest Leira blog article on intimate care, fragrance wellness, and feminine confidence.";
  return source.length <= 160 ? source : `${source.slice(0, 157).trimEnd()}...`;
}

function estimateReadTimeFromContent(post: any): string {
  const text = toPlainText(post?.content || "");
  if (!text) return post?.readTime || "1 min read";
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

async function getBlog(id: string) {
  try {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function getBlogs() {
  try {
    const res = await fetch(`${API_URL}/blogs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlog(id);
  const slugOrId = getBlogSlugOrId(post) || id;
  const canonicalPath = `/blogs/${slugOrId}`;
  const imageUrl = post?.imageUrl || "/images/Intro.JPEG";
  if (!post) {
    return {
      title: "Post Not Found | Leira",
      alternates: buildHreflangAlternates(canonicalPath),
    };
  }
  const seoTitle = String(post?.seo?.metaTitle || "").trim();
  const seoDescription = String(post?.seo?.metaDescription || "").trim();
  const autoDescription = seoDescription || buildAutoMetaDescription(post);
  const readTimeMeta = post?.readTime?.trim() || estimateReadTimeFromContent(post);

  const keywords: string[] = [
    String(post?.title || "").trim(),
    String(post?.seo?.primaryKeyword || "").trim(),
    ...(Array.isArray(post?.seo?.secondaryKeywords) ? post.seo.secondaryKeywords : []),
    "Leira blog",
    "intimate perfume for women",
    "women's intimate wellness",
  ].filter(Boolean);

  return {
    title: seoTitle || `${post.title} | Leira Blog`,
    description: autoDescription,
    keywords,
    alternates: buildHreflangAlternates(canonicalPath),
    other: {
      "reading-time": readTimeMeta,
    },
    openGraph: {
      title: seoTitle || post.title,
      description: autoDescription,
      type: "article",
      url: `${SITE_URL}${canonicalPath}`,
      siteName: "Leira",
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle || post.title,
      description: autoDescription,
      images: [imageUrl],
    },
  };
}

const baseUrl = SITE_URL;

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlog(id);
  if (!post) notFound();
  const slugOrId = getBlogSlugOrId(post) || id;
  if (slugOrId && id !== slugOrId) {
    redirect(`/blogs/${slugOrId}`);
  }

  const all = await getBlogs();
  const relatedPosts = all.filter((p: any) => p._id !== post._id).slice(0, 2);
  const canonicalPath = `/blogs/${slugOrId}`;

  return (
    <>
      <BlogSchema post={post} baseUrl={baseUrl} path={canonicalPath} />
      <BlogPostDetailClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
