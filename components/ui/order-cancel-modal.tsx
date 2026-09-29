"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, X, XCircle } from "lucide-react";

export type OrderCancelModalOrder = {
  _id: string;
  orderNumber?: string;
  total?: number;
  createdAt?: string;
};

type OrderCancelModalProps = {
  isOpen: boolean;
  order: OrderCancelModalOrder | null;
  timeLeftLabel?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export function OrderCancelModal({
  isOpen,
  order,
  timeLeftLabel,
  isLoading = false,
  onClose,
  onConfirm,
}: OrderCancelModalProps) {
  const orderLabel = order?.orderNumber || order?._id || "";

  return (
    <AnimatePresence>
      {isOpen && order ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-cancel-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            disabled={isLoading}
            className="absolute inset-0 bg-neutral-900/45 backdrop-blur-sm"
            aria-label="Close"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-pink-100/80 bg-white shadow-[0_24px_80px_rgba(236,72,153,0.18)]"
          >
            <motion.div className="h-1.5 w-full bg-linear-to-r from-pink-500 via-rose-500 to-pink-400" aria-hidden />

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 transition-colors hover:bg-pink-50 hover:text-pink-600 disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 pb-6 pt-8 sm:px-8">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-pink-50 to-rose-100 text-rose-600 ring-4 ring-pink-50">
                <XCircle className="h-7 w-7" strokeWidth={1.75} />
              </div>

              <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-pink-600">
                Cancel order
              </p>
              <h2
                id="order-cancel-title"
                className="mt-2 text-center font-serif text-2xl italic text-neutral-900"
              >
                Are you sure?
              </h2>

              <p className="mt-3 text-center text-sm leading-relaxed text-neutral-600">
                You are about to cancel order{" "}
                <span className="font-semibold text-neutral-900">{orderLabel}</span>
                {typeof order.total === "number" ? (
                  <>
                    {" "}
                    for <span className="font-semibold text-rose-700">{formatInr(order.total)}</span>
                  </>
                ) : null}
                . This cannot be undone.
              </p>

              <div className="mt-5 space-y-3 rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3.5 text-left text-sm text-neutral-700">
                <p className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                  <span>
                    Cancellation is only available within <strong>24 hours</strong> of placing the order,
                    before dispatch.
                  </span>
                </p>
                {timeLeftLabel ? (
                  <p className="pl-6 text-xs font-medium text-rose-700">{timeLeftLabel}</p>
                ) : null}
                <p className="text-xs text-neutral-500">
                  Prepaid orders: refund will be initiated to your original payment method as per bank timelines.
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-full border border-neutral-200 bg-white px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:border-pink-200 hover:bg-pink-50/50 disabled:opacity-50"
                >
                  Keep order
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 rounded-full bg-linear-to-r from-pink-500 to-rose-500 px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-pink-300/40 transition-all hover:shadow-xl hover:shadow-pink-300/50 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : null}
                  {isLoading ? "Cancelling…" : "Yes, cancel order"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
