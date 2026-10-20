import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CreditCard, Banknote, Lock, Loader2, AlertTriangle } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { useStore } from "@/store/StoreContext";
import { formatINR } from "@/lib/format";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Sri Kamatchi Silk" }] }),
  component: CheckoutPage,
});

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useStore();
  const [pay, setPay] = useState<"razorpay" | "cod">("razorpay");

  // Dynamic logistics settings states
  const [shippingCharge, setShippingCharge] = useState(99);
  const [stateShippingFees, setStateShippingFees] = useState({ tamilNadu: 30, pondicherry: 30, southStates: 60, otherStates: 80 });
  const [freeShippingAbove, setFreeShippingAbove] = useState(4999);
  const [codEnabled, setCodEnabled] = useState(true);

  // Address & Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(() => {
    try { return localStorage.getItem("sk-shipping-state") || ""; } catch { return ""; }
  });
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  const [isPlacing, setIsPlacing] = useState(false);
  useEffect(() => {
    try {
      if (state) localStorage.setItem("sk-shipping-state", state);
      else localStorage.removeItem("sk-shipping-state");
    } catch { /* Checkout remains usable if storage is unavailable. */ }
  }, [state]);

  // 1. Fetch shipping logistics settings from Neon dynamically
  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/settings/shipping`);
        const res = await response.json();
        if (res.success && res.data) {
          setShippingCharge(res.data.shippingCharge);
          setStateShippingFees({ tamilNadu: 30, pondicherry: 30, southStates: 60, otherStates: 80, ...(res.data.stateShippingFees || {}) });
          setFreeShippingAbove(res.data.freeShippingAbove);
          setCodEnabled(res.data.codEnabled);
        }
      } catch (err) {
        console.error("Error loading shipping settings:", err);
      }
    };
    fetchShipping();
  }, []);

  // 2. Load user data if logged in
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 3. Shipping fee calculations based on dynamic rules
  const shippingRate = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === "tamil nadu") return Number(stateShippingFees.tamilNadu);
    if (["puducherry", "pondicherry"].includes(normalized)) return Number(stateShippingFees.pondicherry);
    if (["karnataka", "kerala", "telangana", "andhra pradesh"].includes(normalized)) return Number(stateShippingFees.southStates);
    return value.trim() ? Number(stateShippingFees.otherStates) : null;
  };
  const stateShipping = shippingRate(state);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = country.trim().toLowerCase() === "india" && cartSubtotal > 0
    ? (cartSubtotal >= freeShippingAbove ? 0 : (stateShipping ?? 0) * itemCount)
    : 0;
  const total = cartSubtotal + shipping;

  const navigate = useNavigate();

  const handleWhatsAppContact = () => {
    const cartSummary = cart.map((i) => `${i.product.name} (Qty: ${i.quantity})`).join(", ");

    const text = `Hello Sri Kamatchi Silk, I would like to place an international order.
Order Details:
- Items: ${cartSummary}
- Subtotal: ${formatINR(cartSubtotal)}
- Customer Name: ${name || "Guest"}
- Country: ${country}
- City: ${city || "N/A"}`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/919443210987?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in or create an account to complete your luxury saree order.",
      });
      navigate({ to: "/login" });
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Gating check
    if (country.trim().toLowerCase() !== "india") {
      toast.error("Direct checkout is blocked for international addresses.");
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error("Invalid pincode", {
        description: "Please enter a valid 6-digit Indian postal code.",
      });
      return;
    }

    setIsPlacing(true);

    try {
      if (pay === "cod") {
        // COD creation flow
        const orderPayload = {
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          paymentMethod: "COD",
          customerName: name,
          customerPhone: phone,
          address: landmark ? `${address} (Landmark: ${landmark})` : address,
          city,
          state,
          pincode,
          country,
        };

        const response = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData.message || "Failed to create COD order.");
        }

        toast.success("Order placed successfully via Cash on Delivery!", {
          description: "Thank you for shopping at Sri Kamatchi Silk.",
        });
        clearCart();
        navigate({ to: "/orders" });
      } else {
        // Real Razorpay Payments standard checkout flow
        const rzpRes = await fetch(`${API_BASE}/api/payments/razorpay/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart.map((i) => ({
              productId: i.product.id,
              quantity: i.quantity,
            })),
            customerName: name,
            customerPhone: phone,
            address: landmark ? `${address} (Landmark: ${landmark})` : address,
            city,
            state,
            pincode,
            country,
          }),
        });

        const rzpData = await rzpRes.json();
        if (!rzpRes.ok || !rzpData.success) {
          throw new Error(rzpData.message || "Razorpay order creation failed.");
        }

        // Load dynamic Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Razorpay billing widget failed to initialize. Please check connection.");
        }

        const options = {
          key: rzpData.keyId,
          amount: Math.round(total * 100),
          currency: rzpData.currency,
          name: "Sri Kamatchi Silk",
          description: "Premium Handloom Saree Order",
          order_id: rzpData.razorpayOrderId,
          handler: async function (response: any) {
            setIsPlacing(true);
            try {
              const verifyRes = await fetch(`${API_BASE}/api/payments/razorpay/verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.message || "Payment verification failed.");
              }

              toast.success("Payment successful! Order confirmed.", {
                description: "Your handloom saree is being prepped for dispatch.",
              });
              clearCart();
              navigate({ to: "/orders" });
            } catch (err: any) {
              console.error(err);
              toast.error(err.message || "Payment verification failed.");
            } finally {
              setIsPlacing(false);
            }
          },
          prefill: {
            name: name,
            contact: phone,
            email: email,
          },
          theme: {
            color: "#3a1d13",
          },
          modal: {
            ondismiss: function () {
              setIsPlacing(false);
              toast.error("Payment cancelled by customer.");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  const field =
    "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-gold disabled:opacity-70";

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Checkout</h1>

        {/* Login warning banner if guest */}
        {!localStorage.getItem("token") && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-xs font-medium text-amber-800">
            <AlertTriangle className="shrink-0 text-amber-600" size={16} />
            <div className="flex-1">
              <span>You are checking out as a Guest. </span>
              <Link to="/login" className="font-bold underline hover:text-amber-950">
                Log in now
              </Link>
              <span> to persistently track this order and save sarees.</span>
            </div>
          </div>
        )}

        <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Full name"
                  className={field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPlacing}
                />
                <input
                  required
                  placeholder="Phone number"
                  className={field}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPlacing}
                />
                <input
                  required
                  placeholder="Email"
                  type="email"
                  className={`${field} sm:col-span-2`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPlacing}
                />
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (e.target.value !== "India") {
                        setPay("razorpay"); // reset default selection
                      }
                    }}
                    disabled={isPlacing}
                    className={`${field} cursor-pointer`}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>
                <input
                  required
                  placeholder="Address line"
                  className={`${field} sm:col-span-2`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isPlacing}
                />
                <input
                  required
                  placeholder="City"
                  className={field}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isPlacing}
                />
                <select
                  required
                  aria-label="State"
                  className={field + " cursor-pointer"}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={isPlacing}
                >
                  <option value="">Select state</option><option value="Tamil Nadu">Tamil Nadu</option><option value="Karnataka">Karnataka</option><option value="Kerala">Kerala</option><option value="Telangana">Telangana</option><option value="Andhra Pradesh">Andhra Pradesh</option><option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option><option value="Arunachal Pradesh">Arunachal Pradesh</option><option value="Assam">Assam</option><option value="Bihar">Bihar</option><option value="Chandigarh">Chandigarh</option><option value="Chhattisgarh">Chhattisgarh</option><option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option><option value="Delhi">Delhi</option><option value="Goa">Goa</option><option value="Gujarat">Gujarat</option><option value="Haryana">Haryana</option><option value="Himachal Pradesh">Himachal Pradesh</option><option value="Jammu and Kashmir">Jammu and Kashmir</option><option value="Jharkhand">Jharkhand</option><option value="Ladakh">Ladakh</option><option value="Lakshadweep">Lakshadweep</option><option value="Madhya Pradesh">Madhya Pradesh</option><option value="Maharashtra">Maharashtra</option><option value="Manipur">Manipur</option><option value="Meghalaya">Meghalaya</option><option value="Mizoram">Mizoram</option><option value="Nagaland">Nagaland</option><option value="Odisha">Odisha</option><option value="Puducherry">Puducherry</option><option value="Punjab">Punjab</option><option value="Rajasthan">Rajasthan</option><option value="Sikkim">Sikkim</option><option value="Tripura">Tripura</option><option value="Uttar Pradesh">Uttar Pradesh</option><option value="Uttarakhand">Uttarakhand</option><option value="West Bengal">West Bengal</option>
                </select>
                <input
                  required
                  placeholder="Pincode"
                  className={field}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  disabled={isPlacing}
                />
                <input
                  placeholder="Landmark (optional)"
                  className={field}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  disabled={isPlacing}
                />
              </div>
            </div>

            {/* Payment Method Option Panel */}
            {country.trim().toLowerCase() === "india" ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
                <div className="mt-4 space-y-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${pay === "razorpay" ? "border-gold bg-secondary/50" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      checked={pay === "razorpay"}
                      onChange={() => setPay("razorpay")}
                      disabled={isPlacing}
                      className="accent-[var(--primary)]"
                    />
                    <CreditCard size={20} className="text-primary" />
                    <span className="text-sm font-medium">Razorpay (Cards, UPI, Netbanking)</span>
                  </label>
                  {codEnabled && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${pay === "cod" ? "border-gold bg-secondary/50" : "border-border"}`}
                    >
                      <input
                        type="radio"
                        checked={pay === "cod"}
                        onChange={() => setPay("cod")}
                        disabled={isPlacing}
                        className="accent-[var(--primary)]"
                      />
                      <Banknote size={20} className="text-primary" />
                      <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-soft space-y-4">
                <div className="flex gap-3 text-amber-800">
                  <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">International Checkout Restriction</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed font-semibold">
                      Direct online checkout is currently available only within India. For
                      international orders, please contact Sri Kamatchi Silk directly.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground">Your Order</h2>
            <div className="mt-4 max-h-60 space-y-3 overflow-y-auto">
              {cart.map((i) => (
                <div key={i.product.id} className="flex items-center gap-3">
                  <img
                    src={i.product.image}
                    alt={i.product.name}
                    className="h-14 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{i.product.name}</p>
                    <p className="text-muted-foreground">Qty {i.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatINR((i.product.discountPrice ?? i.product.price) * i.quantity)}
                  </span>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.{" "}
                  <Link to="/shop" className="text-primary">
                    Shop now
                  </Link>
                </p>
              )}
            </div>
            <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatINR(cartSubtotal)}</dd>
              </div>
              {country.trim().toLowerCase() === "india" ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd>{cartSubtotal === 0 ? "—" : cartSubtotal >= freeShippingAbove ? "Free" : stateShipping === null ? "Select state" : formatINR(shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="text-primary">{formatINR(total)}</dd>
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-amber-50/50 border border-amber-200 p-3.5 text-xs text-amber-800 font-semibold leading-relaxed mt-4">
                  International shipping rates apply. Please contact us directly for order pricing
                  and courier details.
                </div>
              )}
            </dl>

            {country.trim().toLowerCase() === "india" ? (
              <button
                disabled={cart.length === 0 || isPlacing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50 cursor-pointer"
              >
                {isPlacing ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                {isPlacing ? "Processing..." : "Place Order"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 py-3 text-sm font-semibold text-white cursor-pointer transition-colors"
              >
                Contact Directly for Order
              </button>
            )}
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
