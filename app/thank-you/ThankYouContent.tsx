"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/Footer";
import type { Ga4PurchaseLineItem } from "@/lib/analytics/google";
import ThankYouPixel from "./ThankYouPixel";

const INK = "text-[#7a2c4e]";
const BODY = "text-[#6b5560]";
const HAIR = "border-[#7a2c4e]/[0.12]";
const EASE = [0.22, 1, 0.36, 1] as const;

const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

const NEXT_STEPS = [
    { n: "01", title: "Confirmed", body: "Your order is in — this page is the receipt." },
    { n: "02", title: "Packed", body: "We prepare it in plain, unmarked packaging." },
    { n: "03", title: "On its way", body: "You'll get tracking details the moment it ships." },
];

export default function ThankYouContent(props: {
    orderId?: string;
    orderNumber?: string;
    value: number;
    contentIds: string[];
    numItems: number;
    ga4Items: Ga4PurchaseLineItem[];
}) {
    const { orderId, orderNumber, value, contentIds, numItems, ga4Items } = props;

    return (
        <div className="leira-underlap-nav-spacer min-h-screen bg-white">
            <ThankYouPixel
                orderId={orderId}
                orderNumber={orderNumber}
                value={value}
                contentIds={contentIds}
                numItems={numItems}
                ga4Items={ga4Items}
            />

            <MiniNavbar />

            <main
                className={`
                    relative isolate overflow-hidden bg-gradient-to-b from-[#fdf1f5] via-[#fff7fa] to-[#fffdfc] px-5 py-16 sm:px-8 md:py-24 lg:px-12
                    before:pointer-events-none before:absolute before:-left-24 before:-top-24 before:-z-10
                    before:h-[34vw] before:max-h-[420px] before:w-[34vw] before:max-w-[420px]
                    before:rounded-full before:bg-[#f9a8d4]/[0.22] before:blur-[100px] before:content-['']
                    after:pointer-events-none after:absolute after:-bottom-24 after:-right-20 after:-z-10
                    after:h-[28vw] after:max-h-[360px] after:w-[28vw] after:max-w-[360px]
                    after:rounded-full after:bg-[#ec4899]/[0.14] after:blur-[110px] after:content-['']
                `}
            >
                <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: GRAIN }} />

                <div className="mx-auto max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="text-center"
                    >
                        {/* drop-shaped check mark — the site's own motif, standing in
                            for a generic success icon */}
                        <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                            className="mx-auto flex h-16 w-16 items-center justify-center rounded-[50%_50%_50%_0] shadow-[0_18px_36px_-16px_rgba(236,72,153,0.55)]"
                            style={{ transform: "rotate(-45deg)", background: "linear-gradient(150deg, #f9a8d4, #ec4899)" }}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ transform: "rotate(45deg)" }}
                            >
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        </motion.span>

                        <span className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#ec4899]">
                            <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
                            Thank you
                        </span>

                        <h1 className={`mt-5 font-serif text-[clamp(30px,4.4vw,46px)] font-light leading-[1.1] ${INK}`}>
                            Your order is confirmed.
                        </h1>
                        <p className={`mx-auto mt-4 max-w-[46ch] text-[14.5px] font-light leading-[1.8] ${BODY}`}>
                            We've received your order and will start preparing it right away.
                        </p>

                        {orderNumber && (
                            <div className={`mx-auto mt-8 inline-flex flex-col items-center gap-1 border-t border-b ${HAIR} px-8 py-4`}>
                                <span className="text-[10.5px] uppercase tracking-[0.22em] text-[#ec4899]">Order ID</span>
                                <span className={`font-serif text-[20px] font-light tabular-nums ${INK}`}>{orderNumber}</span>
                            </div>
                        )}
                    </motion.div>

                    {/* ---------------- what happens next ---------------- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                        className={`mt-14 grid gap-x-8 gap-y-8 border-t pt-10 sm:grid-cols-3 ${HAIR}`}
                    >
                        {NEXT_STEPS.map((step) => (
                            <div key={step.n} className="text-center sm:text-left">
                                <span className="text-[11px] tracking-[0.2em] text-[#ec4899]">{step.n}</span>
                                <p className={`mt-2 font-serif text-[17px] font-light ${INK}`}>{step.title}</p>
                                <p className={`mt-1.5 text-[13px] font-light leading-[1.7] ${BODY}`}>{step.body}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* ---------------- actions ---------------- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
                        className="mt-12 flex flex-col gap-3 sm:flex-row"
                    >
                        <Link href="/profile?tab=track-order" className="flex-1">
                            <button className="group relative flex h-13 w-full items-center justify-center overflow-hidden rounded-full bg-[#7a2c4e] text-[11px] uppercase tracking-[0.22em] text-white transition-transform duration-500 hover:-translate-y-0.5">
                                <span className="relative z-10">Track your order</span>
                                <span aria-hidden className="absolute inset-0 translate-y-full bg-[#ec4899] transition-transform duration-500 group-hover:translate-y-0" />
                            </button>
                        </Link>
                        <Link href="/shop" className="flex-1">
                            <button
                                className={`flex h-13 w-full items-center justify-center rounded-full border text-[11px] uppercase tracking-[0.22em] transition-colors duration-400 hover:border-[#ec4899]/50 hover:text-[#ec4899] ${HAIR} ${INK}`}
                            >
                                Continue shopping
                            </button>
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className={`mt-8 text-center text-[12.5px] font-light ${BODY}`}
                    >
                        Need help?{" "}
                        <Link href="/contact" className="border-b border-[#ec4899]/40 pb-0.5 text-[#ec4899] transition-colors hover:border-[#ec4899]">
                            Contact support
                        </Link>
                        .
                    </motion.p>
                </div>
            </main>

            <Footer />
        </div>
    );
}