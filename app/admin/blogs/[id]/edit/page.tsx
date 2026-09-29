"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { blogAPI, uploadAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Upload, ArrowUp, ArrowDown, Trash2, Image as ImageIcon, AlignLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

const CATEGORIES = ["Scent Guide", "Self Care", "Lifestyle", "Science", "Ethics"];
const BLOCK_TYPES = [
  { value: "richText", label: "Text" },
  { value: "imageLeft", label: "Image Left + Text" },
  { value: "imageRight", label: "Image Right + Text" },
  { value: "image", label: "Full Image" },
  { value: "callout", label: "Callout Box" },
] as const;

type BlockType = (typeof BLOCK_TYPES)[number]["value"];

type BlogBlock = {
  type: BlockType;
  html?: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  tone?: "neutral" | "pink" | "green";
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMobileCover, setUploadingMobileCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCoverInputRef = useRef<HTMLInputElement>(null);
  const sectionImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBlockIndex, setUploadingBlockIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subHeading: "",
    excerpt: "",
    content: "",
    category: CATEGORIES[0],
    date: "",
    readTime: "5 min read",
    imageUrl: "",
    coverImageMobile: "",
    author: "Leira Editorial",
    seo: {
      metaTitle: "",
      metaDescription: "",
      primaryKeyword: "",
      secondaryKeywords: "",
    },
  });
  const [blocks, setBlocks] = useState<BlogBlock[]>([]);

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
    fetchBlog();
  }, [id, router]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getById(id);
      if (response.success && response.data) {
        const b = response.data;
        setFormData({
          title: b.title || "",
          slug: b.slug || "",
          subHeading: b.subHeading || "",
          excerpt: b.excerpt || "",
          content: b.content || "",
          category: b.category || CATEGORIES[0],
          date: b.date || "",
          readTime: b.readTime || "5 min read",
          imageUrl: b.imageUrl || "",
          coverImageMobile: b.coverImageMobile || "",
          author: b.author || "Leira Editorial",
          seo: {
            metaTitle: b?.seo?.metaTitle || "",
            metaDescription: b?.seo?.metaDescription || "",
            primaryKeyword: b?.seo?.primaryKeyword || "",
            secondaryKeywords: Array.isArray(b?.seo?.secondaryKeywords)
              ? b.seo.secondaryKeywords.join(", ")
              : "",
          },
        });
        const incomingBlocks = Array.isArray(b.blocks) ? b.blocks : [];
        setBlocks(
          incomingBlocks.length
            ? incomingBlocks
                .slice()
                .sort((x: any, y: any) => (Number(x?.order) || 0) - (Number(y?.order) || 0))
                .map((blk: any) => ({
                  type: (blk?.type || "richText") as BlockType,
                  html: blk?.html || "",
                  imageUrl: blk?.imageUrl || "",
                  alt: blk?.alt || "",
                  caption: blk?.caption || "",
                  tone: blk?.tone || "neutral",
                }))
            : [{ type: "richText", html: "" }]
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to load post");
      router.push("/admin/blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("seo.")) {
      const key = name.replace("seo.", "");
      setFormData((prev) => ({ ...prev, seo: { ...(prev as any).seo, [key]: value } }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      if (response.success && response.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
        success("Cover image updated.");
      }
    } catch (err: any) {
      error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleMobileCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMobileCover(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      if (response.success && response.data?.url) {
        setFormData((prev) => ({ ...prev, coverImageMobile: response.data.url }));
        success("Mobile cover updated.");
      }
    } catch (err: any) {
      error(err.message || "Upload failed");
    } finally {
      setUploadingMobileCover(false);
      if (mobileCoverInputRef.current) mobileCoverInputRef.current.value = "";
    }
  };

  const addBlock = (type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      type === "image" ? { type, imageUrl: "", alt: "", caption: "" } :
      type === "imageLeft" || type === "imageRight" ? { type, html: "", imageUrl: "", alt: "", caption: "" } :
      type === "callout" ? { type, html: "", tone: "pink" } :
      { type: "richText", html: "" },
    ]);
  };

  const updateBlock = (index: number, patch: Partial<BlogBlock>) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const deleteBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      const temp = next[index];
      next[index] = next[j];
      next[j] = temp;
      return next;
    });
  };

  const handleSectionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const indexStr = e.target.getAttribute("data-index") || "";
    const index = Number(indexStr);
    if (!file || !Number.isFinite(index)) return;
    setUploadingBlockIndex(index);
    try {
      const response = await uploadAPI.uploadImage(file);
      if (response.success && response.data?.url) {
        updateBlock(index, { imageUrl: response.data.url });
        success("Section image uploaded.");
      }
    } catch (err: any) {
      error(err.message || "Upload failed");
    } finally {
      setUploadingBlockIndex(null);
      if (sectionImageInputRef.current) sectionImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanedBlocks = blocks
        .map((b) => ({ ...b }))
        .filter((b) => {
          if (b.type === "image" || b.type === "imageLeft" || b.type === "imageRight") return !!String(b.imageUrl || "").trim();
          return !!String(b.html || "").trim();
        })
        .map((b, idx) => ({ ...b, order: idx }));

      await blogAPI.update(id, {
        ...formData,
        blocks: cleanedBlocks.length ? cleanedBlocks : undefined,
        seo: {
          metaTitle: formData.seo.metaTitle || undefined,
          metaDescription: formData.seo.metaDescription || undefined,
          primaryKeyword: formData.seo.primaryKeyword || undefined,
          secondaryKeywords: formData.seo.secondaryKeywords || undefined,
        },
      });
      success("Blog post updated successfully.");
      setTimeout(() => router.push("/admin/blogs"), 1000);
    } catch (err: any) {
      error(err.message || "Failed to update post");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-neutral-900 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/blogs"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Blog Posts</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-serif font-medium text-neutral-900 mb-2">Edit Post</h1>
          <p className="text-neutral-500">Update your blog article.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-neutral-100/50 border border-neutral-100 p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2">
                Post Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="e.g. The Art of Layering Fragrances"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Slug (optional)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="e.g. leira-intimate-perfume-for-women-india"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Sub-heading</label>
                  <input
                    type="text"
                    name="subHeading"
                    value={formData.subHeading}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="Short line below title (optional)"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Excerpt *</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none resize-none transition-all"
                    placeholder="Short summary for cards and SEO"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Date *</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="e.g. Feb 24, 2026"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Read time *</label>
                  <input
                    type="text"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="5 min read"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="Leira Editorial"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2 pt-4">
                Cover Image *
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="blog-cover-upload-edit"
                disabled={uploading}
              />
              <label
                htmlFor="blog-cover-upload-edit"
                className={`flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-neutral-400 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Upload size={20} className="text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">
                  {uploading ? "Uploading..." : "Change cover image"}
                </span>
              </label>
              {formData.imageUrl && (
                <div className="mt-4 relative w-full max-w-md aspect-video rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src={
                      formData.imageUrl.startsWith("http")
                        ? formData.imageUrl
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000"}${formData.imageUrl}`
                    }
                    alt="Cover"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/placeholder.png";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2 border-b border-neutral-100 pb-2 pt-6">
                Mobile cover image <span className="font-normal normal-case text-neutral-400">(optional)</span>
              </h3>
              <p className="text-[11px] text-neutral-500 mb-4 leading-relaxed">
                Shown only on the blog listing hero for phones. Use a tighter crop without small type in the artwork. If empty, the main cover is used.
              </p>
              <input
                ref={mobileCoverInputRef}
                type="file"
                accept="image/*"
                onChange={handleMobileCoverUpload}
                className="hidden"
                id="blog-mobile-cover-upload-edit"
                disabled={uploadingMobileCover}
              />
              <label
                htmlFor="blog-mobile-cover-upload-edit"
                className={`flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-neutral-400 transition-colors ${uploadingMobileCover ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Upload size={20} className="text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">
                  {uploadingMobileCover ? "Uploading..." : "Upload mobile cover"}
                </span>
              </label>
              {formData.coverImageMobile ? (
                <div className="mt-4 space-y-2">
                  <div className="relative w-full max-w-xs aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img
                      src={
                        formData.coverImageMobile.startsWith("http")
                          ? formData.coverImageMobile
                          : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000"}${formData.coverImageMobile}`
                      }
                      alt="Mobile cover preview"
                      width={1200}
                      height={900}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.png";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coverImageMobile: "" }))}
                    className="text-xs font-medium text-pink-600 hover:text-pink-700"
                  >
                    Remove mobile cover
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={14}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none resize-y transition-all font-mono text-sm"
                placeholder="Full article content (plain text or simple HTML)"
              />
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Tip: For premium layout with images inside sections, use <span className="font-semibold">Sections</span> below. If you don’t add sections, the site will render this full content normally.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 pt-4 flex-1">
                  Sections (Text + Images)
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addBlock("richText")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <AlignLeft className="w-4 h-4" /> Add Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("imageLeft")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <ImageIcon className="w-4 h-4" /> Image Left
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("imageRight")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <ImageIcon className="w-4 h-4" /> Image Right
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("image")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <ImageIcon className="w-4 h-4" /> Full Image
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("callout")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <Plus className="w-4 h-4" /> Callout
                  </button>
                </div>
              </div>

              <input
                ref={sectionImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleSectionImageUpload}
                className="hidden"
              />

              <div className="mt-6 space-y-4">
                {blocks.map((b, idx) => {
                  const isImage = b.type === "image" || b.type === "imageLeft" || b.type === "imageRight";
                  const busy = uploadingBlockIndex === idx;
                  return (
                    <div key={idx} className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                            Section {idx + 1}
                          </span>
                          <select
                            value={b.type}
                            onChange={(e) => updateBlock(idx, { type: e.target.value as BlockType })}
                            className="text-xs font-semibold bg-white border border-neutral-200 rounded-full px-3 py-2 outline-none"
                          >
                            {BLOCK_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, -1)}
                            disabled={idx === 0}
                            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, 1)}
                            disabled={idx === blocks.length - 1}
                            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBlock(idx)}
                            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 inline-flex items-center justify-center"
                            title="Delete section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {isImage && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                Section Image
                              </label>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  if (!sectionImageInputRef.current) return;
                                  sectionImageInputRef.current.setAttribute("data-index", String(idx));
                                  sectionImageInputRef.current.click();
                                }}
                                className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${
                                  busy ? "opacity-60 cursor-not-allowed" : "hover:border-neutral-400 cursor-pointer"
                                } border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-700 inline-flex items-center justify-center gap-2`}
                              >
                                <Upload className="w-4 h-4 text-neutral-500" />
                                {busy ? "Uploading..." : "Upload section image"}
                              </button>
                              {b.imageUrl ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                                  <img
                                    src={
                                      String(b.imageUrl).startsWith("http")
                                        ? (b.imageUrl as string)
                                        : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000"}${b.imageUrl}`
                                    }
                                    alt={b.alt || "Section image"}
                                    width={1280}
                                    height={720}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/images/placeholder.png";
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="text-xs text-neutral-500">
                                  Add an image to enable this section layout.
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                  Alt text
                                </label>
                                <input
                                  value={b.alt || ""}
                                  onChange={(e) => updateBlock(idx, { alt: e.target.value })}
                                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                                  placeholder="Describe the image for SEO/accessibility"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                  Caption (optional)
                                </label>
                                <input
                                  value={b.caption || ""}
                                  onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                                  placeholder="Short caption under image"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {b.type === "callout" && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1 space-y-2">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                Callout tone
                              </label>
                              <select
                                value={b.tone || "pink"}
                                onChange={(e) => updateBlock(idx, { tone: e.target.value as any })}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none cursor-pointer"
                              >
                                <option value="neutral">Neutral</option>
                                <option value="pink">Pink</option>
                                <option value="green">Green</option>
                              </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                Callout HTML
                              </label>
                              <textarea
                                value={b.html || ""}
                                onChange={(e) => updateBlock(idx, { html: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none resize-y transition-all font-mono text-sm"
                                placeholder="<strong>Did you know?</strong> ..."
                              />
                            </div>
                          </div>
                        )}

                        {(b.type === "richText" || b.type === "imageLeft" || b.type === "imageRight") && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                              Section HTML
                            </label>
                            <textarea
                              value={b.html || ""}
                              onChange={(e) => updateBlock(idx, { html: e.target.value })}
                              rows={8}
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none resize-y transition-all font-mono text-sm"
                              placeholder="Use <h2>, <h3>, <p>, <ul>, <strong> etc."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2 pt-4">
                SEO (Google)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Meta Title</label>
                  <input
                    type="text"
                    name="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder={`${formData.title || "Blog post title"} | Leira`}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Meta Description</label>
                  <textarea
                    name="seo.metaDescription"
                    value={formData.seo.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none resize-y transition-all"
                    placeholder="Short SEO description (recommended ~155 characters)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Primary Keyword</label>
                  <input
                    type="text"
                    name="seo.primaryKeyword"
                    value={formData.seo.primaryKeyword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="e.g. private part smell remove"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Secondary Keywords</label>
                  <input
                    type="text"
                    name="seo.secondaryKeywords"
                    value={formData.seo.secondaryKeywords}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
                    placeholder="comma-separated keywords"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-neutral-100">
              <motion.button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-xl font-medium tracking-wide hover:bg-neutral-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
              <Link
                href="/admin/blogs"
                className="px-8 py-4 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
