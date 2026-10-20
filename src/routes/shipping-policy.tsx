import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { InfoPageShell, PolicyBody } from "@/components/store/InfoPageShell";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Sri Kamatchi Silk" },
      {
        name: "description",
        content: "Delivery timelines, charges and coverage for Sri Kamatchi Silk.",
      },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  const [shipping, setShipping] = useState({
    freeShippingAbove: 4999,
    deliveryDays: 5,
    stateShippingFees: { tamilNadu: 30, pondicherry: 30, southStates: 60, otherStates: 80 },
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/shipping`)
      .then((response) => response.json())
      .then((res) => {
        if (res.success && res.data) {
          setShipping({
            freeShippingAbove: Number(res.data.freeShippingAbove ?? 4999),
            deliveryDays: Number(res.data.deliveryDays ?? 5),
            stateShippingFees: {
              tamilNadu: 30,
              pondicherry: 30,
              southStates: 60,
              otherStates: 80,
              ...(res.data.stateShippingFees || {}),
            },
          });
        }
      })
      .catch((error) => console.error("Unable to load shipping policy rates", error));
  }, []);

  const fees = shipping.stateShippingFees;
  const formatFee = (fee: number) => `₹${fee} per item`;

  return (
    <InfoPageShell title="Shipping Policy" subtitle="Safe and timely delivery, every time.">
      <PolicyBody
        sections={[
          {
            heading: "Delivery Timelines",
            body: `Orders are processed within 1–2 business days. Standard delivery takes approximately ${shipping.deliveryDays} business days within India, depending on your location.`,
          },
          {
            heading: "Shipping Charges",
            body: `Shipping is charged per saree/item based on delivery location: Tamil Nadu ${formatFee(fees.tamilNadu)}, Puducherry ${formatFee(fees.pondicherry)}, Karnataka, Kerala, Telangana and Andhra Pradesh ${formatFee(fees.southStates)}, and other Indian states including North India ${formatFee(fees.otherStates)}. The per-item fee is multiplied by the total quantity in the cart. Orders at or above the Free Shipping Cap of ₹${shipping.freeShippingAbove.toLocaleString("en-IN")} qualify for free shipping.`,
          },
          {
            heading: "Coverage",
            body: "We currently ship across India. International shipping is available on request — please contact our support team.",
          },
          {
            heading: "Order Tracking",
            body: "Once your order is dispatched, you will receive a tracking link via SMS and email to follow your shipment.",
          },
          {
            heading: "Packaging",
            body: "Each saree is carefully packed in premium, protective packaging to ensure it reaches you in pristine condition.",
          },
        ]}
      />
    </InfoPageShell>
  );
}
