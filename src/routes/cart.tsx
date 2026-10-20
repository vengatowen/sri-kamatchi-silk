import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { EmptyState } from "@/components/store/EmptyState";
import { useStore } from "@/store/StoreContext";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Shopping Cart — Sri Kamatchi Silk" }] }),
  component: CartPage,
});

function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useStore();
  const [coupon, setCoupon] = useState("");
  const [shippingState, setShippingState] = useState(() => {
    try { return localStorage.getItem("sk-shipping-state") || ""; } catch { return ""; }
  });
  useEffect(() => {
    try {
      if (shippingState) localStorage.setItem("sk-shipping-state", shippingState);
      else localStorage.removeItem("sk-shipping-state");
    } catch { /* State selection remains usable if storage is unavailable. */ }
  }, [shippingState]);
  const shippingRate = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === "tamil nadu") return 40;
    if (["karnataka", "kerala", "telangana", "andhra pradesh"].includes(normalized)) return 60;
    return value ? 80 : null;
  };
  const rate = shippingRate(shippingState);
  const shipping = cartSubtotal === 0 ? 0 : (rate ?? 0);
  const total = cartSubtotal + shipping;

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Shopping Cart
        </h1>
        {cart.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Looks like you haven't added any sarees yet."
              action={
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                >
                  Start Shopping <ArrowRight size={16} />
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-28 w-24 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gold">
                          {item.product.subcategory}
                        </p>
                        <Link
                          to="/product/$slug"
                          params={{ slug: item.product.slug }}
                          className="text-sm font-medium text-foreground hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Remove"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center text-foreground hover:text-primary"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center text-foreground hover:text-primary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatINR(
                          (item.product.discountPrice ?? item.product.price) * item.quantity,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold"
                  />
                </div>
                <button className="rounded-full bg-secondary px-4 text-sm font-medium text-secondary-foreground">
                  Apply
                </button>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatINR(cartSubtotal)}</dd>
                </div>
                <div className="space-y-2">
                  <label htmlFor="cart-shipping-state" className="text-muted-foreground">Delivery state</label>
                  <select id="cart-shipping-state" value={shippingState} onChange={(e) => setShippingState(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold">
                    <option value="">Select state to calculate shipping</option><option value="Tamil Nadu">Tamil Nadu</option><option value="Karnataka">Karnataka</option><option value="Kerala">Kerala</option><option value="Telangana">Telangana</option><option value="Andhra Pradesh">Andhra Pradesh</option><option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option><option value="Arunachal Pradesh">Arunachal Pradesh</option><option value="Assam">Assam</option><option value="Bihar">Bihar</option><option value="Chandigarh">Chandigarh</option><option value="Chhattisgarh">Chhattisgarh</option><option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option><option value="Delhi">Delhi</option><option value="Goa">Goa</option><option value="Gujarat">Gujarat</option><option value="Haryana">Haryana</option><option value="Himachal Pradesh">Himachal Pradesh</option><option value="Jammu and Kashmir">Jammu and Kashmir</option><option value="Jharkhand">Jharkhand</option><option value="Ladakh">Ladakh</option><option value="Lakshadweep">Lakshadweep</option><option value="Madhya Pradesh">Madhya Pradesh</option><option value="Maharashtra">Maharashtra</option><option value="Manipur">Manipur</option><option value="Meghalaya">Meghalaya</option><option value="Mizoram">Mizoram</option><option value="Nagaland">Nagaland</option><option value="Odisha">Odisha</option><option value="Puducherry">Puducherry</option><option value="Punjab">Punjab</option><option value="Rajasthan">Rajasthan</option><option value="Sikkim">Sikkim</option><option value="Tripura">Tripura</option><option value="Uttar Pradesh">Uttar Pradesh</option><option value="Uttarakhand">Uttarakhand</option><option value="West Bengal">West Bengal</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">{cartSubtotal === 0 ? "—" : rate === null ? "Select state" : formatINR(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-bold text-primary">{formatINR(total)}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
