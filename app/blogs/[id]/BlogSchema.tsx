/**
 * JSON-LD Article schema for SEO (schema.org).
 * Rendered on the server with blog data.
 */
export default function BlogSchema({
  post,
  baseUrl,
  path,
}: {
  post: { _id: string; title: string; subHeading?: string; excerpt: string; imageUrl: string; date: string; author: string; seo?: { metaDescription?: string } };
  baseUrl: string;
  path: string;
}) {
  const url = `${baseUrl}${path}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: String(post?.seo?.metaDescription || "").trim() || post.excerpt,
    image: post.imageUrl?.startsWith("http") ? post.imageUrl : `${baseUrl}${post.imageUrl}`,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Leira",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
