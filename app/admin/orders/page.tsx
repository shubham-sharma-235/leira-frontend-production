"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, MessageSquare, Package, RefreshCw, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { orderAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

const STATUS_OPTIONS = ["created", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_OPTIONS = ["created", "pending", "paid", "failed", "refunded"] as const;

type AdminOrder = {
  _id: string;
  orderNumber?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  customer?: { name?: string; email?: string };
  user?: { name?: string; email?: string };
  items?: { quantity: number }[];
  eshipz?: {
    syncStatus?: "pending" | "synced" | "failed" | "skipped";
    attempts?: number;
    externalOrderId?: string;
    lastError?: string;
  };
  orderConfirmationSms?: {
    status?: "pending" | "sent" | "failed" | "skipped";
    lastError?: string;
  };
  orderConfirmationWhatsApp?: {
    status?: "pending" | "sent" | "failed" | "skipped";
    lastError?: string;
  };
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAdminOrders({
        page: 1,
        limit: 100,
        q: search.trim() || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      });
      if (res?.success) {
        setOrders(res.data || []);
      }
    } catch (e: any) {
      error(e.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

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
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => orders, [orders]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await orderAPI.updateAdminOrderStatus(id, nextStatus);
      if (res?.success) {
        success("Order status updated");
        await loadOrders();
      } else {
        throw new Error(res?.message || "Could not update order");
      }
    } catch (e: any) {
      error(e.message || "Could not update order");
    }
  };

  const retryOrderSms = async (id: string) => {
    try {
      const res = await orderAPI.retryAdminOrderSms(id);
      if (res?.success) {
        success(res?.message || "Order confirmation SMS sent");
      } else {
        error(res?.message || "Order SMS failed");
      }
      await loadOrders();
    } catch (e: any) {
      error(e.message || "Could not send order SMS");
    }
  };

  const retryOrderWhatsApp = async (id: string) => {
    try {
      const res = await orderAPI.retryAdminOrderWhatsApp(id);
      if (res?.success) {
        success(res?.message || "Order confirmation WhatsApp sent");
      } else {
        error(res?.message || "Order WhatsApp failed");
      }
      await loadOrders();
    } catch (e: any) {
      error(e.message || "Could not send order WhatsApp");
    }
  };

  const retryEshipz = async (id: string) => {
    try {
      const res = await orderAPI.retryAdminEshipzSync(id);
      if (res?.success) {
        success(res?.message || "Order synced to eShipz");
      } else {
        error(res?.message || "eShipz sync failed");
      }
      await loadOrders();
    } catch (e: any) {
      error(e.message || "Could not sync with eShipz");
    }
  };

  const canMarkPaid = (o: AdminOrder) =>
    o.paymentMethod === "online" &&
    o.paymentStatus !== "paid" &&
    o.paymentStatus !== "failed" &&
    o.paymentStatus !== "refunded" &&
    o.status !== "cancelled";

  const markAsPaid = async (o: AdminOrder) => {
    const label = o.orderNumber || o._id;
    const ok = window.confirm(
      `Mark order ${label} as PAID?\n\nOnly continue if you confirmed this payment in Razorpay (Captured / Success). If payment is not received, cancel instead.`
    );
    if (!ok) return;

    const paymentId = window.prompt(
      "Optional: Razorpay Payment ID (pay_…). Leave empty if you don't have it.",
      ""
    );
    if (paymentId === null) return;

    setMarkingPaidId(o._id);
    try {
      const res = await orderAPI.markAdminOrderPaid(o._id, paymentId || undefined);
      if (res?.success) {
        success(res?.message || "Order marked as paid");
        await loadOrders();
      } else {
        throw new Error(res?.message || "Could not mark order as paid");
      }
    } catch (e: any) {
      error(e.message || "Could not mark order as paid");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const deleteOrder = async (id: string, label: string) => {
    const ok = window.confirm(`Delete order ${label}? This action cannot be undone.`);
    if (!ok) return;
    try {
      const res = await orderAPI.deleteAdminOrder(id);
      if (res?.success) {
        success("Order deleted");
        await loadOrders();
      } else {
        throw new Error(res?.message || "Could not delete order");
      }
    } catch (e: any) {
      error(e.message || "Could not delete order");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans text-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2 transition-colors">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">
              Order <span className="italic text-pink-600">Management</span>
            </h1>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 flex items-center gap-2 border border-neutral-200 rounded-xl px-3">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order no, customer, coupon..."
              className="w-full py-2.5 bg-transparent outline-none text-sm"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-neutral-200 rounded-xl px-3 py-2.5 bg-white text-sm">
            <option value="">All Order Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="border border-neutral-200 rounded-xl px-3 py-2.5 bg-white text-sm">
            <option value="">All Payment Status</option>
            {PAYMENT_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <button onClick={loadOrders} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm hover:bg-neutral-800">Apply Filters</button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200">
            <Package className="mx-auto w-10 h-10 text-neutral-300 mb-3" />
            <p className="text-neutral-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((o) => (
              <motion.div key={o._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">Order</p>
                    <p className="font-semibold text-neutral-900">{o.orderNumber || o._id}</p>
                    <p className="text-sm text-neutral-500">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-sm text-neutral-700">
                    <p>{o.customer?.name || o.user?.name || "Customer"}</p>
                    <p className="text-neutral-500">{o.customer?.email || o.user?.email || ""}</p>
                    <p className="font-semibold text-neutral-900 mt-1">₹{Number(o.total || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700">{o.paymentMethod}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">{o.paymentStatus}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        o.eshipz?.syncStatus === "synced"
                          ? "bg-green-50 text-green-700"
                          : o.eshipz?.syncStatus === "failed"
                          ? "bg-red-50 text-red-700"
                          : o.eshipz?.syncStatus === "skipped"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                      title={o.eshipz?.lastError || ""}
                    >
                      eShipz: {o.eshipz?.syncStatus || "pending"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        o.orderConfirmationSms?.status === "sent"
                          ? "bg-green-50 text-green-700"
                          : o.orderConfirmationSms?.status === "failed"
                          ? "bg-red-50 text-red-700"
                          : o.orderConfirmationSms?.status === "skipped"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                      title={o.orderConfirmationSms?.lastError || ""}
                    >
                      SMS: {o.orderConfirmationSms?.status || "pending"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        o.orderConfirmationWhatsApp?.status === "sent"
                          ? "bg-green-50 text-green-700"
                          : o.orderConfirmationWhatsApp?.status === "failed"
                          ? "bg-red-50 text-red-700"
                          : o.orderConfirmationWhatsApp?.status === "skipped"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                      title={o.orderConfirmationWhatsApp?.lastError || ""}
                    >
                      WA: {o.orderConfirmationWhatsApp?.status || "pending"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {canMarkPaid(o) && (
                      <button
                        type="button"
                        onClick={() => markAsPaid(o)}
                        disabled={markingPaidId === o._id}
                        className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
                        title="After confirming payment in Razorpay dashboard"
                      >
                        {markingPaidId === o._id ? "Marking…" : "Mark as paid"}
                      </button>
                    )}
                    {(o.orderConfirmationSms?.status === "failed" ||
                      o.orderConfirmationSms?.status === "pending" ||
                      o.orderConfirmationSms?.status === "skipped") && (
                      <button
                        type="button"
                        onClick={() => retryOrderSms(o._id)}
                        className="inline-flex items-center gap-1.5 p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        title="Retry order confirmation SMS"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    {(o.orderConfirmationWhatsApp?.status === "failed" ||
                      o.orderConfirmationWhatsApp?.status === "pending" ||
                      o.orderConfirmationWhatsApp?.status === "skipped") && (
                      <button
                        type="button"
                        onClick={() => retryOrderWhatsApp(o._id)}
                        className="inline-flex items-center gap-1.5 p-2 rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                        title="Retry order confirmation WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                    {(o.eshipz?.syncStatus === "failed" || o.eshipz?.syncStatus === "pending" || o.eshipz?.syncStatus === "skipped") && (
                      <button
                        type="button"
                        onClick={() => retryEshipz(o._id)}
                        className="inline-flex items-center gap-1.5 p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        title="Retry eShipz sync"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="border border-neutral-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteOrder(o._id, o.orderNumber || o._id)}
                      className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

