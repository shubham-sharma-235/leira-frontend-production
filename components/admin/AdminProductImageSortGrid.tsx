"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  resolvePreviewImageUrl: (url: string) => string;
  onRemove: (index: number) => void;
  /** Swap with neighbour: -1 = earlier in list (left / first in carousel), +1 = later */
  onMove: (index: number, direction: -1 | 1) => void;
  className?: string;
};

export function AdminProductImageSortGrid({
  images,
  resolvePreviewImageUrl,
  onRemove,
  onMove,
  className,
}: Props) {
  if (images.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4", className)}>
      {images.map((imageUrl, index) => (
        <div key={`${imageUrl}__${index}`} className="relative group">
          <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
            <img
              src={resolvePreviewImageUrl(imageUrl)}
              alt={`Product image ${index + 1}`}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder.png";
              }}
            />
          </div>

          <span
            className="absolute top-2 left-2 min-w-5.5 h-6 px-1.5 flex items-center justify-center rounded-md bg-neutral-900/75 text-[10px] font-bold text-white tabular-nums backdrop-blur-sm"
            title="Order on website"
          >
            {index + 1}
          </span>

          <div className="absolute bottom-2 left-2 flex flex-col gap-0.5">
            <button
              type="button"
              title="Pehle dikhao (carousel / shop)"
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border border-white/80 bg-white/95 text-neutral-800 shadow-md transition-all",
                "hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700",
                "disabled:pointer-events-none disabled:opacity-35"
              )}
            >
              <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              title="Baad mein dikhao"
              disabled={index === images.length - 1}
              onClick={() => onMove(index, 1)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border border-white/80 bg-white/95 text-neutral-800 shadow-md transition-all",
                "hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700",
                "disabled:pointer-events-none disabled:opacity-35"
              )}
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(index)}
            title="Remove image"
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/80 bg-white/95 text-red-500 shadow-md opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500 hover:text-white hover:border-red-400"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
