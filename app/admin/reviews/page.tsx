"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Check, X, Star, Trash2 } from "lucide-react";
import { reviewAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      else fetchReviews();
    } catch {
      router.push("/admin/login");
    }
  }, [router, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : undefined;
      const res = await reviewAPI.getAll(params);
      if (res.success) setReviews(res.data || []);
    } catch {
      error("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (reviewId: string, status: "approved" | "rejected") => {
    setUpdatingId(reviewId);
    try {
      const res = await reviewAPI.updateStatus(reviewId, status);
      if (status === "approved" && res?.rewardCoupon?.code) {
        success(`Review approved. Reward coupon issued: ${res.rewardCoupon.code}`);
      } else {
        success(status === "approved" ? "Review approved." : "Review rejected.");
      }
      fetchReviews();
    } catch (err: any) {
      error(err.message || "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    const ok = window.confirm("Delete this review? This action cannot be undone.");
    if (!ok) return;
    setUpdatingId(reviewId);
    try {
      await reviewAPI.delete(reviewId);
      success("Review deleted.");
      fetchReviews();
    } catch (err: any) {
      error(err.message || "Failed to delete review");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string | null) =>
    !d ? "—" : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans text-neutral-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2">
              <ArrowLeft size={16} /> Back
            </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">
              Product <span className="italic text-pink-600">Reviews</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Approve or reject reviews to show them on the product page.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-8 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-neutral-600">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
            <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No reviews yet</h3>
            <p className="text-neutral-500 text-sm">Reviews will appear here when customers submit them.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[640px]">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Product</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Rating</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Comment</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-neutral-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                        {typeof r.product === "object" && r.product?.name ? r.product.name : r.product || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {typeof r.user === "object" ? (r.user?.name || r.user?.email || "—") : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`w-4 h-4 ${i <= (r.rating || 0) ? "fill-current" : ""}`} />
                          ))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-[200px] truncate" title={r.comment}>
                        {r.comment || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            r.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : r.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{formatDate(r.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === r._id ? (
                          <span className="text-xs text-neutral-400">Updating…</span>
                        ) : (
                          <span className="flex items-center justify-end gap-2">
                            {r.status !== "approved" && (
                              <button
                                onClick={() => handleStatus(r._id, "approved")}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {r.status !== "rejected" && (
                              <button
                                onClick={() => handleStatus(r._id, "rejected")}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
