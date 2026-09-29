import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/mediaUrl';

export interface Product {
  _id?: string;
  id: string;
  name: string;
  subName: string;
  /** Italic hero line under PDP title */
  detailTagline?: string;
  price: string;
  /** MRP / list price for struck-through display on cards */
  originalPrice?: string;
  description: string;
  folderPath: string;
  themeColor: string;
  gradient: string;
  features: string[];
  stats: { label: string; val: string }[];
  section1: { title: string; subtitle: string };
  section2: { title: string; subtitle: string };
  section3: { title: string; subtitle: string };
  section4: { title: string; subtitle: string };
  section5: { title: string; subtitle: string };
  introducingSection: {
    subtitle: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    bottleImage?: string;
  };
  detailsSection: { title: string; description: string; imageAlt: string };
  freshnessSection: { title: string; description: string };
  buyNowSection: {
    price: string;
    unit: string;
    processingParams: string[];
    deliveryPromise: string;
    returnPolicy: string;
  };
  animationCutoff?: number;
  backgroundColor?: string;
  bgFit?: "contain" | "cover";
  images?: string[];
  /** Homepage Discover + homepage combo strip card thumbnail */
  homeCardImage?: string;
  /** Homepage Discover card italic line */
  homeCardTagline?: string;
  /** Homepage Discover card short description */
  homeCardDescription?: string;
  /** /shop grid card cover thumbnail */
  shopCardImage?: string;
  /** /shop grid card short description */
  shopCardDescription?: string;
  /** /shop grid card italic tagline under title */
  shopCardTagline?: string;
  stock?: number;
  status?: string;
  /** Shown in homepage Combo section (above “Loved by women everywhere”) */
  showInComboSection?: boolean;
  /** Shown in main Shop grid + homepage “Loved by women everywhere” */
  showInShopSection?: boolean;
  /** Show star ratings on product cards when reviews exist */
  showReviewsOnCard?: boolean;
  /** Sort order within Shop + “Loved by women everywhere” (ascending) */
  shopSectionOrder?: number;
  /** Sort order within that section (ascending) */
  comboSectionOrder?: number;
}

export const useProducts = (initialProducts: Product[] = []) => {
  const hasInitialProducts = initialProducts.length > 0;
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(!hasInitialProducts);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await productAPI.getAll();
      
      if (response && response.success) {
        const newProducts = response.data.map((product: any) => ({
          ...product,
          images:
            product.images?.length
              ? product.images.map((img: string) => {
                  if (!img) return img;
                  return resolveMediaUrl(img);
                })
              : product.folderPath
              ? (() => {
                  const fp = product.folderPath.startsWith('/') ? product.folderPath : `/${product.folderPath}`;
                  return [resolveMediaUrl(`${fp}/1.jpg`), resolveMediaUrl(`${fp}/2.jpg`)];
                })()
              : [],
        }));
        setProducts(newProducts);
        console.log('✅ Products refreshed:', newProducts.length, 'at', new Date().toLocaleTimeString());
      } else {
        setError('Failed to fetch products');
        setProducts([]);
      }
    } catch (err: any) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Error fetching products. Make sure backend server is running on port 5000.');
      // Fallback to empty array on error
      setProducts([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(!hasInitialProducts);
    
    // Auto-refresh products every 5 seconds to get latest updates from admin
    const interval = setInterval(() => {
      fetchProducts(false);
    }, 5000);

    // Listen for custom event when admin updates products
    const handleProductUpdate = (e?: Event) => {
      console.log('🔄 Product update event received, refreshing immediately...');
      // Force immediate refresh
      setTimeout(() => {
        fetchProducts(false);
      }, 100);
    };
    
    // Custom event for immediate refresh
    window.addEventListener('productUpdated', handleProductUpdate);
    
    // Also listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('productUpdated')) {
        console.log('🔄 Product update detected via storage, refreshing...');
        setTimeout(() => {
          fetchProducts(false);
        }, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [hasInitialProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

