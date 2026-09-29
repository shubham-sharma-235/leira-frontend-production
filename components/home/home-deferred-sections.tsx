"use client";
import Faq from "@/components/home/faq";
import Testimonials from "./Testimonials";
import Leiracontat from '../ui/Leiracontact'

import Footer from "@/components/Footer";
import {
  FeaturesSection,
  TestimonialsSection,
  FAQSection,
} from "@/components/Sections";

export default function HomeDeferredSections() {
  return (
    <>
      {/* <FeaturesSection /> */}
      {/* <TestimonialsSection /> */}
      <Faq />
      <Testimonials />
      <Leiracontat />
      <Footer />
    </>
  );
}

