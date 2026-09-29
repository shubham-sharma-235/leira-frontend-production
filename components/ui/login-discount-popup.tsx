"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Copy, Check } from "lucide-react";
import { couponAPI } from "@/lib/api";

type PromoCoupon = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
};

type LoggedUser = { _id?: string; role?: string } | null;
const SESSION_POPUP_COUNT_KEY = "leira_home_discount_popup_shown_count_v1";
const MAX_POPUP_PER_SESSION = 2;
const REOPEN_DELAY_MS = 30000;

function getSessionShownCount() {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(SESSION_POPUP_COUNT_KEY);
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
}

function getStoredUser(): LoggedUser {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");
  if (!token || !raw) return null;
  try {
    const user = JSON.parse(raw);
    if (!user || user.role === "admin") return null;
    return user;
  } catch {
    return null;
  }
}

export function LoginDiscountPopup() {
  const pathname = usePathname();
  const [coupon, setCoupon] = React.useState<PromoCoupon | null>(null);
  const [user, setUser] = React.useState<LoggedUser>(null);
  const [open, setOpen] = React.useState(false);
  const [shownCount, setShownCount] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const reopenTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryOpenWithinSessionLimit = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    if (window.location.pathname !== "/") return false;
    if (!coupon?.code) return false;
    if (open) return true;

    const currentCount = getSessionShownCount();
    setShownCount(currentCount);
    if (currentCount >= MAX_POPUP_PER_SESSION) {
      setOpen(false);
      return false;
    }

    const nextCount = currentCount + 1;
    sessionStorage.setItem(SESSION_POPUP_COUNT_KEY, String(nextCount));
    setShownCount(nextCount);
    setOpen(true);
    return true;
  }, [coupon?.code, open]);

  React.useEffect(() => {
    let mounted = true;

    const syncUser = () => setUser(getStoredUser());
    syncUser();
    window.addEventListener("userLoggedIn", syncUser);
    window.addEventListener("userLoggedOut", syncUser);

    const fetchPromo = async () => {
      try {
        const res = await couponAPI.getLoginPromo();
        if (!mounted) return;
        if (res?.success && res?.data?.code) {
          setCoupon(res.data);
        } else {
          setCoupon(null);
        }
      } catch {
        if (mounted) setCoupon(null);
      }
    };

    fetchPromo();
    setShownCount(getSessionShownCount());
    return () => {
      mounted = false;
      window.removeEventListener("userLoggedIn", syncUser);
      window.removeEventListener("userLoggedOut", syncUser);
    };
  }, []);

  React.useEffect(() => {
    if (!coupon?.code) {
      setOpen(false);
      return;
    }
    // Show only on home page.
    if (pathname !== "/") {
      setOpen(false);
      return;
    }
    tryOpenWithinSessionLimit();
  }, [coupon?.code, pathname, user?._id, tryOpenWithinSessionLimit]);

  React.useEffect(() => {
    return () => {
      if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
    const currentCount = getSessionShownCount();
    setShownCount(currentCount);
    // Re-open after a short delay while user stays on home page, up to session cap.
    if (currentCount >= MAX_POPUP_PER_SESSION) return;
    reopenTimerRef.current = setTimeout(() => {
      tryOpenWithinSessionLimit();
    }, REOPEN_DELAY_MS);
  };

  if (!coupon || !open) return null;

  const isLoggedIn = !!user?._id;
  const discountLabel = coupon.type === "percent" ? `${coupon.value}% OFF` : `Rs ${coupon.value} OFF`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-70 flex items-end justify-center p-4 sm:items-center">
        <motion.button
          type="button"
          className="absolute inset-0 bg-black/40"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-md rounded-3xl border border-pink-100 bg-white p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <Gift className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">{discountLabel}</p>
          <h3 className="mt-2 text-2xl font-serif text-neutral-900">
            {isLoggedIn ? "Congrats! You got your discount" : "Login for your special discount"}
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            {isLoggedIn
              ? "Your login offer coupon is ready. Apply this code at checkout."
              : "Login now and unlock this coupon for your next order."}
          </p>

          <div className="mt-5 rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Coupon Code</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="font-mono text-lg font-semibold tracking-wide text-neutral-900">{coupon.code}</span>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isLoggedIn ? (
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
                onClick={handleClose}
              >
                Use Coupon
              </Link>
            ) : (
              <Link
                href={`/login?coupon=${encodeURIComponent(coupon.code)}`}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
                onClick={handleClose}
              >
                Login to Claim
              </Link>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
