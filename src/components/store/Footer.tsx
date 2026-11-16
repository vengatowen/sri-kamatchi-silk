import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { subcategories } from "@/data/categories";
import { API_BASE } from "@/lib/api";
import logoImg from "@/assets/logo.png";

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Return Policy", to: "/return-policy" },
];

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Shop All", to: "/shop" },
  { label: "Contact", to: "/contact" },
  { label: "My Orders", to: "/orders" },
];

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/home`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch((err) => console.error("Error fetching footer settings:", err));
  }, []);

  const footer = settings?.footer;
  const description =
    footer?.description ||
    "Weaving heritage into every drape. Sri Kamatchi Silk brings you handcrafted Kanchipuram and luxury silk sarees, made by master artisans for life's most treasured moments.";
  const address = footer?.address || "No. 24, Silk Bazaar Road, Kanchipuram, Tamil Nadu 631502";
  const phone = footer?.phone || "";
  const email = footer?.email || "care@srikamatchisilk.com";
  const copyright = footer?.copyright || "Sri Kamatchi Silk. All rights reserved.";
  const bottomNote = footer?.bottomNote || "Handwoven with love in Kanchipuram, India.";
  const brandName = settings?.header?.brandName || "Sri Kamatchi Silk";
  const logoUrl = settings?.header?.logoUrl || "";

  const getLogoSrc = () => {
    if (!logoUrl) return logoImg;
    if (logoUrl.startsWith("http") || logoUrl.startsWith("data:")) return logoUrl;
    if (logoUrl.startsWith("/")) return `${API_BASE}${logoUrl}`;
    return logoUrl;
  };

  const socialLinks = footer?.socialLinks || {};

  const socials = [
    { Icon: Instagram, link: socialLinks.instagram, name: "Instagram" },
    { Icon: Facebook, link: socialLinks.facebook, name: "Facebook" },
    { Icon: Youtube, link: socialLinks.youtube, name: "YouTube" },
    { Icon: Twitter, link: socialLinks.twitter, name: "Twitter" },
  ].filter((s) => s.link && s.link !== "#" && s.link !== "");

  return (
    <footer className="mt-24 border-t border-border bg-gradient-champagne/40 text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border border-border bg-white p-1 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={getLogoSrc()}
                  alt={brandName}
                  className="h-full w-full object-cover rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== logoImg) {
                      target.src = logoImg;
                    }
                  }}
                />
              </div>
              <span className="font-display text-xl font-bold text-primary">{brandName}</span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
            {socials.length > 0 && (
              <div className="mt-2 flex gap-2.5">
                {socials.map(({ Icon, link, name }, i) => (
                  <a
                    key={i}
                    href={link}
                    aria-label={`${name} link`}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border/80 bg-background text-foreground/75 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Shop Categories</h4>
            <ul className="mt-5 space-y-2.5 text-xs">
              {subcategories.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: s.slug }}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Quick Links</h4>
            <ul className="mt-5 space-y-2.5 text-xs">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {policyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold">
              Get in Touch
            </h4>
            <ul className="mt-5 space-y-3.5 text-xs text-muted-foreground">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                  <span className="leading-relaxed">{address}</span>
                </li>
              )}
              <li className="flex items-center gap-3">
                <span className="shrink-0 text-gold font-extrabold text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-gold/30">WA</span>
                <a
                  href="https://wa.me/917305459199"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors font-medium hover:underline"
                >
                  WhatsApp Support
                </a>
              </li>
              {email && (
                <li className="flex items-center gap-3">
                  <Mail size={15} className="shrink-0 text-gold" />
                  <a href={`mailto:${email}`} className="hover:text-primary transition-colors font-medium hover:underline">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-[11px] text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {copyright}
          </p>
          <p className="font-semibold text-gold/80">{bottomNote}</p>
        </div>
      </div>
    </footer>
  );
}

