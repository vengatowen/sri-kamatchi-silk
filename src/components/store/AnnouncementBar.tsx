import { useState, useEffect } from "react";
import { Truck, Sparkles, Phone, ShieldCheck, HelpCircle } from "lucide-react";
import { API_BASE } from "@/lib/api";

const getIcon = (text: string) => {
  const lowercase = text.toLowerCase();
  if (lowercase.includes("shipping") || lowercase.includes("delivery")) return Truck;
  if (
    lowercase.includes("styling") ||
    lowercase.includes("phone") ||
    lowercase.includes("call") ||
    lowercase.includes("assistance") ||
    lowercase.includes("+91")
  )
    return Phone;
  if (
    lowercase.includes("off") ||
    lowercase.includes("discount") ||
    lowercase.includes("%") ||
    lowercase.includes("sale") ||
    lowercase.includes("wedding")
  )
    return Sparkles;
  if (
    lowercase.includes("secure") ||
    lowercase.includes("guarantee") ||
    lowercase.includes("check")
  )
    return ShieldCheck;
  return HelpCircle;
};

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/home`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.announcements) {
          const filtered = data.data.announcements.filter((a: any) => {
            if (!a.enabled) return false;
            const text = a.text.toLowerCase();
            return !text.includes("+91") && !text.includes("98400") && !text.includes("12345");
          });
          setAnnouncements(filtered);
        }
      })
      .catch((err) => console.error("Error fetching announcements:", err));
  }, []);

  const items =
    announcements.length > 0
      ? announcements
      : [
          { text: "Free shipping on orders above ₹4,999", enabled: true },
          { text: "Up to 30% off on the Wedding Collection", enabled: true },
          {
            text: "Contact us on WhatsApp for styling & custom orders",
            link: "https://wa.me/917305459199",
            enabled: true,
          },
        ];

  return (
    <div className="bg-gradient-maroon text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-hidden px-4 py-2 text-xs">
        {items.map((m, i) => {
          const Icon = getIcon(m.text);
          return (
            <div
              key={i}
              className={`flex items-center gap-2 whitespace-nowrap ${i > 0 ? "hidden sm:flex" : ""}`}
            >
              <Icon size={13} className="text-gold" />
              {m.link ? (
                <a href={m.link} className="tracking-wide hover:underline">
                  {m.text}
                </a>
              ) : (
                <span className="tracking-wide">{m.text}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
