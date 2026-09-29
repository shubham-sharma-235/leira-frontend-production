"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Handshake, CircleDot, Clock3, CheckCircle2 } from "lucide-react";
import { collaborationAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type LeadStatus = "new" | "in_progress" | "resolved";

export default function AdminCollaborationsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [leads, setLeads] = useState<any[]>([]);
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
      else fetchLeads();
    } catch {
      router.push("/admin/login");
    }
  }, [router, statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await collaborationAPI.getAll(statusFilter ? (statusFilter as LeadStatus) : undefined);
      if (res.success) setLeads(res.data || []);
    } catch (err: any) {
      error(err.message || "Failed to load collaboration requests");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: LeadStatus) => {
    setUpdatingId(id);
    try {
      await collaborationAPI.updateStatus(id, status);
      success("Collaboration status updated.");
      fetchLeads();
    } catch (err: any) {
      error(err.message || "Failed to update status");
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2">
              <ArrowLeft size={16} /> Back
            </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">
              Collaboration <span className="italic text-pink-600">Requests</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Manage influencer and brand partnership leads.</p>
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

        {leads.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
            <Handshake className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No collaboration requests</h3>
            <p className="text-neutral-500 text-sm">New requests will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1080px]">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Email</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Type</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Brand / Handle</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Message</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-neutral-50/50 align-top">
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">{lead.fullName || "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-700">{lead.email || "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-700">{lead.phone || "—"}</td>
                      <td className="px-6 py-4 text-sm capitalize text-neutral-700">{lead.collaborationType || "—"}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        <p>{lead.brandOrChannel || "—"}</p>
                        <p className="text-xs text-neutral-500">{lead.socialHandle || ""}</p>
                        <p className="text-xs text-neutral-500">{lead.followers || ""}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-[340px]">
                        <p className="line-clamp-3" title={lead.message}>{lead.message || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            lead.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : lead.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === lead._id ? (
                          <span className="text-xs text-neutral-400">Updating…</span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            {lead.status !== "new" && (
                              <button
                                onClick={() => handleStatus(lead._id, "new")}
                                className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                title="Mark as New"
                              >
                                <CircleDot size={16} />
                              </button>
                            )}
                            {lead.status !== "in_progress" && (
                              <button
                                onClick={() => handleStatus(lead._id, "in_progress")}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Mark In Progress"
                              >
                                <Clock3 size={16} />
                              </button>
                            )}
                            {lead.status !== "resolved" && (
                              <button
                                onClick={() => handleStatus(lead._id, "resolved")}
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

