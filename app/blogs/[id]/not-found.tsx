import Link from "next/link";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col leira-underlap-nav-spacer">
      <MiniNavbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <h2 className="text-3xl font-serif italic text-neutral-900 mb-4">Post Not Found</h2>
        <p className="text-neutral-500 text-center mb-8 max-w-md">
          The blog post you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/blogs"
          className="px-10 py-4 bg-neutral-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          Back to Blog
        </Link>
      </main>
      <Footer />
    </div>
  );
}
