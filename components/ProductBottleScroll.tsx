"use client";

import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { Product } from "@/data/products";
import ProductTextOverlays from "./ProductTextOverlays";

interface Props {
    product: Product;
    products?: Product[];
    currentIndex?: number;
    onProductChange?: (index: number) => void;
    onPrevProduct?: () => void;
    onNextProduct?: () => void;
}

export default function ProductBottleScroll({ product, products, currentIndex, onProductChange, onPrevProduct, onNextProduct }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [scrollReady, setScrollReady] = useState(false);
    useEffect(() => setScrollReady(true), []);

    const { scrollYProgress } = useScroll({
        target: scrollReady ? containerRef : undefined,
        offset: ["start start", "end end"],
    });

    // Heavier spring physics for "luxurious" weight
    const smoothProgress = useSpring(scrollYProgress, {
        mass: 0.2,
        stiffness: 80,
        damping: 25,
        restDelta: 0.0001,
    });

    // Map smooth progress (0-1) to the actual animation range (0 - cutoff)
    const cutoff = product.animationCutoff || 1;
    const activeProgress = useTransform(smoothProgress, [0, 1], [0, cutoff]);

    const frameIndex = useTransform(activeProgress, [0, 1], [0, 239]);

    useEffect(() => {
        // Preload images
        const loadImages = async () => {
            setLoaded(false);
            const importedImages: HTMLImageElement[] = [];
            const promises = [];

            // Only load needed frames if cutoff < 1 to save bandwidth?
            // Ideally load all for smoothness, or optimize.
            // For now, loading all 240 is safer to avoid index errors if logic changes.
            for (let i = 1; i <= 240; i++) {
                const promise = new Promise<void>((resolve) => {
                    const img = new Image();
                    img.src = `${product.folderPath}/${i}.jpg`;
                    img.onload = () => resolve();
                    img.onerror = () => {
                        console.warn(`Failed to load ${img.src}`);
                        resolve();
                    };
                    importedImages[i - 1] = img;
                });
                promises.push(promise);
            }

            await Promise.all(promises);
            setImages(importedImages);
            setLoaded(true);
        };

        loadImages();
    }, [product.folderPath]);

    // Determine background color
    const bgColor = product.backgroundColor || "#000000";
    const isLightMode = bgColor === "#ffffff";

    useEffect(() => {
        if (!loaded || !canvasRef.current || images.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false }); // Optimize for no transparency if possible
        if (!ctx) return;

        // Resize handler
        const handleResize = () => {
            // Set canvas size to match display size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        const render = () => {
            const frameStart = frameIndex.get();
            let idx = Math.floor(frameStart);
            idx = Math.max(0, Math.min(239, idx));

            const img = images[idx];

            // Clear with dynamic background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (!img) {
                requestAnimationFrame(render);
                return;
            }

            // Draw scale logic based on bgFit
            const w = canvas.width;
            const h = canvas.height;
            const imgW = img.width;
            const imgH = img.height;

            const scale = product.bgFit === "cover"
                ? Math.max(w / imgW, h / imgH)
                : Math.min(w / imgW, h / imgH);

            const drawW = imgW * scale;
            const drawH = imgH * scale;

            // Center the image
            const x = (w - drawW) / 2;
            const y = (h - drawH) / 2;

            ctx.drawImage(img, x, y, drawW, drawH);

            requestAnimationFrame(render);
        };

        const animId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animId);
        };
    }, [loaded, images, frameIndex, bgColor]);

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{
                height: `${cutoff * 500}vh`,
                backgroundColor: bgColor
            }}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full block"
                />

                {/* Loading Overlay */}
                {!loaded && (
                    <div
                        className="absolute inset-0 flex items-center justify-center z-50"
                        style={{ backgroundColor: bgColor, color: isLightMode ? 'black' : 'white' }}
                    >
                        <div className="animate-pulse">Loading Experience...</div>
                    </div>
                )}

                {/* Vignette Overlay - Only for dark backgrounds or modified for light */}
                {!isLightMode && (
                    <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_center_transparent_0%,_black_100%] opacity-50"></div>
                )}

                <ProductTextOverlays product={product} scrollYProgress={activeProgress} />
                
                {/* Left Arrow - Fixed within Hero Section */}
                {onPrevProduct && (
                    <button
                        onClick={onPrevProduct}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition-all flex items-center justify-center font-bold hidden md:flex active:scale-95"
                    >
                        &larr;
                    </button>
                )}

                {/* Right Arrow - Fixed within Hero Section */}
                {onNextProduct && (
                    <button
                        onClick={onNextProduct}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition-all flex items-center justify-center font-bold hidden md:flex active:scale-95"
                    >
                        &rarr;
                    </button>
                )}
                
                {/* Bottom Pill Menu - Fixed within Hero Section */}
                {products && currentIndex !== undefined && onProductChange && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 p-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex gap-2 shadow-2xl">
                        {products.map((p, i) => (
                            <button
                                key={p.id}
                                onClick={() => onProductChange(i)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${i === currentIndex
                                    ? "bg-white text-black shadow-lg scale-105"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
