import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { SectionHeading } from "@/components/store/SectionHeading";
import { ProductCard } from "@/components/store/ProductCard";
import { StarRating } from "@/components/store/StarRating";
import { EmptyState } from "@/components/store/EmptyState";
import { Search } from "lucide-react";
import {
  products as mockProducts,
  getProductBySlug as mockGetProductBySlug,
  getRelated as mockGetRelated,
} from "@/data/products";
import { useStore } from "@/store/StoreContext";
import { formatINR, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({ meta: [{ title: "Saree Details — Sri Kamatchi Silk" }] }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = useParams({ from: "/product/$slug" });

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products`);
        const res = await response.json();
        if (res.success) {
          setDbProducts(res.data);
        }
      } catch (err) {
        console.error("Storefront API fetch offline, using mock backup", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [slug]);

  const liveProducts = useMemo(() => {
    if (dbProducts.length === 0) return [];
    return dbProducts.map((p) => {
      const fallback =
        "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk";
      const img = p.image?.startsWith("http")
        ? p.image
        : p.image
          ? `${API_BASE}${p.image}`
          : fallback;

      const variants = Array.isArray(p.variants)
        ? p.variants.map((v: any) => ({
            id: v.id,
            color: v.color,
            stock: v.stock ?? 0,
            images: (Array.isArray(v.images) ? v.images : [])
              .map((u: string) =>
                u?.startsWith("http") ? u : u ? `${API_BASE}${u}` : fallback
              )
              .filter(Boolean),
            sortOrder: v.sortOrder ?? 0,
          }))
        : [];

      const firstVariant = variants[0];
      const galleryFromVariants =
        firstVariant?.images?.length > 0 ? firstVariant.images : [img];

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice || p.price,
        rating: 4.9,
        reviews: 21,
        image: firstVariant?.images?.[0] || img,
        gallery: galleryFromVariants,
        category: p.category?.name || "Silk Sarees",
        subcategory: p.category?.name || "Semi Silks",
        subcategorySlug: p.category?.slug || "semi-silks",
        stock: firstVariant ? firstVariant.stock : p.stock,
        fabric: p.fabric || "Pure Silk",
        color: firstVariant?.color || p.color || "Gold",
        sareeLength: p.sareeLength || "6.3 metres",
        blouseLength: p.blouseLength || "0.8 metres",
        blouseIncluded: p.blouseIncluded !== false,
        featured: p.isFeatured || false,
        trending: p.isTrending || false,
        offer: p.isOffer || false,
        newArrival: true,
        description: p.description,
        categoryId: p.categoryId,
        occasion: p.occasion
          ? Array.isArray(p.occasion)
            ? p.occasion
            : [p.occasion]
          : ["Wedding", "Reception"],
        variants,
        selectedVariantId: firstVariant?.id,
      };
    });
  }, [dbProducts]);

  const product = useMemo(() => {
    return liveProducts.find((p) => p.slug === slug);
  }, [liveProducts, slug]);

  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // When product loads / changes, pick first variant
  useEffect(() => {
    if (!product) return;
    if (product.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
    setActiveImg(0);
  }, [product?.id]);

  const selectedVariant =
    product?.variants?.find((v) => v.id === selectedVariantId) ||
    product?.variants?.[0] ||
    null;

  const displayGallery =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product?.gallery && product.gallery.length > 0
        ? product.gallery
        : product
          ? [product.image]
          : [];

  const displayStock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;
  const displayColor = selectedVariant?.color || product?.color || "";

  const productForCart = product
    ? {
        ...product,
        image: displayGallery[0] || product.image,
        gallery: displayGallery,
        color: displayColor,
        stock: displayStock,
        selectedVariantId: selectedVariant?.id,
      }
    : null;

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin text-primary mr-2" size={24} />
          <span className="text-sm text-muted-foreground">Loading saree specifications...</span>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-3xl px-4 py-20">
          <EmptyState
            icon={Search}
            title="Saree not found"
            description="This product may have moved."
            action={
              <Link
                to="/shop"
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
              >
                Back to shop
              </Link>
            }
          />
        </div>
      </StoreLayout>
    );
  }

  const off = product.discountPrice ? discountPercent(product.price, product.discountPrice) : 0;
  const related = liveProducts
    .filter((p) => p.subcategory === product.subcategory && p.id !== product.id)
    .slice(0, 4);
  const occasionStr = Array.isArray(product.occasion)
    ? product.occasion.join(", ")
    : typeof product.occasion === "string"
      ? product.occasion
      : "Bridal / Wedding / Festival";

  const specs = [
    { label: "Color", value: displayColor || "Royal Maroon" },
    { label: "Fabric", value: product.fabric || "Pure Kanchipuram Silk" },
    { label: "Occasion", value: occasionStr },
    { label: "Saree Length", value: product.sareeLength || "5.5 Meters" },
    { label: "Blouse Length", value: product.blouseLength || "0.8 Meters" },
    { label: "Blouse Included", value: product.blouseIncluded ? "Yes" : "No" },
  ];

  const gallery = displayGallery;

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>{" "}
          /{" "}
          <Link to="/shop" className="hover:text-primary">
            Shop
          </Link>{" "}
          / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <div className="flex gap-3 sm:flex-col">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "h-20 w-16 overflow-hidden rounded-lg border-2",
                    activeImg === i ? "border-gold" : "border-transparent",
                  )}
                >
                  <img
                    src={img || "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk"}
                    alt="thumbnail"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk";
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={gallery[activeImg] || product.image || "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk"}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/600x800/fafaf9/78350f?text=Sri+Kamatchi+Silk";
                }}
              />
              {off > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {off}% OFF
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-gold">
              {product.subcategory || "Heritage Silks"}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <StarRating
              rating={product.rating || 5}
              reviews={product.reviews || 0}
              showValue
              className="mt-3"
            />
            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatINR(product.discountPrice ?? product.price)}
              </span>
              {off > 0 && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatINR(product.price)}
                </span>
              )}
              {off > 0 && (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  Save {off}%
                </span>
              )}
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm">
              {displayStock > 0 ? (
                <span className="flex items-center gap-1.5 text-green-700">
                  <Check size={15} /> In Stock ({displayStock} available)
                </span>
              ) : (
                <span className="text-destructive">Out of Stock</span>
              )}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-foreground">
                  Color: <span className="text-muted-foreground">{displayColor}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const active = v.id === selectedVariant?.id;
                    const thumb = v.images?.[0];
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setActiveImg(0);
                        }}
                        title={v.color}
                        className={cn(
                          "group relative h-14 w-14 overflow-hidden rounded-xl border-2 transition",
                          active
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-gold"
                        )}
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={v.color}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[10px] font-medium">
                            {v.color}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-border bg-card p-5 text-sm">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-10 w-10 place-items-center"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-10 w-10 place-items-center"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button
                onClick={() => toggleWishlist(product)}
                className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-gold"
                aria-label="Wishlist"
              >
                <Heart
                  size={18}
                  className={cn(isWishlisted(product.id) && "fill-primary text-primary")}
                />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => productForCart && addToCart(productForCart, qty)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary bg-card py-3.5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
              >
                <ShoppingBag size={17} /> Add to Cart
              </button>
              <Link
                to="/checkout"
                onClick={() => productForCart && addToCart(productForCart, qty)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground"
              >
                <Zap size={17} /> Buy Now
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
              <div className="rounded-xl border border-border bg-card p-3">
                <Truck className="mx-auto text-gold" size={20} />
                <p className="mt-2">Free shipping over ₹4,999</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <RotateCcw className="mx-auto text-gold" size={20} />
                <p className="mt-2">7-day easy returns</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <ShieldCheck className="mx-auto text-gold" size={20} />
                <p className="mt-2">100% authentic silk</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">Description</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <SectionHeading eyebrow="You May Also Like" title="Related Sarees" />
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
