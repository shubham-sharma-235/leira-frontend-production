export interface Product {
  id: string;
  name: string;
  subName: string;
  price: string;
  description: string;
  folderPath: string;
  themeColor: string;
  gradient: string;
  features: string[];
  stats: { label: string; val: string }[];
  section1: { title: string; subtitle: string };
  section2: { title: string; subtitle: string };
  section3: { title: string; subtitle: string };
  section4: { title: string; subtitle: string };
  section5: { title: string; subtitle: string };
  introducingSection: {
    subtitle: string; // "INTRODUCING"
    title: string; // "THE ESSENCE OF YOU"
    paragraph1: string;
    paragraph2: string;
    paragraph3?: string;
    bottleImage?: string; // Optional bottle image path
  };
  detailsSection: { title: string; description: string; imageAlt: string };
  freshnessSection: { title: string; description: string };
  buyNowSection: {
    price: string;
    unit: string;
    processingParams: string[];
    deliveryPromise: string;
    returnPolicy: string;
  };
  animationCutoff?: number; // Optional cutoff point (0-1) for scroll animation
  backgroundColor?: string; // Optional background color for the canvas/container
  bgFit?: "contain" | "cover"; // Scale mode for the image
}

export const products: Product[] = [
  {
    id: "jasmine",
    name: "Jasmine",
    subName: "Calming floral scent.",
    price: "₹2999",
    description: "Pure Jasmine Extract - Soothing Aroma",
    folderPath: "/images/Jasmine",
    themeColor: "#FFB300", // Brighter gold for dark mode
    animationCutoff: 0.8, // End scroll at "Leira" scene
    backgroundColor: "#ffffff", // White background to merge with video
    bgFit: "cover", // Ensure full screen fill
    gradient: "radial-gradient(circle at center, #2a1c0a 0%, #000000 70%)",
    features: ["Calming", "Floral", "Pure Extract"],
    stats: [
      { label: "Purity", val: "100%" },
      { label: "Origin", val: "India" },
      { label: "Type", val: "Oil" },
    ],
    section1: { title: "Jasmine.", subtitle: "Nature's calm, captured in a bottle." },
    section2: {
      title: "Pure Floral Essence.",
      subtitle:
        "Delicately crafted from the soul of jasmine blossoms.",
    },
    section3: {
      title: "Inner Beauty, Awakened.",
      subtitle:
        "A soothing aroma that balances the mind and senses.",
    },
    section4: { title: "Timeless. Elegant. Sensual.", subtitle: "Designed to be felt, not just worn." },
    section5: { title: "LEIRA", subtitle: "Eau de Bijou · Inner Beauty Perfume" },
    introducingSection: {
      subtitle: "INTRODUCING",
      title: "Discover Leira | Natural Intimate Perfume for Women in India",
      paragraph1:
        "Leira is India's first essential oil-based intimate perfume, crafted exclusively for the modern woman who values elegance, freshness, and natural self-care. Formulated with a luxurious blend of Damask Rose, Jasmine, and Ylang Ylang, Leira is more than a fragrance - it's a daily ritual of confidence.",
      paragraph2:
        "Unlike conventional feminine care products, Leira is 100% organic, alcohol-free, and pH-friendly, designed to gently nourish delicate skin while delivering a long-lasting, sensual aroma that moves with you throughout the day. Each 15ml precision bottle is crafted for hygienic, controlled application - because you deserve nothing less than luxury.",
      paragraph3:
        "Whether you're preparing for a quiet morning, a long day at work, or a romantic evening, Leira enhances your natural scent with soft botanical sophistication. No irritation. No chemicals. Just pure, intimate confidence - bottled. Welcome to the essence of you.",
      bottleImage: "/images/Jasmine/1.jpg", // Using first frame as bottle image
    },
    detailsSection: {
      title: "The King of Fruits",
      description:
        "Our Cream Mango juice uses only the finest Ratnagiri Alphonso mangoes. Known for their rich sweetness and vibrant color, these mangoes are cold-pressed within hours of harvest to preserve every drop of nutrient-rich goodness. It's not just juice; it's a liquid gold experience.",
      imageAlt: "Mango Details",
    },
    freshnessSection: {
      title: "Farm to Bottle",
      description:
        "We believe in absolute transparency. From the orchard to the bottle, our process is designed to minimize oxidation and maximize flavor. HPP (High Pressure Processing) ensures that our juice stays safe and fresh without any heat treatment, keeping the vital enzymes and vitamins intact.",
    },
    buyNowSection: {
      price: "₹2999",
      unit: "per 15ml bottle",
      processingParams: ["Cold Pressed", "Never Heated", "HPP Treated"],
      deliveryPromise:
        "Next-day delivery available in metro cities. Chilled packaging ensures peak freshness.",
      returnPolicy:
        "100% Satisfaction Guarantee. Not happy? We'll replace it, no questions asked.",
    },
  },
  {
    id: "ylang-ylang",
    name: "Ylang Ylang",
    subName: "Exotic fragrance.",
    price: "₹2999",
    description: "Rich Aroma - Essential Oil - Therapeutic",
    folderPath: "/images/Yang",
    themeColor: "#D7CCC8", // Light beige/silver for luxury contrast against dark
    gradient: "radial-gradient(circle at center, #1a1512 0%, #000000 70%)",
    features: ["Exotic", "Therapeutic", "Rich"],
    stats: [
      { label: "Purity", val: "100%" },
      { label: "Grade", val: "A+" },
      { label: "Scent", val: "Strong" },
    ],
    section1: { title: "Ylang Ylang.", subtitle: "Exotic bliss." },
    section2: {
      title: "Pure Indulgence.",
      subtitle:
        "A rich floral aroma that soothes the senses and elevates the soul.",
    },
    section3: {
      title: "Sensual Harmony.",
      subtitle:
        "An intoxicating blend that calms the mind and awakens inner confidence.",
    },
    section4: { title: "Luxury, Reimagined.", subtitle: "Crafted for moments of quiet power and timeless elegance." },
    section5: { title: "LEIRA", subtitle: "Eau de Bijou · Inner Beauty Perfume" },
    introducingSection: {
      subtitle: "INTRODUCING",
      title: "Discover Leira | Natural Intimate Perfume for Women in India",
      paragraph1:
        "Leira is India's first essential oil-based intimate perfume, crafted exclusively for the modern woman who values elegance, freshness, and natural self-care. Formulated with a luxurious blend of Damask Rose, Jasmine, and Ylang Ylang, Leira is more than a fragrance - it's a daily ritual of confidence.",
      paragraph2:
        "Unlike conventional feminine care products, Leira is 100% organic, alcohol-free, and pH-friendly, designed to gently nourish delicate skin while delivering a long-lasting, sensual aroma that moves with you throughout the day. Each 15ml precision bottle is crafted for hygienic, controlled application - because you deserve nothing less than luxury.",
      paragraph3:
        "Whether you're preparing for a quiet morning, a long day at work, or a romantic evening, Leira enhances your natural scent with soft botanical sophistication. No irritation. No chemicals. Just pure, intimate confidence - bottled. Welcome to the essence of you.",
      bottleImage: "/images/Yang/1.jpg",
    },
    detailsSection: {
      title: "Ethically Sourced Cocoa",
      description:
        "We source our cocoa from sustainable farms in Ghana, ensuring fair wages and premium quality. Blended with our house-made almond milk, this drink offers a silky texture that rivals traditional dairy shakes, but with zero cholesterol and 100% plant-based goodness.",
      imageAlt: "Chocolate Details",
    },
    freshnessSection: {
      title: "Cold-Crafted Perfection",
      description:
        "Heat destroys delicate cocoa flavonoids. That's why we mix our Dutch Chocolate cold. Our almond milk is pressed fresh daily, never stored. The result is a clean, robust chocolate flavor that feels heavy on the tongue but light on the stomach.",
    },
    buyNowSection: {
      price: "₹2999",
      unit: "per 15ml bottle",
      processingParams: ["Plant Based", "Cold Blended", "Dairy Free"],
      deliveryPromise:
        "Shipped in insulated eco-friendly coolers. Keeps perfectly cold for 48 hours.",
      returnPolicy: "Taste the difference or get your money back.",
    },
  },
  {
    id: "damask-rose",
    name: "Damask Rose",
    subName: "Romantic essence.",
    price: "₹2999",
    description: "Classic Scent - Pure Rose Water - Refreshing",
    folderPath: "/images/Damask",
    themeColor: "#FF5252", // Vibrant red pop
    gradient: "radial-gradient(circle at center, #2c0b0e 0%, #000000 70%)",
    features: ["Classic", "Refreshing", "Pure"],
    stats: [
      { label: "Purity", val: "100%" },
      { label: "Origin", val: "Bulgaria" },
      { label: "Type", val: "Water" },
    ],
    section1: { title: "Damask Rose.", subtitle: "Timeless. Romantic. Iconic." },
    section2: {
      title: "A Bloom in Motion.",
      subtitle:
        "Velvety Damask rose unfolding with depth, warmth, and sensuality.",
    },
    section3: {
      title: "Emotion, Bottled.",
      subtitle:
        "A fragrance that soothes the heart and lingers on the soul.",
    },
    section4: { title: "Pure Essence. Pure Indulgence.", subtitle: "" },
    section5: { title: "LEIRA", subtitle: "Eau de Bijou · Inner Beauty Perfume" },
    introducingSection: {
      subtitle: "INTRODUCING",
      title: "Discover Leira | Natural Intimate Perfume for Women in India",
      paragraph1:
        "Leira is India's first essential oil-based intimate perfume, crafted exclusively for the modern woman who values elegance, freshness, and natural self-care. Formulated with a luxurious blend of Damask Rose, Jasmine, and Ylang Ylang, Leira is more than a fragrance - it's a daily ritual of confidence.",
      paragraph2:
        "Unlike conventional feminine care products, Leira is 100% organic, alcohol-free, and pH-friendly, designed to gently nourish delicate skin while delivering a long-lasting, sensual aroma that moves with you throughout the day. Each 15ml precision bottle is crafted for hygienic, controlled application - because you deserve nothing less than luxury.",
      paragraph3:
        "Whether you're preparing for a quiet morning, a long day at work, or a romantic evening, Leira enhances your natural scent with soft botanical sophistication. No irritation. No chemicals. Just pure, intimate confidence - bottled. Welcome to the essence of you.",
      bottleImage: "/images/Damask/1.jpg",
    },
    detailsSection: {
      title: "The Ruby Elixir",
      description:
        "Each bottle contains the juice of over 1 kg of premium pomegranates. We use a gentle pressing method to extract the juice from the arils without crushing the bitter pith. This results in a sweet, complex flavor profile that is unmatched by commercial concentrates.",
      imageAlt: "Pomegranate Details",
    },
    freshnessSection: {
      title: "Potent Preservation",
      description:
        "Pomegranate juice is highly sensitive to light and air. Our bottling line is designed to shield the juice from oxidation at every step. We bottle immediately after pressing to lock in the vibrant color and the potent punicalagins—unique antioxidants found only in pomegranate.",
    },
    buyNowSection: {
      price: "₹150",
      unit: "per 15ml bottle",
      processingParams: ["Cold Pressed", "Oxidation Shield", "No Additives"],
      deliveryPromise:
        "Direct from the pressery to your doorstep. Guaranteed fresh upon arrival.",
      returnPolicy: "Damaged in transit? Instant replacement available.",
    },
  },
];
