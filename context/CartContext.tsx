"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cartAPI } from "@/lib/api";
import { trackMetaEvent } from "@/lib/analytics/metaPixel";
import { trackAddToCart } from "@/lib/analytics/ecommerce";

const GUEST_CART_KEY = "leira_guest_cart";

export type CartItemUI = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type ProductSnapshot = { name: string; price: string; imageUrl: string };

function buildImageUrl(path: string | undefined | null): string {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) {
    const base = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
      : "http://localhost:5000";
    return `${base}${path}`;
  }
  return path;
}

function parsePrice(price: string | number | undefined): number {
  if (price == null || price === "") return 0;
  if (typeof price === "number" && Number.isFinite(price)) return price;
  const s = String(price).replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

type GuestCartItem = { productId: string; quantity: number; name: string; price: number; imageUrl: string };

function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function setGuestCart(cart: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

function guestCartToUI(cart: GuestCartItem[]): CartItemUI[] {
  return cart.map((item) => ({
    id: item.productId,
    name: item.name || "Product",
    price: item.price ?? 0,
    quantity: item.quantity,
    imageUrl: item.imageUrl || "/images/placeholder.png",
  }));
}

function mapCartResponseToUI(data: Array<{ productId: string; product: { name?: string; price?: string; folderPath?: string; images?: string[]; shopCardImage?: string; homeCardImage?: string }; quantity: number }>): CartItemUI[] {
  return (data || []).map((item) => {
    const p = item.product || {};
    const thumbRaw =
      String(p.shopCardImage || "").trim() ||
      String(p.homeCardImage || "").trim() ||
      (p.images && p.images.length > 0 ? p.images[0] : "") ||
      (p.folderPath ? `${p.folderPath}/1.jpg` : "");
    const imageUrl = buildImageUrl(thumbRaw || undefined);
    return {
      id: item.productId,
      name: p.name || "Product",
      price: parsePrice(p.price),
      quantity: item.quantity,
      imageUrl,
    };
  });
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

type CartContextValue = {
  items: CartItemUI[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number, productSnapshot?: ProductSnapshot) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [loading, setLoading] = useState(true);
  /** Ignore stale GET /cart responses when multiple refreshCart calls overlap (e.g. login merge + UI refresh). */
  const cartFetchSeq = useRef(0);

  const refreshCart = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    let storedUser: { role?: string } | null = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw) storedUser = JSON.parse(raw);
    } catch {}
    if (!token || storedUser?.role === "admin") {
      setItems(guestCartToUI(getGuestCart()));
      setLoading(false);
      return;
    }
    const seq = ++cartFetchSeq.current;
    try {
      const res = await cartAPI.get();
      if (seq !== cartFetchSeq.current) return;
      if (res.success && Array.isArray(res.data)) {
        setItems(mapCartResponseToUI(res.data));
      } else {
        setItems([]);
      }
    } catch {
      if (seq !== cartFetchSeq.current) return;
      setItems([]);
    } finally {
      if (seq === cartFetchSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // On login: merge guest cart into account, then refetch. On logout: show guest cart if any.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onLogin = async () => {
      const guest = getGuestCart();
      let remaining: GuestCartItem[] = [];
      if (guest.length > 0) {
        for (const item of guest) {
          try {
            await cartAPI.add(item.productId, item.quantity);
          } catch {
            remaining.push(item);
          }
        }
        setGuestCart(remaining);
      }
      await refreshCart();
      if (remaining.length > 0) {
        setItems((prev) => {
          const seen = new Set(prev.map((i) => String(i.id)));
          const extra = guestCartToUI(remaining).filter((g) => !seen.has(String(g.id)));
          return extra.length ? [...prev, ...extra] : prev;
        });
      }
    };
    const onLogout = () => {
      setItems(guestCartToUI(getGuestCart()));
    };
    window.addEventListener("userLoggedIn", onLogin);
    window.addEventListener("userLoggedOut", onLogout);
    return () => {
      window.removeEventListener("userLoggedIn", onLogin);
      window.removeEventListener("userLoggedOut", onLogout);
    };
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1, productSnapshot?: ProductSnapshot) => {
    if (!isLoggedInCustomer()) {
      const guest = getGuestCart();
      const qty = Math.max(1, quantity);
      const existing = guest.find((i) => i.productId === productId);
      const name = productSnapshot?.name ?? "Product";
      const price = parsePrice(productSnapshot?.price);
      const imageUrl = productSnapshot?.imageUrl ?? "/images/placeholder.png";
      if (existing) {
        existing.quantity += qty;
      } else {
        guest.push({ productId, quantity: qty, name, price, imageUrl });
      }
      setGuestCart(guest);
      setItems(guestCartToUI(guest));
      trackMetaEvent("AddToCart", {
        content_ids: [String(productId)],
        content_name: productSnapshot?.name || "Product",
        content_type: "product",
        currency: "INR",
        value: price * qty,
      });
      trackAddToCart({
        item_id: String(productId),
        item_name: productSnapshot?.name || "Product",
        price,
        quantity: qty,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("leira:cart:open"));
      }
      return;
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : null;
        if (u?.role === "admin") {
          throw new Error("Please log in as a customer to add to cart");
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes("customer")) throw e;
      }
    }
    try {
      const res = await cartAPI.add(productId, quantity);
      if (res.success && Array.isArray(res.data)) {
        setItems(mapCartResponseToUI(res.data));
      }
      const qty = Math.max(1, quantity);
      const fallbackPrice = parsePrice(productSnapshot?.price);
      const cartItem = Array.isArray(res?.data)
        ? (res.data as Array<{ productId: string; product?: { price?: string } }>).find((item) => item.productId === productId)
        : null;
      const resolvedPrice = parsePrice(cartItem?.product?.price ?? fallbackPrice);
      trackMetaEvent("AddToCart", {
        content_ids: [String(productId)],
        content_name: productSnapshot?.name || "Product",
        content_type: "product",
        currency: "INR",
        value: resolvedPrice * qty,
      });
      trackAddToCart({
        item_id: String(productId),
        item_name: productSnapshot?.name || "Product",
        price: resolvedPrice,
        quantity: qty,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("leira:cart:open"));
      }
    } catch (e) {
      throw e;
    }
  }, []);

  const guardCustomerOrGuest = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      if (u?.role === "admin") {
        throw new Error("Please log in as a customer to update cart");
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("customer")) throw e;
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!isLoggedInCustomer()) {
      const guest = getGuestCart();
      const item = guest.find((i) => i.productId === productId);
      if (!item) return;
      const qty = Math.max(0, quantity);
      if (qty <= 0) {
        const next = guest.filter((i) => i.productId !== productId);
        setGuestCart(next);
        setItems(guestCartToUI(next));
      } else {
        item.quantity = qty;
        setGuestCart(guest);
        setItems(guestCartToUI(guest));
      }
      return;
    }
    guardCustomerOrGuest();
    try {
      const res = await cartAPI.updateItem(productId, quantity);
      if (res.success && Array.isArray(res.data)) {
        setItems(mapCartResponseToUI(res.data));
      }
    } catch (e) {
      throw e;
    }
  }, [guardCustomerOrGuest]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isLoggedInCustomer()) {
      const guest = getGuestCart().filter((i) => i.productId !== productId);
      setGuestCart(guest);
      setItems(guestCartToUI(guest));
      return;
    }
    guardCustomerOrGuest();
    try {
      const res = await cartAPI.removeItem(productId);
      if (res.success && Array.isArray(res.data)) {
        setItems(mapCartResponseToUI(res.data));
      }
    } catch (e) {
      throw e;
    }
  }, [guardCustomerOrGuest]);

  const value: CartContextValue = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
