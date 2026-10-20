import { createFileRoute } from "@tanstack/react-router";
import { InfoPageShell, PolicyBody } from "@/components/store/InfoPageShell";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy — Sri Kamatchi Silk" },
      {
        name: "description",
        content: "Return policy for damaged sarees only at Sri Kamatchi Silk.",
      },
    ],
  }),
  component: () => (
    <InfoPageShell title="Return Policy" subtitle="Returns are accepted only for sarees delivered in damaged condition.">
      <PolicyBody
        sections={[
          {
            heading: "Damaged Sarees Only",
            body: "Returns are accepted only when a saree is delivered in damaged condition. Items cannot be returned for a change of mind, colour preference, or other non-damage reasons.",
          },
          {
            heading: "Report a Damaged Saree",
            body: "Contact Sri Kamatchi Silk customer support within 48 hours of delivery with your order details and clear photos or video showing the damage. Keep the saree and its original packaging until our team responds.",
          },
          {
            heading: "Review and Resolution",
            body: "Our team will review the damage report and confirm the next steps. A return, replacement, or refund will be arranged only after the damage claim is approved and the resolution is confirmed by our team.",
          },
        ]}
      />
    </InfoPageShell>
  ),
});
