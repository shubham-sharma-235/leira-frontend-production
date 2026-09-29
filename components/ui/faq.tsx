"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Calendar, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconWrap =
  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#faf3f4] text-[#8b4a5c] ring-1 ring-[#e8ddd4]/80";

type FAQItem = {
  id: string;
  icon: React.ReactNode;
  question: string;
  answer: string;
};

export default function FAQs() {
  const faqItems: FAQItem[] = [
    {
      id: "item-1",
      icon: <Shield className="size-4" strokeWidth={1.75} />,
      question: "Is this a substitute for hygiene?",
      answer:
        "No. Leira is a finishing touch, to complement—not replace—your daily cleansing.",
    },
    {
      id: "item-2",
      icon: <Calendar className="size-4" strokeWidth={1.75} />,
      question: "Can I use it every day?",
      answer:
        "Yes. Begin with a patch test; once you're comfortable, enjoy daily as part of your self-care ritual.",
    },
    {
      id: "item-3",
      icon: <AlertCircle className="size-4" strokeWidth={1.75} />,
      question: "What if my skin is sensitive?",
      answer:
        "Apply sparingly on less delicate areas (such as the hip line). Avoid freshly shaved skin; allow at least 24 hours before use.",
    },
    {
      id: "item-4",
      icon: <CheckCircle className="size-4" strokeWidth={1.75} />,
      question: "Is Leira safe for daily use?",
      answer:
        "Yes. Leira is designed for gentle, everyday use. Start with a small amount and continue daily once your skin feels comfortable.",
    },
    {
      id: "item-6",
      icon: <Sparkles className="size-4" strokeWidth={1.75} />,
      question: "Does it help with odor control?",
      answer:
        "Yes. By keeping the area fresh and balanced, Leira may help reduce unwanted odor when used as part of your daily self-care ritual.",
    },
  ];

  return (
    <section
      className="relative z-10 overflow-hidden bg-[#faf7f2] px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-8"
      aria-labelledby="faq-heading"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(139, 74, 92, 0.06) 0%, transparent 55%), radial-gradient(ellipse 70% 40% at 100% 100%, rgba(92, 45, 45, 0.05) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto min-w-0 max-w-6xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16 xl:gap-20">
          <motion.div
            className="lg:w-[40%] lg:max-w-md lg:shrink-0"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
          >
            <div className="lg:sticky lg:top-28">
              <div className="inline-flex rounded-lg border border-[#e8ddd4] bg-[#F5E8EB] px-3.5 py-1.5">
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c2d2d]"
                  )}
                >
                  FAQ
                </span>
              </div>
              <h2
                id="faq-heading"
                className="mt-5 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-[#5c2d2d] sm:text-4xl"
              >
                Frequently Asked Questions
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#5c3d35]/90">
                Can&apos;t find what you&apos;re looking for? Contact our{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-[#8b4a5c] underline decoration-[#8b4a5c]/35 underline-offset-2 transition-colors hover:text-[#6d3a4a] hover:decoration-[#6d3a4a]/50"
                >
                  customer support team
                </Link>
                .
              </p>
            </div>
          </motion.div>

          <motion.div
            className="min-w-0 flex-1"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <Accordion type="single" collapsible className="flex w-full flex-col gap-3 sm:gap-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <AccordionItem
                    value={item.id}
                    className="overflow-hidden rounded-xl border-0 border-b-0 bg-white shadow-[0_8px_28px_rgba(44,24,24,0.07)] ring-1 ring-[#e8ddd4]/90 transition-shadow duration-300 data-[state=open]:shadow-[0_12px_36px_rgba(44,24,24,0.1)]"
                  >
                    <AccordionTrigger className="px-4 py-4 text-left hover:no-underline sm:px-5 sm:py-5 [&>svg]:shrink-0 [&>svg]:text-[#8b4a5c] [&>svg]:opacity-80">
                      <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4">
                        <span className={iconWrap}>{item.icon}</span>
                        <span className="pt-0.5 text-left text-[15px] font-semibold leading-snug text-[#2c1818] sm:text-base">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                      <div className="border-t border-[#f0ebe3] pt-4">
                        <div className="flex gap-3 sm:gap-4">
                          <span className="w-9 shrink-0" aria-hidden="true" />
                          <p className="min-w-0 text-[15px] leading-relaxed text-[#5c3d35]/95">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
