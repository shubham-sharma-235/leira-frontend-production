import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Define the props for the ProductCard component (adapted from TravelCard)
interface ProductCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  imageUrl: string | string[];
  imageAlt: string;
  logo?: React.ReactNode;
  title: string;
  description: string;
  price: string;
  href: string;
  onBookNow: () => void;
}

const ProductCard = React.forwardRef<HTMLAnchorElement, ProductCardProps>(
  (
    {
      className,
      imageUrl,
      imageAlt,
      logo,
      title,
      description,
      price,
      href,
      onBookNow,
      ...props
    },
    ref
  ) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    const currentImage = images[currentImageIndex];
    const [resolvedImage, setResolvedImage] = React.useState(currentImage || "/images/placeholder.png");

    React.useEffect(() => {
      if (images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 2000);
        return () => clearInterval(interval);
      }
    }, [images.length]);

    React.useEffect(() => {
      setResolvedImage(currentImage || "/images/placeholder.png");
    }, [currentImage]);

    return (
      <Link
        href={href}
        ref={ref}
        className={cn(
          "group relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-card/10 shadow-xl",
          "backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:border-pink-500/60",
          className
        )}
        {...props}
      >
        {/* Background Image with Zoom Effect on Hover */}
        <div className="absolute inset-0 h-full w-full">
          <img
            src={resolvedImage}
            alt={imageAlt}
            width={480}
            height={600}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            onError={() => setResolvedImage("/images/placeholder.png")}
          />
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Content Container */}
        <div className="relative flex h-full min-h-[500px] flex-col justify-between p-6 text-card-foreground">
          {/* Top Section: Logo */}
          <div className="flex h-40 items-start">
            {logo && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-black/20 backdrop-blur-sm">
                {logo}
              </div>
            )}
          </div>

          {/* Middle Section: Details (slides up on hover) */}
          <div className="space-y-3 transition-transform duration-500 ease-in-out group-hover:-translate-y-12">
            <h3 className="text-lg md:text-xl font-semibold tracking-tight text-pink-500 whitespace-nowrap overflow-hidden text-ellipsis">
              {title}
            </h3>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-xs">
              {description}
            </p>
          </div>

          {/* Bottom Section: Price and Button (revealed on hover) */}
          <div className="absolute -bottom-20 left-0 w-full p-6 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                  {price}
                </span>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBookNow();
                }}
                size="lg"
                className="rounded-full px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/60 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] flex items-center gap-2"
              >
                Add to cart <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }
);
ProductCard.displayName = "ProductCard";

export { ProductCard };

