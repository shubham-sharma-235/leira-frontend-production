"use client";

import { ProductCardsSectionContent } from "@/components/Sections";
import { useProducts, type Product as HookProduct } from "@/hooks/useProducts";

/** One `useProducts` for both homepage strips (combo + “Loved by women”). */
export function HomeProductSections({ initialProducts = [] }: { initialProducts?: HookProduct[] }) {
  const { products, loading } = useProducts(initialProducts);
  return (
    <>
      <ProductCardsSectionContent products={products} loading={loading} variant="default" />
      <ProductCardsSectionContent products={products} loading={loading} variant="combo" />
    </>
  );
}
