"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Plus, Save, Trash2, Upload, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import { homeVideoAPI, uploadAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type AdminVideo = {
  _id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  posterUrl?: string;
  sortOrder: number;
  isActive: boolean;
};

import { resolveMediaUrl } from "@/lib/mediaUrl";

const toAbsoluteMediaUrl = (raw: string) => resolveMediaUrl(raw);

export default function AdminVideosPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    videoUrl: "",
    posterUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  const sortedVideos = useMemo(
    () => [...videos].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
    [videos]
  );

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

    fetchVideos();
  }, [router]);

  const fetchVideos = async () => {
    try {
      const res = await homeVideoAPI.getAdmin();
      if (res?.success) {
        setVideos(Array.isArray(res.data) ? res.data : []);
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      error(err.message || "Could not load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      subtitle: "",
      videoUrl: "",
      posterUrl: "",
      sortOrder: videos.length,
      isActive: true,
    });
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const res = await uploadAPI.uploadVideo(file);
      const url = res?.data?.url || "";
      if (!url) throw new Error("Upload failed: missing video URL");
      setFormData((prev) => ({ ...prev, videoUrl: url }));
      success("Video uploaded successfully");
    } catch (err: any) {
      error(err.message || "Could not upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePosterUpload = async (file: File) => {
    setUploadingPoster(true);
    try {
      const res = await uploadAPI.uploadImage(file, "home-video-poster");
      const url = res?.data?.url || "";
      if (!url) throw new Error("Upload failed: missing image URL");
      setFormData((prev) => ({ ...prev, posterUrl: url }));
      success("Poster uploaded successfully");
    } catch (err: any) {
      error(err.message || "Could not upload poster");
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      error("Title and video are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await homeVideoAPI.update(editingId, {
          ...formData,
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          videoUrl: formData.videoUrl.trim(),
          posterUrl: formData.posterUrl.trim(),
        });
        success("Video updated");
      } else {
        await homeVideoAPI.create({
          ...formData,
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          videoUrl: formData.videoUrl.trim(),
          posterUrl: formData.posterUrl.trim(),
        });
        success("Video created");
      }
      await fetchVideos();
      resetForm();
    } catch (err: any) {
      error(err.message || "Could not save video");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item: AdminVideo) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || "",
      subtitle: item.subtitle || "",
      videoUrl: item.videoUrl || "",
      posterUrl: item.posterUrl || "",
      sortOrder: Number(item.sortOrder || 0),
      isActive: !!item.isActive,
    });
  };

  const onDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await homeVideoAPI.delete(deleteId);
      success("Video deleted");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      await fetchVideos();
      if (editingId === deleteId) resetForm();
    } catch (err: any) {
      error(err.message || "Could not delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  const moveItem = async (id: string, dir: "up" | "down") => {
    const list = [...sortedVideos];
    const idx = list.findIndex((v) => v._id === id);
    if (idx < 0) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
    const orderedIds = list.map((v) => v._id);
    setVideos(list.map((v, i) => ({ ...v, sortOrder: i })));
    try {
      await homeVideoAPI.reorder(orderedIds);
    } catch (err: any) {
      error(err.message || "Could not reorder videos");
      fetchVideos();
    }
  };

  const toggleActive = async (item: AdminVideo) => {
    try {
      await homeVideoAPI.update(item._id, { isActive: !item.isActive });
      setVideos((prev) => prev.map((v) => (v._id === item._id ? { ...v, isActive: !v.isActive } : v)));
      success(item.isActive ? "Video hidden from homepage" : "Video enabled on homepage");
    } catch (err: any) {
      error(err.message || "Could not update status");
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
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans text-neutral-900">
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Video?"
        message="Are you sure you want to delete this home video?"
        isLoading={isDeleting}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-2 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-medium text-neutral-900">
              Home <span className="italic text-pink-600">Videos</span>
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Upload and manage premium homepage videos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-2 space-y-4"
          >
            <h2 className="text-lg font-semibold text-neutral-900">{editingId ? "Edit Video" : "Add Video"}</h2>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Title *</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-pink-500"
                placeholder="e.g. Leira Premium Ritual"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Subtitle</label>
              <input
                value={formData.subtitle}
                onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-pink-500"
                placeholder="Optional short description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Video *</label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleVideoUpload(f);
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
              {formData.videoUrl ? (
                <video
                  src={toAbsoluteMediaUrl(formData.videoUrl)}
                  className="mt-2 aspect-video w-full rounded-xl border border-neutral-100 bg-neutral-900 object-cover"
                  controls
                />
              ) : null}
              <p className="text-xs text-neutral-500">{uploadingVideo ? "Uploading video..." : "MP4/WebM/MOV up to 120MB"}</p>
              <p className="text-xs text-neutral-400">No upload limit enforced by app layer now (server/proxy limits may still apply).</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Poster (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePosterUpload(f);
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
              {formData.posterUrl ? (
                <img
                  src={toAbsoluteMediaUrl(formData.posterUrl)}
                  alt="Poster preview"
                  width={1280}
                  height={720}
                  className="mt-2 aspect-video w-full rounded-xl border border-neutral-100 object-cover"
                />
              ) : null}
              <p className="text-xs text-neutral-500">{uploadingPoster ? "Uploading poster..." : "Recommended 9:16 or 16:9 image"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Sort order</label>
                <input
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Math.max(0, Number(e.target.value || 0)) }))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-pink-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Status</label>
                <select
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.value === "active" }))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-pink-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || uploadingVideo || uploadingPoster}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {saving ? "Saving..." : editingId ? "Update Video" : "Create Video"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-3"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Uploaded Videos</h2>
              <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">
                {sortedVideos.length} total
              </span>
            </div>
            {!sortedVideos.length ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 py-14 text-center">
                <Film className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                <p className="text-sm text-neutral-500">No videos uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedVideos.map((item, index) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4 md:flex-row md:items-center"
                  >
                    <video
                      src={toAbsoluteMediaUrl(item.videoUrl)}
                      poster={item.posterUrl ? toAbsoluteMediaUrl(item.posterUrl) : undefined}
                      className="aspect-video w-full max-w-[240px] rounded-xl border border-neutral-100 bg-neutral-900 object-cover"
                      muted
                      controls
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                      {item.subtitle ? <p className="mt-1 text-xs text-neutral-500">{item.subtitle}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-neutral-500 border border-neutral-200">
                          Order: {item.sortOrder}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                            item.isActive
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-neutral-200 bg-white text-neutral-500"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveItem(item._id, "up")}
                        disabled={index === 0}
                        className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 hover:border-pink-300 hover:text-pink-600 disabled:opacity-40"
                        title="Move up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(item._id, "down")}
                        disabled={index === sortedVideos.length - 1}
                        className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 hover:border-pink-300 hover:text-pink-600 disabled:opacity-40"
                        title="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-600"
                      >
                        {item.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 hover:border-pink-300 hover:text-pink-600"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(item._id)}
                        className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

