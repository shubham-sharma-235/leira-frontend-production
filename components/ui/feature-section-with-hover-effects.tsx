"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Snowflake,
  Heart,
  Wind,
  TreePine,
  Droplet,
} from "lucide-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "COOLING SENSATION",
      description:
        "Provides a gentle, non-irritating cooling effect, which can help relieve discomfort, itchiness, or a feeling of heat in the intimate area.",
      icon: <Snowflake className="size-[1.1rem] sm:size-6" />,
    },
    {
      title: "MENTAL & MOOD UPLIFT",
      description:
        "The aroma of peppermint has a calming and energizing effect, which can help boost confidence and reduce stress—especially during menstruation or intimacy.",
      icon: <Heart className="size-[1.1rem] sm:size-6" />,
    },
    {
      title: "SOOTHING IRRITATION",
      description:
        "Its anti-inflammatory properties can soothe minor irritation, itching, or redness on the outer genital skin (vulva).",
      icon: <Wind className="size-[1.1rem] sm:size-6" />,
    },
    {
      title: "ODOR CONTROL",
      description:
        "By refreshing the area and reducing moisture, it may help with odor control when used in combination with other deodorizing or antibacterial ingredients.",
      icon: <TreePine className="size-[1.1rem] sm:size-6" />,
    },
    {
      title: "ALCOHOL-FREE & 100% ORGANIC",
      description:
        "Leira is formulated with 100% organic essential oils and is completely alcohol-free — making it safe for daily use on your most sensitive intimate area and bikini area. No harsh chemicals. No synthetic additives. Just pure botanical cares your skin can trust.",
      icon: <Droplet className="size-[1.1rem] sm:size-6" />,
    },
    {
      title: "PH BALANCE SUPPORT",
      description:
        "Formulated with gentle botanical ingredients, Leira may help support the intimate area's natural pH balance, promoting long-lasting freshness and everyday comfort without disrupting sensitive skin.",
      icon: <Droplet className="size-[1.1rem] sm:size-6" />,
    },
  ];
  
  return (
    <div className="relative z-10 mx-auto grid min-w-0 max-w-7xl grid-cols-2 gap-3 px-0 py-6 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        "group/feature relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8ddd4]/90 bg-white p-3 shadow-[0_12px_36px_rgba(44,24,24,0.07)] transition-all duration-300 sm:p-7 md:p-8",
        "hover:border-[#c4a08a]/55 hover:shadow-[0_18px_44px_rgba(44,24,24,0.11)]"
      )}
    >
      <div className="relative z-10 mb-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200/90 bg-[#faf7f2] text-[#8b4a5c] shadow-sm transition-all duration-300 group-hover/feature:border-[#8b4a5c]/35 group-hover/feature:bg-[#8b4a5c] group-hover/feature:text-white sm:mb-5 sm:h-12 sm:w-12 sm:rounded-xl">
        {icon}
      </div>

      <div className="relative z-10 mb-1.5 h-px w-8 bg-linear-to-r from-amber-700/45 via-[#8b4a5c]/35 to-transparent transition-all duration-300 group-hover/feature:w-14 sm:mb-2 sm:w-12" />

      <h3 className="relative z-10 mb-2 text-[11px] font-bold uppercase leading-snug tracking-[0.04em] text-[#8b4a5c] transition-colors duration-300 group-hover/feature:text-[#7a4050] sm:mb-3 sm:text-base sm:tracking-[0.06em]">
        {title}
      </h3>

      <p className="relative z-10 text-left text-[11px] leading-snug text-[#333333] transition-colors duration-300 group-hover/feature:text-[#2c2c2c] sm:text-sm sm:leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

