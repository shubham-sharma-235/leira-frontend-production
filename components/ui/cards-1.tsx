import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

// Define the props for the component
interface ProductCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  imageUrl: string;
  title: string;
  category: string;
  href: string;
  originalPrice?: string;
  currentPrice?: string;
  onSave?: () => void;
  onAddToCart?: () => void;
  isSaved?: boolean;
}

const ProductCard = React.forwardRef<HTMLAnchorElement, ProductCardProps>(
  ({ className, imageUrl, title, category, href, originalPrice, currentPrice, onSave, onAddToCart, isSaved, ...props }, ref) => {
    // Prevent click event from bubbling up from the button to the parent link
    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSave) onSave();
    };

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onAddToCart) onAddToCart();
    };

    return (
      <Link
        href={href}
        ref={ref}
        className={cn(
          "group relative flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200/50 bg-white text-card-foreground transition-all duration-500 ease-out hover:shadow-2xl hover:border-pink-200/50",
          className
        )}
        {...props}
      >
        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400/0 via-pink-400/0 to-pink-400/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10" />

        {/* Image container with aspect ratio */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-white relative flex-shrink-0">
          <img
            src={imageUrl}
            alt={title}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
          />
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
        </div>

        {/* Card content - flex grow to fill space */}
        <div className="p-6 bg-white relative flex flex-col flex-grow">
          {/* Title - fixed min height */}
          <h3 className="font-bold text-lg uppercase leading-tight mb-4 text-black group-hover:text-pink-600 transition-colors duration-300 min-h-[3.5rem] flex items-start">
            LEIRA INTIMATE PERFUME {title.toUpperCase()}
          </h3>

          {/* Prices - Only show current price, no cut price */}
          {currentPrice && (
            <div className="mb-5 space-y-1 flex-shrink-0">
              <p className="text-black text-2xl font-bold group-hover:text-pink-600 transition-colors duration-300">
                {currentPrice}
              </p>
            </div>
          )}

          {/* Add to Cart Button - push to bottom */}
          <div className="mt-auto">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold uppercase py-3.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              ADD TO CART
            </Button>
          </div>
        </div>

        {/* Save / Wishlist button - appears on hover */}
        <Button
          variant="secondary"
          size="icon"
          className={`absolute top-3 right-3 h-8 w-8 rounded-full backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 ${isSaved ? "opacity-100 bg-pink-100 text-pink-600" : "opacity-0"}`}
          onClick={handleSaveClick}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </Link>
    );
  }
);

ProductCard.displayName = "ProductCard";

export { ProductCard };

