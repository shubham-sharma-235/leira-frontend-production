"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { blogAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function AdminBlogsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/admin/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        router.push("/admin/login");
        return;
      }
    } catch {
      router.push("/admin/login");
      return;
    }
    fetchBlogs();
  }, [router]);

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getAll();
      if (response.success) {
        setBlogs(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await blogAPI.delete(deleteId);
      success("Blog deleted successfully.");
      fetchBlogs();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      error(err.message || "Error deleting blog");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans text-neutral-900">
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Blog Post?"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        isLoading={isDeleting}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">
              Blog <span className="italic text-pink-600">Posts</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Create and manage blog articles.</p>
          </div>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Add New Post
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-8 flex items-center gap-4">
          <Search className="text-neutral-400 w-5 h-5 ml-2" />
          <input
            type="text"
            placeholder="Search by title or category..."
            className="flex-1 bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No blog posts yet</h3>
            <p className="text-neutral-500 text-sm mb-6">Create your first post to get started.</p>
            <Link
              href="/admin/blogs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800"
            >
              <Plus size={18} /> Add New Post
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredBlogs.map((blog) => (
              <motion.div
                key={blog._id}
                variants={itemVariants}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100/50 hover:shadow-xl hover:shadow-neutral-200/40 transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-neutral-50 relative overflow-hidden">
                  {blog.imageUrl ? (
                    <img
                      src={
                        blog.imageUrl.startsWith("http")
                          ? blog.imageUrl
                          : blog.imageUrl.startsWith("/")
                            ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${blog.imageUrl}`
                            : blog.imageUrl
                      }
                      alt={blog.title}
                      width={1200}
                      height={900}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <FileText size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/blogs/${blog._id}/edit`}
                      className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur text-neutral-700 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(blog._id)}
                      className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
                    {blog.category}
                  </span>
                  <h3 className="font-serif font-medium text-neutral-900 mt-1 line-clamp-2">{blog.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{blog.date} · {blog.readTime}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
