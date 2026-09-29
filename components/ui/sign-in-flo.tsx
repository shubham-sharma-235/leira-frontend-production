"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Phone, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "@/lib/api";

interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const fieldRectRef = useRef<DOMRect | null>(null);

  const updateFieldRect = (el: EventTarget & HTMLDivElement) => {
    fieldRectRef.current = el.getBoundingClientRect();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = fieldRectRef.current;
    if (!rect) return;
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
        onMouseMove={handleMouseMove}
        onMouseEnter={(e) => {
          updateFieldRect(e.currentTarget);
          setIsHovering(true);
        }}
        onMouseLeave={() => setIsHovering(false)}
        whileFocus={{ borderColor: "#ec4899", boxShadow: "0 0 0 3px rgba(236, 72, 153, 0.1)" }}
      >
        <motion.div
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200"
          animate={{ color: isFocused ? "#ec4899" : "#9ca3af" }}
        >
          {icon}
        </motion.div>

        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent pl-10 pr-12 pt-6 pb-2 text-sm text-gray-900 placeholder:text-transparent focus:outline-none"
          placeholder=""
        />

        <motion.label
          className="absolute left-10 pointer-events-none text-gray-500 origin-[0]"
          animate={{
            top: isFocused || value ? "8px" : "50%",
            scale: isFocused || value ? 0.75 : 1,
            color: isFocused ? "#ec4899" : "#6b7280",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ transform: isFocused || value ? "translateY(0)" : "translateY(-50%)" }}
        >
          {placeholder}
        </motion.label>

        {showToggle && (
          <motion.button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </motion.button>
        )}

        <AnimatePresence>
          {isHovering && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(236, 72, 153, 0.08) 0%, transparent 70%)`
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const SocialButton: React.FC<{ icon: React.ReactNode; name: string }> = ({ icon, name }) => {
  return (
    <motion.button
      className="relative group p-2.5 rounded-lg border border-gray-200 bg-white hover:border-pink-300 transition-all duration-300 ease-in-out overflow-hidden"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10"
        initial={{ x: "-100%" }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.4 }}
      />
      <div className="relative text-gray-600 group-hover:text-pink-600 transition-colors">
        {icon}
      </div>
    </motion.button>
  );
};

const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.15 + 0.05;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        const cw = canvas?.width || window.innerWidth;
        const ch = canvas?.height || window.innerHeight;

        if (this.x > cw) this.x = 0;
        if (this.x < 0) this.x = cw;
        if (this.y > ch) this.y = 0;
        if (this.y < 0) this.y = ch;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(236, 72, 153, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export const SignInFlo: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const q = searchParams.get("signup");
    const r = searchParams.get("register");
    const wantSignUp =
      q === "1" || q === "true" || r === "1" || r === "true";
    setIsSignUp(wantSignUp);
  }, [searchParams]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");
  const [showMobileFlow, setShowMobileFlow] = useState(false);
  const [mobileName, setMobileName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileSubmitting, setMobileSubmitting] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileRequestId, setMobileRequestId] = useState("");
  const [mobileCooldown, setMobileCooldown] = useState(0);

  useEffect(() => {
    if (mobileCooldown <= 0) return;
    const timer = setInterval(() => {
      setMobileCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [mobileCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (isSignUp) {
      if (password !== confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setFormError("Password must be at least 6 characters");
        return;
      }
      if (contactNumber.replace(/\D/g, "").length !== 10) {
        setFormError("Enter a valid 10-digit contact number");
        return;
      }
    }
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const res = await authAPI.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: contactNumber.replace(/\D/g, ""),
          password,
        });
        if (res.success && res.data) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem(
              "user",
              JSON.stringify({
                _id: res.data._id,
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
                role: res.data.role,
              })
            );
            window.dispatchEvent(new Event("userLoggedIn"));
          }
          router.push("/");
        }
      } else {
        const res = await authAPI.login({
          email: email.trim().toLowerCase(),
          password,
        });
        if (res.success && res.data) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem(
              "user",
              JSON.stringify({
                _id: res.data._id,
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
                role: res.data.role,
              })
            );
            window.dispatchEvent(new Event("userLoggedIn"));
          }
          router.push("/");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setName("");
    setContactNumber("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormError("");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center pt-6 pb-8 px-4 relative overflow-hidden">
      <FloatingParticles />

      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-orange-50/30 pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-white/98 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Premium glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10" />

          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl mb-3 relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl blur-sm" />
              <User className="w-6 h-6 text-pink-600 relative z-10" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-gray-500">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp ? (
              <>
                <AnimatedFormField
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User size={18} />}
                />
                <AnimatedFormField
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                />
                <AnimatedFormField
                  type="tel"
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={(e) =>
                    setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  icon={<Phone size={18} />}
                />
                <AnimatedFormField
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  showToggle
                  onToggle={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                />
                <AnimatedFormField
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  showToggle
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  showPassword={showConfirmPassword}
                />
              </>
            ) : (
              <>
                <AnimatedFormField
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                />
                <AnimatedFormField
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  showToggle
                  onToggle={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                />
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500 focus:ring-1 cursor-pointer"
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <motion.button
                    type="button"
                    className="text-xs text-pink-600 hover:text-pink-700 hover:underline transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    Forgot password?
                  </motion.button>
                </div>
              </>
            )}

            {formError && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group bg-gradient-to-r from-pink-600 to-pink-500 text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out hover:from-pink-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`relative z-10 transition-opacity duration-200 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>

              {isSubmitting && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </motion.div>
              )}

              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </motion.button>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <motion.button
                type="button"
                onClick={() => setShowMobileFlow(true)}
                className="relative group w-full flex items-center justify-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-white hover:border-pink-300 transition-all duration-300 ease-in-out overflow-hidden text-gray-700 hover:text-pink-600"
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <Phone size={20} className="relative" />
                <span className="relative font-medium text-sm">Continue with Mobile Number</span>
              </motion.button>
            </div>
          </div>

          <motion.div
            className="mt-5 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <motion.button
                type="button"
                onClick={toggleMode}
                className="text-pink-600 hover:text-pink-700 font-medium hover:underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </motion.button>
            </p>
          </motion.div>

          {/* Mobile Number flow overlay - opens on "Continue with Mobile Number" click */}
          <AnimatePresence>
            {showMobileFlow && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 bg-white rounded-2xl p-6 flex flex-col z-20"
              >
                {/* Back Button */}
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowMobileFlow(false);
                    setMobileName("");
                    setMobileNumber("");
                    setMobileSubmitting(false);
                    setMobileOtp("");
                    setMobileOtpSent(false);
                    setMobileRequestId("");
                    setMobileCooldown(0);
                    setFormError("");
                  }}
                  className="absolute top-5 left-5 flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={16} />
                </motion.button>

                <div className="flex-1 flex flex-col items-center justify-center mb-2">
                  {/* Phone Icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 rounded-[14px] bg-pink-50 flex items-center justify-center mb-4"
                  >
                    <Phone className="w-6 h-6 text-[#eb196e]" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-lg font-bold text-[#111827] text-center mb-1.5"
                  >
                    {isSignUp ? 'Sign up with Mobile Number' : 'Sign in with Mobile Number'}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-[#6b7280] text-center mb-6"
                  >
                    {mobileOtpSent ? "Enter OTP sent to your mobile number" : "Enter your name and 10-digit mobile number"}
                  </motion.p>

                  {!mobileOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.23 }}
                      className="relative w-full mb-3 rounded-xl border border-gray-200 bg-white focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/10 transition-all flex items-center px-4"
                    >
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <input
                        type="text"
                        autoComplete="name"
                        maxLength={80}
                        placeholder="Full name"
                        value={mobileName}
                        onChange={(e) => setMobileName(e.target.value.replace(/\s+/g, " ").slice(0, 80))}
                        className="w-full py-3 text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none bg-transparent"
                      />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative w-full rounded-xl border border-gray-200 bg-white focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/10 transition-all flex items-center px-4"
                  >
                    <span className="text-gray-400 font-medium text-sm mr-3 border-r border-gray-200 pr-3 py-3">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full py-3 text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none bg-transparent"
                    />
                  </motion.div>

                  {mobileOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 }}
                      className="relative w-full mt-3 rounded-xl border border-gray-200 bg-white focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/10 transition-all flex items-center px-4"
                    >
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={mobileOtp}
                        onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full py-3 text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none bg-transparent"
                      />
                    </motion.div>
                  )}

                  {mobileOtpSent && (
                    <p className="mt-2 text-xs text-gray-500 w-full text-left">
                      {mobileCooldown > 0
                        ? `Resend OTP in ${mobileCooldown}s`
                        : "Didn't receive OTP? You can resend now."}
                    </p>
                  )}

                  <motion.button
                    type="button"
                    disabled={
                      (!mobileOtpSent && mobileName.trim().length < 2) ||
                      mobileNumber.length !== 10 ||
                      mobileSubmitting ||
                      (!mobileOtpSent ? mobileCooldown > 0 : false)
                    }
                    onClick={async () => {
                      setFormError("");
                      if (!mobileOtpSent) {
                        if (mobileName.trim().length < 2) {
                          setFormError("Please enter your full name");
                          return;
                        }
                        setMobileSubmitting(true);
                        try {
                          const res = await authAPI.sendPhoneOtp(mobileNumber);
                          if (res?.success) {
                            setMobileRequestId(res?.data?.requestId || "");
                            setMobileOtpSent(true);
                            setMobileOtp("");
                            const retryAfter = Number(res?.retryAfter || 0);
                            setMobileCooldown(retryAfter > 0 ? retryAfter : 30);
                          }
                        } catch (err: unknown) {
                          const message = err instanceof Error ? err.message : "Could not send OTP";
                          setFormError(message);
                        } finally {
                          setMobileSubmitting(false);
                        }
                        return;
                      }

                      if (mobileOtp.length < 4) {
                        setFormError("Please enter valid OTP");
                        return;
                      }
                      if (!mobileRequestId) {
                        setFormError("OTP session expired. Please resend OTP.");
                        return;
                      }

                      setMobileSubmitting(true);
                      try {
                        const res = await authAPI.verifyPhoneOtp({
                          requestId: mobileRequestId,
                          otp: mobileOtp,
                          name: mobileName.trim(),
                        });
                        if (res?.success && res?.data) {
                          if (typeof window !== "undefined") {
                            localStorage.setItem("token", res.data.token);
                            localStorage.setItem(
                              "user",
                              JSON.stringify({
                                _id: res.data._id,
                                name: res.data.name,
                                email: res.data.email,
                                phone: res.data.phone,
                                role: res.data.role,
                              })
                            );
                            window.dispatchEvent(new Event("userLoggedIn"));
                          }
                          router.push("/");
                        }
                      } catch (err: unknown) {
                        const message = err instanceof Error ? err.message : "OTP verification failed";
                        setFormError(message);
                      } finally {
                        setMobileSubmitting(false);
                      }
                    }}
                    className="mt-5 w-full bg-[#eb196e] hover:bg-[#d61362] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {mobileSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      mobileOtpSent ? "Verify OTP & Login" : "Send OTP"
                    )}
                  </motion.button>

                  {mobileOtpSent && (
                    <motion.button
                      type="button"
                      disabled={mobileCooldown > 0 || mobileSubmitting}
                      onClick={async () => {
                        setFormError("");
                        setMobileSubmitting(true);
                        try {
                          const res = await authAPI.sendPhoneOtp(mobileNumber);
                          if (res?.success) {
                            setMobileRequestId(res?.data?.requestId || "");
                            setMobileOtp("");
                            setMobileCooldown(30);
                          }
                        } catch (err: unknown) {
                          const message = err instanceof Error ? err.message : "Could not resend OTP";
                          setFormError(message);
                        } finally {
                          setMobileSubmitting(false);
                        }
                      }}
                      className="mt-2 w-full bg-white border border-pink-200 text-pink-700 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      Resend OTP
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

