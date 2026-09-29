"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Lock, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { authAPI, couponAPI, paymentAPI, productAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { buildThankYouOrderUrl } from "@/lib/analytics/thankYouNavigation";
import { trackBeginCheckout, trackViewCart } from "@/lib/analytics/ecommerce";
import { trackMetaEvent } from "@/lib/analytics/metaPixel";
import { isRecommendableProduct } from "@/lib/product-filters";
import { IndianStateSelect } from "@/components/ui/indian-state-select";
import { usePincodeAutofill } from "@/lib/address/use-pincode-autofill";

const ONLINE_PAYMENT_DISCOUNT_PERCENT = 5;

type ProductLite = {
  _id?: string;
  id: string;
  name: string;
  price?: string;
  buyNowSection?: { price?: string };
  // optional fields if present in DB/seed
  originalPrice?: string;
  mrp?: string;
  oldPrice?: string;
  folderPath?: string;
  images?: string[];
  homeCardImage?: string;
  shopCardImage?: string;
  stock?: number;
  status?: "active" | "inactive";
  showInComboSection?: boolean;
  showInShopSection?: boolean;
};

import { resolveMediaUrl } from "@/lib/mediaUrl";

function buildImageUrl(path: string | undefined | null): string {
  return resolveMediaUrl(path);
}

function pickProductImage(p: ProductLite): string {
  const img =
    (String(p.shopCardImage || "").trim() ||
      String(p.homeCardImage || "").trim() ||
      (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "") ||
      (p.folderPath ? `${p.folderPath}/1.jpg` : ""));
  return buildImageUrl(img);
}

function parsePriceToNumber(price: string | undefined): number {
  if (!price) return 0;
  const s = String(price).replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function isLoggedInCustomer(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    return u?.role !== "admin";
  } catch {
    return false;
  }
}

type CheckoutStep = "cart" | "login" | "address";

function buildAddressLines(a: { address: string; city: string; state: string; pincode: string }) {
  const line1 = String(a.address || "").trim();
  const city = String(a.city || "").trim();
  const state = String(a.state || "").trim();
  const pincode = String(a.pincode || "").trim();

  const pieces = [city, state, pincode].filter(Boolean);
  const line2 = pieces.join(", ");

  // Avoid duplication if line1 already contains city/state/pincode
  const hay = line1.toLowerCase();
  const shouldShowLine2 =
    !!line2 &&
    !pieces.some((p) => p && hay.includes(String(p).toLowerCase()));

  return { line1, line2: shouldShowLine2 ? line2 : "" };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Math.max(0, amount || 0));
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandomUnique<T>(arr: T[], count: number) {
  if (count <= 0) return [];
  if (arr.length <= count) return [...arr];
  const copy = [...arr];
  shuffleInPlace(copy);
  return copy.slice(0, count);
}

function computeRecommendations({
  allProducts,
  cartIds,
  excludeIds,
}: {
  allProducts: ProductLite[];
  cartIds: Set<string>;
  excludeIds: Set<string>;
}): ProductLite[] {
  const eligible = allProducts.filter((p) => {
    const mongo = p._id ? String(p._id) : "";
    const inCartOrExcluded =
      cartIds.has(String(p.id)) ||
      (mongo && cartIds.has(mongo)) ||
      excludeIds.has(String(p.id)) ||
      (mongo && excludeIds.has(mongo));
    return (
      isRecommendableProduct({
        id: p.id,
        name: p.name,
        status: p.status,
        showInShopSection: p.showInShopSection,
        showInComboSection: p.showInComboSection,
      }) && !inCartOrExcluded
    );
  });
  if (eligible.length === 0) return [];
  const sizes = [5, 6, 7, 8];
  const targetCount = Math.min(
    eligible.length,
    sizes[Math.floor(Math.random() * sizes.length)] || 6
  );
  return pickRandomUnique(eligible, targetCount);
}

export function CartCheckoutDrawer() {
  const { items, addToCart, updateQuantity, removeFromCart, refreshCart } = useCart();
  const { success, error } = useToast();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<CheckoutStep>("cart");
  const [recoLoading, setRecoLoading] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<ProductLite[]>([]);
  const [openNonce, setOpenNonce] = React.useState(0);
  const lastRecoIdsRef = React.useRef<Set<string>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);

  // OTP login
  const [otpLoginName, setOtpLoginName] = React.useState("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [requestId, setRequestId] = React.useState("");
  const [cooldown, setCooldown] = React.useState(0);

  // Address (billing + shipping same for now)
  const [addressLoading, setAddressLoading] = React.useState(false);
  const [addressSaving, setAddressSaving] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [addr, setAddr] = React.useState({ address: "", city: "", state: "", pincode: "" });
  const [addressSnapshot, setAddressSnapshot] = React.useState<{ fullName: string; addr: typeof addr } | null>(null);
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = React.useState<"online" | "cod" | null>(null);

  // Coupon
  const [couponInput, setCouponInput] = React.useState("");
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [couponError, setCouponError] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; type: "percent" | "fixed"; value: number } | null>(null);
  const [showCouponsModal, setShowCouponsModal] = React.useState(false);
  const [couponsTab, setCouponsTab] = React.useState<"active" | "payment">("active");
  const [availableCoupons, setAvailableCoupons] = React.useState<
    Array<{ code: string; type: "percent" | "fixed"; value: number; minOrder?: number; validUntil?: string | null }>
  >([]);
  const [couponsLoading, setCouponsLoading] = React.useState(false);

  const subtotal = React.useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );
  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon || subtotal <= 0) return 0;
    if (appliedCoupon.type === "percent") return Math.round((subtotal * Math.min(100, appliedCoupon.value)) / 100);
    return Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);
  const total = Math.max(0, subtotal - discountAmount);
  const onlinePaymentDiscountAmount = React.useMemo(
    () => Math.round((total * ONLINE_PAYMENT_DISCOUNT_PERCENT) / 100),
    [total]
  );
  const onlinePayableTotal = Math.max(0, total - onlinePaymentDiscountAmount);
  const displayedCheckoutTotal = paymentMethod === "online" ? onlinePayableTotal : total;
  const displayedSavings = discountAmount + (paymentMethod === "online" ? onlinePaymentDiscountAmount : 0);

  const cartIds = React.useMemo(() => new Set(items.map((i) => String(i.id))), [items]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) return;
      setRecoLoading(true);
      try {
        const res = await productAPI.getAll();
        const list: ProductLite[] = Array.isArray(res?.data) ? res.data : [];

        // Avoid repeating the exact same items across consecutive opens when possible.
        const firstPass = computeRecommendations({
          allProducts: list,
          cartIds,
          excludeIds: lastRecoIdsRef.current,
        });
        const recos =
          firstPass.length > 0
            ? firstPass
            : computeRecommendations({ allProducts: list, cartIds, excludeIds: new Set() });

        if (mounted) {
          setRecommendations(recos);
          lastRecoIdsRef.current = new Set(recos.map((p) => String(p._id || p.id)));
        }
      } catch {
        if (mounted) setRecommendations([]);
      } finally {
        if (mounted) setRecoLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [open, openNonce, cartIds]);

  React.useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setStep("cart");
      setPaymentMethod(null);
      setOtpLoginName("");
      // Force fresh randomized recommendations each time drawer opens.
      setOpenNonce((n) => n + 1);
    };
    window.addEventListener("leira:cart:open", onOpen);
    return () => window.removeEventListener("leira:cart:open", onOpen);
  }, []);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const addressFormActive =
    isEditingAddress ||
    !addr.address.trim() ||
    !addr.state.trim() ||
    !addr.city.trim() ||
    !/^\d{6}$/.test(String(addr.pincode || "").trim());

  const { lookupNow: lookupCheckoutPincode } = usePincodeAutofill(
    addr.pincode,
    (state, city) => {
      setAddr((p) => ({
        ...p,
        ...(state ? { state } : {}),
        ...(city ? { city } : {}),
      }));
    },
    { enabled: open && step === "address" && !addressLoading && addressFormActive }
  );

  React.useEffect(() => {
    if (!open || step !== "address" || addressLoading) return;
    const complete =
      !!addr.address.trim() &&
      !!addr.state.trim() &&
      !!addr.city.trim() &&
      /^\d{6}$/.test(String(addr.pincode || "").trim());
    if (!complete) setIsEditingAddress(true);
  }, [open, step, addressLoading, addr.address, addr.city, addr.state, addr.pincode]);

  const close = React.useCallback(() => {
    setOpen(false);
    setSubmitting(false);
    setPaymentMethod(null);
    setStep("cart");
    setOtpLoginName("");
    setOtpSent(false);
    setOtp("");
    setRequestId("");
    setCooldown(0);
    setCouponError("");
    setIsEditingAddress(false);
  }, []);

  const applyCoupon = async () => {
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate(code, subtotal);
      if (res?.success && res?.valid && res?.data) {
        setAppliedCoupon({ code: res.data.code, type: res.data.type, value: res.data.value });
        setCouponInput("");
        success("Coupon applied");
      } else {
        setAppliedCoupon(null);
        setCouponError(res?.message || "Invalid coupon");
      }
    } catch (e: any) {
      setAppliedCoupon(null);
      setCouponError(e?.message || "Could not validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const loadActiveCoupons = React.useCallback(async () => {
    if (couponsLoading) return;
    setCouponsLoading(true);
    try {
      const res = await couponAPI.getActive();
      const list = Array.isArray(res?.data) ? res.data : [];
      setAvailableCoupons(
        list
          .filter((c: any) => !!c?.code)
          .map((c: any) => ({
            code: String(c.code || "").trim().toUpperCase(),
            type: c.type === "percent" ? "percent" : "fixed",
            value: Number(c.value) || 0,
            minOrder: Number(c.minOrder) || 0,
            validUntil: c.validUntil ?? null,
          }))
      );
    } catch {
      setAvailableCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  }, [couponsLoading]);

  const openCouponsModal = async () => {
    setShowCouponsModal(true);
    setCouponsTab("active");
    if (availableCoupons.length === 0) {
      await loadActiveCoupons();
    }
  };

  const applyCouponFromList = (code: string) => {
    setCouponInput(code);
    setShowCouponsModal(false);
    // Apply with backend validation for production correctness
    setTimeout(() => {
      applyCoupon();
    }, 0);
  };

  const sendOtp = async () => {
    if (submitting) return;
    const phone = mobileNumber.replace(/\D/g, "").slice(0, 10);
    const name = otpLoginName.replace(/\s+/g, " ").trim();
    if (name.length < 2) {
      error("Please enter your full name");
      return;
    }
    if (phone.length !== 10) {
      error("Enter a valid 10-digit mobile number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.sendPhoneOtp(phone);
      if (!res?.success || !res?.data?.requestId) throw new Error(res?.message || "Could not send OTP");
      setOtpSent(true);
      setRequestId(res.data.requestId);
      setCooldown(30);
      success("OTP sent");
    } catch (e: any) {
      error(e?.message || "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (submitting) return;
    const code = otp.replace(/\D/g, "").slice(0, 6);
    if (!requestId || code.length < 4) {
      error("Enter OTP");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.verifyPhoneOtp({
        requestId,
        otp: code,
        name: otpLoginName.replace(/\s+/g, " ").trim(),
      });
      if (!res?.success || !res?.data?.token) throw new Error(res?.message || "OTP verification failed");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          role: res.data.role,
        })
      );
      // CartContext listens for this: merges `leira_guest_cart` into the account via POST /auth/cart, then refreshCart().
      // Do not call refreshCart() here — it races with that merge; a slow empty GET can finish last and wipe the cart UI.
      window.dispatchEvent(new Event("userLoggedIn"));

      setFullName(String(res.data.name || "").trim());
      setStep("address");
      success("Logged in");
    } catch (e: any) {
      error(e?.message || "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const isAddressComplete = (a: typeof addr) =>
    !!a.address.trim() && !!a.state.trim() && !!a.city.trim() && /^\d{6}$/.test(String(a.pincode || "").trim());

  const addressChanged = React.useMemo(() => {
    if (!addressSnapshot) return true;
    return (
      fullName.trim() !== addressSnapshot.fullName ||
      addr.address !== addressSnapshot.addr.address ||
      addr.city !== addressSnapshot.addr.city ||
      addr.state !== addressSnapshot.addr.state ||
      addr.pincode !== addressSnapshot.addr.pincode
    );
  }, [addressSnapshot, fullName, addr]);

  React.useEffect(() => {
    let mounted = true;
    const loadMe = async () => {
      if (!open) return;
      if (step !== "address") return;
      if (!isLoggedInCustomer()) return;
      setAddressLoading(true);
      try {
        const me = await authAPI.getMe();
        if (!mounted || !me?.success || !me?.data) return;
        const norm = (v: any) => ({
          address: String(v?.address || "").trim(),
          state: String(v?.state || "").trim(),
          city: String(v?.city || "").trim(),
          pincode: String(v?.pincode || "").trim(),
        });
        const billing = norm(me.data.billingAddress);
        const name = String(me.data.name || "").trim();
        setFullName(name);
        setAddr(billing);
        setAddressSnapshot({ fullName: name, addr: billing });
      } catch {
        // ignore
      } finally {
        if (mounted) setAddressLoading(false);
      }
    };
    loadMe();
    return () => {
      mounted = false;
    };
  }, [open, step]);

  const saveAddress = async () => {
    if (!isLoggedInCustomer()) {
      error("Please log in to continue");
      setStep("login");
      return;
    }
    if (!fullName.trim() || !isAddressComplete(addr)) {
      error("Please complete name + address (6-digit pincode)");
      return;
    }
    setAddressSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: fullName.trim(),
        billingAddress: addr,
        shippingAddress: addr,
      });
      if (!res?.success) throw new Error(res?.message || "Could not update address");
      const saved = {
        address: String(res?.data?.billingAddress?.address || addr.address).trim(),
        state: String(res?.data?.billingAddress?.state || addr.state).trim(),
        city: String(res?.data?.billingAddress?.city || addr.city).trim(),
        pincode: String(res?.data?.billingAddress?.pincode || addr.pincode).trim(),
      };
      const savedName = String(res?.data?.name || fullName).trim();
      setFullName(savedName);
      setAddr(saved);
      setAddressSnapshot({ fullName: savedName, addr: saved });
      success("Address saved");
    } catch (e: any) {
      error(e?.message || "Could not save address");
    } finally {
      setAddressSaving(false);
    }
  };

  const placeCod = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const couponCode = appliedCoupon?.code || "";
      const res = await paymentAPI.placeCodOrder(couponCode);
      if (!res?.success) throw new Error(res?.message || "Could not place COD order");
      success("Order placed successfully");
      await refreshCart();
      const ord = String(res?.data?.orderNumber || res?.data?._id || "");
      const oid = String(res?.data?._id || res?.data?.id || "");
      window.location.href = buildThankYouOrderUrl(ord, total, items, oid);
    } catch (e: any) {
      error(e?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const payOnline = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const scriptLoaded = await new Promise<boolean>((resolve) => {
        if (typeof window === "undefined") return resolve(false);
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      if (!scriptLoaded) throw new Error("Could not load Razorpay. Please check your network.");

      const couponCode = appliedCoupon?.code || "";
      const orderRes = await paymentAPI.createOnlineOrder(couponCode);
      if (!orderRes?.success || !orderRes?.data) throw new Error(orderRes?.message || "Could not initiate payment");
      const data = orderRes.data;
      let razorpayPaymentSucceeded = false;

      const options: any = {
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
        theme: { color: "#111827" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            if (razorpayPaymentSucceeded) return;
            void paymentAPI.abandonOnlineOrder(String(data.localOrderId)).catch(() => {});
            error("Payment was not completed. Your order is not confirmed.");
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
            if (!verifyRes?.success) throw new Error(verifyRes?.message || "Payment verification failed");
            success("Payment successful. Order confirmed.");
            await refreshCart();
            const ord = String(verifyRes?.data?.orderNumber || verifyRes?.data?._id || "");
            const oid = String(
              verifyRes?.data?._id || verifyRes?.data?.id || data.localOrderId || ""
            );
            const paidTotal = Number(verifyRes?.data?.total ?? data?.pricing?.total ?? onlinePayableTotal);
            window.location.href = buildThankYouOrderUrl(ord, paidTotal, items, oid);
          } catch (e: any) {
            error(e?.message || "Payment succeeded but verification failed");
            razorpayPaymentSucceeded = false;
          } finally {
            setSubmitting(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        void paymentAPI.abandonOnlineOrder(String(data.localOrderId)).catch(() => {});
        error(resp?.error?.description || "Payment failed");
        setSubmitting(false);
      });
      rzp.open();
    } catch (e: any) {
      error(e?.message || "Checkout failed");
      setSubmitting(false);
    }
  };

  const handlePopupContinue = async () => {
    if (step === "login") {
      if (otpSent) {
        await verifyOtp();
      } else {
        await sendOtp();
      }
      return;
    }
    if (step === "address" && !paymentMethod) {
      error("Please select a payment method (UPI / Cards or COD).");
      return;
    }
    // address step: ensure address saved, then pay
    if (!fullName.trim() || !isAddressComplete(addr)) {
      error("Please complete name + address (6-digit pincode)");
      setIsEditingAddress(true);
      return;
    }
    if (addressChanged) {
      await saveAddress();
    }
    if (paymentMethod === "cod") {
      await placeCod();
    } else {
      await payOnline();
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    const ecommerceItems = items.map((it) => ({
      item_id: String(it.id),
      item_name: String(it.name || "Product"),
      price: Number(it.price) || 0,
      quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
    }));
    trackViewCart(ecommerceItems, total);
    trackBeginCheckout(ecommerceItems, total);
    trackMetaEvent("InitiateCheckout", {
      content_ids: ecommerceItems.map((i) => i.item_id),
      content_type: "product",
      currency: "INR",
      value: total,
      num_items: ecommerceItems.reduce((s, i) => s + i.quantity, 0),
    });

    if (isLoggedInCustomer()) {
      setStep("address");
    } else {
      setStep("login");
    }
  };

  const closeCheckoutPopup = () => {
    setStep("cart");
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-80">
      <motion.button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close cart"
          />

          <motion.aside
            initial={{ x: 480, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0.6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute right-0 top-0 h-full w-full sm:w-[860px] bg-white border-l border-white/30 shadow-2xl ${
              step !== "cart" ? "hidden" : ""
            }`}
            role="dialog"
            aria-modal={step === "cart"}
            aria-hidden={step !== "cart"}
            aria-label="Cart and checkout"
          >
            <div className="h-full flex">
              {/* Left: Recommendations (desktop) */}
              <aside
                className={`${step === "cart" ? "hidden sm:flex" : "hidden"} w-[420px] bg-white border-r border-neutral-200`}
              >
                <div className="h-full w-full flex flex-col">
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-neutral-900">
                        YOU MAY ALSO LIKE
                      </p>
                      <span className="text-neutral-500" aria-hidden="true">
                        ↓
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {recoLoading ? (
                      <div className="rounded-xl border border-neutral-100 bg-white p-4">
                        <p className="text-xs text-neutral-600">Loading…</p>
                      </div>
                    ) : recommendations.length > 0 ? (
                      <div className="space-y-8">
                        {recommendations.map((p) => {
                          const pPrice = p?.price ?? p?.buyNowSection?.price ?? "";
                          const numeric = parsePriceToNumber(pPrice);
                          const compareRaw =
                            (p as any)?.originalPrice ?? (p as any)?.mrp ?? (p as any)?.oldPrice ?? "";
                          const compareNum = parsePriceToNumber(String(compareRaw || ""));
                          const showCompare = compareNum > numeric && numeric > 0;
                          return (
                            <div key={p.id} className="flex items-start gap-4">
                              <div className="h-20 w-20 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                                <img
                                  src={pickProductImage(p)}
                                  alt={p.name}
                                  width={80}
                                  height={80}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-neutral-900 leading-snug">
                                  {p.name}
                                </p>

                                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                                  {showCompare && (
                                    <p className="text-xs font-medium text-neutral-500 line-through tabular-nums decoration-neutral-400">
                                      {formatCurrency(compareNum)}
                                    </p>
                                  )}
                                  <p className="text-sm font-bold text-pink-600 tabular-nums">
                                    {formatCurrency(numeric)}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    addToCart(String(p._id || p.id), 1, {
                                      name: p.name,
                                      price: String(pPrice || ""),
                                      imageUrl: pickProductImage(p),
                                    })
                                  }
                                  className="mt-3 inline-flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-900 hover:text-neutral-700"
                                >
                                  <span className="border-b border-neutral-300 pb-1">ADD TO CART</span>
                                  <span className="border-b border-neutral-300 pb-1" aria-hidden="true">
                                    →
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">No recommendations right now.</p>
                    )}
                  </div>
                </div>
              </aside>

              {/* Right: Cart / Checkout */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="px-6 pt-6 pb-4 border-b border-neutral-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={close}
                        className="sm:hidden mt-0.5 h-9 w-9 inline-flex items-center justify-center rounded-full text-neutral-700 hover:bg-black/5"
                        aria-label="Back"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-900">CART</p>
                      {/* <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FF6A00]">
                        GET 5% ON PREPAID ORDERS
                      </p> */}
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                        Cash on delivery available
                      </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-full p-2 text-neutral-500 hover:bg-black/5"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {items.length === 0 ? (
                    <div className="rounded-3xl border border-neutral-100 bg-white p-8 text-center">
                      <ShoppingBag className="h-10 w-10 mx-auto text-neutral-300" />
                      <p className="mt-4 text-sm text-neutral-600">Your cart is empty.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {items.map((it) => (
                        <div key={it.id} className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                            <img
                              src={it.imageUrl}
                              alt={it.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-neutral-900 leading-snug">
                                {it.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeFromCart(it.id)}
                                className="text-neutral-400 hover:text-neutral-900"
                                aria-label="Remove"
                              >
                                ×
                              </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="inline-flex items-center border border-neutral-200 bg-white rounded-md overflow-hidden">
                                <button
                                  type="button"
                                  className="h-8 w-8 text-neutral-700 hover:bg-neutral-50"
                                  onClick={() =>
                                    it.quantity <= 1
                                      ? removeFromCart(it.id)
                                      : updateQuantity(it.id, it.quantity - 1)
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <div className="h-8 w-10 flex items-center justify-center text-sm font-semibold text-neutral-900 tabular-nums">
                                  {it.quantity}
                                </div>
                                <button
                                  type="button"
                                  className="h-8 w-8 text-neutral-700 hover:bg-neutral-50"
                                  onClick={() => updateQuantity(it.id, it.quantity + 1)}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-sm font-semibold text-neutral-900 tabular-nums">
                                {formatCurrency(it.price * it.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Recommendations (mobile) */}
                      {step === "cart" && (
                        <div className="sm:hidden pt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-900">
                              You may also like
                            </p>
                          </div>

                          <div className="mt-3">
                            {recoLoading ? (
                              <div className="rounded-xl border border-neutral-100 bg-white p-4">
                                <p className="text-xs text-neutral-600">Loading…</p>
                              </div>
                            ) : recommendations.length > 0 ? (
                              <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 overscroll-x-contain touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {recommendations.map((p) => {
                                  const pPrice = p?.price ?? p?.buyNowSection?.price ?? "";
                                  const numeric = parsePriceToNumber(pPrice);
                                  return (
                                    <div
                                      key={p.id}
                                      className="flex w-[min(46vw,190px)] min-w-[158px] snap-start shrink-0 flex-col rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
                                    >
                                      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-[#faf7f2]">
                                        <img
                                          src={pickProductImage(p)}
                                          alt={p.name}
                                          width={180}
                                          height={96}
                                          className="h-full w-full object-contain object-center"
                                          loading="lazy"
                                          decoding="async"
                                        />
                                      </div>
                                      <p className="mt-2 min-h-10 line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
                                        {p.name}
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-neutral-900 tabular-nums">
                                        {formatCurrency(numeric)}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          addToCart(String(p._id || p.id), 1, {
                                            name: p.name,
                                            price: String(pPrice || ""),
                                            imageUrl: pickProductImage(p),
                                          })
                                        }
                                        className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white hover:bg-neutral-800"
                                      >
                                        Add to cart
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-500">No recommendations right now.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="sticky z-20 border-t border-neutral-200 bg-white px-4 py-4 sm:static sm:px-6"
                  style={{
                    // iOS/Safari bottom browser UI can overlap fixed-bottom content when opened
                    // after an in-page interaction. Lift the CTA bar a bit above it.
                    bottom: "calc(env(safe-area-inset-bottom) + 3.25rem)",
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                  }}
                >
                  <p className="text-xs text-neutral-700">
                    Tax included. Shipping calculated at checkout.
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={items.length === 0}
                    className="ml-0 mr-auto mt-3 flex w-[calc(100%-3rem)] max-w-[18rem] justify-center whitespace-nowrap rounded-full bg-neutral-900 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 sm:mx-auto sm:w-full sm:max-w-[520px] sm:rounded-lg sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.25em]"
                  >
                    CHECKOUT — {formatCurrency(displayedCheckoutTotal)}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Center popup like GoKwik */}
          <AnimatePresence>
            {step !== "cart" && (
              <motion.div
                className="fixed inset-0 z-90 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  type="button"
                  className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
                  onClick={closeCheckoutPopup}
                  aria-label="Close checkout popup"
                />

                <motion.div
                  initial={{ y: 16, scale: 0.98, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 16, scale: 0.98, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 w-full max-w-[440px] h-[min(90vh,760px)] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Checkout"
                >
                  <div className="px-5 py-4 border-b border-neutral-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={closeCheckoutPopup}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-neutral-100"
                          aria-label="Back"
                        >
                          <ChevronLeft className="h-5 w-5 text-neutral-900" />
                        </button>
                        <p className="text-sm font-bold tracking-wide text-neutral-900">LEIRA</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <span className="font-medium">100% Secured Payment</span>
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="h-[calc(100%-72px)] flex flex-col">
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                      {/* Order summary */}
                      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-600">
                              🛒
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">Order Summary</p>
                              <p className="mt-0.5 text-xs text-neutral-500">
                                {items.reduce((s, it) => s + it.quantity, 0)} item{items.reduce((s, it) => s + it.quantity, 0) === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {displayedSavings > 0 && (
                              <p className="text-xs text-neutral-400 line-through tabular-nums">{formatCurrency(subtotal)}</p>
                            )}
                            <p className="text-base font-bold text-neutral-900 tabular-nums">{formatCurrency(displayedCheckoutTotal)}</p>
                          </div>
                        </div>
                        {displayedSavings > 0 && (
                          <div className="mt-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {formatCurrency(displayedSavings)} saved so far
                          </div>
                        )}
                      </div>

                      {/* Offers & Rewards (real backend apply/remove stays) */}
                      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                        <div className="px-4 pt-4 pb-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">Offers & Rewards</p>
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              placeholder="Enter coupon code"
                              className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                            />
                            {appliedCoupon ? (
                              <button
                                type="button"
                                onClick={removeCoupon}
                                className="h-11 shrink-0 rounded-xl border border-neutral-200 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-900 hover:bg-neutral-50"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={applyCoupon}
                                disabled={couponLoading}
                                className="h-11 shrink-0 rounded-xl bg-neutral-900 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-neutral-800 disabled:opacity-50"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                          {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
                          {appliedCoupon && (
                            <p className="mt-2 text-xs text-neutral-600">
                              Applied: <span className="font-semibold text-neutral-900">{appliedCoupon.code}</span>
                            </p>
                          )}
                        </div>
                        <div className="border-t border-neutral-100 px-4 py-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <span className="text-neutral-500">🏷️</span>
                            <span className="text-sm">Coupons available</span>
                          </div>
                          <button
                            type="button"
                            onClick={openCouponsModal}
                            className="text-sm font-semibold text-neutral-900 hover:text-neutral-700"
                          >
                            View All
                          </button>
                        </div>
                      </div>

                      {/* View all coupons modal (customer DB coupons) */}
                      <AnimatePresence>
                        {showCouponsModal && (
                          <motion.div
                            className="fixed inset-0 z-95 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <button
                              type="button"
                              className="absolute inset-0 bg-black/40"
                              onClick={() => setShowCouponsModal(false)}
                              aria-label="Close coupons"
                            />
                            <motion.div
                              initial={{ y: 16, scale: 0.98, opacity: 0 }}
                              animate={{ y: 0, scale: 1, opacity: 1 }}
                              exit={{ y: 16, scale: 0.98, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              className="relative w-full max-w-[720px] h-[min(88vh,760px)] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
                              role="dialog"
                              aria-modal="true"
                            >
                              <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg" aria-hidden="true">🎟️</span>
                                  <p className="text-sm font-semibold text-neutral-900">Coupons & Offers</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowCouponsModal(false)}
                                  className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
                                  aria-label="Close"
                                >
                                  <X className="h-4 w-4 text-neutral-700" />
                                </button>
                              </div>

                              <div className="p-5">
                                <input
                                  value={couponInput}
                                  onChange={(e) => setCouponInput(e.target.value)}
                                  placeholder="Enter coupon code"
                                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                                />
                                <div className="mt-4 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCouponsTab("active")}
                                    className={`h-9 rounded-full px-4 text-xs font-semibold ${
                                      couponsTab === "active" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"
                                    }`}
                                  >
                                    Active Coupons
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCouponsTab("payment")}
                                    className={`h-9 rounded-full px-4 text-xs font-semibold ${
                                      couponsTab === "payment" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"
                                    }`}
                                  >
                                    Payment Offers
                                  </button>
                                </div>

                                <div className="mt-5">
                                  {couponsTab === "payment" ? (
                                    <div className="rounded-2xl border border-neutral-200 bg-emerald-50/40 p-4">
                                      <p className="text-sm font-semibold text-neutral-900">Payment offers</p>
                                      <p className="mt-1 text-sm text-neutral-600">
                                        Payment offers are auto-applied on select payment methods.
                                      </p>
                                    </div>
                                  ) : couponsLoading ? (
                                    <p className="text-sm text-neutral-600">Loading coupons…</p>
                                  ) : availableCoupons.length === 0 ? (
                                    <p className="text-sm text-neutral-600">No active coupons available.</p>
                                  ) : (
                                    <div className="space-y-4">
                                      {availableCoupons.map((c) => {
                                        const label = c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`;
                                        return (
                                          <div
                                            key={c.code}
                                            className="rounded-2xl border border-neutral-200 bg-white p-4 flex items-start justify-between gap-4"
                                          >
                                            <div className="min-w-0">
                                              <p className="text-sm font-semibold text-neutral-900">{label}</p>
                                              <p className="mt-1 text-sm text-neutral-700">
                                                Code: <span className="font-semibold">{c.code}</span>
                                              </p>
                                              {c.minOrder ? (
                                                <p className="mt-1 text-xs text-neutral-500">Min order ₹{c.minOrder}</p>
                                              ) : null}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => applyCouponFromList(c.code)}
                                              className="shrink-0 h-10 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                                            >
                                              APPLY
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {step === "login" ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                          <div className="px-4 py-3 bg-[#FFF7E8] text-center text-xs font-semibold text-[#8A5A00]">
                            Login to redeem offers
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-semibold text-neutral-900">Login to continue</p>
                            {!otpSent && (
                              <>
                                <label className="mt-3 block text-xs font-semibold text-neutral-600">Full Name</label>
                                <input
                                  value={otpLoginName}
                                  onChange={(e) => setOtpLoginName(e.target.value.replace(/\s+/g, " ").slice(0, 80))}
                                  placeholder="Full name"
                                  autoComplete="name"
                                  className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                                />
                              </>
                            )}
                            <label className="mt-3 block text-xs font-semibold text-neutral-600">Enter Mobile Number</label>
                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 h-12">
                              <span className="text-sm font-semibold text-neutral-900">+91</span>
                              <input
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value.replace(/\\D/g, "").slice(0, 10))}
                                placeholder="Mobile number"
                                className="h-full w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                              />
                            </div>

                            {otpSent && (
                              <>
                                <label className="mt-4 block text-xs font-semibold text-neutral-600">Enter OTP</label>
                                <input
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value.replace(/\\D/g, "").slice(0, 6))}
                                  placeholder="XXXX"
                                  className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 tracking-[0.35em] text-center outline-none focus:border-neutral-400"
                                />
                                <button
                                  type="button"
                                  onClick={sendOtp}
                                  disabled={cooldown > 0 || submitting}
                                  className="mt-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
                                >
                                  {cooldown > 0 ? `Resend OTP in 00:${String(cooldown).padStart(2, "0")}` : "Resend OTP"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                            DELIVERY DETAILS
                          </p>

                          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                            {(() => {
                              const { line1, line2 } = buildAddressLines(addr);
                              return (
                                <>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <div className="h-10 w-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-700">
                                        <span className="text-base" aria-hidden="true">📍</span>
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-neutral-900">
                                          {fullName?.trim() ? `Deliver To ${fullName.trim()}` : "Deliver To"}
                                        </p>
                                        <p className="mt-1 text-[13px] text-neutral-700 leading-snug">
                                          {line1 || "Add address to continue"}
                                        </p>
                                        {line2 ? (
                                          <p className="mt-0.5 text-[13px] text-neutral-600 leading-snug">
                                            {line2}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setIsEditingAddress(true)}
                                      className="shrink-0 h-10 rounded-2xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                                    >
                                      Change
                                    </button>
                                  </div>

                                  <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4 flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-neutral-900">Free Shipping</p>
                                      <p className="mt-0.5 text-xs text-neutral-500">Delivered in 2-5 business days</p>
                                    </div>
                                    <div className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                      Free
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {isEditingAddress && (
                            <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3">
                              {addressLoading ? (
                                <p className="text-sm text-neutral-600">Loading address…</p>
                              ) : (
                                <>
                                  <div>
                                    <label className="block text-xs font-semibold text-neutral-700">Full Name</label>
                                    <input
                                      value={fullName}
                                      onChange={(e) => setFullName(e.target.value)}
                                      placeholder="Full name"
                                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-neutral-700">Address</label>
                                    <input
                                      value={addr.address}
                                      onChange={(e) => setAddr((p) => ({ ...p, address: e.target.value }))}
                                      placeholder="House / Street / Area"
                                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-neutral-700">Pincode</label>
                                    <input
                                      value={addr.pincode}
                                      inputMode="numeric"
                                      autoComplete="postal-code"
                                      onChange={(e) =>
                                        setAddr((p) => ({
                                          ...p,
                                          pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                                        }))
                                      }
                                      onBlur={() => void lookupCheckoutPincode()}
                                      placeholder="6 digit pincode"
                                      className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                                    />
                                    <p className="mt-1 text-[11px] text-neutral-500">
                                      Enter 6 digits — city and state fill automatically when available.
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-semibold text-neutral-700">City</label>
                                      <input
                                        value={addr.city}
                                        onChange={(e) => setAddr((p) => ({ ...p, city: e.target.value }))}
                                        placeholder="City"
                                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-neutral-700">State</label>
                                      <IndianStateSelect
                                        value={addr.state}
                                        onChange={(state) => setAddr((p) => ({ ...p, state }))}
                                        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 pt-1">
                                    <p className="text-xs text-neutral-600">
                                      {isAddressComplete(addr)
                                        ? addressChanged
                                          ? "Tap Continue to save address."
                                          : "Address saved."
                                        : "Please complete your address to continue."}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => setIsEditingAddress(false)}
                                      className="text-xs font-semibold text-neutral-900 hover:text-neutral-700"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {/* Payment options */}
                          <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 flex items-center justify-between">
                              <p className="text-sm font-semibold text-neutral-900">Payment Options</p>
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Get 5% discount
                              </span>
                            </div>

                            <div className="border-t border-neutral-100">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("online")}
                                className={`w-full px-4 py-4 flex items-center justify-between ${
                                  paymentMethod === "online" ? "bg-neutral-50" : "bg-white"
                                }`}
                              >
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-neutral-900">UPI / Cards / Wallets</p>
                                  <p className="mt-0.5 text-xs text-emerald-700">Pay online and save {formatCurrency(onlinePaymentDiscountAmount)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-neutral-400 line-through tabular-nums">{formatCurrency(total)}</p>
                                  <p className="text-base font-bold text-neutral-900 tabular-nums">{formatCurrency(onlinePayableTotal)}</p>
                                </div>
                              </button>

                              <div className="border-t border-neutral-100" />

                              <button
                                type="button"
                                onClick={() => setPaymentMethod("cod")}
                                className={`w-full px-4 py-4 flex items-center justify-between ${
                                  paymentMethod === "cod" ? "bg-neutral-50" : "bg-white"
                                }`}
                              >
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-neutral-900">Cash on Delivery</p>
                                  <p className="mt-0.5 text-xs text-neutral-500">COD available (may include fee)</p>
                                </div>
                                <p className="text-base font-bold text-neutral-900 tabular-nums">{formatCurrency(total)}</p>
                              </button>
                            </div>

                            {paymentMethod === "cod" && (
                              <p className="px-4 pb-4 pt-2 text-xs text-neutral-500">
                                COD fee (if applicable) is added at checkout.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      
                    </div>

                    <div className="border-t border-neutral-200 bg-white px-5 py-4">
                      <button
                        type="button"
                        onClick={handlePopupContinue}
                        disabled={
                          items.length === 0 ||
                          submitting ||
                          (step === "login" ? false : addressSaving || addressLoading) ||
                          (step === "address" && !paymentMethod)
                        }
                        className="w-full rounded-xl bg-neutral-900 px-5 py-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                      >
                        {step === "login"
                          ? otpSent
                            ? "Continue"
                            : "Continue"
                          : !paymentMethod
                            ? "Select payment method"
                            : paymentMethod === "cod"
                              ? "Place Order"
                              : "Pay Now"}
                      </button>
                      <p className="mt-3 text-[11px] text-neutral-500 text-center">
                        By proceeding, you agree to our Privacy Policy and T&C
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}

