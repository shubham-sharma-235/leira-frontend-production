"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, LogOut, ShoppingBag, Users, Settings, ArrowRight, TrendingUp, BookOpen, Tag, MessageSquare, Mail, Handshake, Film } from "lucide-react";
import { productAPI, userAPI, blogAPI, couponAPI, reviewAPI, contactAPI, orderAPI, collaborationAPI, homeVideoAPI } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, blogs: 0, coupons: 0, reviews: 0, reviewsPending: 0, contactMessages: 0, contactReviews: 0, collaborations: 0, homeVideos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only admin role can access dashboard
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
    } catch {
      router.push('/admin/login');
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productRes, userRes, blogRes, couponRes, reviewRes, contactMessagesRes, contactReviewsRes, orderRes, collaborationRes, homeVideosRes] = await Promise.all([
        productAPI.getAll(),
        userAPI.getAll().catch(() => ({ success: false, data: [], count: 0 })),
        blogAPI.getAll().catch(() => ({ success: false, data: [] })),
        couponAPI.getAll().catch(() => ({ success: false, data: [] })),
        reviewAPI.getAll().catch(() => ({ success: false, data: [] })),
        contactAPI.getMessages().catch(() => ({ success: false, data: [] })),
        contactAPI.getReviews().catch(() => ({ success: false, data: [] })),
        orderAPI.getAdminOrders({ page: 1, limit: 1 }).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        collaborationAPI.getAll().catch(() => ({ success: false, data: [] })),
        homeVideoAPI.getAdmin().catch(() => ({ success: false, data: [] })),
      ]);
      if (productRes.success) {
        setStats(prev => ({ ...prev, products: productRes.data.length }));
      }
      if (userRes.success && (userRes.data || userRes.count !== undefined)) {
        setStats(prev => ({ ...prev, users: userRes.count ?? userRes.data?.length ?? 0 }));
      }
      if (blogRes.success && blogRes.data) {
        setStats(prev => ({ ...prev, blogs: blogRes.data.length }));
      }
      if (couponRes.success && couponRes.data) {
        setStats(prev => ({ ...prev, coupons: couponRes.data.length }));
      }
      if (reviewRes.success && reviewRes.data) {
        const list = reviewRes.data as { status?: string }[];
        const pending = list.filter((r: { status?: string }) => r.status === 'pending').length;
        setStats(prev => ({ ...prev, reviews: list.length, reviewsPending: pending }));
      }
      if (contactMessagesRes.success && contactMessagesRes.data) {
        setStats(prev => ({ ...prev, contactMessages: contactMessagesRes.data.length }));
      }
      if (contactReviewsRes.success && contactReviewsRes.data) {
        setStats(prev => ({ ...prev, contactReviews: contactReviewsRes.data.length }));
      }
      if (orderRes.success) {
        const total = orderRes.pagination?.total ?? orderRes.data?.length ?? 0;
        setStats(prev => ({ ...prev, orders: total }));
      }
      if (collaborationRes.success && collaborationRes.data) {
        setStats(prev => ({ ...prev, collaborations: collaborationRes.data.length }));
      }
      if (homeVideosRes.success && homeVideosRes.data) {
        setStats(prev => ({ ...prev, homeVideos: homeVideosRes.data.length }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Admin not found') || msg.includes('session invalid') || msg.includes('Not authorized')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        router.push('/admin/login');
        return;
      }
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-neutral-900 selection:bg-pink-100 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 lg:py-12">

        {/* Top Bar */}
        <header className="flex items-center justify-between mb-16">
          <div>
            <p className="text-sm font-medium text-neutral-500 tracking-wider uppercase mb-1">Admin Dashboard</p>
            <h1 className="text-3xl lg:text-4xl font-serif font-medium text-neutral-900">
              Good Morning, <span className="italic text-pink-600">Admin</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-100 rounded-full text-sm font-medium text-neutral-600 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-lg shadow-neutral-100/50 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start">
                <div className="bg-pink-50 text-pink-600 p-3 rounded-2xl">
                  <Package size={24} />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={12} /> +12%
                </span>
              </div>
              <div>
                <p className="text-3xl font-serif font-medium text-neutral-900">{stats.products}</p>
                <p className="text-sm text-neutral-500">Total Products</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-lg shadow-neutral-100/50 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start">
                <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl">
                  <ShoppingBag size={24} />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={12} /> +5%
                </span>
              </div>
              <div>
                <p className="text-3xl font-serif font-medium text-neutral-900">{stats.orders}</p>
                <p className="text-sm text-neutral-500">Active Orders</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-lg shadow-neutral-100/50 flex flex-col justify-between h-40 group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                  <Users size={24} />
                </div>
                <span className="text-xs font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-full">
                  Flat
                </span>
              </div>
              <div>
                <p className="text-3xl font-serif font-medium text-neutral-900">{stats.users}</p>
                <p className="text-sm text-neutral-500">Registered Users</p>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-serif text-neutral-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Manage Products Card */}
              <Link href="/admin/products" className="group">
                <motion.div variants={itemVariants} className="bg-neutral-900 text-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-neutral-900/30 transition-all duration-300">
                  <div className="relative z-10 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-pink-600/20 group-hover:text-pink-400 transition-colors">
                    <Package size={24} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-medium mb-2">Manage Products</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Add, edit, or remove products from your inventory.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium border-b border-white/20 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-400 transition-colors">
                      View Inventory <ArrowRight size={14} />
                    </div>
                  </div>

                  {/* Decorative Circle */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors duration-500" />
                </motion.div>
              </Link>

              {/* Manage Orders Card */}
              <Link href="/admin/orders" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="relative z-10 w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-medium mb-2 text-neutral-900">Manage Orders</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed mb-4">Track payments, fulfillment and delivery status updates.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      View Orders <ArrowRight size={14} />
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-50 rounded-full blur-2xl group-hover:bg-pink-100 transition-colors duration-500" />
                </motion.div>
              </Link>

              {/* Manage Blogs Card */}
              <Link href="/admin/blogs" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-medium text-neutral-900">{stats.blogs}</p>
                    <p className="text-sm text-neutral-500 mb-2">Blog Posts</p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Create and manage blog articles.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      Manage Posts <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Reviews Card */}
              <Link href="/admin/reviews" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-medium text-neutral-900">{stats.reviews}</p>
                    <p className="text-sm text-neutral-500 mb-2">Reviews {stats.reviewsPending > 0 && <span className="text-amber-600">({stats.reviewsPending} pending)</span>}</p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Approve or reject product reviews.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      Manage Reviews <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Coupons Card */}
              <Link href="/admin/coupons" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Tag size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-medium text-neutral-900">{stats.coupons}</p>
                    <p className="text-sm text-neutral-500 mb-2">Coupons</p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Create and manage discount codes.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      Manage Coupons <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Contact Messages Card */}
              <Link href="/admin/contact/messages" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-medium text-neutral-900">{stats.contactMessages}</p>
                    <p className="text-sm text-neutral-500 mb-2">Contact Messages</p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Handle customer contact inquiries.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      Open Inbox <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Contact Reviews Card */}
              <Link href="/admin/contact/reviews" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-medium text-neutral-900">{stats.contactReviews}</p>
                    <p className="text-sm text-neutral-500 mb-2">Contact Reviews</p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Approve/reject reviews from contact page.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      Moderate Reviews <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Collaboration Requests Card */}
              <Link href="/admin/collaborations" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <Handshake size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-medium text-neutral-900">{stats.collaborations}</p>
                    <p className="text-sm text-neutral-500 mb-2">Collaborations</p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Manage influencer and brand partnership requests.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      Open Requests <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Users Card */}
              <Link href="/admin/users" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-neutral-900 mb-2">Customers</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Manage user accounts and details.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5">
                      View Users <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Home Videos Card */}
              <Link href="/admin/videos" className="group">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-pink-100 hover:shadow-neutral-900/5">
                  <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
                    <Film size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-medium text-neutral-900">{stats.homeVideos}</p>
                    <p className="text-sm text-neutral-500 mb-2">Home Videos</p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Manage homepage video showcase.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5 group-hover:border-pink-500 group-hover:text-pink-600 transition-colors">
                      Manage Videos <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Settings Card */}
              <Link href="/admin/settings" className="group cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] aspect-square flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-100 opacity-80 hover:opacity-100">
                  <div className="w-12 h-12 bg-neutral-100 text-neutral-600 rounded-2xl flex items-center justify-center">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-neutral-900 mb-2">Settings</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">Configure store preferences.</p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-0.5">
                      Configure <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


