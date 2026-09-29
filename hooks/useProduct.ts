import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { Product } from './useProducts';
import { pickShopCardPath } from '@/lib/product-card-images';
import { resolveMediaUrl } from '@/lib/mediaUrl';

export const useProduct = (id: string) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await productAPI.getById(id);

                if (response && response.success) {
                    const rawGallery = Array.isArray(response.data.images)
                        ? response.data.images.map(String).filter(Boolean)
                        : [];
                    let resolvedImages =
                        rawGallery.length > 0
                            ? rawGallery.map((img: string) => resolveMediaUrl(img)).filter(Boolean)
                            : [];

                    if (resolvedImages.length === 0) {
                        const coverPath = pickShopCardPath(response.data);
                        if (coverPath) {
                            const one = resolveMediaUrl(coverPath);
                            if (one) resolvedImages = [one];
                        }
                    }

                    if (!resolvedImages.length) {
                        resolvedImages = [resolveMediaUrl('/images/placeholder.png')];
                    }

                    const updatedProduct = {
                        ...response.data,
                        images: resolvedImages,
                    };
                    setProduct(updatedProduct);
                } else {
                    setError('Product not found');
                }
            } catch (err: any) {
                console.error('❌ Error fetching product:', err);
                setError(err.message || 'Error fetching product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    return { product, loading, error };
};
