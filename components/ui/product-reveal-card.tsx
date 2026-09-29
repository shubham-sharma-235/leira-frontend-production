"use client"

import { AnimatePresence, motion } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Star, Heart, Truck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

/** Stable key so parent re-renders with a new `images` array ref don't reset the carousel. */
const JOIN = "\u0001"

/** Match `hero-gallery-scroll-animation` — smaller payloads, faster decode vs default 75. */
const CARD_IMAGE_QUALITY = 82

interface ProductRevealCardProps {
  name?: string
  price?: string
  originalPrice?: string
  image?: string
  images?: string[]
  imageAlt?: string
  description?: string
  /** Italic line under product name — admin shop/home card tagline */
  tagline?: string
  rating?: number
  reviewCount?: number
  /** When true and reviewCount > 0, shows stars on card. */
  showReviewsOnCard?: boolean
  /** Keeps card body alignment stable even when a product has no visible review row. */
  reserveReviewSpace?: boolean
  onAdd?: () => void
  onFavorite?: () => void
  onViewDetails?: () => void
  isFavorite?: boolean
  /** When false, hides wishlist row (e.g. combo spotlight cards). Default true. */
  showWishlist?: boolean
  addToCartLabel?: string
  viewDetailsLabel?: string
  enableAnimations?: boolean
  className?: string
  /** Pink "% OFF" pill on the image (from originalPrice vs price). Default true. */
  showDiscountBadge?: boolean
  /** How the image should fit inside the fixed card frame. Default "cover". Ignored when `imageLayout` is `"natural"`. */
  imageFit?: "cover" | "contain"
  /**
   * `uniform` = fixed 4:5 frame (aligned grid). `natural` = image uses its real aspect ratio at full card width (no letterboxing/crop).
   */
  imageLayout?: "uniform" | "natural"
  /**
   * When true, same loading hints as the homepage hero (`priority` + `fetchPriority="high"`).
   * Use only for the first few above-the-fold cards in a grid.
   */
  imagePriority?: boolean
}

const parseMoney = (value: string) => {
  const n = Number(String(value || "").replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

/** Show MRP with ₹ + grouping when admin stored plain digits (e.g. 3500 → ₹3,500). */
const formatListPriceDisplay = (value: string) => {
  const t = String(value || "").trim()
  if (!t) return t
  if (/[₹$€£]|rs\.?/i.test(t)) return t
  const n = parseMoney(t)
  if (n > 0) return `₹${n.toLocaleString("en-IN")}`
  return t
}

const renderFormattedDescription = (value: string) => {
  const parts = String(value || "").split(/(\*\*[^*]+\*\*|~~[^~]+~~)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return (
        <span key={index} className="line-through decoration-2 decoration-pink-400 text-neutral-500">
          {part.slice(2, -2)}
        </span>
      )
    }
    return part
  })
}

export function ProductRevealCard({
  name = "Premium Wireless Headphones",
  price = "Rs 199",
  originalPrice = "",
  image = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=600&fit=crop",
  images = [],
  imageAlt,
  description = "Experience studio-quality sound with advanced noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
  tagline = "",
  rating = 4.8,
  reviewCount = 124,
  showReviewsOnCard = false,
  reserveReviewSpace = false,
  onAdd,
  onFavorite,
  onViewDetails,
  isFavorite = false,
  showWishlist = true,
  addToCartLabel = "Add to Cart",
  viewDetailsLabel = "View Details",
  enableAnimations = true,
  className,
  showDiscountBadge = true,
  imageFit = "cover",
  imageLayout = "uniform",
  imagePriority = false,
}: ProductRevealCardProps) {
  const favorite = isFavorite
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [failedImageMap, setFailedImageMap] = useState<Record<string, boolean>>({})

  const imagesJoinKey = Array.isArray(images) ? images.join(JOIN) : ""

  const imageList = useMemo(() => {
    const fromProps = imagesJoinKey ? imagesJoinKey.split(JOIN).filter(Boolean) : []
    // When `images` is provided, preserve its order (cover first). Avoid appending `image`,
    // which used to push the cover last and broke carousel order.
    const merged = (fromProps.length > 0 ? fromProps : [image].filter(Boolean)) as string[]
    const seen = new Set<string>()
    const unique: string[] = []
    for (const img of merged) {
      if (!seen.has(img)) {
        seen.add(img)
        unique.push(img)
      }
    }
    return unique.length ? unique : ["/images/placeholder.png"]
  }, [imagesJoinKey, image])

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [imageList])

  const displaySrc = useMemo(() => {
    const raw = imageList[currentImageIndex]
    return failedImageMap[raw] ? "/images/placeholder.png" : raw
  }, [imageList, currentImageIndex, failedImageMap])

  useEffect(() => {
    if (imageList.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        // Rotate images sequentially to match the admin upload order.
        if (imageList.length <= 1) return prev
        return (prev + 1) % imageList.length
      })
    }, 2800)
    return () => clearInterval(interval)
  }, [imageList])

  const showReviewRow = showReviewsOnCard && reviewCount > 0
  const shouldReserveReviewSpace = reserveReviewSpace || showReviewRow

  const discountPercent = useMemo(() => {
    if (!originalPrice) return null
    const p = parseMoney(price)
    const op = parseMoney(originalPrice)
    if (!op || op <= p) return null
    return Math.round(((op - p) / op) * 100)
  }, [price, originalPrice])

  const handleFavorite = () => onFavorite?.()

  return (
    <div
      data-slot="product-reveal-card"
      className={cn(
        "relative w-full max-w-sm rounded-2xl bg-white text-card-foreground overflow-hidden",
        "shadow-[0_24px_48px_-16px_rgba(17,17,17,0.14),0_8px_24px_-8px_rgba(236,72,153,0.1)] transition-shadow duration-500",
        "hover:shadow-[0_32px_56px_-18px_rgba(17,17,17,0.16),0_12px_28px_-6px_rgba(236,72,153,0.14)]",
        className
      )}
    >
      <div className="relative w-full">
        {imageLayout === "natural" ? (
          <div className="relative w-full overflow-hidden rounded-t-2xl bg-white">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={`natural-${currentImageIndex}-${displaySrc}`}
                className="relative w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: enableAnimations ? 0.55 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src={displaySrc}
                  alt={imageAlt || name}
                  width={1200}
                  height={1500}
                  priority={imagePriority}
                  fetchPriority={imagePriority ? "high" : undefined}
                  quality={CARD_IMAGE_QUALITY}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-auto w-full max-w-full"
                  style={{ width: "100%", height: "auto" }}
                  onError={() => {
                    const src = imageList[currentImageIndex]
                    setFailedImageMap((prev) => ({ ...prev, [src]: true }))
                  }}
                />
              </motion.div>
            </AnimatePresence>
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/6 via-transparent to-transparent"
              aria-hidden
            />

            <button
              type="button"
              onClick={handleFavorite}
              className={cn(
                "absolute top-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 shadow-md backdrop-blur-md transition-transform active:scale-95",
                favorite ? "bg-pink-500 text-white" : "bg-white/85 text-neutral-600 hover:bg-white hover:text-pink-600"
              )}
            >
              <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
            </button>

            {showDiscountBadge && discountPercent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-3 left-3 z-30 bg-linear-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg shadow-pink-500/25 rounded-full"
              >
                {discountPercent}% OFF
              </motion.div>
            ) : null}

            {imageList.length > 1 ? (
              <div className="absolute bottom-2.5 left-0 right-0 z-30 flex justify-center gap-1.5 px-3">
                {imageList.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === currentImageIndex ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/45"
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="relative aspect-4/5 w-full overflow-hidden bg-neutral-100/25">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={`${currentImageIndex}-${displaySrc}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: enableAnimations ? 0.55 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src={displaySrc}
                  alt={imageAlt || name}
                  fill
                  priority={imagePriority}
                  fetchPriority={imagePriority ? "high" : undefined}
                  quality={CARD_IMAGE_QUALITY}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={cn(
                    "object-center",
                    imageFit === "contain" ? "object-contain p-5" : "object-cover"
                  )}
                  onError={() => {
                    const src = imageList[currentImageIndex]
                    setFailedImageMap((prev) => ({ ...prev, [src]: true }))
                  }}
                />
              </motion.div>
            </AnimatePresence>
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-black/5"
              aria-hidden
            />

            <button
              type="button"
              onClick={handleFavorite}
              className={cn(
                "absolute top-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 shadow-md backdrop-blur-md transition-transform active:scale-95",
                favorite ? "bg-pink-500 text-white" : "bg-white/85 text-neutral-600 hover:bg-white hover:text-pink-600"
              )}
            >
              <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
            </button>

            {showDiscountBadge && discountPercent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-3 left-3 z-30 bg-linear-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg shadow-pink-500/25 rounded-full"
              >
                {discountPercent}% OFF
              </motion.div>
            ) : null}

            {imageList.length > 1 ? (
              <div className="absolute bottom-2.5 left-0 right-0 z-30 flex justify-center gap-1.5 px-3">
                {imageList.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === currentImageIndex ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/45"
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div
        className={cn(
          "space-y-4 bg-linear-to-b from-white to-[#fff7fb] px-6 pb-6",
          shouldReserveReviewSpace ? "pt-4" : "pt-5"
        )}
      >
        {shouldReserveReviewSpace ? (
          <div className={cn("flex min-h-5 items-center gap-2", !showReviewRow && "invisible")} aria-hidden={!showReviewRow}>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating} ({reviewCount} reviews)
            </span>
          </div>
        ) : null}
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-serif text-[1.05rem] font-semibold leading-snug tracking-tight text-neutral-900">
            {name}
          </h3>
          {tagline ? (
            <p className="line-clamp-2 font-serif text-sm italic leading-snug text-pink-700/90">{tagline}</p>
          ) : null}
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
            {originalPrice ? (
              <span className="inline-flex items-baseline gap-2 rounded-xl border border-pink-200/70 bg-linear-to-br from-pink-50/95 via-white to-rose-50/40 px-2.5 py-1 shadow-[0_1px_0_rgba(236,72,153,0.12)]">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-pink-600/90 leading-none">
                  MRP
                </span>
                <span
                  className="text-sm font-semibold tabular-nums text-neutral-600 line-through decoration-2 decoration-pink-400/80"
                  title="Maximum retail price"
                >
                  {formatListPriceDisplay(originalPrice)}
                </span>
              </span>
            ) : null}
            <span className="text-2xl font-bold text-pink-600 tabular-nums tracking-tight leading-none">{price}</span>
          </div>
        </div>

        {description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600 text-justify">
            {renderFormattedDescription(description)}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-pink-100/60 bg-pink-50/40 p-2.5 text-center shadow-sm">
            <div className="font-semibold text-neutral-800">Premium</div>
            <div className="text-muted-foreground">Quality</div>
          </div>
          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-2.5 text-center shadow-sm">
            <div className="font-extrabold text-emerald-800">Cash on</div>
            <div className="font-bold text-emerald-700">Delivery</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white/85 px-3 py-2 text-[11px] font-bold text-neutral-700 shadow-sm">
          <Truck className="h-4 w-4 text-neutral-600" />
          <span>Estimated delivery: 4–5 days</span>
        </div>

        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onAdd}
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 w-full font-medium bg-linear-to-r from-primary to-primary/90 shadow-lg shadow-primary/25"
            )}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {addToCartLabel}
          </button>

          <button
            type="button"
            onClick={onViewDetails}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-full border-pink-200 bg-white/90 font-medium text-neutral-800 hover:bg-pink-50"
            )}
          >
            {viewDetailsLabel}
          </button>

          {showWishlist ? (
            <button
              type="button"
              onClick={handleFavorite}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full font-medium",
                favorite
                  ? "border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100"
                  : "border-neutral-200 bg-white/90 text-neutral-800 hover:bg-neutral-50"
              )}
            >
              <Heart className={cn("mr-2 h-4 w-4", favorite && "fill-current")} />
              {favorite ? "Wishlisted" : "Add to Wishlist"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

