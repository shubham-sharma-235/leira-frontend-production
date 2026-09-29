"use client";

import { useMemo, useState } from "react";

const INK = "text-[#7a2c4e]";
const BODY = "text-[#6b5560]";

type ProductKey = "jasmine" | "ylang-ylang" | "damask-rose";

const PRODUCTS: Record<
    ProductKey,
    { name: string; poetic: string; accent: string; line: string; href: string }
> = {
    jasmine: {
        name: "Leira Jasmine",
        poetic: "Essence of Purity",
        accent: "#ec4899",
        line: "Light, romantic and effortlessly fresh — your everyday companion.",
        href: "/shop/jasmine",
    },
    "ylang-ylang": {
        name: "Leira Ylang Ylang",
        poetic: "Exotic Bliss",
        accent: "#ec4899",
        line: "Bold, warm and quietly confident — for the days that ask more of you.",
        href: "/shop/ylang-ylang",
    },
    "damask-rose": {
        name: "Leira Damask Rose",
        poetic: "Romantic Essence",
        accent: "#b23a63",
        line: "Soft, nourishing and deeply comforting — a gentle daily recovery.",
        href: "/shop/damask-rose",
    },
};

type Question = {
    prompt: string;
    options: { label: string; sub: string; value: ProductKey }[];
};

const QUESTIONS: Question[] = [
    {
        prompt: "What's calling to you right now?",
        options: [
            { label: "Light & floral", sub: "Clean, gentle, familiar", value: "jasmine" },
            { label: "Warm & bold", sub: "Rich, exotic, confident", value: "ylang-ylang" },
            { label: "Soft & romantic", sub: "Delicate, comforting", value: "damask-rose" },
        ],
    },
    {
        prompt: "What matters most today?",
        options: [
            { label: "Everyday freshness", sub: "A quiet daily habit", value: "jasmine" },
            { label: "Confidence for the moment", sub: "Something for tonight", value: "ylang-ylang" },
            { label: "Comfort & recovery", sub: "Gentle, restorative", value: "damask-rose" },
        ],
    },
];

/** small drop-shaped progress marker — the site's own motif, not a generic dot */
function ProgressDrop({ state }: { state: "done" | "current" | "upcoming" }) {
    return (
        <span
            aria-hidden
            className="block h-2.5 w-2.5 rotate-[-45deg] rounded-[50%_50%_50%_0] transition-all duration-500"
            style={{
                background: state === "upcoming" ? "transparent" : "#ec4899",
                border: state === "upcoming" ? "1.5px solid rgba(122,44,78,0.22)" : "1.5px solid transparent",
                transform: `rotate(-45deg) scale(${state === "current" ? 1.25 : 1})`,
                boxShadow: state === "current" ? "0 0 0 5px rgba(236,72,153,0.12)" : "none",
            }}
        />
    );
}

export default function ScentFinderQuiz() {
    const [step, setStep] = useState(0); // 0..QUESTIONS.length-1, then QUESTIONS.length = result
    const [answers, setAnswers] = useState<ProductKey[]>([]);
    const [entering, setEntering] = useState(false);

    const totalSteps = QUESTIONS.length;
    const isResult = step === totalSteps;

    const result = useMemo<ProductKey | null>(() => {
        if (answers.length < totalSteps) return null;
        const tally: Record<ProductKey, number> = { jasmine: 0, "ylang-ylang": 0, "damask-rose": 0 };
        answers.forEach((a) => (tally[a] += 1));
        // tie-break favours the more recent answer — the second question
        // reflects what the person wants "right now" more specifically
        let best: ProductKey = answers[answers.length - 1];
        let bestScore = -1;
        (Object.keys(tally) as ProductKey[]).forEach((k) => {
            if (tally[k] > bestScore) {
                bestScore = tally[k];
                best = k;
            }
        });
        return best;
    }, [answers, totalSteps]);

    const choose = (value: ProductKey) => {
        setEntering(true);
        window.setTimeout(() => {
            setAnswers((prev) => {
                const next = [...prev];
                next[step] = value;
                return next;
            });
            setStep((s) => s + 1);
            setEntering(false);
        }, 260);
    };

    const restart = () => {
        setEntering(true);
        window.setTimeout(() => {
            setAnswers([]);
            setStep(0);
            setEntering(false);
        }, 200);
    };

    const goBack = () => {
        if (step === 0) return;
        setEntering(true);
        window.setTimeout(() => {
            setStep((s) => s - 1);
            setEntering(false);
        }, 200);
    };

    const resultData = result ? PRODUCTS[result] : null;

    return (
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#fdeef4] via-[#fff5f9] to-[#fffdfc] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
            <span
                aria-hidden
                className="pointer-events-none absolute -left-24 top-1/3 -z-10 h-[32vw] max-h-[400px] w-[32vw] max-w-[400px] rounded-full bg-[#f9a8d4]/20 blur-[100px]"
            />

            <div className="mx-auto max-w-xl text-center">
                <span className="inline-flex items-center gap-2.5 rounded-full bg-[#ec4899]/10 px-4 py-1.5 text-[10.5px] uppercase tracking-[0.26em] text-[#ec4899]">
                    <i aria-hidden className="block h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
                    Find your scent
                </span>
                <h2 className={`mt-5 font-serif text-[clamp(26px,3.6vw,38px)] font-light leading-[1.15] ${INK}`}>
                    Two questions. One perfect match.
                </h2>

                {/* progress trail */}
                <div className="mt-8 flex items-center justify-center gap-3">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <ProgressDrop key={i} state={i < step || isResult ? "done" : i === step ? "current" : "upcoming"} />
                    ))}
                </div>

                {/* card */}
                <div
                    className="relative mt-10 min-h-[320px] rounded-[24px] border border-[#7a2c4e]/[0.1] bg-white/80 p-7 shadow-[0_36px_70px_-48px_rgba(122,44,78,0.4)] backdrop-blur-sm sm:p-10"
                >
                    <div
                        className="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ opacity: entering ? 0 : 1, transform: entering ? "translateY(10px)" : "none" }}
                    >
                        {!isResult ? (
                            <>
                                <p className={`font-serif text-[21px] font-light leading-[1.3] ${INK}`}>
                                    {QUESTIONS[step].prompt}
                                </p>

                                <div className="mt-7 grid gap-3">
                                    {QUESTIONS[step].options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => choose(opt.value)}
                                            className="group flex items-center justify-between gap-4 rounded-[14px] border border-[#7a2c4e]/[0.12] bg-white px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ec4899]/40 hover:shadow-[0_16px_32px_-20px_rgba(236,72,153,0.5)]"
                                        >
                                            <span>
                                                <span className={`block font-serif text-[16.5px] font-light ${INK}`}>{opt.label}</span>
                                                <span className={`mt-0.5 block text-[12px] font-light ${BODY}`}>{opt.sub}</span>
                                            </span>
                                            <span
                                                aria-hidden
                                                className="h-2.5 w-2.5 shrink-0 rotate-[-45deg] rounded-[50%_50%_50%_0] border border-[#7a2c4e]/20 transition-all duration-300 group-hover:scale-125 group-hover:border-transparent group-hover:bg-[#ec4899]"
                                            />
                                        </button>
                                    ))}
                                </div>

                                {step > 0 && (
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="mt-6 text-[12px] font-light uppercase tracking-[0.14em] text-[#7a2c4e]/45 transition-colors hover:text-[#ec4899]"
                                    >
                                        ← Back
                                    </button>
                                )}
                            </>
                        ) : resultData ? (
                            <div className="text-center">
                                <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#ec4899]">Your match</span>

                                <div
                                    className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-[50%_50%_50%_0] shadow-[0_18px_34px_-16px_rgba(122,44,78,0.5)]"
                                    style={{ transform: "rotate(-45deg)", background: `linear-gradient(150deg, ${resultData.accent}cc, ${resultData.accent})` }}
                                >
                                    <span style={{ transform: "rotate(45deg)" }} className="font-serif text-[20px] font-light text-white">
                                        {resultData.name.replace("Leira ", "").charAt(0)}
                                    </span>
                                </div>

                                <p className={`mt-5 font-serif text-[26px] font-light ${INK}`}>{resultData.name}</p>
                                <p className="mt-1 font-serif text-[16px] font-light italic text-[#7a2c4e]/50">{resultData.poetic}</p>
                                <p className={`mx-auto mt-4 max-w-[38ch] text-[14px] font-light leading-[1.75] ${BODY}`}>
                                    {resultData.line}
                                </p>

                                <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
                                    <a
                                        href={resultData.href}
                                        className="group relative inline-block overflow-hidden rounded-full px-9 py-3.5 text-[11px] uppercase tracking-[0.22em] text-white transition-transform duration-500 hover:-translate-y-0.5"
                                        style={{ background: resultData.accent }}
                                    >
                                        <span className="relative z-10">Shop {resultData.name.replace("Leira ", "")}</span>
                                        <span aria-hidden className="absolute inset-0 translate-y-full bg-[#2b0f1d] transition-transform duration-500 group-hover:translate-y-0" />
                                    </a>
                                    <button
                                        type="button"
                                        onClick={restart}
                                        className="text-[12px] font-light uppercase tracking-[0.14em] text-[#7a2c4e]/55 transition-colors hover:text-[#ec4899]"
                                    >
                                        Retake quiz
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}