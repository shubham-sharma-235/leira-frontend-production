"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";

interface AboutFeaturesSectionProps {
  imageSrc: string;
  imageAlt?: string;
  heading?: string;
  features?: string[];
}

export function AboutFeaturesSection({ 
  imageSrc, 
  imageAlt = "Leira Product Features",
  heading = "Leira Premium Feature Set",
  features = [
    "pH-conscious formula designed for intimate-area comfort",
    "Natural ingredient profile for gentle daily self-care",
    "Luxurious subtle scent crafted for inner confidence",
    "Fast-absorbing, non-staining, lightweight application",
    "Skin-conscious daily routine support for personal hygiene",
    "Portable premium bottle for confidence on the go"
  ]
}: AboutFeaturesSectionProps) {
  return (
    <section className="bg-white py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text Content - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-pink-600 leading-[1.2] tracking-tight"
            >
              {heading}
            </motion.h2>

            {/* Features List */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-1 shrink-0">
                    <Check className="w-5 h-5 text-pink-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {feature}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Image - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover object-center"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

