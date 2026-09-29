"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { motion, type Variants } from "framer-motion";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.adminLogin({ email, password });

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 font-sans selection:bg-pink-100 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-pink-100/50 border border-white/60">
          <motion.div variants={itemVariants} className="text-center mb-10">
            {/* Brand Mark with Pulse */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-pink-100 rounded-2xl blur-md"
              />
              <div className="relative w-full h-full bg-gradient-to-br from-white to-pink-50 rounded-2xl flex items-center justify-center shadow-sm border border-pink-100">
                <Lock className="w-6 h-6 text-pink-600" />
              </div>
            </div>

            <h1 className="text-3xl font-serif font-medium text-neutral-900 mb-2 tracking-tight">
              Admin <span className="italic text-pink-600">Portal</span>
            </h1>
            <p className="text-sm text-neutral-500 font-light tracking-wide">
              Secure Access
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm backdrop-blur-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-xs font-bold text-pink-900/50 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-600 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-pink-100/50 rounded-2xl text-neutral-900 placeholder:text-pink-200 focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100/50 outline-none transition-all duration-300 shadow-sm"
                  placeholder="admin@leira.com"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-xs font-bold text-pink-900/50 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-600 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-pink-100/50 rounded-2xl text-neutral-900 placeholder:text-pink-200 focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100/50 outline-none transition-all duration-300 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white py-4 rounded-2xl font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.1 }}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                </span>
              ) : 'Access Dashboard'}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-xs text-pink-300 font-medium">
              LEIRA INTERNAL SYSTEM
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
