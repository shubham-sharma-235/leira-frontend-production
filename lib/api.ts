const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      // If 401 and session invalid (user/admin deleted, deactivated, or wrong login type), clear token
      if (response.status === 401 && typeof window !== 'undefined') {
        const sessionInvalid =
          errorMessage === 'User not found' ||
          errorMessage === 'User account is deactivated' ||
          errorMessage === 'Admin not found or session invalid' ||
          errorMessage.includes('Not authorized');
        if (sessionInvalid) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('storage'));
          // If admin API failed, send to admin login
          if (errorMessage === 'Admin not found or session invalid') {
            window.location.href = '/admin/login';
          }
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message === 'Failed to fetch')) {
      console.error('❌ Backend server is not running or not accessible');
      console.error(`💡 API URL: ${API_URL}`);
      throw new Error(`Cannot connect to server (${API_URL}). Check API URL / network / CORS.`);
    }
    // Skip console.error for expected user-facing auth errors (shown in form UI or handled by redirect)
    const msg = error?.message ?? '';
    const expectedAuthError =
      msg === 'Invalid credentials' ||
      msg === 'User already exists with this email' ||
      msg === 'Please provide email and password' ||
      msg === 'Account is deactivated' ||
      msg === 'User account is deactivated' ||
      msg === 'User not found' ||
      msg === 'Not authorized to access this route' ||
      msg === 'Admin not found or session invalid';
    if (!expectedAuthError) console.error('API Error:', error);
    throw error;
  }
}

// Blog API
export const blogAPI = {
  getAll: async () => fetchAPI(`/blogs?t=${Date.now()}`),
  getById: async (id: string) => fetchAPI(`/blogs/${id}`),
  recordView: async (id: string) =>
    fetchAPI(`/blogs/${id}/view`, { method: 'POST' }),
  getReaction: async (id: string) =>
    fetchAPI(`/blogs/${id}/reaction`),
  react: async (id: string, type: 'like' | 'dislike') =>
    fetchAPI(`/blogs/${id}/react`, { method: 'POST', body: JSON.stringify({ type }) }),
  // Blocks (optional) + SEO (optional)
  create: async (data: {
    title: string;
    subHeading?: string;
    excerpt: string;
    content: string;
    category: string;
    date: string;
    readTime: string;
    imageUrl: string;
    coverImageMobile?: string;
    author: string;
    slug?: string;
    blocks?: Array<{
      type: 'richText' | 'image' | 'imageLeft' | 'imageRight' | 'callout';
      html?: string;
      imageUrl?: string;
      alt?: string;
      caption?: string;
      tone?: 'neutral' | 'pink' | 'green';
      order?: number;
    }>;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      primaryKeyword?: string;
      secondaryKeywords?: string[] | string;
    };
  }) => fetchAPI('/blogs', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<{
    title: string;
    subHeading: string;
    excerpt: string;
    content: string;
    category: string;
    date: string;
    readTime: string;
    imageUrl: string;
    coverImageMobile?: string;
    author: string;
    slug: string;
    blocks: Array<{
      type: 'richText' | 'image' | 'imageLeft' | 'imageRight' | 'callout';
      html?: string;
      imageUrl?: string;
      alt?: string;
      caption?: string;
      tone?: 'neutral' | 'pink' | 'green';
      order?: number;
    }>;
    seo: {
      metaTitle?: string;
      metaDescription?: string;
      primaryKeyword?: string;
      secondaryKeywords?: string[] | string;
    };
  }>) => fetchAPI(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => fetchAPI(`/blogs/${id}`, { method: 'DELETE' }),
};

// Coupon API
export const couponAPI = {
  validate: async (code: string, subtotal: number) =>
    fetchAPI('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal }),
    }),
  getLoginPromo: async () => fetchAPI('/coupons/promo'),
  getActive: async () => fetchAPI('/coupons/active'),
  getMyReviewReward: async () => fetchAPI('/coupons/my/reward'),
  getAll: async () => fetchAPI('/coupons'),
  getById: async (id: string) => fetchAPI(`/coupons/${id}`),
  create: async (data: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    minOrder?: number;
    maxUses?: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
    isLoginPromo?: boolean;
  }) => fetchAPI('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  update: async (
    id: string,
    data: Partial<{
      code: string;
      type: 'percent' | 'fixed';
      value: number;
      minOrder: number;
      maxUses: number;
      validFrom: string;
      validUntil: string;
      isActive: boolean;
      isLoginPromo: boolean;
    }>
  ) => fetchAPI(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  setLoginPromo: async (id: string, isLoginPromo: boolean) =>
    fetchAPI(`/coupons/${id}/login-promo`, {
      method: 'PATCH',
      body: JSON.stringify({ isLoginPromo }),
    }),
  delete: async (id: string) => fetchAPI(`/coupons/${id}`, { method: 'DELETE' }),
};

// Product API
export const productAPI = {
  // Get all products
  getAll: async () => {
    // Add cache busting to ensure fresh data
    return fetchAPI(`/products?t=${Date.now()}`);
  },

  // Get single product
  getById: async (id: string) => {
    return fetchAPI(`/products/${id}`);
  },

  // Get product by slug
  getBySlug: async (slug: string) => {
    return fetchAPI(`/products/slug/${slug}`);
  },

  // Create product (Admin)
  create: async (productData: any) => {
    return fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product (Admin)
  update: async (id: string, productData: any) => {
    return fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete product (Admin)
  delete: async (id: string) => {
    return fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth API
export const authAPI = {
  // Register
  register: async (userData: { name: string; email: string; phone?: string; password: string }) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login
  login: async (credentials: { email: string; password: string }) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  sendPhoneOtp: async (phone: string) => {
    return fetchAPI('/auth/phone/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  verifyPhoneOtp: async (payload: { requestId: string; otp: string; name?: string }) => {
    return fetchAPI('/auth/phone/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Get current user
  getMe: async () => {
    return fetchAPI('/auth/me');
  },

  // Admin login only - uses separate Admin collection (not User)
  adminLogin: async (credentials: { email: string; password: string }) => {
    return fetchAPI('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Update current user profile (name, email, phone, address, billingAddress, shippingAddress)
  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    billingAddress?: { address?: string; state?: string; city?: string; pincode?: string };
    shippingAddress?: { address?: string; state?: string; city?: string; pincode?: string };
  }) => {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password (current user)
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return fetchAPI('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Cart API (requires customer auth token)
export const cartAPI = {
  get: async () => fetchAPI('/auth/cart'),
  add: async (productId: string, quantity: number = 1) =>
    fetchAPI('/auth/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateItem: async (productId: string, quantity: number) =>
    fetchAPI(`/auth/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: async (productId: string) =>
    fetchAPI(`/auth/cart/items/${productId}`, { method: 'DELETE' }),
  clear: async () => fetchAPI('/auth/cart', { method: 'DELETE' }),
};

// Wishlist API (requires customer auth token)
export const wishlistAPI = {
  get: async () => fetchAPI('/auth/wishlist'),
  add: async (productId: string) =>
    fetchAPI('/auth/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  remove: async (productId: string) =>
    fetchAPI(`/auth/wishlist/${productId}`, { method: 'DELETE' }),
};

// Review API
export const reviewAPI = {
  getByProduct: async (productId: string) => fetchAPI(`/reviews/product/${productId}`),
  getFeatured: async (limit: number = 9) =>
    fetchAPI(`/reviews/featured?limit=${encodeURIComponent(String(limit))}`),
  getStatsByProducts: async (productIds: string[]) => {
    const ids = (productIds || []).filter(Boolean);
    if (!ids.length) return { success: true, data: {} };
    return fetchAPI(`/reviews/stats?productIds=${encodeURIComponent(ids.join(','))}`);
  },
  create: async (productId: string, rating: number, comment?: string) =>
    fetchAPI('/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment: comment || '' }),
    }),
  getAll: async (params?: { productId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.productId) q.set('productId', params.productId);
    if (params?.status) q.set('status', params.status);
    const query = q.toString();
    return fetchAPI(`/reviews${query ? `?${query}` : ''}`);
  },
  updateStatus: async (reviewId: string, status: 'approved' | 'rejected') =>
    fetchAPI(`/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: async (reviewId: string) =>
    fetchAPI(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
};

// Contact API
export const contactAPI = {
  submitMessage: async (data: { name: string; email: string; message: string }) =>
    fetchAPI('/contact/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submitReview: async (data: { firstName: string; lastName: string; email: string; review: string }) =>
    fetchAPI('/contact/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  /** Approved contact-page reviews for homepage testimonials (public). */
  getApprovedFeatured: async (limit: number = 12) =>
    fetchAPI(`/contact/reviews/featured?limit=${encodeURIComponent(String(limit))}`),
  getMessages: async (status?: 'new' | 'in_progress' | 'resolved') =>
    fetchAPI(`/contact/messages${status ? `?status=${status}` : ''}`),
  updateMessageStatus: async (id: string, status: 'new' | 'in_progress' | 'resolved') =>
    fetchAPI(`/contact/messages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getReviews: async (status?: 'pending' | 'approved' | 'rejected') =>
    fetchAPI(`/contact/reviews${status ? `?status=${status}` : ''}`),
  updateReviewStatus: async (id: string, status: 'pending' | 'approved' | 'rejected') =>
    fetchAPI(`/contact/reviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Collaboration API
export const collaborationAPI = {
  submit: async (data: {
    fullName: string;
    email: string;
    phone: string;
    collaborationType: 'influencer' | 'brand' | 'creator' | 'affiliate' | 'other';
    brandOrChannel?: string;
    socialHandle?: string;
    followers?: string;
    message: string;
  }) =>
    fetchAPI('/collaborations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: async (status?: 'new' | 'in_progress' | 'resolved') =>
    fetchAPI(`/collaborations${status ? `?status=${status}` : ''}`),
  updateStatus: async (id: string, status: 'new' | 'in_progress' | 'resolved') =>
    fetchAPI(`/collaborations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Orders API
export const orderAPI = {
  getMyOrders: async () => fetchAPI('/orders/my'),
  getMyOrderById: async (id: string) => fetchAPI(`/orders/my/${id}`),
  cancelMyOrder: async (id: string) =>
    fetchAPI(`/orders/my/${id}/cancel`, {
      method: 'PATCH',
    }),
  trackMyOrder: async (query: string) => fetchAPI(`/orders/my/track/${encodeURIComponent(query)}`),
  getAdminOrders: async (params?: { page?: number; limit?: number; status?: string; paymentStatus?: string; q?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus);
    if (params?.q) q.set('q', params.q);
    const query = q.toString();
    return fetchAPI(`/orders/admin${query ? `?${query}` : ''}`);
  },
  updateAdminOrderStatus: async (id: string, status: string) =>
    fetchAPI(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  markAdminOrderPaid: async (id: string, razorpayPaymentId?: string) =>
    fetchAPI(`/orders/admin/${id}/mark-paid`, {
      method: 'PATCH',
      body: JSON.stringify({
        razorpayPaymentId: razorpayPaymentId?.trim() || undefined,
      }),
    }),
  retryAdminOrderSms: async (id: string) =>
    fetchAPI(`/orders/admin/${id}/order-sms`, {
      method: 'PATCH',
    }),
  retryAdminOrderWhatsApp: async (id: string) =>
    fetchAPI(`/orders/admin/${id}/order-whatsapp`, {
      method: 'PATCH',
    }),
  retryAdminEshipzSync: async (id: string) =>
    fetchAPI(`/orders/admin/${id}/eshipz-sync`, {
      method: 'PATCH',
    }),
  deleteAdminOrder: async (id: string) =>
    fetchAPI(`/orders/admin/${id}`, {
      method: 'DELETE',
    }),
};

// Payments API
export const paymentAPI = {
  createOnlineOrder: async (couponCode?: string) =>
    fetchAPI('/payments/online/order', {
      method: 'POST',
      body: JSON.stringify({ couponCode: couponCode || '' }),
    }),
  verifyOnlinePayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    localOrderId: string;
  }) =>
    fetchAPI('/payments/online/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  abandonOnlineOrder: async (localOrderId: string) =>
    fetchAPI('/payments/online/abandon', {
      method: 'POST',
      body: JSON.stringify({ localOrderId }),
    }),
  placeCodOrder: async (couponCode?: string) =>
    fetchAPI('/payments/cod', {
      method: 'POST',
      body: JSON.stringify({ couponCode: couponCode || '' }),
    }),
};

// User API (Admin)
export const userAPI = {
  getAll: async () => {
    return fetchAPI('/users');
  },
  getById: async (id: string) => {
    return fetchAPI(`/users/${id}`);
  },
  update: async (id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    billingAddress?: { address?: string; state?: string; city?: string; pincode?: string };
    shippingAddress?: { address?: string; state?: string; city?: string; pincode?: string };
    role?: string;
    isActive?: boolean;
  }) => {
    return fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Upload API
export const uploadAPI = {
  parseErrorResponse: async (response: Response) => {
    const raw = await response.text();
    try {
      const parsed = JSON.parse(raw);
      return parsed?.message || `Upload failed (${response.status})`;
    } catch {
      if (response.status === 413) {
        return 'Upload failed: file too large for server (nginx limit).';
      }
      return `Upload failed (${response.status}): ${response.statusText || 'Unexpected server response'}`;
    }
  },
  // Upload single image
  uploadImage: async (file: File, productKey?: string) => {
    const formData = new FormData();
    if (productKey?.trim()) {
      formData.append('productKey', productKey.trim());
    }
    formData.append('image', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    
    const response = await fetch(`${API_URL}/upload/product`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const message = await uploadAPI.parseErrorResponse(response);
      throw new Error(message);
    }

    const result = await response.json();
    return result;
  },

  // Upload multiple images
  uploadImages: async (files: File[], productKey?: string) => {
    const formData = new FormData();
    if (productKey?.trim()) {
      formData.append('productKey', productKey.trim());
    }
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    
    console.log('📤 Sending upload request to:', `${API_URL}/upload/products`);
    console.log('📦 Files count:', files.length);
    
    const response = await fetch(`${API_URL}/upload/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      },
      body: formData,
    });
    
    console.log('📥 Upload response status:', response.status);
    
    if (!response.ok) {
      const message = await uploadAPI.parseErrorResponse(response);
      console.error('❌ Upload error response:', message);
      throw new Error(message);
    }

    const result = await response.json();
    console.log('✅ Upload success:', result);
    return result;
  },

  // Upload home video
  uploadVideo: async (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    const response = await fetch(`${API_URL}/upload/home-video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await uploadAPI.parseErrorResponse(response);
      throw new Error(message);
    }
    return response.json();
  },
};

// Home Videos API
export const homeVideoAPI = {
  getActive: async () => fetchAPI('/home-videos'),
  getAdmin: async () => fetchAPI('/home-videos/admin'),
  create: async (data: {
    title: string;
    subtitle?: string;
    videoUrl: string;
    posterUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) =>
    fetchAPI('/home-videos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: async (
    id: string,
    data: Partial<{
      title: string;
      subtitle: string;
      videoUrl: string;
      posterUrl: string;
      sortOrder: number;
      isActive: boolean;
    }>
  ) =>
    fetchAPI(`/home-videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: async (id: string) =>
    fetchAPI(`/home-videos/${id}`, {
      method: 'DELETE',
    }),
  reorder: async (orderedIds: string[]) =>
    fetchAPI('/home-videos/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    }),
};
