/** Customer may cancel within 24 hours if order is not yet dispatched. */
export const ORDER_CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export const CUSTOMER_CANCELLABLE_STATUSES = ["created", "confirmed"] as const;

export type OrderCancelCheck = {
  canCancel: boolean;
  reason?: string;
  cancelDeadline?: Date;
};

export function getOrderCancelEligibility(order: {
  status?: string;
  createdAt?: string | Date;
}): OrderCancelCheck {
  const status = String(order.status || "");
  if (status === "cancelled") {
    return { canCancel: false, reason: "This order is already cancelled." };
  }
  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(status as (typeof CUSTOMER_CANCELLABLE_STATUSES)[number])) {
    return {
      canCancel: false,
      reason: "This order can no longer be cancelled because it is being processed or has shipped.",
    };
  }
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    return { canCancel: false, reason: "Unable to verify order time." };
  }
  const cancelDeadline = new Date(createdAt.getTime() + ORDER_CANCEL_WINDOW_MS);
  if (Date.now() >= cancelDeadline.getTime()) {
    return {
      canCancel: false,
      reason: "Cancellation is only available within 24 hours of placing the order.",
      cancelDeadline,
    };
  }
  return { canCancel: true, cancelDeadline };
}
