import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  title: string;
  originalPrice: string;
  currentPrice: string;
  href: string;
  showDiscount?: boolean;
  discountPercent?: number;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, imageUrl, title, originalPrice, currentPrice, href, showDiscount = true, discountPercent = 10, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative block overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1",
          className
        )}
        {...props}
      >
        <Link href={href} aria-label={title}>
          {/* Discount Badge */}
          {showDiscount && (
            <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {discountPercent}% OFF
            </div>
          )}

          {/* Free Delivery Badge */}
          <div className="absolute bottom-3 right-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span>FREE DELIVERY</span>
          </div>

          {/* Image container */}
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-110 p-4"
            />
          </div>

          {/* Card content */}
          <div className="p-6">
            {/* Product Name */}
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              {title}
            </h3>

            {/* Pricing */}
            <div className="flex flex-wrap items-baseline gap-2.5 mb-6">
              <span className="text-sm font-medium text-neutral-500 line-through tabular-nums decoration-neutral-400">
                {originalPrice}
              </span>
              <span className="text-2xl md:text-3xl font-bold text-pink-600 tabular-nums tracking-tight">
                {currentPrice}
              </span>
            </div>

            {/* Quick Buy Button */}
            <Button
              className="w-full bg-gray-800 text-white hover:bg-gray-900 rounded-lg py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300"
            >
              QUICK BUY
            </Button>
          </div>
        </Link>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export { ProductCard };

