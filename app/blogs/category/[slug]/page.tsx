import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leiraindia.com";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api` : "") ||
  "https://leiraindia.com/api";
const IMAGE_BASE = API_URL.replace(/\/api\/?$/, "");

type BlogPost = {
  _id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  readTime?: string;
};

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const toLabel = (slug: string) =>
  String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

const getBlogPath = (post: BlogPost) => {
  const slug = toSlug(post?.slug || post?.title || "");
  return `/blogs/${slug || post?._id || ""}`;
};

function getImageSrc(url: string | undefined): string {
  if (!url) return "/images/placeholder.png";
  if (url.startsWith("http")) return url;
  return url.startsWith("/") ? `${IMAGE_BASE}${url}` : url;
}

async function getBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/blogs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.success && Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryLabel = toLabel(slug);
  const canonicalPath = `/blogs/category/${slug}`;
  const title = `${categoryLabel} Blogs | Leira`;
  const description = `Explore Leira ${categoryLabel.toLowerCase()} blog articles with guides, insights, and tips for intimate care and feminine wellness.`;

  return {
    title,
    description,
    alternates: buildHreflangAlternates(canonicalPath),
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}${canonicalPath}`,
      siteName: "Leira",
      images: ["/images/Intro.JPEG"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/Intro.JPEG"],
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const blogs = await getBlogs();
  const posts = blogs.filter((post) => toSlug(post.category || "") === slug);
  const categoryLabel = toLabel(slug);

  return (
    <div className="min-h-screen bg-[#FAF9F6] leira-underlap-nav-spacer">
      <MiniNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600">Category</p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900 sm:text-4xl">{categoryLabel} Articles</h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-600">
          Explore helpful reads in {categoryLabel} and discover practical insights from Leira.
        </p>

        {posts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-8">
            <p className="text-neutral-700">No articles found in this category yet.</p>
            <Link href="/blogs" className="mt-4 inline-flex text-sm font-medium text-pink-600 hover:text-pink-700">
              Back to all blogs
            </Link>
          </div>
        ) : (
          <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post._id || post.title} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <Link href={getBlogPath(post)} className="block">
                  <div className="relative w-full overflow-hidden bg-[#ebe5df]">
                    <Image
                      src={getImageSrc(post.imageUrl)}
                      alt={post.title || "Leira blog post"}
                      width={1200}
                      height={800}
                      className="h-auto w-full max-w-full object-contain object-center"
                      style={{ width: "100%", height: "auto" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized={Boolean(post.imageUrl?.startsWith("http"))}
                    />
                  </div>
                </Link>
                <div className="space-y-3 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-600">{post.category}</p>
                  <Link href={getBlogPath(post)} className="block text-lg font-semibold leading-snug text-neutral-900 hover:text-pink-700">
                    {post.title}
                  </Link>
                  <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-neutral-500">{post.readTime || "5 min read"}</span>
                    <Link href={getBlogPath(post)} className="text-sm font-medium text-pink-600 hover:text-pink-700">
                      Read post
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

