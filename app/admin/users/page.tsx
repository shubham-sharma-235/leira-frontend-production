"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Edit, Trash2, Search, ArrowLeft, Mail, Phone, User as UserIcon, X } from "lucide-react";
import { userAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "", role: "user" as "user" | "admin", isActive: true });
  const [isSaving, setIsSaving] = useState(false);

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

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      if (res.success && res.data) setUsers(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('Admin not found') || msg.includes('session invalid') || msg.includes('Not authorized')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        router.push("/admin/login");
        return;
      }
      console.error("Error fetching users:", e);
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
      await userAPI.delete(deleteId);
      success("User deleted.");
      fetchUsers();
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      role: (user.role as "user" | "admin") || "user",
      isActive: user.isActive !== false,
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await userAPI.update(editingUser._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        phone: editForm.phone.replace(/\D/g, "").slice(0, 10),
        address: editForm.address.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
      });
      success("User updated.");
      setEditingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error updating user");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03 } }),
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
        title="Delete user?"
        message="This user will be removed. This action cannot be undone."
        isLoading={isDeleting}
      />

      {/* Edit modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-neutral-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900">Edit User</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="10 digits"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Shipping address"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as "user" | "admin" }))}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 text-pink-600 rounded border-neutral-300"
                  />
                  <span className="text-sm text-neutral-700">Active account</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2 transition-colors">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">
              Registered <span className="italic text-pink-600">Users</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              {users.length} user{users.length !== 1 ? "s" : ""} signed up. View and manage details.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-8 flex items-center gap-4">
          <Search className="text-neutral-400 w-5 h-5 ml-2" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="flex-1 bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
            <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No users found</h3>
            <p className="text-neutral-500 text-sm">Users who sign up will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80">
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <motion.tr
                      key={user._id}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                            <UserIcon size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{user.name}</p>
                            <p className="text-sm text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-neutral-600">{user.phone ? `+91 ${user.phone}` : "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-pink-100 text-pink-700" : "bg-neutral-100 text-neutral-600"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-2 text-neutral-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user._id)}
                            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
