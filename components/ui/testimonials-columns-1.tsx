"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Playfair_Display, Montserrat } from "next/font/google";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { contactAPI, reviewAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const testimonialPlayfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const testimonialMontserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

export type Testimonial = {
  text: string;
  name: string;
  role: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

function useCardsPerView() {
  const [n, setN] = useState(1);

  useEffect(() => {
    const read = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      if (w >= 1024) setN(3);
      else if (w >= 768) setN(2);
      else setN(1);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return n;
}

function GoldStars() {
  return (
    <div className="flex justify-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" strokeWidth={0} />
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-[#E8E2D9] bg-white p-6 shadow-[0_1px_3px_rgba(31,26,22,0.06)] md:p-7"
      )}
    >
      <GoldStars />
      <blockquote
        className={cn(
          testimonialPlayfair.className,
          "mt-5 flex-1 text-center text-[0.9375rem] font-normal italic leading-relaxed text-[#1F1A16] md:text-[1.0625rem] md:leading-[1.55]"
        )}
      >
        &ldquo;{item.text}&rdquo;
      </blockquote>
      <div className="mt-6 flex items-center gap-3 border-t border-[#F0EBE3] pt-5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#F5E6E9] to-[#F5EBDD] text-xs font-semibold text-[#5C4A42]",
            testimonialMontserrat.className
          )}
          aria-hidden="true"
        >
          {initialsFromName(item.name)}
        </div>
        <div className="min-w-0 text-left">
          <p className={cn(testimonialMontserrat.className, "text-sm font-medium text-[#1F1A16]")}>
            — {item.name}
          </p>
          <p className={cn(testimonialMontserrat.className, "mt-0.5 text-xs font-normal text-[#6B6560]")}>
            {item.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsPerView = useCardsPerView();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [productRes, contactRes] = await Promise.all([
          reviewAPI.getFeatured(12),
          contactAPI.getApprovedFeatured(12),
        ]);

        type Merged = Testimonial & { sortAt: number };

        const fromProducts: Merged[] = (Array.isArray(productRes?.data) ? productRes.data : [])
          .map((item: { comment?: string; userName?: string; productName?: string; createdAt?: string }) => {
            const comment = String(item?.comment || "").trim();
            const name = String(item?.userName || "Verified Customer").trim() || "Verified Customer";
            const productName = String(item?.productName || "").trim();
            const sortAt = item?.createdAt ? new Date(item.createdAt).getTime() : 0;
            return {
              text: comment,
              name,
              role: productName ? `Verified Buyer • ${productName}` : "Verified Buyer",
              sortAt,
            };
          })
          .filter((item: Merged) => item.text.length > 0);

        const fromContact: Merged[] = (Array.isArray(contactRes?.data) ? contactRes.data : [])
          .map((item: { review?: string; firstName?: string; lastName?: string; createdAt?: string }) => {
            const text = String(item?.review || "").trim();
            const name =
              `${String(item?.firstName || "").trim()} ${String(item?.lastName || "").trim()}`.trim() ||
              "Verified Customer";
            const sortAt = item?.createdAt ? new Date(item.createdAt).getTime() : 0;
            return {
              text,
              name,
              role: "Verified Buyer",
              sortAt,
            };
          })
          .filter((item: Merged) => item.text.length > 0);

        const seen = new Set<string>();
        const merged = [...fromProducts, ...fromContact]
          .sort((a, b) => b.sortAt - a.sortAt)
          .filter((item) => {
            const key = `${item.name.toLowerCase()}|${item.text.slice(0, 80).toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 16)
          .map(({ text, name, role }) => ({ text, name, role }));

        if (mounted) {
          setTestimonials(merged);
        }
      } catch {
        if (mounted) {
          setTestimonials([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const slides = useMemo(() => {
    if (!testimonials.length) return [];
    return testimonials.slice(0, 8);
  }, [testimonials]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex > slides.length - 1) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  const visibleIndices = useMemo(() => {
    const total = slides.length;
    if (!total) return [];
    const k = Math.min(cardsPerView, total);
    return Array.from({ length: k }, (_, i) => (activeIndex + i) % total);
  }, [slides.length, cardsPerView, activeIndex]);

  if (!slides.length) return null;

  const canNavigate = slides.length > 1;

  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative z-10 overflow-hidden bg-[#F7F3EC] px-4 py-12 sm:px-6 sm:py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p
          className={cn(
            testimonialMontserrat.className,
            "text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5c3d35]/85"
          )}
        >
          Testimonials
        </p>
        <h2
          className={cn(
            testimonialPlayfair.className,
            "mt-4 text-center text-2xl font-semibold uppercase leading-tight tracking-[0.12em] text-[#5c2d2d] sm:text-3xl md:text-[2rem] md:tracking-[0.14em]"
          )}
        >
          Loved by Women Everywhere
        </h2>

        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 px-4">
          <span className="h-px min-w-0 flex-1 bg-[#5c2d2d]/18" />
          <Heart className="h-3.5 w-3.5 shrink-0 fill-none text-[#B94A63]" strokeWidth={1.5} />
          <span className="h-px min-w-0 flex-1 bg-[#5c2d2d]/18" />
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl">
          <div className="flex items-stretch gap-2 sm:gap-3 md:gap-4 lg:items-center">
            {canNavigate ? (
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonials"
                className={cn(
                  testimonialMontserrat.className,
                  "hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#B94A63] bg-[#FCE8ED] text-[#B94A63] shadow-sm transition-colors hover:bg-[#FAD6E0] sm:flex md:h-12 md:w-12"
                )}
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
            ) : (
              <span className="hidden w-11 shrink-0 sm:block md:w-12" aria-hidden="true" />
            )}

            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeIndex}-${cardsPerView}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    "grid gap-4",
                    cardsPerView === 3 && "lg:grid-cols-3",
                    cardsPerView === 2 && "md:grid-cols-2",
                    cardsPerView === 1 && "grid-cols-1"
                  )}
                >
                  {visibleIndices.map((idx) => (
                    <TestimonialCard key={`${slides[idx].name}-${idx}`} item={slides[idx]} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {canNavigate ? (
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonials"
                className={cn(
                  testimonialMontserrat.className,
                  "hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#B94A63] bg-[#FCE8ED] text-[#B94A63] shadow-sm transition-colors hover:bg-[#FAD6E0] sm:flex md:h-12 md:w-12"
                )}
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            ) : (
              <span className="hidden w-11 shrink-0 sm:block md:w-12" aria-hidden="true" />
            )}
          </div>

          {canNavigate && (
            <>
              <div className="mt-4 flex justify-center gap-6 sm:hidden">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous testimonials"
                  className={cn(
                    testimonialMontserrat.className,
                    "flex h-11 w-11 items-center justify-center rounded-full border border-[#B94A63] bg-[#FCE8ED] text-[#B94A63] transition-colors hover:bg-[#FAD6E0]"
                  )}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next testimonials"
                  className={cn(
                    testimonialMontserrat.className,
                    "flex h-11 w-11 items-center justify-center rounded-full border border-[#B94A63] bg-[#FCE8ED] text-[#B94A63] transition-colors hover:bg-[#FAD6E0]"
                  )}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to testimonial ${idx + 1}`}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-all",
                      idx === activeIndex
                        ? "scale-110 bg-[#B6405C] shadow-sm"
                        : "border border-[#B94A63] bg-transparent"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
