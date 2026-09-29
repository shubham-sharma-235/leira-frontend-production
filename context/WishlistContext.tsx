"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { wishlistAPI } from "@/lib/api";

export type WishlistProduct = {
  _id: string;
  name: string;
  price?: string;
  folderPath?: string;
  images?: string[];
  homeCardImage?: string;
  shopCardImage?: string;
  id?: string;
};

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

type WishlistContextValue = {
  items: WishlistProduct[];
  productIds: Set<string>;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWishlist = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    let storedUser: { role?: string } | null = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw) storedUser = JSON.parse(raw);
    } catch {}
    if (!token || storedUser?.role === "admin") {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const res = await wishlistAPI.get();
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onLogin = () => refreshWishlist();
    const onLogout = () => setItems([]);
    window.addEventListener("userLoggedIn", onLogin);
    window.addEventListener("userLoggedOut", onLogout);
    return () => {
      window.removeEventListener("userLoggedIn", onLogin);
      window.removeEventListener("userLoggedOut", onLogout);
    };
  }, [refreshWishlist]);

  const productIds = React.useMemo(
    () =>
      new Set(
        items
          .map((p) => p._id || p.id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      ),
    [items]
  );

  const isInWishlist = useCallback(
    (productId: string) => productIds.has(productId),
    [productIds]
  );

  const addToWishlist = useCallback(async (productId: string) => {
    if (!isLoggedInCustomer()) throw new Error("Please log in to add to wishlist");
    try {
      const res = await wishlistAPI.add(productId);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (e) {
      throw e;
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!isLoggedInCustomer()) return;
    try {
      const res = await wishlistAPI.remove(productId);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (e) {
      throw e;
    }
  }, []);

  const value: WishlistContextValue = {
    items,
    productIds,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

export { buildImageUrl as wishlistBuildImageUrl };
