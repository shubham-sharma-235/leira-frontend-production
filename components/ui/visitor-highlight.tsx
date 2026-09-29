"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export function VisitorHighlight() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    // Display-only social proof (~10k range; not a real analytics count)
    setVisitorCount(10000 + Math.floor(Math.random() * 401));
  }, []);

  if (!visitorCount) return null;

  return (
    <section className="relative z-20 bg-[#FAF9F6] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-7xl min-w-0">
        {/* Mobile: full-width strip; sm+: original compact pill (centered in container) */}
        <div className="flex w-full max-w-full items-start gap-3 rounded-2xl border border-pink-200/80 bg-white px-4 py-3 shadow-[0_10px_28px_rgba(236,72,153,0.1)] sm:mx-auto sm:w-fit sm:max-w-none sm:items-center sm:px-5 sm:py-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <Users className="h-4 w-4" />
          </span>
          <p className="min-w-0 text-left text-sm font-medium leading-snug text-neutral-700 sm:leading-normal">
            <span className="font-semibold text-pink-700">
              {visitorCount.toLocaleString("en-IN")}
            </span>{" "}
            people viewed this site
          </p>
        </div>
      </div>
    </section>
  );
}

