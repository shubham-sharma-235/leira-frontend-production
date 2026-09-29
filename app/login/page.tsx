"use client";

import { Suspense } from "react";
import { SignInFlo } from "@/components/ui/sign-in-flo";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  return (
    <>
      <MiniNavbar />
      <div className="leira-underlap-nav-spacer min-h-[60vh]" style={{ backgroundColor: "#FAF9F6" }}>
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <SignInFlo />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}

