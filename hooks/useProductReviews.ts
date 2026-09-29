import { useState, useEffect, useCallback } from 'react';
import { reviewAPI } from '@/lib/api';

export interface ProductReview {
  _id: string;
  product: string;
  user: { _id: string; name: string; email?: string };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export interface ProductReviewStats {
  avgRating: number;
  totalCount: number;
}

export function useProductReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ProductReviewStats>({ avgRating: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await reviewAPI.getByProduct(productId);
      if (res?.success) {
        setReviews(res.data || []);
        setStats(res.stats || { avgRating: 0, totalCount: 0 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
      setReviews([]);
      setStats({ avgRating: 0, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, stats, loading, error, refetch: fetchReviews };
}
