"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { reviewAPI } from "@/lib/api";
import { strikethroughPriceIfHigher } from "@/lib/utils";
import { pickDetailGalleryPaths, pickHomeCardPath, pickShopCardPath } from "@/lib/product-card-images";
import { pickShopCardDescription, pickShopCardTagline } from "@/lib/product-card-copy";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { getProductShopPath } from "@/lib/product-slugs";

export default function ComboPageClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const { products, loading } = useProducts(initialProducts);
  const { addToCart } = useCart();
  const { error } = useToast();
  const router = useRouter();
  const [reviewStatsMap, setReviewStatsMap] = useState<Record<string, { avgRating: number; totalCount: number }>>({});

  const comboProducts = useMemo(() => {
    const safeOrder = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };
    return [...products]
      .filter((p) => Boolean(p.showInComboSection))
      .sort((a, b) => {
        const byOrder = safeOrder(a.comboSectionOrder) - safeOrder(b.comboSectionOrder);
        if (byOrder !== 0) return byOrder;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [products]);

  const productIds = useMemo(
    () => comboProducts.map((p) => p._id).filter((id): id is string => !!id),
    [comboProducts]
  );

  useEffect(() => {
    let mounted = true;
    const loadReviewStats = async () => {
      if (!productIds.length) {
        setReviewStatsMap({});
        return;
      }
      try {
        const res = await reviewAPI.getStatsByProducts(productIds);
        if (mounted && res?.success) {
          setReviewStatsMap(res.data || {});
        }
      } catch {
        if (mounted) setReviewStatsMap({});
      }
    };
    loadReviewStats();
    return () => {
      mounted = false;
    };
  }, [productIds]);

  const handleAddToCart = async (product: {
    _id?: string;
    id?: string;
    name: string;
    price?: string;
    images?: string[];
    folderPath?: string;
    homeCardImage?: string;
    shopCardImage?: string;
    stock?: number;
    status?: string;
  }) => {
    const productId = product._id || product.id;
    if (!productId) return;
    const isOutOfStock = product.status === "inactive" || Number(product.stock ?? 0) <= 0;
    if (isOutOfStock) {
      error("This product is out of stock");
      return;
    }
    const thumbPath = pickShopCardPath(product);
    const imageUrl = thumbPath ? resolveMediaUrl(thumbPath) : "/images/placeholder.png";
    const snapshot = { name: product.name, price: product.price || "₹0", imageUrl };
    try {
      await addToCart(productId, 1, snapshot);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("customer to add to cart")) {
        error("Please log in as a customer to add to cart");
        router.push("/login");
      } else if (msg.includes("Not authorized") || msg.includes("User not found")) {
        error("Please log in to add to cart");
        router.push("/login");
      } else {
        error(msg || "Could not add to cart");
      }
    }
  };

  return (
    <>
      <MiniNavbar />
      <main className="min-h-screen bg-white leira-underlap-nav-spacer">
        <div className="relative z-10">
          <div className="bg-white">
            <div className="pb-16">
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center space-y-6"
                >
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xs md:text-sm text-gray-400 font-medium tracking-[0.22em] uppercase"
                  >
                    The curated edit
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-[1.1] tracking-tight"
                  >
                    <span className="font-serif italic">Signature</span>{" "}
                    <span className="font-semibold text-pink-600">Combos</span>
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-24 h-px bg-linear-to-r from-transparent via-pink-400 to-transparent mx-auto"
                  />
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed font-light"
                  >
                    Luxury pairings and sets chosen for the homepage — same cards and flow as the shop, exclusive to this edit.
                  </motion.p>
                </motion.div>
              </section>

              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {loading ? (
                  <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading…</p>
                  </div>
                ) : comboProducts.length === 0 ? (
                  <div className="text-center py-16 max-w-lg mx-auto">
                    <p className="text-neutral-600 mb-4">
                      No combo products yet. Enable “Show in Combo” on products in admin.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex text-sm font-semibold text-pink-600 hover:text-pink-700 underline underline-offset-4"
                    >
                      Browse the full shop
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 justify-items-center">
                    {comboProducts.map((product, index) => {
                      const detailPaths = pickDetailGalleryPaths(product);
                      const detailGallery = detailPaths.map((pth) => resolveMediaUrl(pth));
                      const coverPath = pickHomeCardPath(product);
                      const coverResolved = coverPath ? resolveMediaUrl(coverPath) : detailGallery[0] || "/images/placeholder.png";
                      const carouselUrls = [
                        coverResolved,
                        ...detailGallery.filter((u) => u !== coverResolved),
                      ].filter(Boolean);
                      const safeCarousel = carouselUrls.length > 0 ? carouselUrls : ["/images/placeholder.png"];
                      const title = product.name;
                      const price = product.price || "₹2,999.00";
                      const cardOriginal = strikethroughPriceIfHigher(price, product.originalPrice);
                      const isOutOfStock = product.status === "inactive" || Number(product.stock ?? 0) <= 0;
                      const stats = product._id ? reviewStatsMap[product._id] : undefined;
                      const rating = stats?.avgRating || 0;
                      const reviewCount = stats?.totalCount || 0;

                      return (
                        <motion.div
                          key={product._id || product.id}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ delay: index * 0.1, duration: 0.6 }}
                          className="w-full flex justify-center"
                        >
                          <div className="relative w-full">
                            {isOutOfStock && (
                              <div className="absolute top-4 right-4 z-20 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl">
                                Out of Stock
                              </div>
                            )}
                            <ProductRevealCard
                              images={safeCarousel}
                              name={title}
                              price={price}
                              originalPrice={cardOriginal}
                              tagline={pickShopCardTagline(product)}
                              description={pickShopCardDescription(product)}
                              rating={rating}
                              reviewCount={reviewCount}
                              showReviewsOnCard={Boolean(product.showReviewsOnCard)}
                              onAdd={() => !isOutOfStock && handleAddToCart(product)}
                              onViewDetails={() => router.push(getProductShopPath(product))}
                              className="mx-auto"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}
