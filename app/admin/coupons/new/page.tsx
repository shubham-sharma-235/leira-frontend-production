"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { couponAPI } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

export default function NewCouponPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 10,
    minOrder: 0,
    maxUses: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
    isLoginPromo: false,
    showInDropdown: true,
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => ({ ...prev, [name]: value as "percent" | "fixed" }));
      return;
    }
    if (name === "value" || name === "minOrder" || name === "maxUses") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
      return;
    }
    if (name === "isActive") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    if (name === "isLoginPromo") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    if (name === "showInDropdown") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      error("Enter coupon code");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        code: formData.code.trim(),
        type: formData.type,
        value: formData.value,
        minOrder: formData.minOrder || undefined,
        maxUses: formData.maxUses || undefined,
        isActive: formData.isActive,
        isLoginPromo: formData.isLoginPromo,
        showInDropdown: formData.showInDropdown,
      };
      if (formData.validFrom) payload.validFrom = new Date(formData.validFrom).toISOString();
      if (formData.validUntil) payload.validUntil = new Date(formData.validUntil).toISOString();
      await couponAPI.create(payload);
      success("Coupon created successfully.");
      setTimeout(() => router.push("/admin/coupons"), 1000);
    } catch (err: any) {
      error(err.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-neutral-900 p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/coupons" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Coupons</span>
        </Link>
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-medium text-neutral-900 mb-2">Create Coupon</h1>
          <p className="text-neutral-500">Add a new discount code.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl shadow-neutral-100/50 border border-neutral-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Code *</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. WELCOME10" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-mono uppercase placeholder:normal-case focus:bg-white focus:border-neutral-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none cursor-pointer">
                  <option value="percent">Percentage off</option>
                  <option value="fixed">Fixed amount off (₹)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Value *</label>
                <input type="number" name="value" value={formData.value} onChange={handleChange} required min={0} max={formData.type === "percent" ? 100 : undefined} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none" />
                <p className="text-xs text-neutral-400">{formData.type === "percent" ? "Percentage (e.g. 10 for 10%)" : "Amount in ₹"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Min order (₹)</label>
                <input type="number" name="minOrder" value={formData.minOrder || ""} onChange={handleChange} min={0} placeholder="0 = no minimum" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Max uses</label>
                <input type="number" name="maxUses" value={formData.maxUses || ""} onChange={handleChange} min={0} placeholder="0 = unlimited" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Valid from</label>
                <input type="datetime-local" name="validFrom" value={formData.validFrom} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Valid until</label>
                <input type="datetime-local" name="validUntil" value={formData.validUntil} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded border-neutral-300 text-pink-600 focus:ring-pink-500" />
              <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">Active (customers can use this coupon)</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isLoginPromo" name="isLoginPromo" checked={formData.isLoginPromo} onChange={handleChange} className="rounded border-neutral-300 text-pink-600 focus:ring-pink-500" />
              <label htmlFor="isLoginPromo" className="text-sm font-medium text-neutral-700">Set as login popup coupon</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="showInDropdown" name="showInDropdown" checked={formData.showInDropdown} onChange={handleChange} className="rounded border-neutral-300 text-pink-600 focus:ring-pink-500" />
              <label htmlFor="showInDropdown" className="text-sm font-medium text-neutral-700">Show in website coupon dropdown (public list)</label>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50">
                <Save size={18} />
                {loading ? "Creating..." : "Create Coupon"}
              </button>
              <Link href="/admin/coupons" className="px-8 py-4 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
