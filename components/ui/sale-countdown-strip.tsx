"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getSaleEndDate,
  isSaleCountdownEnabled,
  SALE_COUNTDOWN_STRIP_HEIGHT_PX,
} from "@/lib/sale-countdown";

function setSaleBarInsetPx(px: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--leira-sale-bar-h",
    px > 0 ? `${px}px` : "0px"
  );
}

function SlidingDigit({ digit }: { digit: string }) {
  return (
    <div className="relative h-7 w-6 overflow-hidden rounded-[5px] border border-white/10 bg-white/6 sm:h-8 sm:w-7">
      <AnimatePresence initial={false}>
        <motion.span
          key={digit}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-[0.9rem] font-semibold tabular-nums tracking-tight text-white sm:text-[1.05rem]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function digitCells(n: number, pad: number) {
  const capped =
    pad === 2 ? Math.min(99, Math.max(0, n)) : Math.min(999, Math.max(0, n));
  const s = capped.toString().padStart(pad, "0");
  return s.split("");
}

function UnitBlock({
  label,
  chars,
}: {
  label: string;
  chars: string[];
}) {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-1.5">
      <div className="flex gap-1">
        {chars.map((ch, i) => (
          <SlidingDigit key={`${label}-${i}`} digit={ch} />
        ))}
      </div>
      <span className="text-[0.5rem] font-medium tracking-[0.2em] text-white/70 sm:text-[0.55rem]">
        {label}
      </span>
    </div>
  );
}

function useCountdown(target: Date) {
  // Important: keep initial render stable for SSR hydration.
  // We compute remaining time only after the component mounts on the client.
  const [remain, setRemain] = React.useState(0);

  React.useEffect(() => {
    const tick = () =>
      setRemain(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const totalSec = Math.floor(remain / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { done: remain <= 0, days, hours, minutes, seconds, totalSec };
}

export function SaleCountdownStrip() {
  const enabled = false;
  const target = React.useMemo(() => getSaleEndDate(), []);
  const headline =
    process.env.NEXT_PUBLIC_SALE_COUNTDOWN_HEADLINE?.trim() ||
    "Big Sale Ends In";
  const stripRef = React.useRef<HTMLElement | null>(null);

  const { done, days, hours, minutes, seconds } = useCountdown(target);
  const headlineTitleCase = React.useMemo(() => {
    const s = String(headline || "").trim();
    if (!s) return s;
    return s
      .split(/\s+/g)
      .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(" ");
  }, [headline]);

  React.useLayoutEffect(() => {
    if (!enabled || done) {
      setSaleBarInsetPx(0);
      return;
    }

    const el = stripRef.current;
    if (!el) {
      setSaleBarInsetPx(SALE_COUNTDOWN_STRIP_HEIGHT_PX);
      return;
    }

    const apply = () => setSaleBarInsetPx(el.offsetHeight);
    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);

    return () => {
      ro.disconnect();
      setSaleBarInsetPx(0);
    };
  }, [enabled, done]);

  if (!enabled || done) return null;

  const dayPad = days >= 100 ? 3 : 2;

  return (
    <aside
      ref={(node) => {
        stripRef.current = node;
      }}
      className="fixed left-0 right-0 z-40 border-b border-white/10 bg-[#050505] px-3 py-2 sm:px-4 sm:py-2.5"
      style={{
        top: 0,
        minHeight: SALE_COUNTDOWN_STRIP_HEIGHT_PX,
      }}
      aria-label="Sale ends in"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 sm:gap-1.5">
        <p className="text-center text-[0.6rem] font-medium tracking-[0.18em] text-white/85 sm:text-[0.7rem]">
          {headlineTitleCase}
        </p>
        <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4 md:gap-6">
          <UnitBlock label="DAYS" chars={digitCells(days, dayPad)} />
          <UnitBlock label="HH" chars={digitCells(hours, 2)} />
          <UnitBlock label="MM" chars={digitCells(minutes, 2)} />
          <UnitBlock label="SS" chars={digitCells(seconds, 2)} />
        </div>
      </div>
    </aside>
  );
}
