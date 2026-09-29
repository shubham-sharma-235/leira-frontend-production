"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tag, Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { couponAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function AdminCouponsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
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
      if (user.role !== "admin") router.push("/admin/login");
      else fetchCoupons();
    } catch {
      router.push("/admin/login");
    }
  }, [router]);

  const fetchCoupons = async () => {
    try {
      const res = await couponAPI.getAll();
      if (res.success) setCoupons(res.data || []);
    } catch {
      error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await couponAPI.delete(deleteId);
      success("Coupon deleted.");
      fetchCoupons();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      error(err.message || "Error deleting");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggleLoginPromo = async (id: string, isSelected: boolean) => {
    try {
      await couponAPI.setLoginPromo(id, !isSelected);
      success(!isSelected ? "Login popup coupon selected." : "Login popup coupon removed.");
      fetchCoupons();
    } catch (err: any) {
      error(err.message || "Could not update login popup coupon");
    }
  };

  const filtered = coupons.filter((c) => c.code?.toLowerCase().includes(searchQuery.toLowerCase()));
  const formatD = (d: string | null) => (!d ? "—" : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans text-neutral-900">
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Coupon?" message="This action cannot be undone." isLoading={isDeleting} />
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2"> <ArrowLeft size={16} /> Back </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">Coupon <span className="italic text-pink-600">Codes</span></h1>
            <p className="text-neutral-500 text-sm mt-1">Create and manage discount coupons.</p>
          </div>
          <Link href="/admin/coupons/new" className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800"> <Plus size={18} /> Add Coupon </Link>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-8 flex items-center gap-4">
          <Search className="text-neutral-400 w-5 h-5" />
          <input type="text" placeholder="Search by code..." className="flex-1 bg-transparent border-none outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
            <Tag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No coupons yet</h3>
            <Link href="/admin/coupons/new" className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium mt-4"> <Plus size={18} /> Add Coupon </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Code</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Value</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Min order</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Uses</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Valid until</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Popup</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4 font-mono font-semibold text-neutral-900">{c.code}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{c.type === "percent" ? "%" : "₹"}</td>
                    <td className="px-6 py-4 text-sm">{c.type === "percent" ? c.value + "%" : "₹" + c.value}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{c.minOrder ? "₹" + c.minOrder : "—"}</td>
                    <td className="px-6 py-4 text-sm">{c.maxUses > 0 ? (c.usedCount ?? 0) + "/" + c.maxUses : (c.usedCount ?? 0) + " used"}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{formatD(c.validUntil)}</td>
                    <td className="px-6 py-4">
                      <span className={"px-2 py-1 rounded-full text-xs font-bold uppercase " + (c.isActive ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-500")}>{c.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleLoginPromo(c._id, !!c.isLoginPromo)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          c.isLoginPromo
                            ? "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        {c.isLoginPromo ? "Selected" : "Set Popup"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={"/admin/coupons/" + c._id + "/edit"} className="inline-flex p-2 text-neutral-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg" title="Edit"><Edit size={16} /></Link>
                      <button onClick={() => { setDeleteId(c._id); setIsDeleteModalOpen(true); }} className="inline-flex p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg ml-1" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
