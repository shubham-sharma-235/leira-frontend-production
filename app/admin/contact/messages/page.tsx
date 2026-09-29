"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Clock3, CircleDot } from "lucide-react";
import { contactAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export default function AdminContactMessagesPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
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
      else fetchMessages();
    } catch {
      router.push("/admin/login");
    }
  }, [router, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await contactAPI.getMessages(
        statusFilter ? (statusFilter as "new" | "in_progress" | "resolved") : undefined
      );
      if (res.success) setMessages(res.data || []);
    } catch (err: any) {
      error(err.message || "Failed to load contact messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: "new" | "in_progress" | "resolved") => {
    setUpdatingId(id);
    try {
      await contactAPI.updateMessageStatus(id, status);
      success("Message status updated.");
      fetchMessages();
    } catch (err: any) {
      error(err.message || "Failed to update");
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2">
              <ArrowLeft size={16} /> Back
            </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">
              Contact <span className="italic text-pink-600">Messages</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Manage customer inquiries from the contact page.</p>
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
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
            <Mail className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No contact messages</h3>
            <p className="text-neutral-500 text-sm">New messages will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[780px]">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Email</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Message</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {messages.map((m) => (
                    <tr key={m._id} className="hover:bg-neutral-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">{m.name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-700">{m.email || "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-[360px]">
                        <p className="line-clamp-2" title={m.message}>{m.message || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            m.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : m.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{formatDate(m.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === m._id ? (
                          <span className="text-xs text-neutral-400">Updating…</span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            {m.status !== "new" && (
                              <button
                                onClick={() => handleStatus(m._id, "new")}
                                className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                title="Mark as New"
                              >
                                <CircleDot size={16} />
                              </button>
                            )}
                            {m.status !== "in_progress" && (
                              <button
                                onClick={() => handleStatus(m._id, "in_progress")}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Mark In Progress"
                              >
                                <Clock3 size={16} />
                              </button>
                            )}
                            {m.status !== "resolved" && (
                              <button
                                onClick={() => handleStatus(m._id, "resolved")}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Mark Resolved"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
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
