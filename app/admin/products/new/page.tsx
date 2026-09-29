"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productAPI, uploadAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { AdminProductImageSortGrid } from "@/components/admin/AdminProductImageSortGrid";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export default function NewProductPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    subName: "",
    detailTagline: "",
    price: "",
    originalPrice: "",
    description: "",
    folderPath: "",
    themeColor: "#ec4899",
    status: "active",
    stock: 0,
    images: [] as string[],
    homeCardImage: "",
    homeCardTagline: "",
    homeCardDescription: "",
    shopCardImage: "",
    shopCardTagline: "",
    shopCardDescription: "",
    showInComboSection: false,
    showInShopSection: true,
    showReviewsOnCard: false,
    shopSectionOrder: 0,
    comboSectionOrder: 0,
  });
  const [uploading, setUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const homeCardInputRef = useRef<HTMLInputElement>(null);
  const shopCardInputRef = useRef<HTMLInputElement>(null);
  const homeCardDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const shopCardDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const resolvePreviewImageUrl = (imageUrl: string) => resolveMediaUrl(imageUrl);

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
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const t = e.target;
    const raw =
      t instanceof HTMLInputElement && t.type === "checkbox"
        ? t.checked
        : t.type === "number"
          ? Number(t.value)
          : t.value;
    setFormData((prev) => {
      const next = {
        ...prev,
        [t.name]: raw,
      };
      if (t.name === "stock") {
        next.status = Number(raw) <= 0 ? "inactive" : "active";
      }
      return next;
    });
  };

  const wrapHomeCardDescription = (marker: "**" | "~~") => {
    const textarea = homeCardDescriptionRef.current;
    const current = formData.homeCardDescription || "";
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const fallbackText = marker === "~~" ? "₹2,999" : "₹2,399";
    const selected = current.slice(start, end) || fallbackText;
    const next = `${current.slice(0, start)}${marker}${selected}${marker}${current.slice(end)}`;

    setFormData((prev) => ({ ...prev, homeCardDescription: next }));
    requestAnimationFrame(() => {
      homeCardDescriptionRef.current?.focus();
      const cursor = start + marker.length + selected.length + marker.length;
      homeCardDescriptionRef.current?.setSelectionRange(cursor, cursor);
    });
  };

  const wrapShopCardDescription = (marker: "**" | "~~") => {
    const textarea = shopCardDescriptionRef.current;
    const current = formData.shopCardDescription || "";
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const fallbackText = marker === "~~" ? "₹2,999" : "₹2,399";
    const selected = current.slice(start, end) || fallbackText;
    const next = `${current.slice(0, start)}${marker}${selected}${marker}${current.slice(end)}`;

    setFormData((prev) => ({ ...prev, shopCardDescription: next }));
    requestAnimationFrame(() => {
      shopCardDescriptionRef.current?.focus();
      const cursor = start + marker.length + selected.length + marker.length;
      shopCardDescriptionRef.current?.setSelectionRange(cursor, cursor);
    });
  };

  const wrapProductDescription = () => {
    const textarea = descriptionRef.current;
    const current = formData.description || "";
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const marker = "**";
    const selected = current.slice(start, end) || "important words";
    const next = `${current.slice(0, start)}${marker}${selected}${marker}${current.slice(end)}`;

    setFormData((prev) => ({ ...prev, description: next }));
    requestAnimationFrame(() => {
      descriptionRef.current?.focus();
      const cursor = start + marker.length + selected.length + marker.length;
      descriptionRef.current?.setSelectionRange(cursor, cursor);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const to = index + direction;
      if (to < 0 || to >= prev.images.length) return prev;
      const next = [...prev.images];
      [next[index], next[to]] = [next[to], next[index]];
      return { ...prev, images: next };
    });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const productKey = String(formData.id || formData.name || "").trim();
    if (!productKey) {
      error("Please enter Product ID or Product Name before uploading images.");
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const response = await uploadAPI.uploadImages(fileArray, productKey);

      if (response.success) {
        const uploadedUrls = response.data
          .map((item: any) => item?.url || item?.path || "")
          .filter(Boolean);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        success(`${uploadedUrls.length} image(s) added to product detail gallery.`);
      }
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      error(err.message || "Error uploading images");
    } finally {
      setUploading(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: "home" | "shop") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const productKey = String(formData.id || formData.name || "").trim();
    if (!productKey) {
      error("Please enter Product ID or Product Name before uploading images.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const response = await uploadAPI.uploadImages([files[0]], productKey);
      if (response.success) {
        const url = response.data.map((item: any) => item?.url || item?.path || "").filter(Boolean)[0];
        if (url) {
          setFormData((prev) =>
            slot === "home" ? { ...prev, homeCardImage: url } : { ...prev, shopCardImage: url }
          );
          success(slot === "home" ? "Homepage card image set." : "Shop page card image set.");
        }
      }
    } catch (err: any) {
      error(err.message || "Error uploading image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fallbackFolderPath = `/uploads/products/${String(formData.id || "product")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
      await productAPI.create({
        ...formData,
        folderPath: formData.folderPath?.trim() || fallbackFolderPath,
      });
      success("Product created successfully! It's now live.");
      // Trigger immediate product refresh in shop/home (same tab + cross-tab)
      window.dispatchEvent(new Event("productUpdated"));
      localStorage.setItem(`productUpdated:${Date.now()}`, String(Date.now()));
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (err: any) {
      error(err.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-neutral-900 selection:bg-pink-100 p-6 lg:p-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Products</span>
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-serif font-medium text-neutral-900 mb-2">Create New Product</h1>
          <p className="text-neutral-500">Add a new item to your luxury collection.</p>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl shadow-neutral-100/50 border border-neutral-100 p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* General Info Section */}
            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Product ID <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                    placeholder="e.g. jasmine-oil"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Product Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                    placeholder="e.g. Jasmine Absolute"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Sub Caption</label>
                  <input
                    type="text"
                    name="subName"
                    value={formData.subName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                    placeholder="e.g. The Essence of Purity"
                  />
                  <p className="text-[11px] text-neutral-400">Shop cards par chhota description — cards / grid.</p>
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Product page tagline</label>
                  <textarea
                    name="detailTagline"
                    value={formData.detailTagline}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all resize-y min-h-[88px]"
                    placeholder="Italic line seedha title ke neeche (PDP hero) — offers, gift copy, etc."
                  />
                  <p className="text-[11px] text-neutral-400">Yahi line product detail page par title ke niche italic me dikhegi. Khali chhodoge toh purane products jaisa auto / SEO fallback.</p>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2 pt-4">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Price <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                    placeholder="₹2999"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Status</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 appearance-none focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">
                  Cut price (MRP) <span className="font-normal normal-case text-neutral-400">— optional, strike-through on website</span>
                </label>
                <input
                  type="text"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full max-w-md px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                  placeholder="e.g. 3999 (must be higher than Price)"
                />
                <p className="text-[11px] text-neutral-400">
                  Selling amount upar &quot;Price&quot; me. Yahan <strong>zyada</strong> amount = card par cut / strike price.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-pink-50/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest border-b border-pink-100/80 pb-2">
                Homepage visibility
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="showInComboSection"
                    checked={formData.showInComboSection}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span className="text-sm font-medium text-neutral-800">Show in Combo (homepage combo strip + /combo)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="showInShopSection"
                    checked={formData.showInShopSection}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span className="text-sm font-medium text-neutral-800">Show in Shop + “Loved by women everywhere”</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="showReviewsOnCard"
                    checked={formData.showReviewsOnCard}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span className="text-sm font-medium text-neutral-800">
                    Show star ratings on product cards (only when this product has reviews)
                  </span>
                </label>
              </div>
              <div className="space-y-2 max-w-xs">
                <label className="text-xs font-bold text-neutral-500 uppercase">Order in Combo strip</label>
                <input
                  type="number"
                  name="comboSectionOrder"
                  value={formData.comboSectionOrder}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
                />
                <p className="text-[11px] text-neutral-500">Only applies when “Show in Combo” is enabled. Lower numbers appear first.</p>
              </div>
              <div className="space-y-2 max-w-xs">
                <label className="text-xs font-bold text-neutral-500 uppercase">Order in Shop</label>
                <input
                  type="number"
                  name="shopSectionOrder"
                  value={formData.shopSectionOrder}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
                />
                <p className="text-[11px] text-neutral-500">Only applies when “Show in Shop…” is enabled. Lower numbers appear first.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest border-b border-amber-100/80 pb-2">
                Homepage card content
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Card tagline</label>
                <input
                  type="text"
                  name="homeCardTagline"
                  value={formData.homeCardTagline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                  placeholder="e.g. Romantic & Elegant"
                />
                <p className="text-[11px] text-neutral-500">Homepage product card me product name ke neeche italic line. Blank chhodoge toh dikhegi nahi.</p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Card description</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => wrapHomeCardDescription("~~")}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      Cut price
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapHomeCardDescription("**")}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      Bold price
                    </button>
                  </div>
                </div>
                <textarea
                  ref={homeCardDescriptionRef}
                  name="homeCardDescription"
                  value={formData.homeCardDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all resize-y min-h-[88px]"
                  placeholder="Homepage card par short description..."
                />
                <p className="text-[11px] text-neutral-500">
                  Price select karke Cut price/Bold price dabao. Example: Now 20% off. ~~₹2,999~~ **₹2,399**
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest border-b border-emerald-100/80 pb-2">
                Shop page card content
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Card tagline</label>
                <input
                  type="text"
                  name="shopCardTagline"
                  value={formData.shopCardTagline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all"
                  placeholder="e.g. Luxury intimate care"
                />
                <p className="text-[11px] text-neutral-500">Shop page card par product name ke neeche italic line. Blank chhodoge toh dikhegi nahi.</p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Card description</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => wrapShopCardDescription("~~")}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      Cut price
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapShopCardDescription("**")}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      Bold price
                    </button>
                  </div>
                </div>
                <textarea
                  ref={shopCardDescriptionRef}
                  name="shopCardDescription"
                  value={formData.shopCardDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all resize-y min-h-[104px]"
                  placeholder="Shop page card par short description..."
                />
                <p className="text-[11px] text-neutral-500">
                  Shop page cards ke paragraph ke liye. Blank chhodoge toh dikhega nahi. Example: Now 20% off. ~~₹2,999~~ **₹2,399**
                </p>
              </div>
            </div>

            {/* Assets Section */}
            <div>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2 pt-4">Assets & Branding</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Theme Accent</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="themeColor"
                      value={formData.themeColor}
                      onChange={handleChange}
                      className="w-12 h-12 border-none rounded-xl cursor-pointer bg-transparent"
                    />
                    <span className="text-sm font-mono text-neutral-500 uppercase">{formData.themeColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Description <span className="text-red-400">*</span></label>
                <button
                  type="button"
                  onClick={wrapProductDescription}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Bold selected
                </button>
              </div>
              <textarea
                ref={descriptionRef}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-0 outline-none transition-all resize-none"
                placeholder="Describe the product features, scent notes, and benefits..."
              />
              <p className="text-[11px] text-neutral-500">
                Word/sentence select karke Bold selected dabao. Example: This is **bold** and this stays normal.
              </p>
            </div>

            {/* Product images — homepage card, shop card, detail gallery */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  Homepage card image
                </h3>
                <p className="mt-2 text-xs text-neutral-500">
                  Homepage Discover grid + homepage combo strip — one editorial thumbnail (optional; falls back to shop card or gallery).
                </p>
                <div className="mt-4 flex flex-wrap items-start gap-4">
                  <div className="relative h-32 w-28 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {formData.homeCardImage ? (
                      <img
                        src={resolvePreviewImageUrl(formData.homeCardImage)}
                        alt="Homepage card"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-neutral-400 px-2 text-center">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={homeCardInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="home-card-upload"
                      disabled={uploading}
                      onChange={(ev) => handleCardImageUpload(ev, "home")}
                    />
                    <label
                      htmlFor="home-card-upload"
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 ${uploading ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <Upload size={16} />
                      Upload (single)
                    </label>
                    {formData.homeCardImage ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => setFormData((p) => ({ ...p, homeCardImage: "" }))}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  Shop page card image
                </h3>
                <p className="mt-2 text-xs text-neutral-500">
                  /shop and cart thumbnails — one cover image (optional; falls back to homepage card or gallery).
                </p>
                <div className="mt-4 flex flex-wrap items-start gap-4">
                  <div className="relative h-32 w-28 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {formData.shopCardImage ? (
                      <img
                        src={resolvePreviewImageUrl(formData.shopCardImage)}
                        alt="Shop card"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-neutral-400 px-2 text-center">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={shopCardInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="shop-card-upload"
                      disabled={uploading}
                      onChange={(ev) => handleCardImageUpload(ev, "shop")}
                    />
                    <label
                      htmlFor="shop-card-upload"
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 ${uploading ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <Upload size={16} />
                      Upload (single)
                    </label>
                    {formData.shopCardImage ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => setFormData((p) => ({ ...p, shopCardImage: "" }))}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100 pb-2">
                  Product detail gallery <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </h3>
                <p className="mt-2 text-xs text-neutral-500 mb-4">
                  Extra images for the product detail page carousel. Upload multiple; use ↑ ↓ to reorder. Save works even if empty — homepage / shop card images or folder assets can still show.
                </p>

              <div className="mb-4">
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                  id="gallery-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="gallery-upload"
                  className={`flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-neutral-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload size={20} className="text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-700">
                    {uploading ? 'Uploading...' : 'Add images to detail gallery'}
                  </span>
                </label>
                <p className="text-xs text-neutral-400 mt-2 text-center">JPEG, PNG, GIF, WebP — multiple files OK</p>
              </div>

              {/* Display Images */}
              {formData.images.length > 0 ? (
                <div className="space-y-3">
                  <AdminProductImageSortGrid
                    images={formData.images}
                    resolvePreviewImageUrl={resolvePreviewImageUrl}
                    onRemove={handleRemoveImage}
                    onMove={handleMoveImage}
                  />
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-xl">
                  <p className="text-sm text-neutral-500">No gallery images yet — optional. You can still save the product.</p>
                </div>
              )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-neutral-100">
              <motion.button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-xl font-medium tracking-wide hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:shadow-neutral-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={18} />
                {loading ? 'Creating Product...' : 'Create Product'}
              </motion.button>

              <Link
                href="/admin/products"
                className="px-8 py-4 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

