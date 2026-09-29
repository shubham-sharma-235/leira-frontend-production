'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from '@/components/ui/shopping-cart';
import { Button } from '@/components/ui/button';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/toast';

export default function ShoppingCartPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { items, loading, updateQuantity, removeFromCart, refreshCart } = useCart();

  const handleSessionError = React.useCallback(
    (msg: string) => {
      error("Please log in again to update your cart");
      refreshCart();
      router.push("/login");
    },
    [error, refreshCart, router]
  );

  const handleQuantityChange = React.useCallback(
    async (id: string, newQuantity: number) => {
      const qty = Math.max(1, newQuantity);
      try {
        await updateQuantity(id, qty);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("User not found") || msg.includes("Not authorized") || msg.includes("customer")) {
          handleSessionError(msg);
        } else {
          error(msg || "Could not update quantity");
        }
      }
    },
    [updateQuantity, error, handleSessionError]
  );

  const handleRemoveItem = React.useCallback(
    async (id: string) => {
      try {
        await removeFromCart(id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("User not found") || msg.includes("Not authorized") || msg.includes("customer")) {
          handleSessionError(msg);
        } else {
          error(msg || "Could not remove item");
        }
      }
    },
    [removeFromCart, error, handleSessionError]
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans selection:bg-pink-100 leira-underlap-nav-spacer">
      <MiniNavbar />
      <main className="flex-grow p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-center mb-12 text-neutral-900">
            Your <span className="font-serif italic text-pink-600">Selection</span>
          </h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ShoppingCart
              items={items}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onCheckoutComplete={refreshCart}
            />
          )}

          {!loading && items.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/shop">
                <Button variant="outline" className="rounded-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
