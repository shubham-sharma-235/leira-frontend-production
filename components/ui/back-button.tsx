"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className="inline-flex items-center gap-2 rounded-full border border-pink-200 px-4 py-2 text-sm font-medium text-pink-700 transition hover:bg-pink-50"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}

