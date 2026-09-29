"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Heart, Camera, LogOut, ChevronRight, Phone, Mail, Edit3, Save, ArrowLeft, Lock, Home, Truck, CreditCard, Search, CheckCircle2, Clock, Map, Trash2, XCircle } from "lucide-react";
import { getOrderCancelEligibility } from "@/lib/order-cancel";
import { OrderCancelModal, type OrderCancelModalOrder } from "@/components/ui/order-cancel-modal";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI, cartAPI, orderAPI } from "@/lib/api";
import { useWishlist, wishlistBuildImageUrl } from "@/context/WishlistContext";
import { pickShopCardPath } from "@/lib/product-card-images";
import { getProductShopPath } from "@/lib/product-slugs";
import { IndianStateSelect } from "@/components/ui/indian-state-select";
import { usePincodeAutofill } from "@/lib/address/use-pincode-autofill";

export default function ProfilePage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <ProfileContent />
        </React.Suspense>
    );
}

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items: wishlistItems, loading: wishlistLoading, removeFromWishlist } = useWishlist();
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [trackingId, setTrackingId] = useState("");
    const [trackResult, setTrackResult] = useState<any>(null);
    const [trackLoading, setTrackLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [cancelModalOrder, setCancelModalOrder] = useState<OrderCancelModalOrder | null>(null);
    const emptyAddr = () => ({ address: "", state: "", city: "", pincode: "" });
    const [userData, setUserData] = useState<{
        name: string;
        email: string;
        phone: string;
        address: string;
        avatar: string;
        billingAddress: { address: string; state: string; city: string; pincode: string };
        shippingAddress: { address: string; state: string; city: string; pincode: string };
    }>({
        name: "",
        email: "",
        phone: "",
        address: "",
        avatar: "",
        billingAddress: emptyAddr(),
        shippingAddress: emptyAddr(),
    });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
    const getProductHref = (product: { id?: string; name?: string; _id?: string }) =>
        getProductShopPath(product);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await orderAPI.getMyOrders();
            if (res?.success) {
                setOrders(res.data || []);
            } else {
                setOrders([]);
            }
        } catch {
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const openCancelModal = (order: {
        _id: string;
        orderNumber?: string;
        status?: string;
        createdAt?: string;
        total?: number;
    }) => {
        const eligibility = getOrderCancelEligibility(order);
        if (!eligibility.canCancel) {
            setMessage({ type: "error", text: eligibility.reason || "This order cannot be cancelled." });
            return;
        }
        setCancelModalOrder({
            _id: order._id,
            orderNumber: order.orderNumber,
            total: order.total,
            createdAt: order.createdAt,
        });
    };

    const confirmCancelOrder = async () => {
        if (!cancelModalOrder) return;
        setCancellingOrderId(cancelModalOrder._id);
        setMessage(null);
        try {
            const res = await orderAPI.cancelMyOrder(cancelModalOrder._id);
            if (res?.success) {
                setMessage({ type: "success", text: res.message || "Order cancelled successfully." });
                setCancelModalOrder(null);
                await fetchOrders();
            } else {
                throw new Error(res?.message || "Could not cancel order");
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Could not cancel order" });
        } finally {
            setCancellingOrderId(null);
        }
    };

    const formatCancelTimeLeft = (deadline?: Date) => {
        if (!deadline) return "";
        const ms = deadline.getTime() - Date.now();
        if (ms <= 0) return "";
        const hours = Math.floor(ms / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        if (hours > 0) return `${hours}h ${minutes}m left to cancel`;
        return `${minutes}m left to cancel`;
    };

    useEffect(() => {
        const validTabs = new Set(["profile", "security", "addresses", "orders", "track-order", "wishlist"]);
        const tab = searchParams.get("tab");
        if (tab && validTabs.has(tab)) {
            setActiveTab(tab);
        } else {
            setActiveTab("profile");
        }
        const track = searchParams.get("track");
        if (track) setTrackingId(track);
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === "orders") {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const { lookupNow: lookupBillingPincode } = usePincodeAutofill(
        userData.billingAddress?.pincode ?? "",
        (state, city) => {
            setUserData((prev) => ({
                ...prev,
                billingAddress: {
                    ...(prev.billingAddress ?? emptyAddr()),
                    ...(state ? { state } : {}),
                    ...(city ? { city } : {}),
                },
            }));
        },
        { enabled: activeTab === "addresses" }
    );

    const { lookupNow: lookupShippingPincode } = usePincodeAutofill(
        userData.shippingAddress?.pincode ?? "",
        (state, city) => {
            setUserData((prev) => ({
                ...prev,
                shippingAddress: {
                    ...(prev.shippingAddress ?? emptyAddr()),
                    ...(state ? { state } : {}),
                    ...(city ? { city } : {}),
                },
            }));
        },
        { enabled: activeTab === "addresses" }
    );

    useEffect(() => {
        const tab = searchParams.get("tab");
        const track = searchParams.get("track");
        if (tab === "track-order" && track) {
            (async () => {
                setTrackLoading(true);
                try {
                    const res = await orderAPI.trackMyOrder(track);
                    if (res?.success && res?.data) {
                        const o = res.data;
                        const statusOrder = ["created", "confirmed", "processing", "shipped", "delivered"];
                        const currentIndex = Math.max(0, statusOrder.indexOf(o.status));
                        setTrackResult({
                            id: o.orderNumber || o._id,
                            status: o.status,
                            expectedDelivery: o.status === "delivered" ? "Delivered" : "In Progress",
                            steps: [
                                { title: "Order Placed", date: new Date(o.createdAt).toLocaleString(), completed: currentIndex >= 0 },
                                { title: "Confirmed", date: currentIndex >= 1 ? "Completed" : "Pending", completed: currentIndex >= 1 },
                                { title: "Processing", date: currentIndex >= 2 ? "Completed" : "Pending", completed: currentIndex >= 2 },
                                { title: "Shipped", date: currentIndex >= 3 ? "Completed" : "Pending", completed: currentIndex >= 3 },
                                { title: "Delivered", date: currentIndex >= 4 ? "Completed" : "Pending", completed: currentIndex >= 4 },
                            ]
                        });
                    }
                } finally {
                    setTrackLoading(false);
                }
            })();
        }
    }, [searchParams]);

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        authAPI.getMe()
            .then((res) => {
                if (res.success && res.data) {
                    const u = res.data;
                    const ba = u.billingAddress as { address?: string; state?: string; city?: string; pincode?: string } | undefined;
                    const sa = u.shippingAddress as { address?: string; state?: string; city?: string; pincode?: string } | undefined;
                    setUserData({
                        name: u.name || "",
                        email: u.email || "",
                        phone: (u.phone && String(u.phone).replace(/\D/g, "").slice(-10)) || "",
                        address: u.address || "",
                        avatar: u.avatar || "",
                        billingAddress: ba ? { address: ba.address || "", state: ba.state || "", city: ba.city || "", pincode: ba.pincode || "" } : emptyAddr(),
                        shippingAddress: sa ? { address: sa.address || "", state: sa.state || "", city: sa.city || "", pincode: sa.pincode || "" } : emptyAddr(),
                    });
                    fetchOrders();
                }
            })
            .catch(() => router.push("/login"))
            .finally(() => setLoading(false));
    }, [router]);

    const tabs = [
        { id: "profile", label: "My Profile", icon: User },
        { id: "security", label: "Security & Password", icon: Lock },
        { id: "addresses", label: "Billing & Shipping", icon: Home },
        { id: "orders", label: "My Orders", icon: Package },
        { id: "track-order", label: "Track Order", icon: Map },
        { id: "wishlist", label: "Wishlist", icon: Heart },
    ];

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingId.trim()) return;
        setTrackLoading(true);
        try {
            const res = await orderAPI.trackMyOrder(trackingId.trim());
            if (!res?.success || !res?.data) {
                throw new Error(res?.message || "Order not found");
            }
            const o = res.data;
            const statusOrder = ["created", "confirmed", "processing", "shipped", "delivered"];
            const currentIndex = Math.max(0, statusOrder.indexOf(o.status));
            setTrackResult({
                id: o.orderNumber || o._id,
                status: o.status,
                expectedDelivery: o.status === "delivered" ? "Delivered" : "In Progress",
                steps: [
                    { title: "Order Placed", date: new Date(o.createdAt).toLocaleString(), completed: currentIndex >= 0 },
                    { title: "Confirmed", date: currentIndex >= 1 ? "Completed" : "Pending", completed: currentIndex >= 1 },
                    { title: "Processing", date: currentIndex >= 2 ? "Completed" : "Pending", completed: currentIndex >= 2 },
                    { title: "Shipped", date: currentIndex >= 3 ? "Completed" : "Pending", completed: currentIndex >= 3 },
                    { title: "Delivered", date: currentIndex >= 4 ? "Completed" : "Pending", completed: currentIndex >= 4 },
                ]
            });
            setMessage(null);
        } catch (err: any) {
            setTrackResult(null);
            setMessage({ type: "error", text: err.message || "Order not found." });
        } finally {
            setTrackLoading(false);
        }
    };

    const handleSave = async () => {
        setMessage(null);
        setSaveLoading(true);
        try {
            const phoneOnly = userData.phone.replace(/\D/g, "").slice(0, 10);
            const res = await authAPI.updateProfile({
                name: userData.name.trim(),
                email: userData.email.trim(),
                phone: phoneOnly,
            });
            if (res.success && res.data) {
                const u = res.data;
                if (typeof window !== "undefined") {
                    const existing = localStorage.getItem("user");
                    let obj: Record<string, unknown> = {};
                    try {
                        if (existing) obj = JSON.parse(existing);
                    } catch { }
                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            ...obj,
                            _id: u._id,
                            name: u.name,
                            email: u.email,
                            phone: u.phone,
                            role: u.role,
                        })
                    );
                    window.dispatchEvent(new Event("userLoggedIn"));
                }
                const ba = u.billingAddress as { address?: string; state?: string; city?: string; pincode?: string } | undefined;
                const sa = u.shippingAddress as { address?: string; state?: string; city?: string; pincode?: string } | undefined;
                setUserData({
                    name: u.name || "",
                    email: u.email || "",
                    phone: (u.phone && String(u.phone).replace(/\D/g, "").slice(-10)) || "",
                    address: u.address || "",
                    avatar: u.avatar || "",
                    billingAddress: ba ? { address: ba.address || "", state: ba.state || "", city: ba.city || "", pincode: ba.pincode || "" } : emptyAddr(),
                    shippingAddress: sa ? { address: sa.address || "", state: sa.state || "", city: sa.city || "", pincode: sa.pincode || "" } : emptyAddr(),
                });
                setMessage({ type: "success", text: "Profile updated successfully." });
        setIsEditing(false);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update profile.";
            setMessage({ type: "error", text: msg });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleSaveBilling = async () => {
        setMessage(null);
        setSaveLoading(true);
        try {
            const res = await authAPI.updateProfile({ billingAddress: userData.billingAddress ?? emptyAddr() });
            if (res.success && res.data) {
                const u = res.data as { billingAddress?: { address?: string; state?: string; city?: string; pincode?: string }; shippingAddress?: { address?: string; state?: string; city?: string; pincode?: string } };
                const ba = u.billingAddress;
                setUserData((prev) => ({
                    ...prev,
                    billingAddress: ba ? { address: ba.address || "", state: ba.state || "", city: ba.city || "", pincode: ba.pincode || "" } : emptyAddr(),
                }));
                setMessage({ type: "success", text: "Billing address updated." });
            }
        } catch (err: unknown) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update billing address." });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleSaveShipping = async () => {
        setMessage(null);
        setSaveLoading(true);
        try {
            const res = await authAPI.updateProfile({ shippingAddress: userData.shippingAddress ?? emptyAddr() });
            if (res.success && res.data) {
                const u = res.data as { shippingAddress?: { address?: string; state?: string; city?: string; pincode?: string } };
                const sa = u.shippingAddress;
                setUserData((prev) => ({
                    ...prev,
                    shippingAddress: sa ? { address: sa.address || "", state: sa.state || "", city: sa.city || "", pincode: sa.pincode || "" } : emptyAddr(),
                }));
                setMessage({ type: "success", text: "Shipping address updated." });
            }
        } catch (err: unknown) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update shipping address." });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setMessage(null);
        const { currentPassword, newPassword, confirmPassword } = passwordForm;
        if (!currentPassword.trim()) {
            setMessage({ type: "error", text: "Enter your current password." });
            return;
        }
        if (!newPassword.trim()) {
            setMessage({ type: "error", text: "Enter a new password." });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "New password must be at least 6 characters." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New password and confirm password do not match." });
            return;
        }
        setPasswordLoading(true);
        try {
            const res = await authAPI.changePassword({ currentPassword, newPassword });
            if (res.success) {
                setMessage({ type: "success", text: "Password updated successfully." });
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setMessage({ type: "error", text: (res as { message?: string }).message || "Failed to update password." });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update password.";
            setMessage({ type: "error", text: msg });
        } finally {
            setPasswordLoading(false);
        }
    };

    const initial = userData.name ? userData.name.charAt(0).toUpperCase() : "U";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
            {/* Background glowing blobs */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pink-100/50 to-transparent -z-10" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-pink-300/20 blur-[100px] -z-10 mix-blend-multiply" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-rose-200/20 blur-[100px] -z-10 mix-blend-multiply" />

            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-gray-600 bg-white/60 backdrop-blur-md border border-white/50 rounded-full hover:bg-white inset hover:text-pink-600 hover:shadow-md transition-all group w-fit"
                >
                    <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
                    Back to Home
                </button>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full md:w-80 shrink-0"
                    >
                        {/* User Card */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden mb-6 group">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-pink-400 to-rose-400" />

                            <div className="relative mt-8 mb-4 inline-block">
                                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl mx-auto relative group">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center overflow-hidden">
                                        {userData.avatar ? (
                                            <Image src={userData.avatar} alt={userData.name} fill className="object-cover" />
                                        ) : (
                                            <span className="text-white text-3xl font-bold">{initial}</span>
                                        )}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-pink-600 shadow-lg border border-gray-100 hover:scale-110 transition-transform">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{userData.name}</h2>
                            <p className="text-sm text-gray-500 mb-6">{userData.email}</p>

                            <div className="flex justify-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                                <div className="text-center px-4">
                                    <div className="font-bold text-gray-900 text-lg">{orders.length}</div>
                                    <div className="text-xs">Orders</div>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="text-center px-4">
                                    <div className="font-bold text-gray-900 text-lg">{wishlistItems.length}</div>
                                    <div className="text-xs">Wishlisted</div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative group
                      ${isActive ? 'text-pink-700' : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/50'}`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-tab-indicator"
                                                className="absolute inset-0 bg-pink-100/50 rounded-2xl border border-pink-200/50"
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                        <tab.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-pink-500'}`} />
                                        <span className="relative z-10">{tab.label}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 ml-auto text-pink-500 relative z-10" />}
                                    </button>
                                );
                            })}

                            <div className="my-2 border-t border-gray-100 mx-2" />

                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    window.dispatchEvent(new Event('userLoggedOut'));
                                    router.push('/');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5 opacity-70" />
                                <span>Log out</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Main Content Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex-1"
                    >
                        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[600px]">

                            <AnimatePresence mode="wait">
                                {/* PROFILE TAB */}
                                {activeTab === "profile" && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Personal Information</h1>
                                                <p className="text-sm text-gray-500 mt-1">Manage your personal details and how we can reach you.</p>
                                            </div>
                                            <button
                                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                                disabled={saveLoading}
                                                className={`w-full sm:w-auto sm:min-w-[148px] px-5 py-2.5 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-70
                          ${isEditing
                                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-pink-200 hover:shadow-lg'
                                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600'
                                                    }`}
                                            >
                                                {saveLoading ? (
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : isEditing ? (
                                                    <><Save className="w-4 h-4" /> Save Details</>
                                                ) : (
                                                    <><Edit3 className="w-4 h-4" /> Edit Profile</>
                                                )}
                                            </button>
                                        </div>

                                        {message && (
                                            <p className={`mb-4 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                                                {message.text}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Form Fields */}
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                        <User className="w-4 h-4 text-pink-500" /> Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        value={userData.name}
                                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                                        className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all disabled:opacity-70 disabled:bg-gray-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                        <Phone className="w-4 h-4 text-pink-500" /> Phone Number
                                                    </label>
                                                    <div className="flex rounded-xl border border-gray-200 bg-white/50 overflow-hidden focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500">
                                                        <span className="flex items-center px-4 py-3 text-gray-500 text-sm border-r border-gray-200 bg-gray-50/50">+91</span>
                                                    <input
                                                        type="tel"
                                                        disabled={!isEditing}
                                                        value={userData.phone}
                                                            onChange={(e) => setUserData({ ...userData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                                                            placeholder="10 digit number"
                                                            maxLength={10}
                                                            className="flex-1 min-w-0 px-4 py-3 text-gray-900 text-sm bg-transparent outline-none disabled:opacity-70 disabled:bg-gray-50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                        <Mail className="w-4 h-4 text-pink-500" /> Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        disabled={!isEditing}
                                                        value={userData.email}
                                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                                        className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all disabled:opacity-70 disabled:bg-gray-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* SECURITY TAB */}
                                {activeTab === "security" && (
                                    <motion.div
                                        key="security"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security & Password</h1>
                                                <p className="text-sm text-gray-500 mt-1">Keep your account secure by updating your password regularly.</p>
                                            </div>
                                        </div>

                                        <div className="max-w-md space-y-5">
                                            {message && activeTab === "security" && (
                                                <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                                                    {message.text}
                                                </div>
                                            )}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <Lock className="w-4 h-4 text-pink-500" /> Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                                                    placeholder="Enter your current password"
                                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                                                    autoComplete="current-password"
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <Lock className="w-4 h-4 text-pink-500" /> New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                                                    placeholder="Create a new strong password (min 6 characters)"
                                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                                                    autoComplete="new-password"
                                                />
                                            </div>

                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <Lock className="w-4 h-4 text-pink-500" /> Confirm New Password
                                                    </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                                    placeholder="Re-enter your new password"
                                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                                                    autoComplete="new-password"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleChangePassword}
                                                disabled={passwordLoading}
                                                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {passwordLoading ? (
                                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <><Lock className="w-4 h-4" /> Change Password</>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ADDRESSES TAB */}
                                {activeTab === "addresses" && (
                                    <motion.div
                                        key="addresses"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Saved Addresses</h1>
                                                <p className="text-sm text-gray-500 mt-1">Manage your billing and shipping addresses for faster checkout.</p>
                                            </div>
                                        </div>

                                        {message && activeTab === "addresses" && (
                                            <div className={`mb-6 rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                                                {message.text}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Billing Address Card */}
                                            <div className="bg-white border border-gray-100 p-8 shadow-sm">
                                                <div className="flex items-center gap-3 mb-10">
                                                    <div className="w-8 h-[1px] bg-gray-300"></div>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billing Address</h3>
                                                </div>

                                                <div className="space-y-8 mb-12">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Address <span className="text-rose-800">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={userData.billingAddress?.address ?? ""}
                                                            onChange={(e) => setUserData((prev) => ({ ...prev, billingAddress: { ...(prev.billingAddress ?? emptyAddr()), address: e.target.value } }))}
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            placeholder="Street address"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Pincode <span className="text-rose-800">*</span></label>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            autoComplete="postal-code"
                                                            value={userData.billingAddress?.pincode ?? ""}
                                                            onChange={(e) => setUserData((prev) => ({ ...prev, billingAddress: { ...(prev.billingAddress ?? emptyAddr()), pincode: e.target.value.replace(/\D/g, "").slice(0, 6) } }))}
                                                            onBlur={() => void lookupBillingPincode()}
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            placeholder="Pincode"
                                                        />
                                                        <p className="mt-1 text-[10px] text-slate-400">6 digits — city and state fill automatically when available.</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">City <span className="text-rose-800">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={userData.billingAddress?.city ?? ""}
                                                            onChange={(e) => setUserData((prev) => ({ ...prev, billingAddress: { ...(prev.billingAddress ?? emptyAddr()), city: e.target.value } }))}
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            placeholder="City"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">State <span className="text-rose-800">*</span></label>
                                                        <IndianStateSelect
                                                            value={userData.billingAddress?.state ?? ""}
                                                            onChange={(state) =>
                                                                setUserData((prev) => ({
                                                                    ...prev,
                                                                    billingAddress: { ...(prev.billingAddress ?? emptyAddr()), state },
                                                                }))
                                                            }
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            aria-label="Billing state"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleSaveBilling}
                                                    disabled={saveLoading}
                                                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-300 text-white text-[11px] font-bold uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-all rounded-full shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {saveLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                                    Update Billing
                                                </button>
                                            </div>

                                            {/* Shipping Address Card */}
                                            <div className="bg-white border border-gray-100 p-8 shadow-sm">
                                                <div className="flex items-center gap-3 mb-10">
                                                    <div className="w-8 h-[1px] bg-gray-300"></div>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shipping Address</h3>
                                                </div>

                                                <div className="space-y-8 mb-12">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Address <span className="text-rose-800">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={userData.shippingAddress?.address ?? ""}
                                                            onChange={(e) => setUserData((prev) => ({ ...prev, shippingAddress: { ...(prev.shippingAddress ?? emptyAddr()), address: e.target.value } }))}
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            placeholder="Street address"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Pincode <span className="text-rose-800">*</span></label>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            autoComplete="postal-code"
                                                            value={userData.shippingAddress?.pincode ?? ""}
                                                            onChange={(e) => setUserData((prev) => ({ ...prev, shippingAddress: { ...(prev.shippingAddress ?? emptyAddr()), pincode: e.target.value.replace(/\D/g, "").slice(0, 6) } }))}
                                                            onBlur={() => void lookupShippingPincode()}
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            placeholder="Pincode"
                                                        />
                                                        <p className="mt-1 text-[10px] text-slate-400">6 digits — city and state fill automatically when available.</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">City <span className="text-rose-800">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={userData.shippingAddress?.city ?? ""}
                                                            onChange={(e) => setUserData((prev) => ({ ...prev, shippingAddress: { ...(prev.shippingAddress ?? emptyAddr()), city: e.target.value } }))}
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            placeholder="City"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">State <span className="text-rose-800">*</span></label>
                                                        <IndianStateSelect
                                                            value={userData.shippingAddress?.state ?? ""}
                                                            onChange={(state) =>
                                                                setUserData((prev) => ({
                                                                    ...prev,
                                                                    shippingAddress: { ...(prev.shippingAddress ?? emptyAddr()), state },
                                                                }))
                                                            }
                                                            className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 bg-transparent"
                                                            aria-label="Shipping state"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleSaveShipping}
                                                    disabled={saveLoading}
                                                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-300 text-white text-[11px] font-bold uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-all rounded-full shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {saveLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Truck className="w-4 h-4" />}
                                                    Update Shipping
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ORDERS TAB */}
                                {activeTab === "orders" && (
                                    <motion.div
                                        key="orders"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-8">
                                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order History</h1>
                                            <p className="text-sm text-gray-500 mt-1">
                                                View and track your orders. You can cancel within 24 hours before dispatch.
                                            </p>
                                        </div>

                                        {message && activeTab === "orders" && (
                                            <motion.div
                                                className={`mb-6 rounded-xl px-4 py-3 text-sm ${
                                                    message.type === "success"
                                                        ? "bg-green-50 text-green-800 border border-green-200"
                                                        : "bg-red-50 text-red-800 border border-red-200"
                                                }`}
                                            >
                                                {message.text}
                                            </motion.div>
                                        )}

                                        <div className="space-y-6">
                                            {ordersLoading ? (
                                                <div className="py-14 text-center">
                                                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                                </div>
                                            ) : orders.length === 0 ? (
                                                <div className="bg-white border border-gray-100 p-10 shadow-sm text-center text-gray-500">
                                                    No orders yet.
                                                </div>
                                            ) : (
                                                orders.map((order) => {
                                                    const cancelInfo = getOrderCancelEligibility(order);
                                                    const isCancelled = order.status === "cancelled";
                                                    return (
                                                    <div key={order._id} className="bg-white border border-gray-100 p-8 shadow-sm">
                                                        <div className="flex items-center justify-between mb-10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-[1px] bg-gray-300"></div>
                                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Detail</h3>
                                                            </div>
                                                            <span
                                                                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border ${
                                                                    isCancelled
                                                                        ? "bg-red-50 text-red-700 border-red-100"
                                                                        : "bg-green-50 text-green-700 border-green-100"
                                                                }`}
                                                            >
                                                                {order.status}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Order ID <span className="text-rose-800">*</span></label>
                                                                <div className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg select-all">{order.orderNumber || order._id}</div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Date <span className="text-rose-800">*</span></label>
                                                                <div className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Total Amount <span className="text-rose-800">*</span></label>
                                                                <div className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg">{formatCurrency(order.total || 0)}</div>
                                                        </div>
                                                        <div>
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Items <span className="text-rose-800">*</span></label>
                                                                <div className="w-full pb-2 border-b border-gray-200 text-gray-800 font-serif italic text-lg">{order.items?.length || 0} <span className="text-sm text-gray-400 font-sans not-italic ml-1">Products</span></div>
                                                            </div>
                                                        </div>

                                                        {cancelInfo.canCancel && (
                                                            <p className="text-xs text-amber-700 mb-4">
                                                                {formatCancelTimeLeft(cancelInfo.cancelDeadline)}
                                                            </p>
                                                        )}
                                                        {!cancelInfo.canCancel && !isCancelled && order.status !== "delivered" && (
                                                            <p className="text-xs text-gray-500 mb-4">{cancelInfo.reason}</p>
                                                        )}

                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setTrackingId(order.orderNumber || order._id);
                                                                    setActiveTab("track-order");
                                                                }}
                                                                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-300 text-white text-[11px] font-bold uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-all rounded-full shadow-md w-full sm:w-auto justify-center"
                                                            >
                                                                View Order <Package className="w-4 h-4" />
                                                            </button>
                                                            {cancelInfo.canCancel && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openCancelModal(order)}
                                                                    disabled={cancellingOrderId === order._id}
                                                                    className="border border-red-200 bg-red-50 text-red-700 text-[11px] font-bold uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-all rounded-full hover:bg-red-100 disabled:opacity-60 w-full sm:w-auto justify-center"
                                                                >
                                                                    {cancellingOrderId === order._id ? (
                                                                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4" />
                                                                    )}
                                                                    Cancel order
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* TRACK ORDER TAB */}
                                {activeTab === "track-order" && (
                                    <motion.div
                                        key="track-order"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-8">
                                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Track Your Order</h1>
                                            <p className="text-sm text-gray-500 mt-1">Enter your order ID or tracking number to see current status.</p>
                                        </div>

                                        <div className="bg-white border border-gray-100 p-6 sm:p-8 shadow-sm mb-8">
                                            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 relative border-b border-gray-200">
                                                    <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                                                        <Search className="h-5 w-5 text-slate-300" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={trackingId}
                                                        onChange={(e) => setTrackingId(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-3 bg-transparent text-gray-800 font-serif italic text-lg focus:outline-none focus:border-rose-900 transition-all rounded-none"
                                                        placeholder="e.g. ORD-12345678"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={trackLoading || !trackingId.trim()}
                                                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg hover:shadow-pink-300 text-white text-[11px] font-bold uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-3 transition-all rounded-full shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {trackLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Truck className="w-4 h-4" />}
                                                    Track Package
                                                </button>
                                            </form>
                                        </div>

                                        {trackResult && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-gray-100 p-6 sm:p-8 shadow-sm"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-[1px] bg-gray-300"></div>
                                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking Info</h3>
                                                        </div>
                                                        <h2 className="text-2xl font-serif italic text-gray-900">{trackResult.id}</h2>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                                                        <p className="text-lg font-serif italic text-rose-800">{trackResult.expectedDelivery}</p>
                                                    </div>
                                                </div>

                                                <div className="relative pl-6 sm:pl-0 mt-4 sm:mt-12 mb-4">
                                                    {/* Horizontal line for desktop */}
                                                    <div className="hidden sm:block absolute top-[18px] left-[10%] right-[10%] h-[2px] bg-gray-100 z-0"></div>

                                                    {/* Vertical tracking layout */}
                                                    <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-10 sm:gap-0">
                                                        {trackResult.steps.map((step: any, index: number) => (
                                                            <div key={index} className="flex sm:flex-col items-start sm:items-center gap-6 sm:gap-4 text-left sm:text-center w-full sm:w-1/5 relative group">
                                                                {/* Vertical line for mobile */}
                                                                {index < trackResult.steps.length - 1 && (
                                                                    <div className="sm:hidden absolute top-10 left-[19px] bottom-[-40px] w-[2px] bg-gray-100 z-0"></div>
                                                                )}

                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 transition-colors duration-500 relative ${step.completed ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                                    {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                                </div>

                                                                <div className="mt-[-2px] sm:mt-0">
                                                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-1.5 transition-colors ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                                                                    <p className="text-xs text-gray-500 font-serif italic">{step.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {/* WISHLIST TAB */}
                                {activeTab === "wishlist" && (
                                    <motion.div
                                        key="wishlist"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Wishlist</h1>
                                                <p className="text-sm text-gray-500 mt-1">Products you've saved for later. Buy them before they go out of stock.</p>
                                            </div>
                                        </div>

                                        {message && activeTab === "wishlist" && (
                                            <div className={`mb-6 rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                                                {message.text}
                                            </div>
                                        )}

                                        {wishlistLoading ? (
                                            <div className="flex justify-center py-20">
                                                <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : wishlistItems.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-white border border-gray-100 p-12 rounded-3xl text-center shadow-sm"
                                            >
                                                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform duration-500">
                                                    <Heart className="w-10 h-10 text-pink-400" />
                                                </div>
                                                <h2 className="text-2xl font-serif italic text-gray-900 mb-3">Your wishlist is empty</h2>
                                                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-sans">You haven't added anything to your wishlist yet. Explore our luxury collection to find your favorite scents.</p>
                                                <Link href="/shop" className="inline-block px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-pink-200 transition-all active:scale-95">
                                                    Start Shopping
                                                </Link>
                                            </motion.div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {wishlistItems.map((product, i) => {
                                                    const thumbPath = pickShopCardPath(product);
                                                    const imgSrc = thumbPath ? wishlistBuildImageUrl(thumbPath) : "/images/placeholder.png";
                                                    return (
                                                        <motion.div
                                                            key={product._id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden flex flex-col h-full"
                                                        >
                                                            {/* Image and Overlay */}
                                                            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                                                                <Image
                                                                    src={imgSrc}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-500" />

                                                                {/* Remove Action */}
                                                                <button
                                                                    onClick={() => {
                                                                        removeFromWishlist(product._id);
                                                                        setMessage({ type: "success", text: "Product removed from wishlist" });
                                                                        setTimeout(() => setMessage(null), 3000);
                                                                    }}
                                                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-white transition-all shadow-md transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-500"
                                                                    title="Remove from wishlist"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="p-6 flex flex-col flex-1">
                                                                <div className="flex-1">
                                                                    <Link href={getProductHref(product)} className="block">
                                                                        <h3 className="font-serif italic text-lg text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">{product.name}</h3>
                                                                    </Link>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-3">Leira Exclusive</p>
                                                                    <div className="flex items-baseline gap-2 mb-6">
                                                                        <span className="text-xl font-medium text-gray-900">₹{product.price ?? "0"}</span>
                                                                        {/* Mock original price for aesthetic */}
                                                                        <span className="text-xs text-slate-300 line-through">₹{(Number(product.price || 0) * 1.2).toFixed(0)}</span>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            setSaveLoading(true);
                                                                            await cartAPI.add(product._id, 1);
                                                                            setMessage({ type: "success", text: "Luxury scent added to cart!" });
                                                                            window.dispatchEvent(new Event("cartUpdated"));
                                                                            setTimeout(() => setMessage(null), 3000);
                                                                        } catch (err: any) {
                                                                            setMessage({ type: "error", text: err.message || "Failed to add to cart" });
                                                                        } finally {
                                                                            setSaveLoading(false);
                                                                        }
                                                                    }}
                                                                    disabled={saveLoading}
                                                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-pink-300 transition-all active:scale-[0.98] disabled:opacity-70"
                                                                >
                                                                    {saveLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Package className="w-4 h-4" />}
                                                                    Add to Cart
                                        </button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                            </AnimatePresence>

                        </div >
                    </motion.div >

                </div>
            </div>

            <OrderCancelModal
                isOpen={Boolean(cancelModalOrder)}
                order={cancelModalOrder}
                timeLeftLabel={
                    cancelModalOrder
                        ? formatCancelTimeLeft(
                              getOrderCancelEligibility(cancelModalOrder).cancelDeadline
                          )
                        : undefined
                }
                isLoading={Boolean(cancelModalOrder && cancellingOrderId === cancelModalOrder._id)}
                onClose={() => {
                    if (!cancellingOrderId) setCancelModalOrder(null);
                }}
                onConfirm={confirmCancelOrder}
            />
        </div>
    );
}
