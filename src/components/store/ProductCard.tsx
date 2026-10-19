import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Check, ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/types";
import { useStore } from "@/store/StoreContext";
import { formatINR, discountPercent } from "@/lib/format";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProductCard({
  product,
  index = 0,
  variant = "default",
}: {
  product: Product;
  index?: number;
  variant?: "default" | "square" | "square-compact";
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);
  const off = product.discountPrice ? discountPercent(product.price, product.discountPrice) : 0;
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover-lift h-full w-full"
    >
      <div className={cn("relative overflow-hidden bg-muted", (variant === "square" || variant === "square-compact") ? "aspect-square" : "aspect-[4/5]")}>
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <img
            src={product.image || "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={800}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk";
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
              {off}% OFF
            </span>
          )}
          {product.newArrival && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-gold-foreground shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          aria-label="Add to wishlist"
          onClick={() => toggleWishlist(product)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-card"
        >
          <Heart size={16} className={cn(wished && "fill-primary text-primary")} />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => addToCart(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                aria-label="Quick view"
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-card text-foreground shadow-md transition-colors hover:bg-accent"
              >
                <Eye size={16} />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl border-border bg-card p-6 shadow-card">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-bold text-foreground pr-6 text-left">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-left text-xs uppercase tracking-wider text-gold font-semibold mt-1">
                  {product.subcategory} — Heritage Silk Sarees
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 mt-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-xl bg-muted border border-border">
                  <img
                    src={product.image || "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk"}
                    alt={product.name}
                    className="aspect-[4/5] w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk";
                    }}
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <StarRating
                      rating={product.rating || 5}
                      reviews={product.reviews || 0}
                      showValue
                    />
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">
                        {formatINR(product.discountPrice ?? product.price)}
                      </span>
                      {off > 0 && (
                        <span className="text-base text-muted-foreground line-through">
                          {formatINR(product.price)}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-4">
                      {product.description}
                    </p>

                    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Fabric</dt>
                        <dd className="font-semibold text-foreground mt-0.5">{product.fabric}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Color</dt>
                        <dd className="font-semibold text-foreground mt-0.5">{product.color}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Saree Length</dt>
                        <dd className="font-semibold text-foreground mt-0.5">
                          {product.sareeLength}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Blouse Included</dt>
                        <dd className="font-semibold text-foreground mt-0.5">
                          {product.blouseIncluded ? "Yes" : "No"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        addToCart(product);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      View Full Details <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", variant === "square-compact" ? "p-3" : "p-4")}>
        <span className="text-[11px] uppercase tracking-wider text-gold">
          {product.subcategory}
        </span>
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className={cn("mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-foreground transition-colors hover:text-primary", variant === "square-compact" && "text-sm")}>
            {product.name}
          </h3>
        </Link>
        <StarRating
          rating={product.rating || 5}
          reviews={product.reviews || 0}
          showValue
          className={cn("mt-2", variant === "square-compact" && "mt-1.5 text-xs")}
        />
        <div className={cn("mt-3 flex items-center gap-2", variant === "square-compact" && "mt-2")}>
          <span className={cn("text-lg font-semibold text-primary", variant === "square-compact" && "text-base")}>
            {formatINR(product.discountPrice ?? product.price)}
          </span>
          {off > 0 && (
            <span className={cn("text-sm text-muted-foreground line-through", variant === "square-compact" && "text-xs")}>
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
