"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Plus, Edit, Trash2, Search, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
import { productAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { pickShopCardPath } from "@/lib/product-card-images";

export default function ProductsPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [reorderMode, setReorderMode] = useState<"shop" | "combo">("shop");
    const [reorderSavingId, setReorderSavingId] = useState<string | null>(null);
    const resolveImageUrl = (raw: string | undefined | null) => resolveMediaUrl(raw || "");

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) {
            router.push('/admin/login');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'admin') {
                router.push('/admin/login');
                return;
            }
        } catch {
            router.push('/admin/login');
            return;
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productAPI.getAll();
            if (response.success) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
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
            await productAPI.delete(deleteId);
            success("Product deleted successfully.");
            // Trigger immediate product refresh in shop/home (same tab + cross-tab)
            window.dispatchEvent(new Event("productUpdated"));
            localStorage.setItem(`productUpdated:${Date.now()}`, String(Date.now()));
            fetchProducts();
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            error(err.message || 'Error deleting product');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const safeOrder = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };

    const visibleInMode = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const matches = (p: any) => !q || String(p?.name || "").toLowerCase().includes(q);
        const isShopVisible = (p: any) => {
            if (typeof p?.showInShopSection === "boolean") return p.showInShopSection;
            return !Boolean(p?.showInComboSection);
        };
        if (reorderMode === "combo") {
            return [...products]
                .filter((p) => Boolean(p?.showInComboSection))
                .filter(matches)
                .sort((a, b) => {
                    const byOrder = safeOrder(a?.comboSectionOrder) - safeOrder(b?.comboSectionOrder);
                    if (byOrder !== 0) return byOrder;
                    return String(a?.name || "").localeCompare(String(b?.name || ""));
                });
        }
        // shop mode
        return [...products]
            .filter(isShopVisible)
            .filter(matches)
            .sort((a, b) => {
                const byOrder = safeOrder(a?.shopSectionOrder) - safeOrder(b?.shopSectionOrder);
                if (byOrder !== 0) return byOrder;
                return String(a?.name || "").localeCompare(String(b?.name || ""));
            });
    }, [products, reorderMode, searchQuery]);

    const swapOrder = async (index: number, direction: -1 | 1) => {
        const curr = visibleInMode[index];
        const other = visibleInMode[index + direction];
        if (!curr || !other) return;

        const orderKey = reorderMode === "combo" ? "comboSectionOrder" : "shopSectionOrder";
        const aId = String(curr?._id || "");
        const bId = String(other?._id || "");
        if (!aId || !bId) return;

        // If existing orders are the same (common when everything is default 0),
        // swapping 0<->0 won't move anything. Seed an order from current list position.
        const rawA = Number(curr?.[orderKey]);
        const rawB = Number(other?.[orderKey]);
        const aExisting = Number.isFinite(rawA) ? rawA : 0;
        const bExisting = Number.isFinite(rawB) ? rawB : 0;
        const ordersEqual = aExisting === bExisting;
        const aOrder = ordersEqual ? index : aExisting;
        const bOrder = ordersEqual ? index + direction : bExisting;

        // Optimistic UI: swap in local state first.
        setProducts((prev) =>
            prev.map((p) => {
                if (String(p?._id) === aId) return { ...p, [orderKey]: bOrder };
                if (String(p?._id) === bId) return { ...p, [orderKey]: aOrder };
                return p;
            })
        );

        setReorderSavingId(aId);
        try {
            await Promise.all([
                productAPI.update(aId, { [orderKey]: bOrder } as any),
                productAPI.update(bId, { [orderKey]: aOrder } as any),
            ]);
            success("Order updated");
            window.dispatchEvent(new Event("productUpdated"));
            localStorage.setItem(`productUpdated:${Date.now()}`, String(Date.now()));
        } catch (err: any) {
            error(err?.message || "Could not update order");
            // Revert by refetching (safe)
            fetchProducts();
        } finally {
            setReorderSavingId(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans text-neutral-900">
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product?"
                message="Are you sure you want to delete this product? This action cannot be undone."
                isLoading={isDeleting}
            />

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-pink-600 mb-2 transition-colors">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-serif font-medium text-neutral-900">
                            Product <span className="italic text-pink-600">Inventory</span>
                        </h1>
                        <p className="text-neutral-500 text-sm mt-1">Manage your catalog, prices, and stock.</p>
                    </div>

                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus size={18} />
                        Add New Product
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-8 flex items-center gap-4">
                    <Search className="text-neutral-400 w-5 h-5 ml-2" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="flex-1 bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => setReorderMode("shop")}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${reorderMode === "shop" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-50"}`}
                        >
                            Reorder Shop/Loved
                        </button>
                        <button
                            type="button"
                            onClick={() => setReorderMode("combo")}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${reorderMode === "combo" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-50"}`}
                        >
                            Reorder Combo
                        </button>
                    </div>
                    <p className="text-xs text-neutral-500">
                        Use ↑ / ↓ on a card to move it.
                    </p>
                </div>

                {/* Grid */}
                {visibleInMode.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
                        <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">No products found</h3>
                        <p className="text-neutral-500 text-sm">Try adjusting your search or add a new product.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {visibleInMode.map((product, idx) => {
                            const isOutOfStock = product.status === 'inactive' || Number(product.stock ?? 0) <= 0;
                            const thumbPath = pickShopCardPath(product);
                            const thumbSrc = thumbPath ? resolveImageUrl(thumbPath) : "";
                            return (
                            <motion.div
                                key={product._id}
                                variants={itemVariants}
                                className="group bg-white rounded-2xl p-4 shadow-sm border border-neutral-100/50 hover:shadow-xl hover:shadow-neutral-200/40 transition-all duration-300"
                            >
                                <div className="aspect-4/5 bg-neutral-50 rounded-xl mb-4 overflow-hidden relative">
                                    {thumbSrc ? (
                                        <div className="w-full h-full relative">
                                            <img
                                                src={thumbSrc}
                                                alt={product.name}
                                                width={800}
                                                height={1000}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                            <Package size={32} />
                                        </div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-2 group-hover:translate-x-0">
                                        <button
                                            type="button"
                                            onClick={() => swapOrder(idx, -1)}
                                            disabled={idx === 0 || reorderSavingId === String(product._id)}
                                            className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur text-neutral-700 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-white/90 disabled:hover:text-neutral-700"
                                            title="Move up"
                                        >
                                            <ArrowUp size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => swapOrder(idx, 1)}
                                            disabled={idx === visibleInMode.length - 1 || reorderSavingId === String(product._id)}
                                            className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur text-neutral-700 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors shadow-sm disabled:opacity-40 disabled:hover:bg-white/90 disabled:hover:text-neutral-700"
                                            title="Move down"
                                        >
                                            <ArrowDown size={14} />
                                        </button>
                                        <Link
                                            href={`/admin/products/${product._id}/edit`}
                                            className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur text-neutral-700 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors shadow-sm"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(product._id)}
                                            className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-serif font-medium text-neutral-900 truncate pr-2">{product.name}</h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-sm font-medium text-neutral-600">{product.price}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${isOutOfStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {isOutOfStock ? 'Out of stock' : 'In stock'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">Stock: {Number(product.stock ?? 0)}</p>
                                    <p className="text-[10px] text-neutral-400 mt-1">
                                        Order:{" "}
                                        {reorderMode === "combo"
                                            ? Number(product.comboSectionOrder ?? 0)
                                            : Number(product.shopSectionOrder ?? 0)}
                                    </p>
                                </div>
                            </motion.div>
                        );
                        })}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
