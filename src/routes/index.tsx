import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight, Quote, Instagram, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { SectionHeading } from "@/components/store/SectionHeading";
import { ProductCard } from "@/components/store/ProductCard";
import { StarRating } from "@/components/store/StarRating";
import { products as localProducts } from "@/data/products";
import { subcategories } from "@/data/categories";
import { testimonials as staticTestimonials } from "@/data/store";
import { API_BASE } from "@/lib/api";
import { formatINR } from "@/lib/format";
import sriKamatchiSilksBanner from "@/assets/sri-kamatchi-silks-banner.png";
import sriKamatchiSilksBanner2 from "@/assets/sri-kamatchi-silks-banner-2.jpg";
import saree1 from "@/assets/saree-1.jpg";
import saree2 from "@/assets/saree-2.jpg";
import saree3 from "@/assets/saree-3.jpg";
import saree4 from "@/assets/saree-4.jpg";
import saree5 from "@/assets/saree-5.jpg";
import saree6 from "@/assets/saree-6.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sri Kamatchi Silk — Premium Kanchipuram & Luxury Silk Sarees" },
      {
        name: "description",
        content:
          "Shop handcrafted luxury silk sarees — Kanchipuram, semi silk, cotton silk, luxury & celebrity collections for weddings and festivals.",
      },
      { property: "og:title", content: "Sri Kamatchi Silk — Premium Silk Sarees" },
      {
        property: "og:description",
        content: "Handcrafted luxury silk sarees for weddings, festivals and everyday elegance.",
      },
    ],
  }),
  component: HomePage,
});

const getIconByName = (name: string) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent || HelpCircle;
};

function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Resolve configured hero slides while preserving legacy single-image settings.
  const resolveHeroImage = (image: string) => {
    if (!image || /^(data:|blob:|https?:\/\/)/i.test(image)) return image;
    return `${API_BASE}${image.startsWith("/") ? "" : "/"}${image}`;
  };
  const configuredHero = settings?.hero || {};
  const configuredSlides = Array.isArray(configuredHero.slides)
    ? configuredHero.slides.filter((slide: any) => slide && slide.imageUrl)
    : [];
  const heroSlides = configuredSlides.length > 0
    ? configuredSlides.map((slide: any) => ({
        ...slide,
        imageUrl: resolveHeroImage(slide.imageUrl),
        showText: slide.showText !== false,
      }))
    : (configuredHero.imageUrl || settings?.heroImage)
      ? [{
          imageUrl: resolveHeroImage(configuredHero.imageUrl || settings?.heroImage),
          showText: configuredHero.showText !== false,
          eyebrow: configuredHero.eyebrow || "",
          title: configuredHero.title || settings?.heroTitle || "",
          subtitle: configuredHero.subtitle || settings?.heroSubtitle || "",
          primaryCtaText: configuredHero.primaryCtaText || "",
          primaryCtaLink: configuredHero.primaryCtaLink || "/shop",
          secondaryCtaText: configuredHero.secondaryCtaText || "",
          secondaryCtaLink: configuredHero.secondaryCtaLink || "/shop",
        }]
      : [
          { imageUrl: sriKamatchiSilksBanner, showText: false },
          { imageUrl: sriKamatchiSilksBanner2, showText: false },
        ];
  const images = heroSlides.map((slide: any) => slide.imageUrl);
  const activeHeroSlide = heroSlides[currentIndex % heroSlides.length] || heroSlides[0];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/home`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch((err) => console.error("Error fetching homepage settings:", err));

    fetch(`${API_BASE}/api/categories`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setDbCategories(res.data);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));

    fetch(`${API_BASE}/api/products`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setDbProducts(res.data);
      })
      .catch((err) => console.error("Error fetching homepage products:", err));
  }, []);

  // Extraction of settings with fallback values
  const hero = settings?.hero || {
    eyebrow: "Heritage Weaves",
    title: "Draped in Timeless Elegance",
    subtitle:
      "Discover the soul of South Indian craftsmanship. Handwoven Kanchipuram and luxury silk sarees, made for the moments you'll cherish forever.",
    primaryCtaText: "Explore Collection",
    primaryCtaLink: "/silk-sarees",
    secondaryCtaText: "Shop All Sarees",
    secondaryCtaLink: "/shop",
    imageUrl: "",
    ratingValue: "4.9/5",
    ratingText: "Rated by 12,000+ brides",
    stats: [
      { value: "25+", label: "Years of Heritage" },
      { value: "50k+", label: "Happy Customers" },
      { value: "100%", label: "Pure Silk" },
    ],
  };

  const toggles = settings?.toggles || {
    heroCarousel: true,
    trendingArrivals: true,
    curatedOccasions: true,
    customerTestimonials: true,
    featuredCollections: true,
    weddingBanner: true,
    festivalBanner: true,
    newArrivals: true,
    celebritySection: true,
    instagramGallery: true,
    newsletter: true,
  };

  const categoriesSection = settings?.categoriesSection || {
    eyebrow: "The House of Silk",
    title: "Silk Sarees",
    subtitle:
      "Handwoven heritage drapes crafted by master weavers — explore our signature collections.",
  };

  const trendingSections = settings?.trendingSections || {
    trendingTitle: "Trending Sarees",
    trendingEyebrow: "Most Loved",
    newArrivalsTitle: "New Arrivals",
    newArrivalsEyebrow: "Fresh Off the Loom",
    celebrityTitle: "Celebrity Inspired",
    celebrityEyebrow: "As Seen on Stars",
    maxProducts: 4,
  };

  const sectionContent = settings?.sectionContent || {};

  const occasionFinder = settings?.occasionFinder || {
    eyebrow: "Curated for You",
    title: "Find Your Saree by Occasion",
    subtitle: "Whatever the moment, we have the perfect drape to match it.",
    items: [
      { name: "Wedding", icon: "Crown" },
      { name: "Reception", icon: "Sparkles" },
      { name: "Festival", icon: "PartyPopper" },
      { name: "Temple Visit", icon: "Landmark" },
      { name: "Daily Wear", icon: "Sun" },
      { name: "Gift", icon: "Gift" },
    ],
  };

  const promiseSection = settings?.promiseSection || {
    eyebrow: "The Promise",
    title: "Why Choose Sri Kamatchi Silk",
    cards: [
      {
        title: "Authentic Handloom",
        text: "Certified pure silk woven by master artisans.",
        icon: "Award",
      },
      {
        title: "Trusted Quality",
        text: "Each saree quality-checked & zari-tested.",
        icon: "ShieldCheck",
      },
      {
        title: "Pan-India Delivery",
        text: "Safe, insured shipping to your doorstep.",
        icon: "Truck",
      },
      {
        title: "Personal Styling",
        text: "Dedicated stylists to help you choose.",
        icon: "Headphones",
      },
    ],
  };

  const dbTestimonials = settings?.testimonials || staticTestimonials;

  const gallery = settings?.gallery || {
    eyebrow: "@srikamatchisilk",
    title: "Follow Our Journey",
    subtitle: "Tag us with #DrapedInKamatchi to be featured.",
    items: [],
  };

  const newsletter = settings?.newsletter || {
    title: "Join the Kamatchi Circle",
    subtitle: "Be the first to know about new weaves, private sales and styling tips.",
    buttonText: "Subscribe",
  };

  const banners = settings?.banners || [];
  const weddingBannerData = banners.find((b: any) => b.id === "wedding") || {
    label: "Limited Time",
    title: "Wedding Collection",
    description: "Up to 30% off on bridal Kanchipuram silks. Make your big day unforgettable.",
    ctaText: "Shop the Sale",
    ctaLink: "/shop",
    imageUrl: "",
  };
  const festivalBannerData = banners.find((b: any) => b.id === "festival") || {
    label: "New Season",
    title: "Festival Edit",
    description: "Radiant cotton silks & semi silks to light up every celebration.",
    ctaText: "Discover Now",
    ctaLink: "/shop",
    imageUrl: "",
  };

  // Prefer live backend products. Local sample products are used only if the API cannot be reached.
  const catalogProducts = useMemo(() => {
    if (dbProducts === null) return localProducts;
    return dbProducts.map((p: any) => {
      const image = p.image || p.images?.[0] || "";
      const resolvedImage = image && /^(https?:|data:|blob:)/i.test(image) ? image : image ? `${API_BASE}${image.startsWith("/") ? "" : "/"}${image}` : "";
      return {
        ...p,
        id: String(p.id),
        name: p.name || "",
        slug: p.slug || String(p.id),
        price: Number(p.price || 0),
        discountPrice: Number(p.discountPrice || p.price || 0),
        rating: Number(p.rating || 5),
        reviews: Number(p.reviews || 0),
        image: resolvedImage,
        gallery: Array.isArray(p.gallery) ? p.gallery : resolvedImage ? [resolvedImage] : [],
        category: p.category?.name || p.categoryName || "Silk Sarees",
        subcategory: p.category?.name || p.subcategory || p.categoryName || "",
        subcategorySlug: p.category?.slug || p.subcategorySlug || "",
        fabric: p.fabric || "",
        color: p.color || "",
        stock: Number(p.stock || 0),
        description: p.description || "",
        featured: Boolean(p.isFeatured ?? p.featured),
        trending: Boolean(p.isTrending ?? p.trending),
        offer: Boolean(p.isOffer ?? p.offer),
        newArrival: Boolean(p.isNewArrival ?? p.newArrival),
        bestSeller: Boolean(p.isBestSeller ?? p.bestSeller),
        categoryId: p.categoryId ?? p.category?.id,
      };
    });
  }, [dbProducts]);

  // A saved ID list takes precedence over automatic flags. No product data is modified.
  const selectedProducts = (key: string, fallback: any[]) => {
    const ids = sectionContent[key];
    if (!Array.isArray(ids)) return fallback;
    const byId = new Map(catalogProducts.map((p: any) => [String(p.id), p]));
    return ids.map((id: any) => byId.get(String(id))).filter(Boolean);
  };
  const limit = Number(trendingSections.maxProducts) || 4;
  const trending = selectedProducts("trendingProductIds", catalogProducts.filter((p: any) => p.trending)).slice(0, limit);
  const newArrivals = selectedProducts("newArrivalsProductIds", catalogProducts.filter((p: any) => p.newArrival)).slice(0, limit);
  const celebrity = selectedProducts("celebrityProductIds", catalogProducts.filter((p: any) => p.subcategory === "Celebrity Silks")).slice(0, limit);
  const todaysDeals = selectedProducts("todaysDealsProductIds", catalogProducts.filter((p: any) => p.offer || (p.discountPrice && p.discountPrice < p.price)));
  const bestSellers = selectedProducts("bestSellersProductIds", catalogProducts.filter((p: any) => p.bestSeller || p.trending));
  const pochampalliProducts = selectedProducts("pochampalliProductIds", catalogProducts.filter(
    (p: any) => p.subcategory === "Pure Cotton Silks" || p.subcategory === "Cotton Silks" || p.fabric === "Cotton Silk" || p.fabric === "Pure Cotton"
  ));

  // Category sorting & selection if specified in settings, falling back to database categories, then local file categories
  const displayedCategories = useMemo(() => {
    // 1. Get database categories mapped cleanly
    const baseList =
      dbCategories.length > 0
        ? dbCategories.map((c) => {
            const localMatch = subcategories.find((s) => s.slug === c.slug);
            const rawImage = c.image || localMatch?.image;
            return {
              id: c.id,
              name: c.name,
              slug: c.slug,
              image:
                typeof rawImage === "string" && rawImage.startsWith("/uploads")
                  ? `${API_BASE}${rawImage}`
                  : rawImage,
              description:
                c.description || localMatch?.description || "Handcrafted saree division.",
            };
          })
        : subcategories;

    // 2. Ensure we have exactly 5 categories by backfilling with unique local subcategories if needed
    let mergedList = [...baseList];
    for (const sub of subcategories) {
      if (mergedList.length >= 5) break;
      const exists = mergedList.some(
        (m) =>
          m.slug === sub.slug ||
          m.name.toLowerCase().trim() === sub.name.toLowerCase().trim()
      );
      if (!exists) {
        mergedList.push({
          ...sub,
          image: sub.image,
        });
      }
    }

    // 3. Guarantee that each of the 5 categories gets a completely unique image from our local assets
    const availableAssets = [saree1, saree2, saree3, saree4, saree5, saree6];
    const usedImages = new Set<string>();

    const selectedIds = settings?.categoriesSection?.selectedCategoryIds;
    const chosenList = Array.isArray(selectedIds)
      ? mergedList.filter((item) => selectedIds.map(String).includes(String(item.id)))
      : mergedList.slice(0, 5);

    return chosenList.map((item) => {
      let finalImg = item.image;

      // If image is missing, duplicate, or fallback, assign a unique one from our available assets
      if (!finalImg || usedImages.has(String(finalImg))) {
        const unusedAsset = availableAssets.find((asset) => !usedImages.has(String(asset)));
        if (unusedAsset) {
          finalImg = unusedAsset;
        }
      }

      if (finalImg) {
        usedImages.add(String(finalImg));
      }

      return {
        ...item,
        image: finalImg,
      };
    });
  }, [dbCategories, subcategories, settings?.categoriesSection?.selectedCategoryIds]);

  // Instagram gallery items
  const galleryImgs = catalogProducts.slice(0, 6).map((p: any) => p.image);
  const galleryItemsToShow =
    gallery.items && Array.isArray(gallery.items) && gallery.items.length > 0
      ? gallery.items.map((item: any) => ({
          ...item,
          imageUrl:
            typeof item.imageUrl === "string" && item.imageUrl.startsWith("/uploads")
              ? `${API_BASE}${item.imageUrl}`
              : item.imageUrl,
        }))
      : galleryImgs.map((img) => ({ imageUrl: img, link: "#" }));

  // Helper to split hero title for gradient coloring
  const parseHeroTitle = (titleText: string) => {
    // If it contains "Timeless", highlight it
    if (titleText.includes("Timeless")) {
      const parts = titleText.split("Timeless");
      return (
        <>
          {parts[0]}
          <span className="text-gradient-gold">Timeless</span>
          {parts[1]}
        </>
      );
    }
    return titleText;
  };

  return (
    <StoreLayout>
      {/* Hero / Banner Slider */}
      {toggles.heroCarousel !== false && (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-[16/9] sm:aspect-[2.47/1] overflow-hidden rounded-[2rem] border border-gold/10 shadow-card bg-card group"
        >
          {/* Slides */}
          <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                  const swipeThreshold = 50;
                  if (info.offset.x < -swipeThreshold) {
                    nextSlide();
                  } else if (info.offset.x > swipeThreshold) {
                    prevSlide();
                  }
                }}
              >
                <img
                  src={images[currentIndex % images.length]}
                  alt={`Sri Kamatchi Silks Banner ${(currentIndex % images.length) + 1}`}
                  draggable="false"
                  className="w-full h-full object-cover object-center block select-none"
                />
                {activeHeroSlide?.showText && (
                  <div className="absolute inset-0 z-[1] flex items-center">
                    <div className="max-w-2xl px-6 py-8 sm:px-12 sm:py-12 text-white drop-shadow-md">
                      {activeHeroSlide.eyebrow && (
                        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-3">
                          {activeHeroSlide.eyebrow}
                        </p>
                      )}
                      {activeHeroSlide.title && (
                        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                          {parseHeroTitle(activeHeroSlide.title)}
                        </h1>
                      )}
                      {activeHeroSlide.subtitle && (
                        <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-white/90">
                          {activeHeroSlide.subtitle}
                        </p>
                      )}
                      {(activeHeroSlide.primaryCtaText || activeHeroSlide.secondaryCtaText) && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          {activeHeroSlide.primaryCtaText && (
                            <Link
                              to={(activeHeroSlide.primaryCtaLink || "/shop") as any}
                              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground"
                            >
                              {activeHeroSlide.primaryCtaText} <ArrowRight size={15} />
                            </Link>
                          )}
                          {activeHeroSlide.secondaryCtaText && (
                            <Link
                              to={(activeHeroSlide.secondaryCtaLink || "/shop") as any}
                              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-black/20 px-5 py-2.5 text-sm font-semibold text-white"
                            >
                              {activeHeroSlide.secondaryCtaText}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white border border-white/10 hover:border-gold/50 transition-all duration-300 group/btn shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 group-hover/btn:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/35 hover:bg-black/55 text-white border border-white/10 hover:border-gold/50 transition-all duration-300 group/btn shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          {/* Bottom Dots Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "w-8 bg-gold shadow-sm" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </section>
      )}

      {/* Featured Categories (Circular grid) */}
      {toggles.featuredCollections !== false && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow={categoriesSection.eyebrow}
            title={categoriesSection.title}
            subtitle={categoriesSection.subtitle}
          />
          <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-5 justify-center">
            {displayedCategories.map((s: any, i: number) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex flex-col items-center"
              >
                <Link
                  to="/category/$slug"
                  params={{ slug: s.slug }}
                  className="group block text-center"
                >
                  <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full overflow-hidden border border-gold/30 hover:border-gold shadow-md bg-card transition-all duration-300">
                    <img
                      src={s.image}
                      alt={s.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const localMatch = subcategories.find((sub) => sub.slug === s.slug);
                        (e.target as HTMLImageElement).src =
                          localMatch?.image || subcategories[0].image;
                      }}
                    />
                  </div>
                  <h3 className="mt-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">
                    {s.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Today's Deal section */}
      {toggles.trendingArrivals !== false && toggles.todaysDeals !== false && todaysDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between border-b border-border/40 pb-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{sectionContent.todaysDealsEyebrow || trendingSections.trendingEyebrow || "Exclusive Offers"}</span>
              <h2 className="font-display text-2xl font-bold text-foreground mt-1">{sectionContent.todaysDealsTitle || trendingSections.trendingTitle || "Today's Deals"}</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
            {todaysDeals.map((p) => (
              <Link
                key={p.id}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="group min-w-[130px] sm:min-w-[170px] flex-shrink-0 text-center flex flex-col items-center"
              >
                <div className="relative aspect-square w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border border-border/80 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-gold">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="mt-3 text-xs font-medium text-foreground line-clamp-1 max-w-[120px] sm:max-w-[160px]">
                  {p.name}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 justify-center">
                  <span className="text-xs font-bold text-primary">{formatINR(p.discountPrice ?? p.price)}</span>
                  {p.discountPrice && p.discountPrice < p.price && (
                    <span className="text-[10px] text-muted-foreground line-through">{formatINR(p.price)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best Selling section */}
      {toggles.trendingArrivals !== false && toggles.bestSellers !== false && bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between border-b border-border/40 pb-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{sectionContent.bestSellersEyebrow || "Most Popular"}</span>
              <h2 className="font-display text-2xl font-bold text-foreground mt-1">{sectionContent.bestSellersTitle || "Best Selling Sarees"}</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 justify-items-center">
            {bestSellers.slice(0, Math.max(1, Number(sectionContent.bestSellersMaxProducts) || 4)).map((p, i) => (
              <div key={p.id} className="w-full max-w-[240px] sm:max-w-[260px] lg:max-w-[220px]">
                <ProductCard product={p} index={i} variant="square-compact" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pochampalli Pure Cotton Silk Sarees section */}
      {toggles.curatedOccasions !== false && toggles.pochampalliSection !== false && pochampalliProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between border-b border-border/40 pb-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{sectionContent.pochampalliEyebrow || "Traditional Weaves"}</span>
              <h2 className="font-display text-2xl font-bold text-foreground mt-1">{sectionContent.pochampalliTitle || "Pochampalli Pure Cotton Silk Sarees"}</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 justify-items-center">
            {pochampalliProducts.slice(0, Math.max(1, Number(sectionContent.pochampalliMaxProducts) || 4)).map((p, i) => (
              <div key={p.id} className="w-full">
                <ProductCard product={p} index={i} variant="square" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category-wise rows */}
      {toggles.featuredCollections !== false && toggles.categoryRows !== false && displayedCategories.map((cat: any) => {
        const catProducts = products.filter(
          (p) =>
            p.category === cat.name ||
            p.subcategory === cat.name ||
            p.subcategorySlug === cat.slug
        );
        if (catProducts.length === 0) return null;

        return (
          <section key={cat.id} className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex items-end justify-between border-b border-border/40 pb-4 mb-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{sectionContent.categoryRowsEyebrow || "Collections"}</span>
                <h2 className="font-display text-2xl font-bold text-foreground mt-1">{sectionContent.categoryRowsTitlePrefix ? sectionContent.categoryRowsTitlePrefix + " " + cat.name : cat.name}</h2>
              </div>
              <Link
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
              {(Number(sectionContent.categoryRowsMaxProducts) > 0 ? catProducts.slice(0, Number(sectionContent.categoryRowsMaxProducts)) : catProducts).map((p) => (
                <div key={p.id} className="min-w-[180px] sm:min-w-[220px] flex-shrink-0">
                  <ProductCard product={p} variant="square" />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Offer banners */}
      {(toggles.weddingBanner !== false || toggles.festivalBanner !== false) && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div
            className={`grid gap-6 ${toggles.weddingBanner !== false && toggles.festivalBanner !== false ? "lg:grid-cols-2" : "grid-cols-1"}`}
          >
            {toggles.weddingBanner !== false && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-maroon p-8 text-primary-foreground sm:p-12">
                <span className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
                  {weddingBannerData.label}
                </span>
                <h3 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                  {weddingBannerData.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm text-primary-foreground/80">
                  {weddingBannerData.description}
                </p>
                <Link
                  to={(weddingBannerData.ctaLink as any) || "/shop"}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-gold-foreground"
                >
                  {weddingBannerData.ctaText} <ArrowRight size={15} />
                </Link>
                <img
                  src={
                    weddingBannerData.imageUrl
                      ? /^(data:|blob:|https?:\/\/)/i.test(weddingBannerData.imageUrl)
                        ? weddingBannerData.imageUrl
                        : `${API_BASE}${weddingBannerData.imageUrl.startsWith("/") ? "" : "/"}${weddingBannerData.imageUrl}`
                      : saree2
                  }
                  alt={weddingBannerData.title}
                  loading="lazy"
                  className="pointer-events-none absolute -bottom-6 -right-6 h-44 w-44 rotate-6 rounded-2xl object-cover opacity-90 sm:h-56 sm:w-56"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = saree2;
                  }}
                />
              </div>
            )}
            {toggles.festivalBanner !== false && (
              <div className="relative overflow-hidden rounded-3xl bg-accent p-8 text-accent-foreground sm:p-12">
                <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
                  {festivalBannerData.label}
                </span>
                <h3 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                  {festivalBannerData.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm text-accent-foreground/80">
                  {festivalBannerData.description}
                </p>
                <Link
                  to={(festivalBannerData.ctaLink as any) || "/shop"}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                >
                  {festivalBannerData.ctaText} <ArrowRight size={15} />
                </Link>
                <img
                  src={
                    festivalBannerData.imageUrl
                      ? /^(data:|blob:|https?:\/\/)/i.test(festivalBannerData.imageUrl)
                        ? festivalBannerData.imageUrl
                        : `${API_BASE}${festivalBannerData.imageUrl.startsWith("/") ? "" : "/"}${festivalBannerData.imageUrl}`
                      : saree5
                  }
                  alt={festivalBannerData.title}
                  loading="lazy"
                  className="pointer-events-none absolute -bottom-6 -right-6 h-44 w-44 -rotate-6 rounded-2xl object-cover opacity-90 sm:h-56 sm:w-56"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = saree5;
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Products section */}
      {toggles.newArrivals !== false && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between border-b border-border/40 pb-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">{trendingSections.newArrivalsEyebrow || "Fresh Off the Loom"}</span>
              <h2 className="font-display text-2xl font-bold text-foreground mt-1">{trendingSections.newArrivalsTitle || "New Products"}</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 justify-items-center">
            {newArrivals.slice(0, 4).map((p, i) => (
              <div key={p.id} className="w-full">
                <ProductCard product={p} index={i} variant="square" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Boutique options: curated occasions */}
      {toggles.curatedOccasions !== false && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionHeading eyebrow={occasionFinder.eyebrow} title={occasionFinder.title} subtitle={occasionFinder.subtitle} />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(occasionFinder.items || []).map((item: any, index: number) => {
              const OccasionIcon = getIconByName(item.icon || "Sparkles");
              return (
                <Link key={item.name || index} to="/shop" className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition-colors hover:border-gold">
                  <OccasionIcon size={24} className="text-primary" />
                  <span className="text-xs font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Boutique options: why choose us */}
      {toggles.promiseSection !== false && (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading eyebrow={promiseSection.eyebrow} title={promiseSection.title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(promiseSection.cards || []).map((card: any, index: number) => {
            const PromiseIcon = getIconByName(card.icon || "Award");
            return (
              <div key={card.title || index} className="rounded-2xl border border-border/60 bg-card p-5">
                <PromiseIcon size={24} className="text-primary" />
                <h3 className="mt-3 font-display text-base font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.text}</p>
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* Boutique options: celebrity collection */}
      {toggles.celebritySection !== false && celebrity.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionHeading eyebrow={trendingSections.celebrityEyebrow || "As Seen on Stars"} title={trendingSections.celebrityTitle || "Celebrity Inspired"} />
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 justify-items-center">
            {celebrity.slice(0, 4).map((p, index) => (
              <div key={p.id} className="w-full">
                <ProductCard product={p} index={index} variant="square" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Boutique options: testimonials */}
      {toggles.customerTestimonials !== false && dbTestimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionHeading eyebrow="Customer Stories" title="Loved by Our Customers" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dbTestimonials.map((item: any, index: number) => (
              <article key={item.id || index} className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex items-center gap-1 text-gold" aria-label={`${item.rating || 5} out of 5 stars`}>
                  {Array.from({ length: Math.max(1, Math.min(5, Number(item.rating) || 5)) }).map((_, starIndex) => <span key={starIndex}>★</span>)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{item.text || item.message || ""}”</p>
                <p className="mt-4 text-sm font-semibold">{item.name || "Customer"}</p>
                {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Boutique options: Instagram gallery */}
      {toggles.instagramGallery !== false && galleryItemsToShow.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionHeading eyebrow={gallery.eyebrow} title={gallery.title} subtitle={gallery.subtitle} />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {galleryItemsToShow.map((item: any, index: number) => (
              <a key={index} href={item.link && item.link !== "#" ? item.link : undefined} className="block aspect-square overflow-hidden rounded-xl border border-border/60 bg-card">
                <img src={item.imageUrl} alt={item.caption || `Sri Kamatchi Silk gallery ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Boutique options: newsletter */}
      {toggles.newsletter !== false && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl bg-gradient-maroon px-6 py-10 text-center text-primary-foreground sm:px-12">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{newsletter.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-primary-foreground/80">{newsletter.subtitle}</p>
            <Link to="/contact" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground">
              {newsletter.buttonText || "Contact Us"}
            </Link>
          </div>
        </section>
      )}

      {/* Policy/Service Strip */}
      <section className="bg-card border-y border-border/40 py-8 mb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            <Link to="/terms" className="flex flex-col items-center gap-2 group">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary group-hover:bg-gold group-hover:text-gold-foreground transition-all">
                <Icons.ShieldCheck size={18} />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">Terms & Conditions</span>
              <span className="text-[10px] text-muted-foreground">Fair & clear terms</span>
            </Link>
            <Link to="/return-policy" className="flex flex-col items-center gap-2 group">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary group-hover:bg-gold group-hover:text-gold-foreground transition-all">
                <Icons.RefreshCw size={18} />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">Return Policy</span>
              <span className="text-[10px] text-muted-foreground">Easy returns within 7 days</span>
            </Link>
            <Link to="/shipping-policy" className="flex flex-col items-center gap-2 group">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary group-hover:bg-gold group-hover:text-gold-foreground transition-all">
                <Icons.Truck size={18} />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">Shipping Policy</span>
              <span className="text-[10px] text-muted-foreground">Pan-India insured delivery</span>
            </Link>
            <a href="https://wa.me/919443210987" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary group-hover:bg-gold group-hover:text-gold-foreground transition-all">
                <Icons.Headphones size={18} />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">Customer Support</span>
              <span className="text-[10px] text-muted-foreground">24/7 WhatsApp support</span>
            </a>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
