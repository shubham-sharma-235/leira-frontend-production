'use client';
import * as React from 'react';
import { buildThankYouOrderUrl } from '@/lib/analytics/thankYouNavigation';
import { trackBeginCheckout } from '@/lib/analytics/ecommerce';
import { trackMetaEvent } from '@/lib/analytics/metaPixel';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, ShoppingCart as ShoppingCartIcon, Banknote, CreditCard, Tag, X } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface ShoppingCartProps {
    items: CartItem[];
    onQuantityChange: (id: string, newQuantity: number) => void;
    onRemoveItem: (id: string) => void;
    onCheckoutComplete?: () => Promise<void> | void;
}

interface AddressFields {
    address: string;
    state: string;
    city: string;
    pincode: string;
}

import { motion, AnimatePresence } from "framer-motion";
import { authAPI, couponAPI, paymentAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { IndianStateSelect } from "@/components/ui/indian-state-select";
import { usePincodeAutofill } from "@/lib/address/use-pincode-autofill";

declare global {
    interface Window {
        Razorpay?: any;
    }
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ items, onQuantityChange, onRemoveItem, onCheckoutComplete }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { success, error } = useToast();
    const [paymentMethod, setPaymentMethod] = React.useState<'cod' | 'online' | null>(null);
    const [checkoutStep, setCheckoutStep] = React.useState<1 | 2 | 3>(1);
    const [couponInput, setCouponInput] = React.useState('');
    const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; type: 'percent' | 'fixed'; value: number } | null>(null);
    const [couponError, setCouponError] = React.useState('');
    const [couponLoading, setCouponLoading] = React.useState(false);
    const [checkoutLoading, setCheckoutLoading] = React.useState(false);
    const [confirmedOrder, setConfirmedOrder] = React.useState<{ id?: string; orderNumber?: string } | null>(null);
    const [suggestedCouponCode, setSuggestedCouponCode] = React.useState("");
    const [reviewReward, setReviewReward] = React.useState<{ value: number; type: 'percent' | 'fixed'; autoApplied?: boolean } | null>(null);
    const [billingName, setBillingName] = React.useState("");
    const [shippingName, setShippingName] = React.useState("");
    const [billingAddress, setBillingAddress] = React.useState<AddressFields>({ address: "", state: "", city: "", pincode: "" });
    const [shippingAddress, setShippingAddress] = React.useState<AddressFields>({ address: "", state: "", city: "", pincode: "" });
    const [sameAsBilling, setSameAsBilling] = React.useState(false);
    const [addressLoading, setAddressLoading] = React.useState(false);
    const [addressSaving, setAddressSaving] = React.useState(false);
    const [addressSnapshot, setAddressSnapshot] = React.useState<{
        billing: AddressFields;
        shipping: AddressFields;
        billingName: string;
        shippingName: string;
    } | null>(null);

    const normalizeAddress = React.useCallback((value: any): AddressFields => ({
        address: String(value?.address || "").trim(),
        state: String(value?.state || "").trim(),
        city: String(value?.city || "").trim(),
        pincode: String(value?.pincode || "").trim(),
    }), []);

    const isAddressComplete = React.useCallback((value: AddressFields) => {
        return !!value.address && !!value.state && !!value.city && /^\d{6}$/.test(value.pincode);
    }, []);

    const addressesEqual = React.useCallback((a: AddressFields, b: AddressFields) => {
        return a.address === b.address && a.state === b.state && a.city === b.city && a.pincode === b.pincode;
    }, []);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = 0; // Free shipping

    const discountAmount = React.useMemo(() => {
        if (!appliedCoupon || subtotal <= 0) return 0;
        if (appliedCoupon.type === 'percent') {
            return Math.round((subtotal * appliedCoupon.value) / 100);
        }
        return Math.min(appliedCoupon.value, subtotal);
    }, [appliedCoupon, subtotal]);

    // Disabled: review reward auto-discount (restore useMemo to re-enable).
    // const reviewRewardDiscount = React.useMemo(() => {
    //     if (!reviewReward || subtotal <= 0) return 0;
    //     const base = Math.max(0, subtotal - discountAmount);
    //     if (reviewReward.type === 'percent') {
    //         return Math.round((base * Math.min(reviewReward.value, 100)) / 100);
    //     }
    //     return Math.min(reviewReward.value, base);
    // }, [reviewReward, subtotal, discountAmount]);
    const reviewRewardDiscount = 0;

    // Disabled: 5% extra on online / prepaid (restore useMemo to re-enable).
    // const onlinePaymentDiscount = React.useMemo(() => {
    //     if (paymentMethod !== 'online') return 0;
    //     const amountAfterDiscounts = Math.max(0, subtotal - discountAmount - reviewRewardDiscount);
    //     return Math.round((amountAfterDiscounts * 5) / 100);
    // }, [paymentMethod, subtotal, discountAmount, reviewRewardDiscount]);
    const onlinePaymentDiscount = 0;

    const total = Math.max(0, subtotal - discountAmount - reviewRewardDiscount - onlinePaymentDiscount + shippingCost);
    const effectiveShippingAddress = sameAsBilling ? billingAddress : shippingAddress;
    const effectiveShippingName = sameAsBilling ? billingName : shippingName;
    const addressReady =
        !!billingName.trim() &&
        !!effectiveShippingName.trim() &&
        isAddressComplete(billingAddress) &&
        isAddressComplete(effectiveShippingAddress);
    const addressChanged = React.useMemo(() => {
        if (!addressSnapshot) return true;
        return (
            !addressesEqual(billingAddress, addressSnapshot.billing) ||
            !addressesEqual(effectiveShippingAddress, addressSnapshot.shipping) ||
            billingName.trim() !== addressSnapshot.billingName ||
            effectiveShippingName.trim() !== addressSnapshot.shippingName
        );
    }, [addressSnapshot, billingAddress, effectiveShippingAddress, addressesEqual, billingName, effectiveShippingName]);

    const { lookupNow: lookupBillingPincode } = usePincodeAutofill(
        billingAddress.pincode,
        (state, city) => {
            setBillingAddress((prev) => ({
                ...prev,
                ...(state ? { state } : {}),
                ...(city ? { city } : {}),
            }));
        },
        { enabled: checkoutStep === 2 }
    );

    const { lookupNow: lookupShippingPincode } = usePincodeAutofill(
        shippingAddress.pincode,
        (state, city) => {
            setShippingAddress((prev) => ({
                ...prev,
                ...(state ? { state } : {}),
                ...(city ? { city } : {}),
            }));
        },
        { enabled: checkoutStep === 2 && !sameAsBilling }
    );

    React.useEffect(() => {
        const codeFromUrl = searchParams.get("coupon");
        if (codeFromUrl?.trim()) {
            setCouponInput(codeFromUrl.trim().toUpperCase());
        }
    }, [searchParams]);

    React.useEffect(() => {
        let mounted = true;
        const loadSuggestedCoupon = async () => {
            try {
                if (isLoggedInCustomer()) {
                    // Review reward coupons disabled — do not fetch / apply.
                    // const reward = await couponAPI.getMyReviewReward();
                    // if (!mounted) return;
                    // if (reward?.success && reward?.data) {
                    //     setReviewReward({
                    //         value: Number(reward.data.value || 5),
                    //         type: reward.data.type === 'fixed' ? 'fixed' : 'percent',
                    //         autoApplied: !!reward.data.autoApplied,
                    //     });
                    // } else {
                    //     setReviewReward(null);
                    // }
                    if (mounted) setReviewReward(null);
                } else if (mounted) {
                    setReviewReward(null);
                }
                const promo = await couponAPI.getLoginPromo();
                if (!mounted) return;
                setSuggestedCouponCode(promo?.success && promo?.data?.code ? promo.data.code : "");
            } catch {
                if (mounted) {
                    setSuggestedCouponCode("");
                    setReviewReward(null);
                }
            }
        };
        loadSuggestedCoupon();
        return () => {
            mounted = false;
        };
    }, []);

    React.useEffect(() => {
        let mounted = true;
        const loadAddresses = async () => {
            if (!isLoggedInCustomer()) return;
            setAddressLoading(true);
            try {
                const me = await authAPI.getMe();
                if (!mounted || !me?.success || !me?.data) return;
                const billing = normalizeAddress(me.data.billingAddress);
                const shipping = normalizeAddress(me.data.shippingAddress);
                const profileName = String(me.data.name || "").trim();
                setBillingAddress(billing);
                setShippingAddress(shipping);
                setBillingName(profileName);
                setShippingName(profileName);
                setSameAsBilling(addressesEqual(billing, shipping));
                setAddressSnapshot({ billing, shipping, billingName: profileName, shippingName: profileName });
            } catch {
                // non-blocking for cart rendering
            } finally {
                if (mounted) setAddressLoading(false);
            }
        };
        loadAddresses();
        return () => {
            mounted = false;
        };
    }, [normalizeAddress, addressesEqual]);

    const handleAddressUpdate = async () => {
        if (!isLoggedInCustomer()) {
            error("Please log in as customer to update address");
            router.push("/login");
            return;
        }
        if (!isAddressComplete(billingAddress)) {
            error("Please complete Billing Address (6-digit pincode required)");
            return;
        }
        if (!billingName.trim() || !effectiveShippingName.trim()) {
            error("Please enter name in Billing and Shipping Address");
            return;
        }
        if (!isAddressComplete(effectiveShippingAddress)) {
            error("Please complete Shipping Address (6-digit pincode required)");
            return;
        }

        setAddressSaving(true);
        try {
            const res = await authAPI.updateProfile({
                name: billingName.trim(),
                billingAddress,
                shippingAddress: effectiveShippingAddress,
            });
            if (!res?.success) throw new Error(res?.message || "Could not update address");

            const savedBilling = normalizeAddress(res?.data?.billingAddress || billingAddress);
            const savedShipping = normalizeAddress(res?.data?.shippingAddress || effectiveShippingAddress);
            const savedName = String(res?.data?.name || billingName).trim();
            setBillingAddress(savedBilling);
            setShippingAddress(savedShipping);
            setBillingName(savedName);
            setShippingName(sameAsBilling ? savedName : shippingName.trim() || savedName);
            setSameAsBilling(addressesEqual(savedBilling, savedShipping));
            setAddressSnapshot({
                billing: savedBilling,
                shipping: savedShipping,
                billingName: savedName,
                shippingName: sameAsBilling ? savedName : (shippingName.trim() || savedName),
            });
            success("Address updated");
        } catch (e: any) {
            error(e?.message || "Could not update address");
        } finally {
            setAddressSaving(false);
        }
    };

    const handleApplyCoupon = async () => {
        setCouponError('');
        const code = couponInput.trim();
        if (!code) {
            setCouponError('Enter a coupon code');
            return;
        }
        setCouponLoading(true);
        try {
            const res = await couponAPI.validate(code, subtotal);
            if (res.success && res.valid && res.data) {
                setAppliedCoupon({
                    code: res.data.code,
                    type: res.data.type,
                    value: res.data.value,
                });
                setCouponInput('');
            } else {
                setCouponError(res.message || 'Invalid or expired coupon');
            }
        } catch {
            setCouponError('Could not validate coupon. Try again.');
        } finally {
            setCouponLoading(false);
        }
    };

    const isLoggedInCustomer = () => {
        if (typeof window === "undefined") return false;
        const token = localStorage.getItem("token");
        if (!token) return false;
        try {
            const raw = localStorage.getItem("user");
            const user = raw ? JSON.parse(raw) : null;
            return !!user && user.role !== "admin";
        } catch {
            return false;
        }
    };

    const loadRazorpayScript = async () => {
        if (typeof window === "undefined") return false;
        if (window.Razorpay) return true;
        return await new Promise<boolean>((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (checkoutLoading) return;
        if (!isLoggedInCustomer()) {
            error("Please log in as customer to checkout");
            router.push("/login");
            return;
        }
        if (!addressReady) {
            error("Please complete Billing and Shipping Address before placing order");
            return;
        }
        if (addressChanged) {
            error("Please click Update Address before placing order");
            return;
        }
        if (!paymentMethod) {
            error("Please select a payment method (COD or online).");
            return;
        }

        const ecommerceItems = items.map((it) => ({
            item_id: String(it.id),
            item_name: String(it.name || "Product"),
            price: Number(it.price) || 0,
            quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
        }));
        trackBeginCheckout(ecommerceItems, total);
        trackMetaEvent("InitiateCheckout", {
            content_ids: ecommerceItems.map((i) => i.item_id),
            content_type: "product",
            currency: "INR",
            value: total,
            num_items: ecommerceItems.reduce((s, i) => s + i.quantity, 0),
        });

        setCheckoutLoading(true);
        let razorpayOpened = false;
        try {
            const couponCode = appliedCoupon?.code || "";
            if (paymentMethod === "cod") {
                const res = await paymentAPI.placeCodOrder(couponCode);
                if (!res?.success) throw new Error(res?.message || "Could not place COD order");
                success("Order placed successfully");
                if (onCheckoutComplete) await onCheckoutComplete();
                const ord = String(res?.data?.orderNumber || res?.data?._id || "");
                const oid = String(res?.data?._id || res?.data?.id || "");
                router.push(buildThankYouOrderUrl(ord, total, items, oid));
                return;
            }

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) throw new Error("Could not load Razorpay. Please check your network.");

            const orderRes = await paymentAPI.createOnlineOrder(couponCode);
            if (!orderRes?.success || !orderRes?.data) {
                throw new Error(orderRes?.message || "Could not initiate payment");
            }

            const data = orderRes.data;
            let razorpayPaymentSucceeded = false;
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Leira",
                description: "Order Payment",
                order_id: data.razorpayOrderId,
                prefill: {
                    name: data.customer?.name || "",
                    email: data.customer?.email || "",
                    contact: data.customer?.contact || "",
                },
                theme: { color: "#ec4899" },
                modal: {
                    ondismiss: () => {
                        if (razorpayPaymentSucceeded) {
                            setCheckoutLoading(false);
                            return;
                        }
                        void paymentAPI.abandonOnlineOrder(String(data.localOrderId)).catch(() => {});
                        error("Payment was not completed. Your order is not confirmed.");
                        setCheckoutLoading(false);
                    },
                },
                handler: async function (response: any) {
                    razorpayPaymentSucceeded = true;
                    try {
                        const verifyRes = await paymentAPI.verifyOnlinePayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            localOrderId: data.localOrderId,
                        });
                        if (!verifyRes?.success) {
                            throw new Error(verifyRes?.message || "Payment verification failed");
                        }
                        success("Payment successful. Order confirmed.");
                        if (onCheckoutComplete) await onCheckoutComplete();
                        const ord = String(verifyRes?.data?.orderNumber || verifyRes?.data?._id || "");
                        const oid = String(
                            verifyRes?.data?._id || verifyRes?.data?.id || data.localOrderId || ""
                        );
                        router.push(buildThankYouOrderUrl(ord, total, items, oid));
                    } catch (err: any) {
                        razorpayPaymentSucceeded = false;
                        error(err.message || "Payment succeeded but verification failed");
                    } finally {
                        setCheckoutLoading(false);
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (resp: any) => {
                void paymentAPI.abandonOnlineOrder(String(data.localOrderId)).catch(() => {});
                error(resp?.error?.description || "Payment failed");
                setCheckoutLoading(false);
            });
            razorpayOpened = true;
            rzp.open();
        } catch (err: any) {
            error(err.message || "Checkout failed");
        } finally {
            if (!razorpayOpened) setCheckoutLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Cart Items List */}
            <div className="grow space-y-6">
                {items.length > 0 && (
                    <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">Checkout</p>
                                <p className="mt-1 text-sm font-semibold text-neutral-900">
                                    Step {checkoutStep} of 3
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCheckoutStep(1)}
                                    className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                                        checkoutStep === 1 ? "border-pink-500 bg-pink-50 text-pink-700" : "border-neutral-200 bg-white text-neutral-600 hover:border-pink-200"
                                    }`}
                                >
                                    Cart
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCheckoutStep(2)}
                                    disabled={items.length === 0}
                                    className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-50 ${
                                        checkoutStep === 2 ? "border-pink-500 bg-pink-50 text-pink-700" : "border-neutral-200 bg-white text-neutral-600 hover:border-pink-200"
                                    }`}
                                >
                                    Address
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCheckoutStep(3)}
                                    disabled={!addressReady || addressChanged}
                                    className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-50 ${
                                        checkoutStep === 3 ? "border-pink-500 bg-pink-50 text-pink-700" : "border-neutral-200 bg-white text-neutral-600 hover:border-pink-200"
                                    }`}
                                >
                                    Payment
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                            <span className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50/60 px-4 py-2 text-pink-700">Free Shipping</span>
                            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-neutral-700">COD Available</span>
                            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-neutral-700">Secure Payments</span>
                        </div>
                    </div>
                )}

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 px-6 bg-white/50 rounded-3xl border border-neutral-100"
                    >
                        <ShoppingCartIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                        <h3 className="text-xl font-serif text-neutral-900 mb-2">Your Bag is Empty</h3>
                        <p className="text-neutral-500 mb-8">Discover our collection of exclusive fragrances.</p>
                        <Link href="/shop">
                        <Button className="bg-neutral-900 text-white rounded-none px-8 py-6 uppercase tracking-widest text-xs hover:bg-pink-600 transition-colors">
                            Continue Shopping
                        </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative flex items-center gap-6 bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-neutral-100/50"
                                >
                                    <div className="relative overflow-hidden rounded-xl w-24 h-24 shrink-0 bg-neutral-100">
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.4 }}
                                            src={item.imageUrl}
                                            alt={item.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="size-full object-cover object-center"
                                        />
                                    </div>

                                    <div className="flex-1 grid gap-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-lg text-neutral-900 tracking-tight">{item.name}</h3>
                                            <p className="font-semibold text-lg text-neutral-900 tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                        <p className="text-sm text-neutral-400 font-light">{formatCurrency(item.price)} each</p>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-3 bg-neutral-50 rounded-full px-2 py-1 border border-neutral-200">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30"
                                                    onClick={() =>
                                                      item.quantity <= 1
                                                        ? onRemoveItem(item.id)
                                                        : onQuantityChange(item.id, item.quantity - 1)
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-medium w-6 text-center tabular-nums text-neutral-900">{item.quantity}</span>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:bg-white hover:shadow-sm transition-all"
                                                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <button
                                                className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                                                onClick={() => onRemoveItem(item.id)}
                                                title="Remove Item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {items.length > 0 && checkoutStep === 2 && (
                    <div className="mt-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-900">Billing & Shipping Address</h3>
                            <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sameAsBilling}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSameAsBilling(checked);
                                        if (checked) {
                                            setShippingAddress(billingAddress);
                                            setShippingName(billingName);
                                        }
                                    }}
                                    className="accent-pink-600"
                                />
                                Same as Billing Address
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-neutral-100 p-4 bg-neutral-50/40 space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-700">Billing Address</p>
                                <Input
                                    placeholder="Full Name"
                                    value={billingName}
                                    onChange={(e) => setBillingName(e.target.value)}
                                    className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400"
                                />
                                <Input
                                    placeholder="Address"
                                    value={billingAddress.address}
                                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, address: e.target.value }))}
                                    className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400"
                                />
                                <Input
                                    placeholder="Pincode (6 digits)"
                                    value={billingAddress.pincode}
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                                    onBlur={() => void lookupBillingPincode()}
                                    className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="City"
                                        value={billingAddress.city}
                                        onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                                        className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400"
                                    />
                                    <IndianStateSelect
                                        value={billingAddress.state}
                                        onChange={(state) => setBillingAddress((prev) => ({ ...prev, state }))}
                                        className="h-11 w-full rounded-xl bg-white px-3 text-sm text-black outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-pink-500/30"
                                        aria-label="Billing state"
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-100 p-4 bg-neutral-50/40 space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-700">Shipping Address</p>
                                <Input
                                    placeholder="Full Name"
                                    value={sameAsBilling ? billingName : shippingName}
                                    disabled={sameAsBilling}
                                    onChange={(e) => setShippingName(e.target.value)}
                                    className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400 disabled:bg-neutral-100"
                                />
                                <Input
                                    placeholder="Address"
                                    value={sameAsBilling ? billingAddress.address : shippingAddress.address}
                                    disabled={sameAsBilling}
                                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, address: e.target.value }))}
                                    className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400 disabled:bg-neutral-100"
                                />
                                <Input
                                    placeholder="Pincode (6 digits)"
                                    value={sameAsBilling ? billingAddress.pincode : shippingAddress.pincode}
                                    disabled={sameAsBilling}
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                                    onBlur={() => void lookupShippingPincode()}
                                    className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400 disabled:bg-neutral-100"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="City"
                                        value={sameAsBilling ? billingAddress.city : shippingAddress.city}
                                        disabled={sameAsBilling}
                                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                                        className="h-11 rounded-xl bg-white text-black placeholder:text-gray-400 disabled:bg-neutral-100"
                                    />
                                    <IndianStateSelect
                                        value={sameAsBilling ? billingAddress.state : shippingAddress.state}
                                        disabled={sameAsBilling}
                                        onChange={(state) => setShippingAddress((prev) => ({ ...prev, state }))}
                                        className="h-11 w-full rounded-xl bg-white px-3 text-sm text-black outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-pink-500/30 disabled:bg-neutral-100"
                                        aria-label="Shipping state"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <Button
                                type="button"
                                onClick={handleAddressUpdate}
                                disabled={addressSaving || addressLoading || !addressReady}
                                className="h-11 rounded-xl bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60"
                            >
                                {addressSaving ? "Updating..." : "Update Address"}
                            </Button>
                            <div className="text-[10px] font-semibold uppercase tracking-wider">
                                {!addressReady && <p className="text-red-500">Complete both addresses before placing order</p>}
                                {addressReady && addressChanged && <p className="text-amber-600">Address changed - click Update Address</p>}
                                {addressReady && !addressChanged && <p className="text-green-600">Address verified</p>}
                            </div>
                        </div>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCheckoutStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)))}
                            disabled={checkoutStep === 1}
                            className="rounded-full"
                        >
                            Back
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (checkoutStep === 1) setCheckoutStep(2);
                                else if (checkoutStep === 2) setCheckoutStep(3);
                            }}
                            disabled={
                                checkoutStep === 3 ||
                                (checkoutStep === 2 && (!addressReady || addressChanged))
                            }
                            className="rounded-full bg-neutral-900 text-white hover:bg-pink-600"
                        >
                            {checkoutStep === 1 ? "Continue to Address" : "Continue to Payment"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Order Summary */}
            {items.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="w-full lg:w-[400px] shrink-0"
                >
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-neutral-100 border border-white sticky top-24">
                        <h3 className="text-xl font-serif italic text-neutral-900 mb-6">Order Summary</h3>

                        <div className="space-y-4 text-sm text-neutral-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-neutral-900 tabular-nums">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between items-center">
                                    <span className="text-green-600 flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" />
                                        Discount ({appliedCoupon.code})
                                    </span>
                                    <span className="font-medium text-green-600 tabular-nums">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            {reviewRewardDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-green-600 flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" />
                                        Review Reward
                                    </span>
                                    <span className="font-medium text-green-600 tabular-nums">-{formatCurrency(reviewRewardDiscount)}</span>
                                </div>
                            )}
                            {onlinePaymentDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-green-600 flex items-center gap-1.5">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Online Payment Discount (5%)
                                    </span>
                                    <span className="font-medium text-green-600 tabular-nums">-{formatCurrency(onlinePaymentDiscount)}</span>
                            </div>
                            )}

                            <Separator className="my-4 bg-neutral-100" />

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-lg text-neutral-900">Total</span>
                                <span className="font-bold text-xl text-neutral-900 tabular-nums">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {/* Coupon code */}
                        <div className="mt-8 space-y-3">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                Have a Promo Code?
                            </label>
                            {appliedCoupon ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-between gap-2 rounded-2xl border border-pink-100 bg-pink-50/30 px-5 py-4 shadow-sm"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest leading-none mb-1">Coupon Applied</span>
                                        <span className="text-sm font-serif italic text-gray-900">{appliedCoupon.code}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setAppliedCoupon(null); setCouponError(''); }}
                                        className="text-pink-400 hover:text-pink-600 p-2 rounded-full hover:bg-white transition-all shadow-sm"
                                        title="Remove coupon"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="relative group">
                                        <Input
                                            placeholder="Enter Code (e.g. WELCOME10)"
                                            value={couponInput}
                                            onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                                            onKeyDown={(e) => e.key === 'Enter' && !couponLoading && handleApplyCoupon()}
                                            className="rounded-2xl border-neutral-100 bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-500 text-sm h-14 pl-5 pr-28 focus:ring-pink-500/20 focus:border-pink-200 transition-all group-hover:bg-white group-hover:shadow-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-md hover:shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-neutral-400 font-medium uppercase tracking-tight px-1 italic">
                                        {suggestedCouponCode ? `Try ${suggestedCouponCode} for your login offer` : "Apply a valid coupon to get instant discount"}
                                    </p>
                                    {reviewRewardDiscount > 0 && (
                                        <p className="text-[9px] text-green-600 font-semibold uppercase tracking-tight px-1 italic">
                                            Review reward is auto-applied. You can still use another coupon.
                                        </p>
                                    )}
                                </div>
                            )}
                            {couponError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-1"
                                >
                                    {couponError}
                                </motion.p>
                            )}
                        </div>

                        {/* Payment method */}
                        {checkoutStep === 3 && (
                        <div className="mt-10 space-y-4">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <CreditCard className="h-3 w-3" />
                                Payment Method
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-300 group overflow-hidden ${paymentMethod === 'cod'
                                            ? 'border-pink-500 bg-pink-50/20 shadow-lg shadow-pink-100/50'
                                            : 'border-neutral-100 bg-white text-neutral-600 hover:border-pink-200'
                                        }`}
                                >
                                    {paymentMethod === 'cod' && (
                                        <motion.div
                                            layoutId="active-payment"
                                            className="absolute inset-0 bg-linear-to-r from-pink-500/5 to-rose-500/5 -z-10"
                                        />
                                    )}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'bg-neutral-50 text-neutral-400 group-hover:bg-pink-50 group-hover:text-pink-400'}`}>
                                        <Banknote className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${paymentMethod === 'cod' ? 'text-pink-600' : 'text-neutral-900'}`}>Cash on Delivery</span>
                                        <span className="text-[10px] font-serif italic text-neutral-400">Pay when your scent arrives</span>
                                    </div>
                                    {paymentMethod === 'cod' && (
                                        <div className="ml-auto">
                                            <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('online')}
                                    className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-300 group overflow-hidden ${paymentMethod === 'online'
                                            ? 'border-pink-500 bg-pink-50/20 shadow-lg shadow-pink-100/50'
                                            : 'border-neutral-100 bg-white text-neutral-600 hover:border-pink-200'
                                        }`}
                                >
                                    {paymentMethod === 'online' && (
                                        <motion.div
                                            layoutId="active-payment"
                                            className="absolute inset-0 bg-linear-to-r from-pink-500/5 to-rose-500/5 -z-10"
                                        />
                                    )}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'online' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'bg-neutral-50 text-neutral-400 group-hover:bg-pink-50 group-hover:text-pink-400'}`}>
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${paymentMethod === 'online' ? 'text-pink-600' : 'text-neutral-900'}`}>Secure Online</span>
                                        <span className="text-[10px] font-serif italic text-neutral-400">Instant UPI, Cards & Net Banking</span>
                                    </div>
                                    {paymentMethod === 'online' && (
                                        <div className="ml-auto">
                                            <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                        )}

                        <Button
                            onClick={handleCheckout}
                            disabled={
                                checkoutStep !== 3 ||
                                checkoutLoading ||
                                addressSaving ||
                                !addressReady ||
                                addressChanged ||
                                !paymentMethod
                            }
                            className="w-full mt-10 h-14 bg-neutral-900 text-white rounded-full py-6 uppercase tracking-[0.25em] text-[10px] font-bold hover:bg-pink-600 transition-all duration-500 shadow-xl shadow-neutral-900/10 hover:shadow-pink-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {checkoutLoading
                                ? "Processing..."
                                : !paymentMethod
                                  ? "Select payment method"
                                  : paymentMethod === 'online'
                                    ? 'Proceed to Pay Online'
                                    : 'Confirm Order via COD'}
                        </Button>

                        <p className="text-xs text-center text-neutral-400 mt-4 leading-relaxed">
                            Need help? <a href="/contact" className="underline hover:text-neutral-900">Contact Support</a>
                            {paymentMethod === 'online' && (
                                <>
                            <br />
                                    Secure Checkout powered by Razorpay
                                </>
                            )}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
