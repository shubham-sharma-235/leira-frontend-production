"use client";

import React, { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   LEIRA — PRELOADER

   A full-screen blush splash shown on first mount. It stays up until
   EITHER the heavy hero graphic has finished loading OR a hard 3s cap
   is reached (whichever comes first), then fades out over 600ms and
   removes itself from the DOM.

   Drop it in once, high in the tree — see the mounting note at the
   bottom of this file. It renders nothing at all after it has faded.

   Nothing here touches your data, hooks, or handlers — it is purely a
   loading overlay.
------------------------------------------------------------------- */

/** The Leira logo (public asset). */
const LOGO_SRC = "/images/logo.png";

/** The heavy hero graphic — when this decodes, the hero is ready.
    Point this at whatever your hero's main image actually is. */
const HERO_IMAGE = "/graphics/g1.png";

/** Hard cap: never hold the splash longer than this, even if the
    image is slow or fails to load. */
const MAX_MS = 3000;

/** How long the fade-out takes before the node is removed. */
const FADE_MS = 600;

export default function Preloader() {
  // `mounted` keeps the node in the DOM; `hidden` drives the fade.
  const [mounted, setMounted] = useState(true);
  const [hidden, setHidden] = useState(false);
  const doneRef = useRef(false);

  // Drive the sweep + pulse with rAF and inline transforms, rather than
  // injected @keyframes — Next can hoist/strip a dangerouslySetInnerHTML
  // <style> so the CSS animation sometimes never applies (bar looks stuck).
  const sweepRef = useRef<HTMLSpanElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const sweepDur = 1250; // ms per sweep pass
    const pulseDur = 1600; // ms per pulse cycle
    const loop = (now: number) => {
      const t = now - start;

      const sweep = sweepRef.current;
      if (sweep) {
        const p = (t % sweepDur) / sweepDur; // 0 → 1
        const x = -120 + p * 440; // -120% → 320%
        sweep.style.transform = `translateX(${x}%)`;
      }

      const logo = logoRef.current;
      if (logo) {
        const pp = (t % pulseDur) / pulseDur; // 0 → 1
        const wave = Math.sin(pp * Math.PI * 2); // -1 → 1
        logo.style.opacity = String(1 - (1 - wave) * 0.07); // ~0.86 → 1
        logo.style.transform = `scale(${1 - (1 - wave) * 0.0125})`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let capTimer = 0;
    let removeTimer = 0;
    let heroImg: HTMLImageElement | null = null;

    // NOTE: we deliberately do NOT lock <body>/<html> overflow. The overlay
    // itself covers the viewport and blocks interaction while visible (see
    // touchAction/overscroll on the rendered node), so there is no scroll to
    // suppress underneath it — and nothing can be left locked afterwards.
    // A previous version toggled body overflow and could leave the page
    // frozen when another component (the hero's sticky audit) rewrote it.

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;

      // fade, then unmount
      setHidden(true);
      removeTimer = window.setTimeout(() => setMounted(false), FADE_MS);
    };

    // Respect reduced-motion: skip the wait, fade immediately.
    let reduce = false;
    try {
      reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      reduce = false;
    }

    if (reduce) {
      finish();
    } else {
      // Preload the heavy hero graphic with a detached Image so we know
      // when it is actually ready to paint.
      try {
        heroImg = new window.Image();
        heroImg.onload = finish;
        heroImg.onerror = finish; // don't hang the site if the asset is missing
        heroImg.src = HERO_IMAGE;
        // Already cached? Some browsers won't fire onload again.
        if (heroImg.complete) finish();
      } catch {
        // If Image construction fails for any reason, fall back to the cap.
      }

      // Hard 3s cap — the splash never outstays this.
      capTimer = window.setTimeout(finish, MAX_MS);
    }

    return () => {
      window.clearTimeout(capTimer);
      window.clearTimeout(removeTimer);
      if (heroImg) {
        heroImg.onload = null;
        heroImg.onerror = null;
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "26px",
        background:
          "linear-gradient(180deg, #fdf1f5 0%, #fff7fa 55%, #fffdfc 100%)",
        opacity: hidden ? 0 : 1,
        // While visible it swallows scroll/touch; the moment it starts
        // fading it becomes fully click-through, so nothing is ever trapped.
        pointerEvents: hidden ? "none" : "auto",
        touchAction: hidden ? "auto" : "none",
        overscrollBehavior: "contain",
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* soft blush glow behind the mark */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "min(60vw, 420px)",
          height: "min(60vw, 420px)",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "rgba(249, 168, 212, 0.28)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      {/* logo */}
      <img
        ref={logoRef}
        src={LOGO_SRC}
        alt="Leira"
        style={{
          position: "relative",
          width: "auto",
          height: "clamp(38px, 9vw, 56px)",
          objectFit: "contain",
          willChange: "transform, opacity",
        }}
      />

      {/* indeterminate sweep line */}
      <span
        aria-hidden
        style={{
          position: "relative",
          width: "clamp(120px, 34vw, 180px)",
          height: "2px",
          borderRadius: "2px",
          overflow: "hidden",
          background: "rgba(122, 44, 78, 0.12)",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: "40%",
            borderRadius: "2px",
            background: "linear-gradient(90deg, #f9a8d4, #ec4899)",
            animation: "leiraPreloaderSweep 1.25s cubic-bezier(0.65, 0, 0.35, 1) infinite",
          }}
        />
      </span>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes leiraPreloaderPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.72; transform: scale(0.975); }
            }
            @keyframes leiraPreloaderSweep {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(320%); }
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes leiraPreloaderPulse { 0%, 100% { opacity: 1; transform: none; } }
              @keyframes leiraPreloaderSweep { 0%, 100% { transform: none; } }
            }
          `,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   HOW TO MOUNT

   Option A — whole site (recommended). In app/layout.tsx, drop it just
   inside <body>, above {children}:

     import Preloader from "@/components/Preloader";
     ...
     <body>
       <Preloader />
       {children}
     </body>

   Option B — home page only. At the top of your home page component's
   returned JSX:

     import Preloader from "@/components/Preloader";
     ...
     return (
       <>
         <Preloader />
         <LeiraHero />
         ...
       </>
     );

   Adjust LOGO_SRC / HERO_IMAGE above if your public asset paths differ.
------------------------------------------------------------------- */