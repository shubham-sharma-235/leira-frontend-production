"use client";

import React, { useEffect, useRef } from "react";

/* ------------------------------------------------------------------
   IMAGES — placeholder stock photography (Lorem Picsum serves Unsplash
   photos, so these load without an API key). Swap any entry for a real
   Unsplash URL when you have the shots:
     https://images.unsplash.com/photo-XXXXXXXXXXXXX?w=900&q=80
------------------------------------------------------------------- */
const stock = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const COLLAGE_IMAGES = [
  "/new-images/ls-1.jpg",
  "/new-images/how-to-use-s2.png",
  "/new-images/ls-17.jpeg",
  "/new-images/ls-2.jpg",
  "/new-images/ls-3.jpg",
  "/new-images/ls-15.jpeg",
  "/new-images/pd-2.JPG",
  "/new-images/ls-7.jpg",
  "/new-images/ls-12.jpeg",
  "/new-images/how-to-use-s3.jpg",
  "/new-images/ls-4.jpg",
];

/* Reveal image: desktop + mobile versions.
   Both are rendered, and CSS shows the right one per screen size
   (see .revealDesktop / .revealMobile in the CSS below). */
const LAPTOP_IMAGE = "/graphics/g1.png";
const PHONE_IMAGE = "/graphics/g1-mob.png";
const ABOUT_IMAGE = "/graphics/g2.png";
/* second, smaller frame in the about collage */
const ABOUT_IMAGE_2 = "/new-images/pd-2.JPG";

/* ------------------------------------------------------------------
   TIMING
   REVEAL_END — progress (0–1) at which the image is fully open and the
                collage has cleared. Everything after is pure hold.
   SEAM_START — progress at which the fade into the About background begins.
------------------------------------------------------------------- */
const REVEAL_END = 0.7;
const SEAM_START = 0.8;

type Card = {
  top: string;
  left: string;
  width: string;
  aspectRatio: string;
  dx: number;
  dy: number;
  i: number;
  smHide?: boolean;
};

const CARDS: Card[] = [
  { top: "42%", left: "4%", width: "9vw", aspectRatio: "4 / 5", dx: -60, dy: -6, i: 0 },
  { top: "24%", left: "14%", width: "9.5vw", aspectRatio: "5 / 4", dx: -52, dy: -34, i: 1, smHide: true },
  { top: "14%", left: "26%", width: "10.5vw", aspectRatio: "4 / 5", dx: -46, dy: -30, i: 2 },
  { top: "56%", left: "18%", width: "11vw", aspectRatio: "4 / 5", dx: -50, dy: 30, i: 3, smHide: true },
  { top: "74%", left: "3%", width: "12vw", aspectRatio: "4 / 4", dx: -58, dy: 34, i: 4 },
  { top: "62%", left: "44%", width: "10vw", aspectRatio: "3 / 4", dx: 6, dy: 62, i: 5 },
  { top: "34%", left: "68%", width: "12vw", aspectRatio: "2.8 / 3", dx: 50, dy: -14, i: 6, smHide: true },
  { top: "20%", left: "84%", width: "10vw", aspectRatio: "1 / 1", dx: 56, dy: -36, i: 7 },
  { top: "50%", left: "83%", width: "11vw", aspectRatio: "3 / 4", dx: 54, dy: 26, i: 8, smHide: true },
  { top: "72%", left: "72%", width: "9vw", aspectRatio: "1 / 1", dx: 48, dy: 40, i: 9, smHide: true },
  { top: "22%", left: "56%", width: "9vw", aspectRatio: "1 / 1", dx: 41, dy: 41, i: 10, smHide: true },
];

const TICK_COUNT = 42;

const SPECS = [
  { n: "01", k: "Base", v: "100% organic essential oils" },
  { n: "02", k: "Free from", v: "Alcohol, parabens, synthetics" },
  { n: "03", k: "Formula", v: "pH balanced for intimate skin" },
  { n: "04", k: "Bottle", v: "15 ml precision dropper" },
];

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap");

.leiraRoot {
  font-family: Outfit, Outfit Fallback;
  --font-serif: "Cormorant Garamond", Georgia, serif;
  background: #fff;

  overflow: visible;
  transform: none;
  filter: none;
  perspective: none;
  contain: none;
  will-change: auto;
}

.hero {
  --pink: #ec4899;
  --pink-soft: #f9a8d4;
  --rose-ink: #7a2c4e;
  --body-ink: #6b5560;
  --gold: #ec4899;
  --seam-color: #fffdfc;

  --sticky-top: 0px;

  --stage-h: 100vh;

  background: linear-gradient(
    180deg,
    #fdf1f5 0%,
    #fff7fa 60%,
    #fffdfc 100%
  );

  color: var(--rose-ink);

  -webkit-font-smoothing: antialiased;

  overflow: visible;
  transform: none;
  filter: none;
}
.scroller {
  position: relative;
  height: 360vh;
  overflow: visible;
  transform: none;
}

.stage {
  position: -webkit-sticky;
  position: sticky;
  top: var(--sticky-top);
  height: var(--stage-h);
  min-height: 540px;
  overflow: hidden;
  isolation: isolate;
  /* margin-top: 2rem; */
}

.collage {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.card {
  position: absolute;
  margin: 0;
  transform: translate3d(
    calc(var(--dx) * var(--d) * 1vw),
    calc(var(--dy) * var(--d) * 1vh),
    0
  );
  will-change: transform;
}

.cardInner {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 26px 54px -32px rgba(122, 44, 78, 0.45);
  animation: bob calc(7s + var(--i) * 0.7s) ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.85s);
}
.cardInner img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-11px);
  }
}

.title-he {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  pointer-events: none;
}
.gap {
  width: clamp(104px, 11vw, 150px);
  flex: none;
}

.word {
  font-family: var(--font-serif, "Cormorant Garamond", "Playfair Display", Georgia, serif);
  font-weight: 300;
  font-size: clamp(32px, 5.2vw, 74px);
  line-height: 1;
  letter-spacing: -0.015em;
  white-space: nowrap;
  color: color-mix(in srgb, var(--rose-ink) calc((1 - var(--r)) * 100%), #ffffff);
  will-change: transform;
}
.left {
  transform: translateX(calc(var(--d) * -46vw));
}
.right {
  transform: translateX(calc(var(--d) * 46vw));
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.reveal {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  width: calc(104px + var(--r) * (100vw - 104px));
  height: calc(66px + var(--r) * (var(--stage-h) - 66px));
  transform: translate(-50%, -50%);
  border-radius: calc(18px - var(--r) * 18px);
  overflow: hidden;
  box-shadow: 0 40px 90px -54px rgba(122, 44, 78, 0.5);
  will-change: width, height;
}

/* ---- Reveal images: desktop vs mobile ----
   Both <img> tags are in the DOM; CSS decides which one is visible.
   This is more reliable than <picture> in React/Next.js, where the
   browser sometimes keeps the first image it picked. */
.reveal .revealImg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.reveal .revealDesktop {
  display: block;
}
.reveal .revealMobile {
  display: none;
}

.tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(58, 20, 36, 0.3) 0%,
    rgba(58, 20, 36, 0.04) 42%,
    rgba(58, 20, 36, 0.42) 100%
  );
  opacity: clamp(0, calc(var(--r) * 1.7 - 0.5), 1);
}

.seam {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 46vh;
  z-index: 6;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 253, 252, 0) 0%,
    rgba(255, 253, 252, 0.55) 52%,
    var(--seam-color) 100%
  );
  opacity: var(--s);
}

.cta {
  position: absolute;
  left: 50%;
  bottom: clamp(84px, 12vh, 124px);
  z-index: 7;
  transform: translateX(-50%);
  padding: 13px 32px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--rose-ink) calc((1 - var(--r)) * 45%), #ffffff);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  color: color-mix(in srgb, var(--rose-ink) calc((1 - var(--r)) * 100%), #ffffff);
  transition: background 0.4s ease;
}
.cta:hover {
  background: rgba(255, 255, 255, 0.92);
  color: var(--rose-ink);
}

.meter {
  position: absolute;
  left: 50%;
  bottom: clamp(26px, 5vh, 46px);
  z-index: 7;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  opacity: calc(1 - var(--s));
}
.pct {
  font-size: 10px;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--rose-ink) calc((1 - var(--r)) * 70%), #ffffff);
}
.ticks {
  display: flex;
  gap: 3px;
  align-items: center;
}
.ticks i {
  display: block;
  width: 1px;
  height: 8px;
  background: color-mix(in srgb, var(--rose-ink) calc((1 - var(--r)) * 30%), rgba(255, 255, 255, 0.45));
  transition: height 0.3s ease;
}
.ticks i.on {
  height: 13px;
  background: var(--pink);
}

@media (max-width: 900px) {
  .scroller {
    height: 320vh;
  }
  .smHide {
    display: none;
  }
  .card:nth-of-type(1) {
    top: 16% !important;
    left: 4% !important;
    width: 30vw !important;
  }
  .card:nth-of-type(3) {
    top: 16% !important;
    left: 62% !important;
    width: 30vw !important;
  }
  .card:nth-of-type(5) {
    top: 42% !important;
    left: 4% !important;
    width: 26vw !important;
  }
  .card:nth-of-type(6) {
    top: 44% !important;
    left: 66% !important;
    width: 26vw !important;
  }
  .card:nth-of-type(8) {
    top: 66% !important;
    left: 34% !important;
    width: 30vw !important;
  }
  .title-he {
    flex-direction: column;
  }
  .gap {
    width: auto;
    height: 120px;
  }
  .left {
    transform: translateY(calc(var(--d) * -40vh));
  }
  .right {
    transform: translateY(calc(var(--d) * 40vh));
  }
  /* Mobile reveal: starts as a small portrait box and expands to the
     full screen (width AND height), so the portrait g1-mob image is
     shown whole instead of being cropped into a landscape strip. */
  .reveal {
    width: calc(80px + var(--r) * (100vw - 80px)) !important;
    height: calc(100px + var(--r) * (var(--stage-h) - 100px)) !important;
  }

  /* ---- Swap to the mobile reveal image ---- */
  .reveal .revealDesktop {
    display: none;
  }
  .reveal .revealMobile {
    display: block;
  }

  .cta {
    padding: 10px 22px;
    font-size: 9px;
    width: 55%;
    margin-bottom: 6px;
    text-align: center;
    letter-spacing: 0.14em;
    bottom: clamp(64px, 10vh, 96px);
  }
  .seam {
    height: 38vh;
  }
}

.flat .scroller {
  height: auto;
}
.flat .stage {
  position: static;
  height: 80vh;
}
.flat .collage,
.flat .meter,
.flat .seam {
  display: none;
}
.flat .reveal {
  width: 100%;
  height: 100%;
  border-radius: 0;
}
.flat .tint {
  opacity: 1;
}
.flat .word {
  color: #fff;
  transform: none;
}
.flat .cta {
  color: #fff;
  border-color: #fff;
}
.flat * {
  animation: none !important;
  transition: none !important;
}

.about {
  --pink: #ec4899;
  --pink-soft: #f9a8d4;
  --rose-ink: #7a2c4e;
  --body-ink: #6b5560;
  --gold: #ec4899;
  --hair: rgba(122, 44, 78, 0.12);
  --ap: 0;

  position: relative;
  z-index: 2;
  overflow: hidden;
  isolation: isolate;

  margin-top: clamp(-96px, -7vw, -56px);
  border-radius: calc(46px * (1 - var(--ap))) calc(46px * (1 - var(--ap))) 0 0;
  box-shadow: 0 -34px 70px -34px rgba(122, 44, 78, 0.3);

  padding: clamp(92px, 12vw, 175px) clamp(20px, 6vw, 88px) clamp(40px, 4vw, 70px);
  background: linear-gradient(180deg, #fffdfc 0%, #fff5f9 58%, #fdeef4 100%);
  color: var(--body-ink);
}

.seamDrop {
  position: absolute;
  top: clamp(30px, 4vw, 46px);
  left: 50%;
  width: 15px;
  height: 15px;
  border-radius: 50% 50% 50% 0;
  background: linear-gradient(150deg, var(--pink-soft), var(--pink));
  box-shadow: 0 0 0 7px rgba(236, 72, 153, 0.09);
  transform: translateX(-50%) rotate(-45deg) scale(0);
  transition: transform 0.9s cubic-bezier(0.34, 1.4, 0.5, 1) 0.1s;
}
.in .seamDrop {
  transform: translateX(-50%) rotate(-45deg) scale(1);
}

.about::before {
  content: "";
  position: absolute;
  top: -12%;
  right: -10%;
  width: 46vw;
  height: 46vw;
  max-width: 620px;
  max-height: 620px;
  border-radius: 50%;
  background: rgba(249, 168, 212, 0.3);
  filter: blur(90px);
  z-index: -1;
  pointer-events: none;
  animation: aboutDrift 24s ease-in-out infinite;
}
@keyframes aboutDrift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-40px, 44px, 0) scale(1.12);
  }
}

.aboutTop {
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 34px);
  max-width: 1300px;
  margin: 0 auto clamp(44px, 6vw, 76px);
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.9s ease, transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.in .aboutTop {
  opacity: 1;
  transform: none;
}

.tag {
  flex: none;
  font-size: 11.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--pink);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.in .tag {
  opacity: 1;
  transform: none;
}

.rule {
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(90deg, rgba(216, 176, 106, 0.85), rgba(216, 176, 106, 0.12));
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}
.in .rule {
  transform: scaleX(1);
}

.index {
  flex: none;
  font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
  font-size: 18px;
  letter-spacing: 0.1em;
  color: rgba(122, 44, 78, 0.5);
  opacity: 0;
  transition: opacity 0.7s ease 0.5s;
}
.in .index {
  opacity: 1;
}

.aboutWrap {
  position: relative;
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: clamp(40px, 6vw, 96px);
  align-items: center;
}

.art {
  position: relative;
  padding: 0 clamp(20px, 4vw, 54px) clamp(48px, 7vw, 86px) 0;
}
.artMask {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  aspect-ratio: 4 / 5;
  background: #f7e6ee;
  box-shadow: 0 40px 80px -50px rgba(122, 44, 78, 0.55);
  clip-path: inset(0 0 100% 0);
  transition: clip-path 1.25s cubic-bezier(0.76, 0, 0.24, 1);
}
.in .artMask {
  clip-path: inset(0 0 0 0);
}
.artMask img {
  display: block;
  width: 100%;
  height: 100%;
  will-change: transform;
  filter: blur(14px);
  transition: filter 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}
.in .artMask img {
  filter: blur(0);
}

.artSecondWrap {
  position: absolute;
  right: 0;
  bottom: clamp(16px, 3vw, 34px);
  width: clamp(120px, 17vw, 210px);
  transform: translateY(calc((var(--ap) - 0.5) * -30px));
  will-change: transform;
}
.artSecond {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  border: 6px solid #fffdfc;
  box-shadow: 0 26px 50px -30px rgba(122, 44, 78, 0.5);
  clip-path: inset(0 100% 0 0);
  transition: clip-path 1.1s cubic-bezier(0.76, 0, 0.24, 1) 0.55s;
}
.in .artSecond {
  clip-path: inset(0 0 0 0);
  animation: floatArt 8s ease-in-out infinite 1.8s;
}
.artSecond img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@keyframes floatArt {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.artNote {
  position: absolute;
  left: 0;
  bottom: 0;
  font-size: 11.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7a2c4e;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease 0.85s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.85s;
}
.in .artNote {
  opacity: 1;
  transform: none;
}

.heading {
  margin: 0;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  font-weight: 300;
  font-size: clamp(31px, 4.1vw, 56px);
  line-height: 1.14;
  letter-spacing: -0.014em;
  color: var(--rose-ink);
}
.heading em {
  font-style: italic;
  color: var(--pink);
}
.line {
  display: block;
  overflow: hidden;
}
.line > span {
  display: block;
  transform: translateY(105%);
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.12s + var(--l) * 0.11s);
}
.in .line > span {
  transform: translateY(0);
}

.prose {
  margin-top: clamp(20px, 2.4vw, 30px);
}
.prose p {
  margin: 0 0 16px;
  max-width: 52ch;
  font-size: clamp(15px, 1.12vw, 16.8px);
  font-weight: 300;
  line-height: 1.82;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.8s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.5s + var(--l) * 0.12s);
}
.in .prose p {
  opacity: 1;
  transform: none;
}

.specs {
  display: grid;
  display: none;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 clamp(20px, 3vw, 44px);
  margin: clamp(26px, 3vw, 38px) 0 0;
}
.spec {
  position: relative;
  padding: clamp(16px, 1.8vw, 22px) 0;
  border-top: 1px solid var(--hair);
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.7s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.72s + var(--l) * 0.09s);
}
.in .spec {
  opacity: 1;
  transform: none;
}
.spec::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(216, 176, 106, 0.9), rgba(216, 176, 106, 0.1));
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1), background 0.45s ease;
  transition-delay: calc(0.78s + var(--l) * 0.11s), 0s;
}
.in .spec::after {
  transform: scaleX(1);
}
.spec:hover::after {
  background: linear-gradient(90deg, var(--pink), var(--pink-soft));
}
.spec dd {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.spec:hover dd {
  transform: translateX(5px);
}
.specNum {
  display: block;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  color: rgba(216, 176, 106, 0.9);
  margin-bottom: 8px;
}
.spec dt {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(122, 44, 78, 0.55);
  margin-bottom: 5px;
}
.spec dd {
  margin: 0;
  font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
  font-size: clamp(17px, 1.4vw, 21px);
  line-height: 1.3;
  color: var(--rose-ink);
}

.pull {
  position: relative;
  margin: clamp(30px, 3.6vw, 46px) 0 0;
  padding-left: clamp(20px, 2.4vw, 30px);
  font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
  font-style: italic;
  font-size: clamp(21px, 2vw, 29px);
  line-height: 1.4;
  color: var(--rose-ink);
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.8s ease 1.05s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 1.05s;
}
.in .pull {
  opacity: 1;
  transform: none;
}
.pull::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: linear-gradient(180deg, var(--gold), rgba(216, 176, 106, 0.15));
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1) 1.2s;
}
.in .pull::before {
  transform: scaleY(1);
}

.link {
  position: relative;
  display: inline-block;
  margin-top: clamp(24px, 3vw, 34px);
  padding-bottom: 6px;
  font-family: var(--font-serif, "Cormorant Garamond", Georgia, serif);
  font-size: 22px;
  color: var(--rose-ink);
  text-decoration: none;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.7s ease 1.3s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 1.3s,
    color 0.35s ease;
}
.in .link {
  opacity: 1;
  transform: none;
}
.link::before,
.link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  width: 100%;
}
.link::before {
  background: rgba(216, 176, 106, 0.6);
}
.link::after {
  background: var(--pink);
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.link:hover {
  color: var(--pink);
}
.link:hover::after {
  transform: scaleX(1);
  transform-origin: left center;
}

@media (max-width: 900px) {
  .aboutWrap {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .art {
    max-width: 460px;
    padding-right: clamp(40px, 12vw, 70px);
  }
  .index {
    display: none;
  }
  .specs {
    gap: 0 24px;
  }
}

@media (max-width: 560px) {
  .specs {
    grid-template-columns: 1fr;
  }
  .artSecond {
    width: 44vw;
  }
  .artSecondWrap {
    right: 20%;
  }
  .aboutWrap {
    grid-gap: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .about *,
  .about *::before,
  .about *::after {
    transition: none !important;
    animation: none !important;
  }
  .artMask,
  .artSecond {
    clip-path: none;
  }
  .about {
    margin-top: 0;
    border-radius: 0;
  }
  .artMask img {
    filter: none;
  }
  .artSecondWrap,
  .seamDrop,
  .aboutTop {
    transform: none;
    opacity: 1;
  }
  .tag,
  .index,
  .artNote,
  .prose p,
  .spec,
  .pull,
  .link {
    opacity: 1;
    transform: none;
  }
  .rule,
  .pull::before {
    transform: none;
  }
  .line > span {
    transform: none;
  }
}
`;

function auditStickyAncestors(el: HTMLElement, autofix: boolean, debug: boolean) {
  const blockers: { el: HTMLElement; reason: string; fixed: boolean }[] = [];
  let node: HTMLElement | null = el.parentElement;

  while (node && node !== document.documentElement) {
    const cs = getComputedStyle(node);

    const clipsY = cs.overflowY !== "visible" && cs.overflowY !== "clip";
    const clipsX = cs.overflowX !== "visible" && cs.overflowX !== "clip";
    if (clipsY || clipsX) {
      const scrolls =
        (clipsY && node.scrollHeight > node.clientHeight + 1) ||
        (clipsX && node.scrollWidth > node.clientWidth + 1);

      const forcedAutoY = cs.overflowX === "hidden" && cs.overflowY === "auto";
      const forcedAutoX = cs.overflowY === "hidden" && cs.overflowX === "auto";

      const convertible =
        !scrolls &&
        (forcedAutoY ||
          forcedAutoX ||
          ((!clipsY || cs.overflowY === "hidden") &&
            (!clipsX || cs.overflowX === "hidden")));

      if (autofix && convertible) {
        if (forcedAutoY) {
          node.style.overflowX = "clip";
          node.style.overflowY = "visible";
        } else if (forcedAutoX) {
          node.style.overflowY = "clip";
          node.style.overflowX = "visible";
        } else {
          if (clipsX) node.style.overflowX = "clip";
          if (clipsY) node.style.overflowY = "clip";
        }
        blockers.push({ el: node, reason: "overflow:hidden → clip", fixed: true });
      } else {
        blockers.push({
          el: node,
          reason: `overflow ${cs.overflowX}/${cs.overflowY}`,
          fixed: false,
        });
      }
    }

    const cbReasons: string[] = [];
    if (cs.transform !== "none") cbReasons.push("transform");
    if (cs.filter !== "none") cbReasons.push("filter");
    if (cs.perspective !== "none") cbReasons.push("perspective");
    if (cs.backdropFilter && cs.backdropFilter !== "none") cbReasons.push("backdrop-filter");
    if (cs.contain.includes("paint") || cs.contain.includes("layout"))
      cbReasons.push(`contain:${cs.contain}`);
    if (/transform|filter|perspective/.test(cs.willChange)) cbReasons.push("will-change");
    if (cbReasons.length) {
      blockers.push({ el: node, reason: cbReasons.join(", "), fixed: false });
    }

    node = node.parentElement;
  }

  [document.documentElement, document.body].forEach((n) => {
    const cs = getComputedStyle(n);
    if (cs.overflowX === "hidden") {
      if (autofix) {
        (n as HTMLElement).style.overflowX = "clip";
        blockers.push({ el: n as HTMLElement, reason: "overflow-x:hidden → clip", fixed: true });
      } else {
        blockers.push({ el: n as HTMLElement, reason: "overflow-x:hidden", fixed: false });
      }
    }
  });

  if (debug || blockers.some((b) => !b.fixed)) {
    const unfixed = blockers.filter((b) => !b.fixed);
    if (unfixed.length) {
      // eslint-disable-next-line no-console
      console.warn(
        "[LeiraHero] These ancestors break position:sticky and must be changed in your own CSS:",
        unfixed.map((b) => ({ element: b.el, problem: b.reason }))
      );
    }
    if (debug) {
      // eslint-disable-next-line no-console
      console.info("[LeiraHero] sticky audit", blockers);
    }
  }

  return blockers;
}

function getScrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    const cs = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(cs.overflowY) && node.scrollHeight > node.clientHeight)
      return node;
    node = node.parentElement;
  }
  return null;
}

type Props = {
  stickyTop?: number;
  autoFixSticky?: boolean;
  debug?: boolean;
};

export default function LeiraHero({
  stickyTop = 0,
  autoFixSticky = true,
  debug = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ticksRef = useRef<HTMLSpanElement | null>(null);
  const pctRef = useRef<HTMLSpanElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const artRef = useRef<HTMLDivElement | null>(null);
  const artImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const scroller = scrollerRef.current;
    const stage = stageRef.current;
    const about = aboutRef.current;
    const art = artRef.current;
    const artImg = artImgRef.current;
    const pct = pctRef.current;
    if (!root || !hero || !scroller || !stage || !about || !art || !artImg || !pct) return;

    auditStickyAncestors(root, autoFixSticky, debug);

    hero.style.setProperty("--sticky-top", stickyTop + "px");

    const scrollParent = getScrollParent(root);
    const ticks: HTMLElement[] = Array.prototype.slice.call(
      ticksRef.current ? ticksRef.current.querySelectorAll("i") : []
    );

    let target = 0;
    let current = 0;
    let raf = 0;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    const viewH = () => (scrollParent ? scrollParent.clientHeight : innerHeight) - stickyTop;

    let observer: IntersectionObserver | null = null;
    if (reduce) {
      about.classList.add("in");
    } else {
      observer = new IntersectionObserver(
        (es, o) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              about.classList.add("in");
              o.disconnect();
            }
          }),
        { root: scrollParent, threshold: 0.25 }
      );
      observer.observe(about);
    }

    function measure() {
      const vh = viewH();
      hero!.style.setProperty("--stage-h", vh + "px");

      const r = scroller!.getBoundingClientRect();
      const top = scrollParent
        ? r.top - scrollParent.getBoundingClientRect().top - stickyTop
        : r.top - stickyTop;
      const d = r.height - vh;
      if (d > 0) target = clamp01(-top / d);
    }

    function paint() {
      const a = clamp01(current / REVEAL_END);
      const seam = clamp01((current - SEAM_START) / (1 - SEAM_START));

      stage!.style.setProperty("--p", String(current));
      stage!.style.setProperty("--r", String(a));
      stage!.style.setProperty("--d", String(Math.pow(a, 1.35)));
      stage!.style.setProperty("--s", String(seam));

      ticks.forEach((t, i) => t.classList.toggle("on", i / ticks.length <= a));
      pct!.textContent = Math.round(a * 100) + "%";
    }

    function tick() {
      const diff = target - current;
      if (Math.abs(diff) > 0.0004) {
        current += diff * 0.12;
        paint();
      }
      if (!reduce) {
        const r2 = art!.getBoundingClientRect();
        const c = r2.top + r2.height / 2 - innerHeight / 2;
        const s = Math.max(-40, Math.min(40, (-c / innerHeight) * 46));
        artImg!.style.transform = "translate3d(0," + s.toFixed(1) + "px,0) scale(1)";

        const ra = about!.getBoundingClientRect();
        const vh2 = viewH();
        const ap = clamp01((vh2 - ra.top) / (vh2 * 0.55));
        about!.style.setProperty("--ap", ap.toFixed(4));
      }
      raf = requestAnimationFrame(tick);
    }

    measure();
    paint();
    raf = requestAnimationFrame(tick);

    document.addEventListener("scroll", measure, { passive: true, capture: true });
    addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("scroll", measure, true);
      removeEventListener("resize", measure);
      ro.disconnect();
      if (observer) observer.disconnect();
    };
  }, [stickyTop, autoFixSticky, debug]);

  return (
    <div className="leiraRoot" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="hero" aria-label="Leira" ref={heroRef}>
        <div className="scroller" ref={scrollerRef}>
          <div
            className="stage"
            ref={stageRef}
            style={{ "--p": 0, "--r": 0, "--d": 0, "--s": 0 } as React.CSSProperties}
          >
            <div className="collage" aria-hidden="true">
              {CARDS.map((c) => (
                <figure
                  key={c.i}
                  className={c.smHide ? "card smHide" : "card"}
                  style={
                    {
                      top: c.top,
                      left: c.left,
                      width: c.width,
                      aspectRatio: c.aspectRatio,
                      "--dx": c.dx,
                      "--dy": c.dy,
                      "--i": c.i,
                    } as React.CSSProperties
                  }
                >
                  <span className="cardInner">
                    <img src={COLLAGE_IMAGES[c.i]} alt="" loading="lazy" />
                  </span>
                </figure>
              ))}
            </div>

            <div className="title-he" aria-hidden="true">
              <span className="word left">Leira</span>
              <span className="gap" />
              <span className="word right">India</span>
            </div>

            <h1 className="sr">
              Leira &mdash; India&apos;s first intimate perfume for women
            </h1>

            {/* FIX: two separate images instead of <picture>.
                CSS shows .revealDesktop above 900px and .revealMobile
                at 900px and below. */}
            <div className="reveal">
              <img
                className="revealImg revealDesktop"
                src={LAPTOP_IMAGE}
                alt="The Leira collection"
              />
              <img
                className="revealImg revealMobile"
                src={PHONE_IMAGE}
                alt="The Leira collection"
              />
              <span className="tint" aria-hidden="true" />
            </div>

            <div className="seam" aria-hidden="true" />

            <a className="cta" href="/shop">
              Explore the collection
            </a>

            <div className="meter" aria-hidden="true">
              <span className="pct" ref={pctRef}>
                0%
              </span>
              <span className="ticks" ref={ticksRef}>
                {Array.from({ length: TICK_COUNT }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* ================= ABOUT ================= */}
        <div className="about" ref={aboutRef}>
          {/* <span className="seamDrop" aria-hidden="true" /> */}
          <div className="aboutWrap">
            <div className="art" ref={artRef}>
              <div className="artMask">
                <img
                  ref={artImgRef}
                  src={ABOUT_IMAGE}
                  alt="The Leira bottle with botanicals"
                  style={{ transform: "translate3d(0,0,0) scale(1)" }}
                />
              </div>

              <div className="artSecondWrap" aria-hidden="true">
                <div className="artSecond">
                  <img src={ABOUT_IMAGE_2} alt="" loading="lazy" />
                </div>
              </div>

              <span className="artNote">Damask Rose &middot; Jasmine &middot; Ylang Ylang</span>
            </div>

            <div className="text">
              <h2 className="heading">
                <span className="line" style={{ "--l": 0 } as React.CSSProperties}>
                  <span>Discover Leira | Natural</span>
                </span>
                <span className="line" style={{ "--l": 1 } as React.CSSProperties}>
                  <span> Intimate Perfume for</span>
                </span>
                <span className="line" style={{ "--l": 2 } as React.CSSProperties}>
                  <span>
                    <em> Women</em>.
                  </span>
                </span>
              </h2>

              <div className="prose">
                <p style={{ "--l": 0 } as React.CSSProperties}>
                  Leira is India&apos;s first essential oil based intimate perfume, made for
                  the woman who treats care as something deliberate rather than something
                  rushed. Damask Rose, Jasmine and Ylang Ylang, blended to sit close to the
                  skin and stay there.
                </p>
                <p style={{ "--l": 1 } as React.CSSProperties}>
                  No alcohol, no parabens, nothing synthetic. Two drops from the glass
                  dropper after your shower is the entire routine &mdash; everything else it
                  does, it does quietly, all day.
                </p>
              </div>

              <dl className="specs">
                {SPECS.map((s, i) => (
                  <div
                    className="spec"
                    key={s.k}
                    style={{ "--l": i } as React.CSSProperties}
                  >
                    <span className="specNum">{s.n}</span>
                    <dt>{s.k}</dt>
                    <dd>{s.v}</dd>
                  </div>
                ))}
              </dl>

              <a className="link" href="/shop">
                Shop the collection
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}