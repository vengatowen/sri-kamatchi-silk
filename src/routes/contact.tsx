import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Send, Sparkles } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { SectionHeading } from "@/components/store/SectionHeading";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Sri Kamatchi Silk" },
      {
        name: "description",
        content: "Visit our premium saree boutique or contact our styling experts.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "Bridal Styling",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Message sent successfully!", {
        description: "Our bridal style consultants will contact you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", reason: "Bridal Styling", message: "" });
    }, 1200);
  };

  return (
    <StoreLayout>
      {/* Hero Header */}
      <section className="bg-gradient-champagne relative overflow-hidden py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="mb-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>{" "}
            / <span className="text-foreground">Contact Us</span>
          </nav>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-gold mb-6">
            <Sparkles size={13} /> Custom Care
          </span>
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Connect With Our Consultants
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Whether choosing your dream wedding saree or inquiring about wholesale catalog custom
            orders, our personal style advisors are ready to assist you.
          </p>
          <div className="gold-divider mx-auto mt-6 w-24" />
        </div>
      </section>

      {/* Grid Layout */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10"
          >
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Send Us A Message
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Fill in your details below and our weavers & styling support team will respond
              quickly.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Your Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter contact number"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="reason"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Inquiry For *
                  </label>
                  <select
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-gold"
                  >
                    <option value="Bridal Styling">Bridal Styling Appointment</option>
                    <option value="Custom Weaving">Custom Zari/Design Weaving</option>
                    <option value="Order Support">Order Tracking & Returns</option>
                    <option value="Wholesale Inquiry">Wholesale & Corporate Purchases</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Your Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details about what you are looking for (e.g. Wedding dates, custom border preferences, color options)..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-gold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-75"
              >
                {submitting ? (
                  "Sending Inquiry..."
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Details */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-xl font-bold text-foreground">
                Our Flagship Boutique
              </h3>
              <div className="gold-divider mt-3 w-16" />
              <ul className="mt-6 space-y-6">
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Address
                    </h4>
                    <p className="text-sm font-medium text-foreground mt-1">
                      26/85D3, Gandhinagar, Nallikadai Street,
                      <br />
                      Salem Main Road, Elampillai - 637502
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      WhatsApp Support
                    </h4>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      <a
                        href="https://wa.me/7200170633"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        7200170633 · Contact on WhatsApp
                      </a>
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Support Email
                    </h4>
                    <p className="text-sm font-medium text-foreground mt-1">
                      care@srikamatchisilk.com
                      <br />
                      bridal@srikamatchisilk.com
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Showroom Hours
                    </h4>
                    <p className="text-sm font-medium text-foreground mt-1">
                      Open 7 Days a week
                      <br />
                      09:00 AM - 09:00 PM (IST)
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Maps for the updated Elampillai shop address */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <div className="bg-secondary/60 px-5 py-4 flex items-center justify-between border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Elampillai Shop
                </span>
                <MapPin size={16} className="text-primary" />
              </div>
              <iframe
                title="Sri Kamatchi Silks shop location in Elampillai"
                src="https://maps.google.com/maps?q=26%2F85D3%2C%20Gandhinagar%2C%20Nallikadai%20Street%2C%20Salem%20Main%20Road%2C%20Elampillai%20637502&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="block aspect-[4/3] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="p-4">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=26%2F85D3%2C%20Gandhinagar%2C%20Nallikadai%20Street%2C%20Salem%20Main%20Road%2C%20Elampillai%20637502"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-primary/20 bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary shadow-soft hover:bg-secondary"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
