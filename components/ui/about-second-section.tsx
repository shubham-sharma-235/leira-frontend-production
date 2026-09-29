"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AboutSecondSectionProps {
  imageSrc: string;
  imageAlt?: string;
  smallHeading?: string;
  mainHeading?: string;
  description?: string;
  closingLine?: string;
}

export function AboutSecondSection({ 
  imageSrc, 
  imageAlt = "About Leira",
  smallHeading = "feel good inside and out",
  mainHeading = "Let's Talk about beauty",
  description = "True beauty starts from within — and that includes how you feel in your most intimate moments. At Leira, we believe feminine wellness is not just about hygiene, but about comfort, confidence, and self-respect. Crafted with care and powered by nature, our products support a healthy intimate balance while giving you the gentle nourishment your body deserves.",
  closingLine = "Because when you feel good, you glow differently."
}: AboutSecondSectionProps) {
  return (
    <section className="bg-white py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover object-center"
              loading="lazy"
            />
          </motion.div>

          {/* Text Content - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 order-1 lg:order-2"
          >
            {/* Small Heading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs md:text-sm text-gray-400 font-medium tracking-[0.15em] uppercase"
            >
              {smallHeading}
            </motion.p>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-pink-600 leading-[1.2] tracking-tight"
            >
              {mainHeading}
            </motion.h2>

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm md:text-base text-gray-500 leading-relaxed max-w-xl"
            >
              {description}
            </motion.p>

            {/* Closing Line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base md:text-lg text-gray-700 font-medium italic pt-2"
            >
              {closingLine}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

