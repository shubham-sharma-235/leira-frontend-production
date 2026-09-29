"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin') {
        // Redirect to dashboard if already logged in
        router.push('/admin/dashboard');
      } else {
        // Redirect to login if not admin
        router.push('/admin/login');
      }
    } else {
      // Redirect to login if not logged in
      router.push('/admin/login');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

