import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useStore } from "@/store/StoreContext";
import { API_BASE } from "@/lib/api";
import logoImg from "@/assets/logo.png";
import { subcategories } from "@/data/categories";
import { formatINR } from "@/lib/format";

export function Navbar() {
  const { cartCount, wishlist, cartSubtotal } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const [settings, setSettings] = useState<any>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/home`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch((err) => console.error("Error fetching header settings:", err));

    fetch(`${API_BASE}/api/categories`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setDbCategories(res.data);
        }
      })
      .catch((err) => console.error("Error fetching categories in navbar:", err));
  }, []);

  const header = settings?.header;
  const brandName = header?.brandName || "Sri Kamatchi Silk";
  const logoUrl = header?.logoUrl || "";

  const getLogoSrc = () => {
    if (!logoUrl) return logoImg;
    if (logoUrl.startsWith("http") || logoUrl.startsWith("data:")) return logoUrl;
    if (logoUrl.startsWith("/")) return `${API_BASE}${logoUrl}`;
    return logoUrl;
  };

  const contactNumber = String(header?.contactNumber || "").replace(/\D/g, "");
  const whatsappUrl = contactNumber ? `https://wa.me/${contactNumber}` : "https://wa.me/919443210987";
  const navLabels = header?.navLabels || {};
  const navLinks = (Array.isArray(header?.navLinks) && header.navLinks.length > 0
    ? header.navLinks
    : [
        { label: "Home", to: "/" },
        { label: "Silk Sarees", to: "/silk-sarees" },
        { label: "Shop", to: "/shop" },
        { label: "About", to: "/about" },
        { label: "Contact", to: whatsappUrl },
      ]).map((item: any) => ({
        ...item,
        label: item.to === "/" ? (navLabels.home || item.label)
          : item.to === "/silk-sarees" || /semi silks|silk cotton/i.test(item.label || "") ? (navLabels.silkSarees || item.label)
          : item.to === "/shop" ? (navLabels.shop || item.label)
          : item.to === "/about" ? (navLabels.about || item.label)
          : /contact/i.test(item.label || "") ? (navLabels.contact || item.label)
          : item.label,
      }));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: query } as never });
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const displayedCategories = useMemo(() => {
    const baseList =
      dbCategories.length > 0
        ? dbCategories.map((c) => {
            const localMatch = subcategories.find((s) => s.slug === c.slug);
            const rawImage = c.image || localMatch?.image || subcategories[0].image;
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
    return baseList;
  }, [dbCategories]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      {/* Top Deck: Branding, Large Search, and Customer Actions */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        {/* Mobile menu trigger */}
        <button className="lg:hidden p-1 rounded-full hover:bg-secondary" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="h-14 sm:h-18 w-auto px-3 py-1 flex items-center justify-center bg-white border border-border/60 rounded-xl shadow-sm">
            <img
              src={getLogoSrc()}
              alt={brandName}
              className="h-full w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== logoImg) {
                  target.src = logoImg;
                }
              }}
            />
          </div>
        </Link>

        {/* Desktop Search Bar: Centered and Always Visible */}
        <form onSubmit={submitSearch} className="hidden lg:flex relative flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Kanchipuram, bridal, cotton silk…"
              className="w-full rounded-full border border-border/70 bg-card py-2.5 pl-11 pr-24 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all">
              Search
            </button>
          </div>
        </form>

        {/* Action Icons / Links (Wishlist, Cart, Login) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
          >
            <Search size={19} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-secondary/60 text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
          >
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4.5 w-4.5 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Link with amount */}
          <Link
            to="/cart"
            aria-label="Cart"
            className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-foreground/85 hover:bg-secondary hover:text-primary transition-colors"
          >
            <div className="relative">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left text-[10px] leading-tight font-medium">
              <span className="text-muted-foreground text-[8px] uppercase tracking-wider">My Cart</span>
              <span>{formatINR(cartSubtotal)}</span>
            </div>
          </Link>

          {/* Account/Profile Link */}
          <Link
            to="/login"
            aria-label="Account"
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary/60 text-foreground/80 hover:bg-secondary hover:text-primary transition-colors">
              <User size={18} />
            </div>
            <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider">Sign In</span>
          </Link>
        </div>
      </div>

      {/* Mobile Search Expandable Area */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-border/50 bg-background"
          >
            <form onSubmit={submitSearch} className="mx-auto flex gap-2 px-4 py-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for Kanchipuram, bridal, cotton silk…"
                  className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-xs outline-none focus:border-gold"
                />
              </div>
              <button type="submit" className="rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground">
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Deck: Category Dropdown & Primary Links */}
      <div className="hidden lg:block border-t border-border/40 bg-card/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
          {/* Category Dropdown Menu */}
          <div className="relative group/cat">
            <button className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:border-gold hover:text-primary transition-all">
              <Menu size={14} className="text-primary" />
              <span>Categories</span>
              <ChevronDown size={12} className="text-muted-foreground transition-transform duration-300 group-hover/cat:rotate-180" />
            </button>
            {/* Category Dropdown List */}
            <div className="absolute left-0 top-full z-50 mt-1.5 w-64 origin-top-left scale-95 opacity-0 pointer-events-none group-hover/cat:scale-100 group-hover/cat:opacity-100 group-hover/cat:pointer-events-auto rounded-xl border border-border bg-card p-2 shadow-card transition-all duration-300">
              <div className="flex flex-col gap-0.5">
                {displayedCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to="/category/$slug"
                    params={{ slug: cat.slug }}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
                      onError={(e) => {
                        const localMatch = subcategories.find((s) => s.slug === cat.slug);
                        (e.target as HTMLImageElement).src = localMatch?.image || subcategories[0].image;
                      }}
                    />
                    <span>{cat.name}</span>
                  </Link>
                ))}
                <div className="gold-divider my-1.5 opacity-60" />
                <Link
                  to="/shop"
                  className="text-center text-[11px] font-bold uppercase tracking-wider text-primary hover:underline py-1"
                >
                  All Categories
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
            {navLinks.map((item: any, index: number) => (
              /^https?:\/\//i.test(item.to || "") ? (
                <a
                  key={item.label || index}
                  href={item.to}
                  target={item.to.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/80 transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label || index}
                  to={(item.to || "/") as any}
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/80 transition-colors hover:text-primary"
                  activeProps={{ className: "text-primary font-bold" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85%] flex-col bg-background shadow-card lg:hidden border-r border-border/40"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                <span className="font-display text-base font-bold text-primary">{brandName}</span>
                <button aria-label="Close" onClick={() => setMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Search in Mobile Drawer */}
                <form onSubmit={submitSearch} className="mb-6 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search weaves…"
                    className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-xs outline-none focus:border-gold"
                  />
                </form>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-3">
                      Navigation
                    </h4>
                    <nav className="flex flex-col gap-0.5">
                      {navLinks.map((item: any, index: number) =>
                        /^https?:\/\//i.test(item.to || "") ? (
                          <a
                            key={item.label || index}
                            href={item.to}
                            target={item.to.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-secondary"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            key={item.label || index}
                            to={(item.to || "/") as any}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-secondary"
                            activeProps={{ className: "bg-secondary text-primary font-bold" }}
                            activeOptions={{ exact: item.to === "/" }}
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </nav>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-3">
                      Categories
                    </h4>
                    <div className="flex flex-col gap-0.5">
                      {displayedCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          to="/category/$slug"
                          params={{ slug: cat.slug }}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-foreground/85 hover:bg-secondary"
                        >
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-6 w-6 rounded-full object-cover border border-border"
                            onError={(e) => {
                              const localMatch = subcategories.find((s) => s.slug === cat.slug);
                              (e.target as HTMLImageElement).src = localMatch?.image || subcategories[0].image;
                            }}
                          />
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/50 p-4 bg-card/30">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-sm"
                >
                  <User size={14} /> Account Login
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

