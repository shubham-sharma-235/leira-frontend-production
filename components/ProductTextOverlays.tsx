import { motion, MotionValue, useTransform } from "framer-motion";
import { Product } from "@/data/products";

interface ProductTextOverlaysProps {
    product: Product;
    scrollYProgress: MotionValue<number>;
}

export default function ProductTextOverlays({
    product,
    scrollYProgress,
}: ProductTextOverlaysProps) {
    // Define opacity transforms for each section based on scroll progress

    // Section 1: Intro (0 - 0.2)
    const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
    const y1 = useTransform(scrollYProgress, [0, 0.1, 0.2], [0, 0, -50]);
    const scale1 = useTransform(scrollYProgress, [0, 0.1], [0.95, 1]);
    const blur1 = useTransform(scrollYProgress, [0.1, 0.2], ["0px", "10px"]);

    // Section 2: Features (0.2 - 0.4)
    const opacity2 = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
    const y2 = useTransform(scrollYProgress, [0.1, 0.2, 0.4], [50, 0, -50]);
    const blur2 = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], ["10px", "0px", "0px", "10px"]);

    // Section 3: Benefits (0.4 - 0.6)
    const opacity3 = useTransform(scrollYProgress, [0.3, 0.4, 0.5, 0.6], [0, 1, 1, 0]);
    const y3 = useTransform(scrollYProgress, [0.3, 0.4, 0.6], [50, 0, -50]);
    const blur3 = useTransform(scrollYProgress, [0.3, 0.4, 0.5, 0.6], ["10px", "0px", "0px", "10px"]);

    // Section 4: Pure (0.6 - 0.8)
    const opacity4 = useTransform(scrollYProgress, [0.5, 0.6, 0.7, 0.8], [0, 1, 1, 0]);
    const y4 = useTransform(scrollYProgress, [0.5, 0.6, 0.8], [50, 0, -50]);
    const blur4 = useTransform(scrollYProgress, [0.5, 0.6, 0.7, 0.8], ["10px", "0px", "0px", "10px"]);

    // Section 5: Brand Lockup (0.8 - 1.0)
    const opacity5 = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);
    const y5 = useTransform(scrollYProgress, [0.7, 0.8, 1], [50, 0, 0]);
    const blur5 = useTransform(scrollYProgress, [0.7, 0.8], ["10px", "0px"]);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-center items-center text-center text-white p-4">
            {/* Section 1 */}
            <motion.div
                style={{ opacity: opacity1, y: y1, scale: scale1, filter: blur1 }}
                className="absolute top-[40%] -translate-y-1/2 w-full px-4"
            >
                <h1 className="text-7xl md:text-[8rem] font-bold mb-6 tracking-tighter leading-none text-[#fc259b] drop-shadow-2xl">
                    {product.section1.title.replace(".", "")}
                    <span className="text-white">.</span>
                </h1>
                <p className="text-xl md:text-2xl font-light tracking-[0.5em] uppercase text-white">
                    {product.section1.subtitle}
                </p>
            </motion.div>

            {/* Section 2 */}
            <motion.div
                style={{ opacity: opacity2, y: y2, filter: blur2 }}
                className="absolute top-1/2 -translate-y-1/2 max-w-5xl px-4"
            >
                <h2 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight text-[#fc259b]">
                    {product.section2.title}
                </h2>
                <p className="text-2xl md:text-3xl font-light text-white">
                    {product.section2.subtitle}
                </p>
            </motion.div>

            {/* Section 3 */}
            <motion.div
                style={{ opacity: opacity3, y: y3, filter: blur3 }}
                className="absolute top-1/2 -translate-y-1/2 max-w-5xl px-4"
            >
                <h2 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight text-[#fc259b]">
                    {product.section3.title}
                </h2>
                <p className="text-2xl md:text-3xl font-light text-white">
                    {product.section3.subtitle}
                </p>
            </motion.div>

            {/* Section 4 */}
            <motion.div
                style={{ opacity: opacity4, y: y4, filter: blur4 }}
                className="absolute top-1/2 -translate-y-1/2 max-w-6xl px-4"
            >
                <h2 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight text-[#fc259b]">
                    {product.section4.title}
                </h2>
                <p className="text-2xl md:text-3xl font-light text-white">
                    {product.section4.subtitle}
                </p>
            </motion.div>

            {/* Section 5: Brand Lockup */}
            <motion.div
                style={{ opacity: opacity5, y: y5, filter: blur5 }}
                className="absolute top-1/2 -translate-y-1/2 max-w-6xl px-4"
            >
                <h2 className="text-6xl md:text-[9rem] font-black mb-6 tracking-tighter leading-none text-[#fc259b]">
                    {product.section5.title}
                </h2>
                <p className="text-2xl md:text-4xl font-light text-white">
                    {product.section5.subtitle}
                </p>
            </motion.div>
        </div>
    );
}
