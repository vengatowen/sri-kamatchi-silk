import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Truck,
  Sparkles,
  HelpCircle,
  Save,
  Settings,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Navigation,
  FileText,
  MessageSquare,
  Instagram,
  Mail,
  Home,
  Check,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const AVAILABLE_ICONS = [
  "Award",
  "ShieldCheck",
  "Truck",
  "Headphones",
  "Crown",
  "Sparkles",
  "PartyPopper",
  "Landmark",
  "Sun",
  "Gift",
  "Heart",
  "Star",
  "Phone",
  "Mail",
];

// Reusable Image Upload component with Canvas-based Compression and paste URL support
function ImageUploadField({
  label,
  value,
  onChange,
  onRemove,
  recommendedSize = "Recommended size: 1080x1440 px",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
  recommendedSize?: string;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteUrlMode, setPasteUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 1000;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          onChange(dataUrl);
          toast.success("Image uploaded & compressed successfully!");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">{label}</label>
        <button
          type="button"
          onClick={() => setPasteUrlMode(!pasteUrlMode)}
          className="text-[11px] text-[#d4af37] hover:underline"
        >
          {pasteUrlMode ? "Use Uploader" : "Paste Public URL"}
        </button>
      </div>

      {pasteUrlMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-2 text-xs outline-none focus:border-[#d4af37]"
          />
          {value && (
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-2 text-xs rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[140px]",
            dragActive
              ? "border-[#d4af37] bg-[#fbfaf7]"
              : "border-[#e8dfd8] bg-[#fbfaf7]/40 hover:bg-[#fbfaf7]/60",
          )}
        >
          {value ? (
            <div className="relative group w-full flex flex-col items-center">
              <img
                src={
                  value.startsWith("data:") || value.startsWith("http")
                    ? value
                    : `${API_BASE}${value}`
                }
                alt="Preview"
                className="max-h-[120px] rounded-lg object-contain border border-[#e8dfd8]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg gap-2">
                <label className="cursor-pointer bg-white text-primary px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-secondary">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFile(e.target.files[0]);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={onRemove}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col items-center">
              <UploadCloud size={28} className="text-[#6e5d53]" />
              <div className="text-xs text-muted-foreground">
                <label className="cursor-pointer text-[#d4af37] hover:underline font-semibold">
                  Click to upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFile(e.target.files[0]);
                    }}
                  />
                </label>{" "}
                or drag and drop
              </div>
              <p className="text-[10px] text-muted-foreground">{recommendedSize}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // Legacy & Specific states retained
  const [rzpActive, setRzpActive] = useState(true);
  const [rzpMode, setRzpMode] = useState("test");
  const [rzpKeyId, setRzpKeyId] = useState("");
  const [rzpSecret, setRzpSecret] = useState("");

  const [shipFreeAbove, setShipFreeAbove] = useState(4999);
  const [shipCharge, setShipCharge] = useState(99);
  const [shipCod, setShipCod] = useState(true);
  const [shipDays, setShipDays] = useState(5);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [offerBanner, setOfferBanner] = useState("");

  // Grouped Storefront settings JSON object
  const [homeSettings, setHomeSettings] = useState<any>({
    announcements: [],
    header: {},
    hero: {},
    banners: [],
    toggles: {},
    categoriesSection: {},
    trendingSections: {},
    occasionFinder: {},
    promiseSection: {},
    testimonials: [],
    gallery: {},
    newsletter: {},
    footer: {},
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 1. Fetch Shipping Rules
      const shipRes = await fetch(`${API_BASE}/api/settings/shipping`);
      const shipData = await shipRes.json();
      if (shipData.success && shipData.data) {
        setShipFreeAbove(shipData.data.freeShippingAbove);
        setShipCharge(shipData.data.shippingCharge);
        setShipCod(shipData.data.codEnabled);
        setShipDays(shipData.data.deliveryDays);
      }

      // 2. Fetch Payment Rules
      if (token) {
        const payRes = await fetch(`${API_BASE}/api/settings/payment`, { headers });
        const payData = await payRes.json();
        if (payData.success && payData.data) {
          setRzpActive(payData.data.razorpayEnabled);
          setRzpKeyId(payData.data.razorpayKeyId || "");
          setRzpSecret(payData.data.razorpaySecret || "");
          setRzpMode(payData.data.razorpayMode || "test");
        }
      }

      // 3. Fetch CMS settings
      const homeRes = await fetch(`${API_BASE}/api/settings/home`);
      const homeData = await homeRes.json();
      if (homeData.success && homeData.data) {
        setHomeSettings(homeData.data);
        setHeroTitle(homeData.data.heroTitle || "");
        setHeroSubtitle(homeData.data.heroSubtitle || "");
        setHeroImage(homeData.data.heroImage || "");
        setOfferBanner(homeData.data.offerBanner || "");
      }
    } catch (err) {
      console.error("Error loading boutique settings:", err);
      toast.error("Failed to load backend configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Payment settings
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Admin credentials not found");

      const response = await fetch(`${API_BASE}/api/settings/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpayKeyId: rzpKeyId,
          razorpaySecret: rzpSecret,
          razorpayEnabled: rzpActive,
          razorpayMode: rzpMode,
        }),
      });

      const res = await response.json();
      if (!response.ok || !res.success) throw new Error(res.message);
      toast.success("Payment Gateway configurations saved successfully!");
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment settings");
    }
  };

  // Save Shipping settings
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Admin credentials not found");

      const response = await fetch(`${API_BASE}/api/settings/shipping`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          freeShippingAbove: shipFreeAbove,
          shippingCharge: shipCharge,
          codEnabled: shipCod,
          deliveryDays: shipDays,
        }),
      });

      const res = await response.json();
      if (!response.ok || !res.success) throw new Error(res.message);
      toast.success("Logistics & Shipping configurations saved successfully!");
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || "Failed to update shipping settings");
    }
  };

  // Save specific grouped homepage JSON part
  const handleSaveSettingsPart = async (partData: any, sectionName: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Admin credentials not found");

      const response = await fetch(`${API_BASE}/api/settings/home`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partData),
      });

      const res = await response.json();
      if (!response.ok || !res.success) throw new Error(res.message);
      toast.success(`${sectionName} CMS configurations saved live!`);

      // Reload from DB to keep component values synchronized
      const homeRes = await fetch(`${API_BASE}/api/settings/home`);
      const homeData = await homeRes.json();
      if (homeData.success && homeData.data) {
        setHomeSettings(homeData.data);
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to update ${sectionName}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-[#6e5d53] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#3a1d13]" />
        <span className="font-semibold">Retrieving boutique database configurations...</span>
      </div>
    );
  }

  // REPEATERS HELPER FUNCTIONS
  // Announcements
  const handleAnnouncementChange = (index: number, key: string, value: any) => {
    const list = [...(homeSettings.announcements || [])];
    list[index] = { ...list[index], [key]: value };
    setHomeSettings({ ...homeSettings, announcements: list });
  };
  const moveAnnouncement = (index: number, direction: "up" | "down") => {
    const list = [...(homeSettings.announcements || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setHomeSettings({ ...homeSettings, announcements: list });
  };
  const removeAnnouncement = (index: number) => {
    const list = (homeSettings.announcements || []).filter((_: any, i: number) => i !== index);
    setHomeSettings({ ...homeSettings, announcements: list });
  };
  const addAnnouncement = () => {
    const list = [...(homeSettings.announcements || [])];
    list.push({ text: "New announcements highlight", link: "", enabled: true });
    setHomeSettings({ ...homeSettings, announcements: list });
  };

  // Testimonials
  const handleTestimonialChange = (index: number, key: string, value: any) => {
    const list = [...(homeSettings.testimonials || [])];
    list[index] = { ...list[index], [key]: value };
    setHomeSettings({ ...homeSettings, testimonials: list });
  };
  const moveTestimonial = (index: number, direction: "up" | "down") => {
    const list = [...(homeSettings.testimonials || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setHomeSettings({ ...homeSettings, testimonials: list });
  };
  const removeTestimonial = (index: number) => {
    const list = (homeSettings.testimonials || []).filter((_: any, i: number) => i !== index);
    setHomeSettings({ ...homeSettings, testimonials: list });
  };
  const addTestimonial = () => {
    const list = [...(homeSettings.testimonials || [])];
    list.push({
      id: "t_" + Date.now(),
      name: "New Client",
      location: "City",
      text: "The saree and fabric quality is absolutely premium.",
      rating: 5,
      avatar: "NC",
    });
    setHomeSettings({ ...homeSettings, testimonials: list });
  };

  // Occasions
  const handleOccasionChange = (index: number, key: string, value: any) => {
    const oFinder = { ...homeSettings.occasionFinder };
    const list = [...(oFinder.items || [])];
    list[index] = { ...list[index], [key]: value };
    oFinder.items = list;
    setHomeSettings({ ...homeSettings, occasionFinder: oFinder });
  };
  const moveOccasion = (index: number, direction: "up" | "down") => {
    const oFinder = { ...homeSettings.occasionFinder };
    const list = [...(oFinder.items || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    oFinder.items = list;
    setHomeSettings({ ...homeSettings, occasionFinder: oFinder });
  };
  const removeOccasion = (index: number) => {
    const oFinder = { ...homeSettings.occasionFinder };
    oFinder.items = (oFinder.items || []).filter((_: any, i: number) => i !== index);
    setHomeSettings({ ...homeSettings, occasionFinder: oFinder });
  };
  const addOccasion = () => {
    const oFinder = { ...homeSettings.occasionFinder };
    const list = [...(oFinder.items || [])];
    list.push({ name: "New Occasion", icon: "Crown" });
    oFinder.items = list;
    setHomeSettings({ ...homeSettings, occasionFinder: oFinder });
  };

  // Why Us / Promise Section
  const handlePromiseChange = (index: number, key: string, value: any) => {
    const promise = { ...homeSettings.promiseSection };
    const list = [...(promise.cards || [])];
    list[index] = { ...list[index], [key]: value };
    promise.cards = list;
    setHomeSettings({ ...homeSettings, promiseSection: promise });
  };
  const movePromise = (index: number, direction: "up" | "down") => {
    const promise = { ...homeSettings.promiseSection };
    const list = [...(promise.cards || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    promise.cards = list;
    setHomeSettings({ ...homeSettings, promiseSection: promise });
  };
  const removePromise = (index: number) => {
    const promise = { ...homeSettings.promiseSection };
    promise.cards = (promise.cards || []).filter((_: any, i: number) => i !== index);
    setHomeSettings({ ...homeSettings, promiseSection: promise });
  };
  const addPromise = () => {
    const promise = { ...homeSettings.promiseSection };
    const list = [...(promise.cards || [])];
    list.push({ title: "New Feature", text: "Premium quality guaranteed.", icon: "Award" });
    promise.cards = list;
    setHomeSettings({ ...homeSettings, promiseSection: promise });
  };

  // Gallery Repeater
  const handleGalleryItemChange = (index: number, key: string, value: any) => {
    const gal = { ...homeSettings.gallery };
    const list = [...(gal.items || [])];
    list[index] = { ...list[index], [key]: value };
    gal.items = list;
    setHomeSettings({ ...homeSettings, gallery: gal });
  };
  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    const gal = { ...homeSettings.gallery };
    const list = [...(gal.items || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    gal.items = list;
    setHomeSettings({ ...homeSettings, gallery: gal });
  };
  const removeGalleryItem = (index: number) => {
    const gal = { ...homeSettings.gallery };
    gal.items = (gal.items || []).filter((_: any, i: number) => i !== index);
    setHomeSettings({ ...homeSettings, gallery: gal });
  };
  const addGalleryItem = () => {
    const gal = { ...homeSettings.gallery };
    const list = [...(gal.items || [])];
    list.push({ imageUrl: "", caption: "", link: "#" });
    gal.items = list;
    setHomeSettings({ ...homeSettings, gallery: gal });
  };

  const tabs = [
    { id: "general", label: "General & Gateway", icon: Settings },
    { id: "announcements", label: "Announcement Bar", icon: Navigation },
    { id: "header", label: "Header & Branding", icon: Home },
    { id: "hero", label: "Hero Section", icon: Sparkles },
    { id: "banners", label: "Seasonal Banners", icon: ImageIcon },
    { id: "toggles", label: "Section Toggles", icon: ListFilter },
    { id: "categories", label: "Collections Highlight", icon: FileText },
    { id: "trending", label: "Trending Categories", icon: FileText },
    { id: "occasions", label: "Occasion Finder", icon: ListFilter },
    { id: "promise", label: "Why Choose Us", icon: ShieldCheck },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "gallery", label: "Instagram Gallery", icon: Instagram },
    { id: "newsletter", label: "Newsletter Form", icon: Mail },
    { id: "footer", label: "Footer & Contact", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="border-b border-[#f3ede8] pb-4">
        <h1 className="font-display text-2xl font-bold text-[#2c2623] sm:text-3xl">
          Boutique CMS & Operations Center
        </h1>
        <p className="text-sm text-[#6e5d53] mt-1">
          Configure backend gateway credentials, logistics settings, and update home storefront
          content dynamically.
        </p>
      </div>

      {/* Tabs Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {/* Mobile dropdown selector */}
          <div className="lg:hidden w-full mb-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3.5 py-3 text-sm font-semibold outline-none focus:border-[#d4af37]"
            >
              {tabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop list sidebar */}
          <div className="hidden lg:block space-y-1 bg-white p-2 rounded-2xl border border-[#e8dfd8]">
            {tabs.map((t) => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer",
                    activeTab === t.id
                      ? "bg-[#3a1d13] text-white shadow-soft"
                      : "text-[#6e5d53] hover:bg-[#fbfaf7] hover:text-[#2c2623]",
                  )}
                >
                  <TabIcon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configurations Form Panel */}
        <div className="flex-1 min-w-0">
          {/* 1. GENERAL SETTINGS */}
          {activeTab === "general" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Payment Gateway */}
              <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
                <div className="flex items-center gap-3 border-b border-[#f3ede8] pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Razorpay Integration</h3>
                    <p className="text-[10px] text-muted-foreground">
                      Manage your online credit card and UPI gateway.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePayment} className="space-y-4 text-sm text-[#2c2623]">
                  <div className="flex items-center justify-between rounded-xl bg-[#fbfaf7] border border-[#f3ede8] p-3.5">
                    <div>
                      <p className="font-bold text-xs">Enable Razorpay Payments</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Let clients pay securely online at checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRzpActive(!rzpActive)}
                      className="shrink-0 cursor-pointer"
                    >
                      {rzpActive ? (
                        <ToggleRight size={32} className="text-[#d4af37]" />
                      ) : (
                        <ToggleLeft size={32} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Gateway Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRzpMode("test")}
                        className={cn(
                          "flex-1 rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer",
                          rzpMode === "test"
                            ? "border-[#d4af37] bg-[#fbfaf7] text-primary"
                            : "border-[#e8dfd8] bg-white text-[#6e5d53]",
                        )}
                      >
                        Test/Sandbox
                      </button>
                      <button
                        type="button"
                        onClick={() => setRzpMode("live")}
                        className={cn(
                          "flex-1 rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer",
                          rzpMode === "live"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-[#e8dfd8] bg-white text-[#6e5d53]",
                        )}
                      >
                        Live Production
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      required
                      value={rzpKeyId}
                      onChange={(e) => setRzpKeyId(e.target.value)}
                      placeholder="rzp_test_..."
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37] font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Razorpay Key Secret
                    </label>
                    <input
                      type="password"
                      required
                      value={rzpSecret}
                      onChange={(e) => setRzpSecret(e.target.value)}
                      placeholder="Key Secret"
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37] font-mono text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-[#f3ede8]">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={14} /> Save Gateway
                    </button>
                  </div>
                </form>
              </div>

              {/* Logistics & Shipping */}
              <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
                <div className="flex items-center gap-3 border-b border-[#f3ede8] pb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Logistics & Shipping Rules</h3>
                    <p className="text-[10px] text-muted-foreground">
                      Adjust standard rates and cash on delivery eligibility.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveShipping} className="space-y-4 text-sm text-[#2c2623]">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                        Shipping charge (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={shipCharge}
                        onChange={(e) => setShipCharge(+e.target.value)}
                        className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                        Free Shipping Cap (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={shipFreeAbove}
                        onChange={(e) => setShipFreeAbove(+e.target.value)}
                        className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Transit Period (Days)
                    </label>
                    <input
                      type="number"
                      required
                      value={shipDays}
                      onChange={(e) => setShipDays(+e.target.value)}
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-[#fbfaf7] border border-[#f3ede8] p-3.5">
                    <div>
                      <p className="font-bold text-xs">Allow Cash on Delivery (COD)</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Let clients pay cash upon saree delivery.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShipCod(!shipCod)}
                      className="shrink-0 cursor-pointer"
                    >
                      {shipCod ? (
                        <ToggleRight size={32} className="text-[#d4af37]" />
                      ) : (
                        <ToggleLeft size={32} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-[#f3ede8]">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={14} /> Save Logistics
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 2. ANNOUNCEMENT BAR */}
          {activeTab === "announcements" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-[#f3ede8] pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">Top Announcement Bar Messages</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Manage small announcements scrolling on top of storefront pages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addAnnouncement}
                  className="rounded-xl bg-secondary text-primary border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Announcement
                </button>
              </div>

              <div className="space-y-4">
                {(!homeSettings.announcements || homeSettings.announcements.length === 0) && (
                  <p className="text-xs text-muted-foreground italic text-center py-6">
                    No announcements configured yet. Click above to add one.
                  </p>
                )}
                {homeSettings.announcements?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="border border-[#e8dfd8] bg-[#fbfaf7]/60 rounded-2xl p-4 space-y-3 relative"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#3a1d13]">
                        Announcement #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveAnnouncement(idx, "up")}
                          className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === homeSettings.announcements.length - 1}
                          onClick={() => moveAnnouncement(idx, "down")}
                          className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAnnouncement(idx)}
                          className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Announcement text
                        </label>
                        <input
                          type="text"
                          required
                          value={item.text}
                          onChange={(e) => handleAnnouncementChange(idx, "text", e.target.value)}
                          placeholder="e.g. Free shipping on orders above ₹4,999"
                          className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Action Redirect Link (Optional)
                        </label>
                        <input
                          type="text"
                          value={item.link || ""}
                          onChange={(e) => handleAnnouncementChange(idx, "link", e.target.value)}
                          placeholder="e.g. /shop or /category/wedding"
                          className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1.5">
                      <input
                        type="checkbox"
                        id={`ann-chk-${idx}`}
                        checked={item.enabled}
                        onChange={(e) => handleAnnouncementChange(idx, "enabled", e.target.checked)}
                        className="rounded border-[#e8dfd8] text-primary focus:ring-0"
                      />
                      <label
                        htmlFor={`ann-chk-${idx}`}
                        className="text-xs text-muted-foreground select-none"
                      >
                        Show this announcement live on storefront
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      { announcements: homeSettings.announcements },
                      "Announcement Bar",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Announcement Bar
                </button>
              </div>
            </div>
          )}

          {/* 3. HEADER & BRANDING */}
          {activeTab === "header" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">
                  Header branding & Navigation Labels
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Adjust storefront name, upload boutique logo, and customize menu links.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Boutique brand name
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.header?.brandName || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          header: { ...homeSettings.header, brandName: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Tagline / Subtext logo
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.header?.tagline || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          header: { ...homeSettings.header, tagline: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Customer Hotline phone
                  </label>
                  <input
                    type="text"
                    required
                    value={homeSettings.header?.contactNumber || ""}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        header: { ...homeSettings.header, contactNumber: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <ImageUploadField
                  label="Boutique Logo image (replaces text logo if uploaded)"
                  value={homeSettings.header?.logoUrl || ""}
                  onChange={(val) =>
                    setHomeSettings({
                      ...homeSettings,
                      header: { ...homeSettings.header, logoUrl: val },
                    })
                  }
                  onRemove={() =>
                    setHomeSettings({
                      ...homeSettings,
                      header: { ...homeSettings.header, logoUrl: "" },
                    })
                  }
                  recommendedSize="Recommended logo dimensions: 200x50 px, transparent background PNG preferred"
                />

                <div className="border border-[#e8dfd8] rounded-xl p-4 bg-[#fbfaf7]/60 space-y-3">
                  <span className="text-xs font-bold text-[#3a1d13]">
                    Menu Navigation Labels (Text-Editable)
                  </span>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        Home
                      </label>
                      <input
                        type="text"
                        required
                        value={homeSettings.header?.navLabels?.home || "Home"}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            header: {
                              ...homeSettings.header,
                              navLabels: {
                                ...(homeSettings.header?.navLabels || {}),
                                home: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        Silk Sarees
                      </label>
                      <input
                        type="text"
                        required
                        value={homeSettings.header?.navLabels?.silkSarees || "Silk Sarees"}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            header: {
                              ...homeSettings.header,
                              navLabels: {
                                ...(homeSettings.header?.navLabels || {}),
                                silkSarees: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        Shop
                      </label>
                      <input
                        type="text"
                        required
                        value={homeSettings.header?.navLabels?.shop || "Shop"}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            header: {
                              ...homeSettings.header,
                              navLabels: {
                                ...(homeSettings.header?.navLabels || {}),
                                shop: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        About
                      </label>
                      <input
                        type="text"
                        required
                        value={homeSettings.header?.navLabels?.about || "About"}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            header: {
                              ...homeSettings.header,
                              navLabels: {
                                ...(homeSettings.header?.navLabels || {}),
                                about: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        Contact
                      </label>
                      <input
                        type="text"
                        required
                        value={homeSettings.header?.navLabels?.contact || "Contact"}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            header: {
                              ...homeSettings.header,
                              navLabels: {
                                ...(homeSettings.header?.navLabels || {}),
                                contact: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart({ header: homeSettings.header }, "Header & Branding")
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Header Configs
                </button>
              </div>
            </div>
          )}

          {/* 4. HERO SECTION */}
          {activeTab === "hero" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">Homepage Main Hero Panel</h3>
                <p className="text-[10px] text-muted-foreground">
                  Modify showcase headline content, CTA redirects, stats details, and rating cards.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Eyebrow Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.hero?.eyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, eyebrow: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Main Title Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.hero?.title || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, title: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Subtitle Paragraph description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={homeSettings.hero?.subtitle || ""}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        hero: { ...homeSettings.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f3ede8] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Primary CTA Text
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.hero?.primaryCtaText || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, primaryCtaText: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Primary CTA Link
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.hero?.primaryCtaLink || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, primaryCtaLink: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Secondary CTA Text
                    </label>
                    <input
                      type="text"
                      value={homeSettings.hero?.secondaryCtaText || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, secondaryCtaText: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Secondary CTA Link
                    </label>
                    <input
                      type="text"
                      value={homeSettings.hero?.secondaryCtaLink || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, secondaryCtaLink: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f3ede8] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Rating Score value
                    </label>
                    <input
                      type="text"
                      value={homeSettings.hero?.ratingValue || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, ratingValue: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Rating card text
                    </label>
                    <input
                      type="text"
                      value={homeSettings.hero?.ratingText || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, ratingText: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#f3ede8] pt-4">
                  <span className="text-xs font-bold text-[#3a1d13] block">
                    Heritage stats list
                  </span>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {homeSettings.hero?.stats?.map((stat: any, index: number) => (
                      <div
                        key={index}
                        className="border border-[#e8dfd8] rounded-xl p-3 bg-[#fbfaf7] space-y-2"
                      >
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            Stat Value
                          </label>
                          <input
                            type="text"
                            required
                            value={stat.value}
                            onChange={(e) => {
                              const statsList = [...(homeSettings.hero.stats || [])];
                              statsList[index] = { ...statsList[index], value: e.target.value };
                              setHomeSettings({
                                ...homeSettings,
                                hero: { ...homeSettings.hero, stats: statsList },
                              });
                            }}
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2 py-1 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            Stat Label
                          </label>
                          <input
                            type="text"
                            required
                            value={stat.label}
                            onChange={(e) => {
                              const statsList = [...(homeSettings.hero.stats || [])];
                              statsList[index] = { ...statsList[index], label: e.target.value };
                              setHomeSettings({
                                ...homeSettings,
                                hero: { ...homeSettings.hero, stats: statsList },
                              });
                            }}
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2 py-1 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 border-t border-[#f3ede8] pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#3a1d13]">Hero Slider Slides</h4>
                      <p className="text-[10px] text-muted-foreground">Add images and optional text overlays. Each slide can show or hide its text independently.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const slides = [...(homeSettings.hero?.slides || [])];
                        if (slides.length === 0 && homeSettings.hero?.imageUrl) {
                          slides.push({
                            imageUrl: homeSettings.hero.imageUrl,
                            showText: true,
                            eyebrow: homeSettings.hero.eyebrow || "",
                            title: homeSettings.hero.title || "",
                            subtitle: homeSettings.hero.subtitle || "",
                            primaryCtaText: homeSettings.hero.primaryCtaText || "",
                            primaryCtaLink: homeSettings.hero.primaryCtaLink || "/silk-sarees",
                            secondaryCtaText: homeSettings.hero.secondaryCtaText || "",
                            secondaryCtaLink: homeSettings.hero.secondaryCtaLink || "/shop",
                          });
                        }
                        slides.push({
                          imageUrl: "",
                          showText: true,
                          eyebrow: homeSettings.hero?.eyebrow || "",
                          title: homeSettings.hero?.title || "",
                          subtitle: homeSettings.hero?.subtitle || "",
                          primaryCtaText: homeSettings.hero?.primaryCtaText || "",
                          primaryCtaLink: homeSettings.hero?.primaryCtaLink || "/silk-sarees",
                          secondaryCtaText: homeSettings.hero?.secondaryCtaText || "",
                          secondaryCtaLink: homeSettings.hero?.secondaryCtaLink || "/shop",
                        });
                        setHomeSettings({
                          ...homeSettings,
                          hero: { ...homeSettings.hero, slides },
                        });
                      }}
                      className="shrink-0 rounded-lg border border-[#e8dfd8] bg-white px-3 py-2 text-xs font-bold text-[#3a1d13] hover:border-[#d4af37]"
                    >
                      <Plus size={13} className="inline mr-1" /> Add Slide
                    </button>
                  </div>
                  {((homeSettings.hero?.slides?.length
                    ? homeSettings.hero.slides
                    : [{
                        imageUrl: homeSettings.hero?.imageUrl || "",
                        showText: homeSettings.hero?.showText !== false,
                        eyebrow: homeSettings.hero?.eyebrow || "",
                        title: homeSettings.hero?.title || "",
                        subtitle: homeSettings.hero?.subtitle || "",
                        primaryCtaText: homeSettings.hero?.primaryCtaText || "",
                        primaryCtaLink: homeSettings.hero?.primaryCtaLink || "/silk-sarees",
                        secondaryCtaText: homeSettings.hero?.secondaryCtaText || "",
                        secondaryCtaLink: homeSettings.hero?.secondaryCtaLink || "/shop",
                      }]).map((slide: any, index: number) => (
                    <div key={index} className="space-y-4 rounded-xl border border-[#e8dfd8] bg-[#fbfaf7]/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#3a1d13]">Slide {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const slides = [...(homeSettings.hero?.slides || [])];
                              if (slides.length === 0) return;
                              [slides[index - 1], slides[index]] = [slides[index], slides[index - 1]];
                              setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                            }}
                            className="rounded border border-[#e8dfd8] bg-white px-2 py-1 text-xs disabled:opacity-40"
                          >↑</button>
                          <button
                            type="button"
                            disabled={index === (homeSettings.hero?.slides?.length || 1) - 1}
                            onClick={() => {
                              const slides = [...(homeSettings.hero?.slides || [])];
                              if (slides.length === 0) return;
                              [slides[index], slides[index + 1]] = [slides[index + 1], slides[index]];
                              setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                            }}
                            className="rounded border border-[#e8dfd8] bg-white px-2 py-1 text-xs disabled:opacity-40"
                          >↓</button>
                          <button
                            type="button"
                            disabled={(homeSettings.hero?.slides?.length || 0) < 2}
                            onClick={() => {
                              const slides = [...(homeSettings.hero?.slides || [])];
                              slides.splice(index, 1);
                              setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                            }}
                            className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-600 disabled:opacity-40"
                          ><Trash2 size={12} className="inline mr-1" />Remove</button>
                        </div>
                      </div>
                      <ImageUploadField
                        label={`Slide ${index + 1} image`}
                        value={slide.imageUrl || ""}
                        recommendedSize="Recommended: 1920x780 px"
                        onChange={(val) => {
                          const slides = homeSettings.hero?.slides?.length
                            ? [...homeSettings.hero.slides]
                            : [{
                                imageUrl: homeSettings.hero?.imageUrl || "",
                                showText: homeSettings.hero?.showText !== false,
                                eyebrow: homeSettings.hero?.eyebrow || "",
                                title: homeSettings.hero?.title || "",
                                subtitle: homeSettings.hero?.subtitle || "",
                                primaryCtaText: homeSettings.hero?.primaryCtaText || "",
                                primaryCtaLink: homeSettings.hero?.primaryCtaLink || "/silk-sarees",
                                secondaryCtaText: homeSettings.hero?.secondaryCtaText || "",
                                secondaryCtaLink: homeSettings.hero?.secondaryCtaLink || "/shop",
                              }];
                          slides[index] = { ...slides[index], imageUrl: val };
                          setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                        }}
                        onRemove={() => {
                          const slides = homeSettings.hero?.slides?.length
                            ? [...homeSettings.hero.slides]
                            : [{ ...slide }];
                          slides[index] = { ...slides[index], imageUrl: "" };
                          setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                        }}
                      />
                      <label className="flex items-center gap-2 text-xs font-semibold text-[#3a1d13]">
                        <input
                          type="checkbox"
                          checked={slide.showText !== false}
                          onChange={(e) => {
                            const slides = homeSettings.hero?.slides?.length
                              ? [...homeSettings.hero.slides]
                              : [{ ...slide }];
                            slides[index] = { ...slides[index], showText: e.target.checked };
                            setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                          }}
                        />
                        Show text overlay on this slide
                      </label>
                      {slide.showText !== false && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["eyebrow", "Eyebrow"],
                            ["title", "Main title"],
                            ["subtitle", "Subtitle"],
                            ["primaryCtaText", "Primary button text"],
                            ["primaryCtaLink", "Primary button link"],
                            ["secondaryCtaText", "Secondary button text"],
                            ["secondaryCtaLink", "Secondary button link"],
                          ] as const).map(([field, label]) => (
                            <div key={field} className={field === "subtitle" ? "space-y-1 sm:col-span-2" : "space-y-1"}>
                              <label className="text-[10px] font-bold uppercase text-[#6e5d53]">{label}</label>
                              {field === "subtitle" ? (
                                <textarea
                                  rows={2}
                                  value={slide[field] || ""}
                                  onChange={(e) => {
                                    const slides = homeSettings.hero?.slides?.length
                                      ? [...homeSettings.hero.slides]
                                      : [{ ...slide }];
                                    slides[index] = { ...slides[index], [field]: e.target.value };
                                    setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                                  }}
                                  className="w-full rounded-lg border border-[#e8dfd8] bg-white px-3 py-2 text-xs"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={slide[field] || ""}
                                  onChange={(e) => {
                                    const slides = homeSettings.hero?.slides?.length
                                      ? [...homeSettings.hero.slides]
                                      : [{ ...slide }];
                                    slides[index] = { ...slides[index], [field]: e.target.value };
                                    setHomeSettings({ ...homeSettings, hero: { ...homeSettings.hero, slides } });
                                  }}
                                  className="w-full rounded-lg border border-[#e8dfd8] bg-white px-3 py-2 text-xs"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <ImageUploadField
                  label="Main Hero image (legacy fallback)"

                  value={homeSettings.hero?.imageUrl || ""}
                  onChange={(val) =>
                    setHomeSettings({
                      ...homeSettings,
                      hero: { ...homeSettings.hero, imageUrl: val },
                    })
                  }
                  onRemove={() =>
                    setHomeSettings({
                      ...homeSettings,
                      hero: { ...homeSettings.hero, imageUrl: "" },
                    })
                  }
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      {
                        hero: homeSettings.hero,
                        // Keep legacy columns aligned
                        heroTitle: homeSettings.hero?.title,
                        heroSubtitle: homeSettings.hero?.subtitle,
                        heroImage: homeSettings.hero?.imageUrl,
                      },
                      "Hero Section",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Hero Section
                </button>
              </div>
            </div>
          )}

          {/* 5. HOMEPAGE BANNERS */}
          {activeTab === "banners" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">Storefront Showcase Banners</h3>
                <p className="text-[10px] text-muted-foreground">
                  Adjust titles, subtitles, call-to-actions, and background images for promo blocks.
                </p>
              </div>

              <div className="space-y-8">
                {/* 1. Wedding Banner */}
                {(() => {
                  const idx = homeSettings.banners?.findIndex((b: any) => b.id === "wedding") ?? -1;
                  const item =
                    idx !== -1
                      ? homeSettings.banners[idx]
                      : {
                          id: "wedding",
                          label: "Limited Time",
                          title: "Wedding Collection",
                          description: "Up to 30% off on bridal Kanchipuram silks.",
                          ctaText: "Shop the Sale",
                          ctaLink: "/shop",
                          imageUrl: "",
                        };
                  const updateBannerField = (key: string, val: string) => {
                    const list = [...(homeSettings.banners || [])];
                    if (idx === -1) {
                      list.push({ ...item, [key]: val });
                    } else {
                      list[idx] = { ...list[idx], [key]: val };
                    }
                    setHomeSettings({ ...homeSettings, banners: list });
                  };
                  return (
                    <div className="border border-[#e8dfd8] rounded-2xl p-4 bg-[#fbfaf7]/40 space-y-3">
                      <span className="text-xs font-bold text-[#3a1d13] block">
                        Wedding Collection Banner promo
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            Banner Label (Eyebrow)
                          </label>
                          <input
                            type="text"
                            required
                            value={item.label}
                            onChange={(e) => updateBannerField("label", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            Banner Title Headline
                          </label>
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={(e) => updateBannerField("title", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">
                          Banner Description text
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateBannerField("description", e.target.value)}
                          className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            required
                            value={item.ctaText}
                            onChange={(e) => updateBannerField("ctaText", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            CTA Button Link
                          </label>
                          <input
                            type="text"
                            required
                            value={item.ctaLink}
                            onChange={(e) => updateBannerField("ctaLink", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>
                      <ImageUploadField
                        label="Wedding Banner background image override"
                        value={item.imageUrl || ""}
                        onChange={(val) => updateBannerField("imageUrl", val)}
                        onRemove={() => updateBannerField("imageUrl", "")}
                      />
                    </div>
                  );
                })()}

                {/* 2. Festival Banner */}
                {(() => {
                  const idx =
                    homeSettings.banners?.findIndex((b: any) => b.id === "festival") ?? -1;
                  const item =
                    idx !== -1
                      ? homeSettings.banners[idx]
                      : {
                          id: "festival",
                          label: "New Season",
                          title: "Festival Edit",
                          description: "Radiant cotton silks & semi silks.",
                          ctaText: "Discover Now",
                          ctaLink: "/shop",
                          imageUrl: "",
                        };
                  const updateBannerField = (key: string, val: string) => {
                    const list = [...(homeSettings.banners || [])];
                    if (idx === -1) {
                      list.push({ ...item, [key]: val });
                    } else {
                      list[idx] = { ...list[idx], [key]: val };
                    }
                    setHomeSettings({ ...homeSettings, banners: list });
                  };
                  return (
                    <div className="border border-[#e8dfd8] rounded-2xl p-4 bg-[#fbfaf7]/40 space-y-3">
                      <span className="text-xs font-bold text-[#3a1d13] block">
                        Festival Edit Banner promo
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            Banner Label (Eyebrow)
                          </label>
                          <input
                            type="text"
                            required
                            value={item.label}
                            onChange={(e) => updateBannerField("label", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            Banner Title Headline
                          </label>
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={(e) => updateBannerField("title", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold">
                          Banner Description text
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateBannerField("description", e.target.value)}
                          className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            required
                            value={item.ctaText}
                            onChange={(e) => updateBannerField("ctaText", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold">
                            CTA Button Link
                          </label>
                          <input
                            type="text"
                            required
                            value={item.ctaLink}
                            onChange={(e) => updateBannerField("ctaLink", e.target.value)}
                            className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>
                      <ImageUploadField
                        label="Festival Banner background image override"
                        value={item.imageUrl || ""}
                        onChange={(val) => updateBannerField("imageUrl", val)}
                        onRemove={() => updateBannerField("imageUrl", "")}
                      />
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() => {
                    const weddingObj =
                      homeSettings.banners?.find((b: any) => b.id === "wedding") || {};
                    handleSaveSettingsPart(
                      {
                        banners: homeSettings.banners,
                        offerBanner: weddingObj.description || "",
                      },
                      "Seasonal Banners",
                    );
                  }}
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Banners
                </button>
              </div>
            </div>
          )}

          {/* 6. SECTION TOGGLES */}
          {activeTab === "toggles" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">Homepage Active Section Toggles</h3>
                <p className="text-[10px] text-muted-foreground">
                  Dynamically turn on/off visual grids across the main storefront portal.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-sm text-[#2c2623]">
                {Object.entries({
                  heroCarousel: "Why Choose Us Section",
                  trendingArrivals: "Trending Arrivals",
                  curatedOccasions: "Curated Occasions Finder",
                  customerTestimonials: "Customer Testimonials Slider",
                  featuredCollections: "House of Silk Collections Showcase",
                  weddingBanner: "Seasonal Wedding Promo Card",
                  festivalBanner: "Seasonal Festival Promo Card",
                  newArrivals: "New Loom Arrivals Section",
                  celebritySection: "Celebrity Inspired Collection",
                  instagramGallery: "Instagram Gallery Feed",
                  newsletter: "Newsletter Circle Subscription",
                }).map(([key, label]) => {
                  const isActive = homeSettings.toggles?.[key] !== false;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl bg-[#fbfaf7] border border-[#f3ede8] p-3.5"
                    >
                      <div>
                        <p className="font-bold text-xs">{label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Toggle visibility on home page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...(homeSettings.toggles || {}) };
                          updated[key] = !isActive;
                          setHomeSettings({ ...homeSettings, toggles: updated });
                        }}
                        className="shrink-0 cursor-pointer"
                      >
                        {isActive ? (
                          <ToggleRight size={32} className="text-[#d4af37]" />
                        ) : (
                          <ToggleLeft size={32} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart({ toggles: homeSettings.toggles }, "Section Toggles")
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Toggles
                </button>
              </div>
            </div>
          )}

          {/* 7. COLLECTIONS / CATEGORY DISPLAY */}
          {activeTab === "categories" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">
                  House of Silk Collections showcase
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Adjust section headers displayed above category card grids.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.categoriesSection?.eyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          categoriesSection: {
                            ...homeSettings.categoriesSection,
                            eyebrow: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.categoriesSection?.title || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          categoriesSection: {
                            ...homeSettings.categoriesSection,
                            title: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Section Subtitle
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={homeSettings.categoriesSection?.subtitle || ""}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        categoriesSection: {
                          ...homeSettings.categoriesSection,
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      { categoriesSection: homeSettings.categoriesSection },
                      "Collections Highlight",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Section Content
                </button>
              </div>
            </div>
          )}

          {/* 8. TRENDING CATEGORIES */}
          {activeTab === "trending" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">Trending & Featured Saree Grids</h3>
                <p className="text-[10px] text-muted-foreground">
                  Adjust visual subtitles and product quantities for hot grids.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Trending Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.trendingSections?.trendingEyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          trendingSections: {
                            ...homeSettings.trendingSections,
                            trendingEyebrow: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Trending Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.trendingSections?.trendingTitle || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          trendingSections: {
                            ...homeSettings.trendingSections,
                            trendingTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f3ede8] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      New Arrivals Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.trendingSections?.newArrivalsEyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          trendingSections: {
                            ...homeSettings.trendingSections,
                            newArrivalsEyebrow: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      New Arrivals Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.trendingSections?.newArrivalsTitle || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          trendingSections: {
                            ...homeSettings.trendingSections,
                            newArrivalsTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f3ede8] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Celebrity Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.trendingSections?.celebrityEyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          trendingSections: {
                            ...homeSettings.trendingSections,
                            celebrityEyebrow: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Celebrity Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.trendingSections?.celebrityTitle || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          trendingSections: {
                            ...homeSettings.trendingSections,
                            celebrityTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-[#f3ede8] pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Max Products shown per Section
                  </label>
                  <input
                    type="number"
                    required
                    value={homeSettings.trendingSections?.maxProducts || 4}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        trendingSections: {
                          ...homeSettings.trendingSections,
                          maxProducts: +e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37] max-w-[200px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      { trendingSections: homeSettings.trendingSections },
                      "Trending Categories",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Grid Content
                </button>
              </div>
            </div>
          )}

          {/* 9. OCCASION FINDER */}
          {activeTab === "occasions" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-[#f3ede8] pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    Boutique Occasion Finder Configuration
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Adjust occasions headers and icons mapped to filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addOccasion}
                  className="rounded-xl bg-secondary text-primary border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Occasion
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.occasionFinder?.eyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          occasionFinder: {
                            ...homeSettings.occasionFinder,
                            eyebrow: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.occasionFinder?.title || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          occasionFinder: { ...homeSettings.occasionFinder, title: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    required
                    value={homeSettings.occasionFinder?.subtitle || ""}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        occasionFinder: {
                          ...homeSettings.occasionFinder,
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-3 border-t border-[#f3ede8] pt-4">
                  <span className="text-xs font-bold text-[#3a1d13] block">
                    Occasion Filters Repeater
                  </span>
                  {homeSettings.occasionFinder?.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-3 items-center border border-[#e8dfd8] rounded-xl p-3 bg-[#fbfaf7]/60"
                    >
                      <div className="flex-1 w-full grid gap-3 grid-cols-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            Occasion Name
                          </label>
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => handleOccasionChange(idx, "name", e.target.value)}
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            Lucide Icon name
                          </label>
                          <select
                            value={item.icon || "Crown"}
                            onChange={(e) => handleOccasionChange(idx, "icon", e.target.value)}
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                          >
                            {AVAILABLE_ICONS.map((i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveOccasion(idx, "up")}
                          className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === homeSettings.occasionFinder.items.length - 1}
                          onClick={() => moveOccasion(idx, "down")}
                          className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeOccasion(idx)}
                          className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      { occasionFinder: homeSettings.occasionFinder },
                      "Occasion Finder",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Occasion Finder
                </button>
              </div>
            </div>
          )}

          {/* 10. WHY CHOOSE US */}
          {activeTab === "promise" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-[#f3ede8] pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">Why Choose Us section</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Adjust trust badges, title content, and promise cards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPromise}
                  className="rounded-xl bg-secondary text-primary border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Feature Card
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.promiseSection?.eyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          promiseSection: {
                            ...homeSettings.promiseSection,
                            eyebrow: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.promiseSection?.title || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          promiseSection: { ...homeSettings.promiseSection, title: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#f3ede8] pt-4">
                  <span className="text-xs font-bold text-[#3a1d13] block">
                    Trust Cards Repeater
                  </span>
                  {homeSettings.promiseSection?.cards?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-[#e8dfd8] rounded-xl p-3 bg-[#fbfaf7]/60 space-y-2 relative"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-[#f3ede8]">
                        <span className="text-[10px] font-bold text-[#3a1d13]">
                          Card #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => movePromise(idx, "up")}
                            className="p-1 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === homeSettings.promiseSection.cards.length - 1}
                            onClick={() => movePromise(idx, "down")}
                            className="p-1 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                          >
                            <ArrowDown size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePromise(idx)}
                            className="p-1 rounded-lg border border-red-200 bg-white text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            Card Title
                          </label>
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={(e) => handlePromiseChange(idx, "title", e.target.value)}
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            Lucide Icon name
                          </label>
                          <select
                            value={item.icon || "Award"}
                            onChange={(e) => handlePromiseChange(idx, "icon", e.target.value)}
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                          >
                            {AVAILABLE_ICONS.map((i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-muted-foreground">
                          Card Description
                        </label>
                        <input
                          type="text"
                          required
                          value={item.text}
                          onChange={(e) => handlePromiseChange(idx, "text", e.target.value)}
                          className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      { promiseSection: homeSettings.promiseSection },
                      "Why Choose Us",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Feature Cards
                </button>
              </div>
            </div>
          )}

          {/* 11. TESTIMONIALS */}
          {activeTab === "testimonials" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-[#f3ede8] pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">Bride & Customer Testimonials</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Manage real-time customer styling validation quotes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTestimonial}
                  className="rounded-xl bg-secondary text-primary border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Testimonial
                </button>
              </div>

              <div className="space-y-4">
                {(!homeSettings.testimonials || homeSettings.testimonials.length === 0) && (
                  <p className="text-xs text-muted-foreground italic text-center py-6">
                    No testimonials created yet. Click add to begin.
                  </p>
                )}
                {homeSettings.testimonials?.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="border border-[#e8dfd8] rounded-2xl p-4 bg-[#fbfaf7]/60 space-y-3 relative"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-[#f3ede8]">
                      <span className="text-xs font-bold text-[#3a1d13]">
                        Testimonial #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveTestimonial(idx, "up")}
                          className="p-1 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === homeSettings.testimonials.length - 1}
                          onClick={() => moveTestimonial(idx, "down")}
                          className="p-1 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                        >
                          <ArrowDown size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTestimonial(idx)}
                          className="p-1 rounded-lg border border-red-200 bg-white text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-muted-foreground">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleTestimonialChange(idx, "name", e.target.value)}
                          className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-muted-foreground">
                          City / Location
                        </label>
                        <input
                          type="text"
                          required
                          value={item.location}
                          onChange={(e) => handleTestimonialChange(idx, "location", e.target.value)}
                          className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-muted-foreground">
                          Initials Avatar (max 3 chars)
                        </label>
                        <input
                          type="text"
                          required
                          value={item.avatar}
                          onChange={(e) => handleTestimonialChange(idx, "avatar", e.target.value)}
                          className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground">
                        Review Quote text
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={item.text}
                        onChange={(e) => handleTestimonialChange(idx, "text", e.target.value)}
                        className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      { testimonials: homeSettings.testimonials },
                      "Testimonials",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Testimonials List
                </button>
              </div>
            </div>
          )}

          {/* 12. INSTAGRAM GALLERY */}
          {activeTab === "gallery" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-[#f3ede8] pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">Instagram Showcase Grid</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Upload and configure showcase posts scrolling below categories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addGalleryItem}
                  className="rounded-xl bg-secondary text-primary border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Gallery Post
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Eyebrow
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.gallery?.eyebrow || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          gallery: { ...homeSettings.gallery, eyebrow: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.gallery?.title || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          gallery: { ...homeSettings.gallery, title: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.gallery?.subtitle || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          gallery: { ...homeSettings.gallery, subtitle: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-[#f3ede8] pt-4">
                  <span className="text-xs font-bold text-[#3a1d13] block">Gallery Posts List</span>
                  {homeSettings.gallery?.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-[#e8dfd8] rounded-xl p-3 bg-[#fbfaf7]/60 space-y-3 relative"
                    >
                      <div className="flex justify-between items-center pb-1 border-b border-[#f3ede8]">
                        <span className="text-[10px] font-bold text-[#3a1d13]">
                          Post #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryItem(idx, "up")}
                            className="p-1 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === homeSettings.gallery.items.length - 1}
                            onClick={() => moveGalleryItem(idx, "down")}
                            className="p-1 rounded-lg border border-border bg-white text-muted-foreground disabled:opacity-40"
                          >
                            <ArrowDown size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(idx)}
                            className="p-1 rounded-lg border border-red-200 bg-white text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            Post Caption
                          </label>
                          <input
                            type="text"
                            value={item.caption || ""}
                            onChange={(e) =>
                              handleGalleryItemChange(idx, "caption", e.target.value)
                            }
                            placeholder="e.g. Saree styling guides"
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2 py-1 outline-none focus:border-[#d4af37]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground">
                            External Instagram link
                          </label>
                          <input
                            type="text"
                            value={item.link || ""}
                            onChange={(e) => handleGalleryItemChange(idx, "link", e.target.value)}
                            placeholder="e.g. https://instagram.com/p/..."
                            className="w-full rounded-lg border border-[#e8dfd8] bg-white px-2 py-1 outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      </div>

                      <ImageUploadField
                        label="Upload Gallery image"
                        value={item.imageUrl || ""}
                        onChange={(val) => handleGalleryItemChange(idx, "imageUrl", val)}
                        onRemove={() => handleGalleryItemChange(idx, "imageUrl", "")}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart({ gallery: homeSettings.gallery }, "Instagram Gallery")
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Gallery settings
                </button>
              </div>
            </div>
          )}

          {/* 13. NEWSLETTER */}
          {activeTab === "newsletter" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">Newsletter Circle Form</h3>
                <p className="text-[10px] text-muted-foreground">
                  Customize marketing subscription headlines and button values.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Form Headline Title
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.newsletter?.title || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          newsletter: { ...homeSettings.newsletter, title: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Submit Button Label
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.newsletter?.buttonText || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          newsletter: { ...homeSettings.newsletter, buttonText: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Subtitle description paragraph
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={homeSettings.newsletter?.subtitle || ""}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        newsletter: { ...homeSettings.newsletter, subtitle: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart(
                      { newsletter: homeSettings.newsletter },
                      "Newsletter Form",
                    )
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Newsletter Settings
                </button>
              </div>
            </div>
          )}

          {/* 14. FOOTER & CONTACT DETAILS */}
          {activeTab === "footer" && (
            <div className="rounded-2xl border border-[#e8dfd8] bg-white p-6 shadow-soft space-y-6">
              <div className="border-b border-[#f3ede8] pb-4">
                <h3 className="font-display text-lg font-bold">Footer content & Address block</h3>
                <p className="text-[10px] text-muted-foreground">
                  Adjust showrooms contact locations, email hotlines, social handles, and copyright
                  descriptors.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Footer brand description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={homeSettings.footer?.description || ""}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        footer: { ...homeSettings.footer, description: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                    Boutique showroom address
                  </label>
                  <input
                    type="text"
                    required
                    value={homeSettings.footer?.address || ""}
                    onChange={(e) =>
                      setHomeSettings({
                        ...homeSettings,
                        footer: { ...homeSettings.footer, address: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Hotline Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.footer?.phone || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          footer: { ...homeSettings.footer, phone: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Support Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={homeSettings.footer?.email || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          footer: { ...homeSettings.footer, email: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-[#f3ede8] pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Copyright statement
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.footer?.copyright || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          footer: { ...homeSettings.footer, copyright: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6e5d53]">
                      Bottom note label
                    </label>
                    <input
                      type="text"
                      required
                      value={homeSettings.footer?.bottomNote || ""}
                      onChange={(e) =>
                        setHomeSettings({
                          ...homeSettings,
                          footer: { ...homeSettings.footer, bottomNote: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[#e8dfd8] bg-[#fbfaf7] px-3.5 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Social media handles */}
                <div className="border border-[#e8dfd8] rounded-xl p-4 bg-[#fbfaf7]/60 space-y-3">
                  <span className="text-xs font-bold text-[#3a1d13]">
                    Boutique Social Media Handles (External URLs)
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        Instagram URL
                      </label>
                      <input
                        type="text"
                        value={homeSettings.footer?.socialLinks?.instagram || ""}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            footer: {
                              ...homeSettings.footer,
                              socialLinks: {
                                ...(homeSettings.footer?.socialLinks || {}),
                                instagram: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="#"
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        Facebook URL
                      </label>
                      <input
                        type="text"
                        value={homeSettings.footer?.socialLinks?.facebook || ""}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            footer: {
                              ...homeSettings.footer,
                              socialLinks: {
                                ...(homeSettings.footer?.socialLinks || {}),
                                facebook: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="#"
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        YouTube URL
                      </label>
                      <input
                        type="text"
                        value={homeSettings.footer?.socialLinks?.youtube || ""}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            footer: {
                              ...homeSettings.footer,
                              socialLinks: {
                                ...(homeSettings.footer?.socialLinks || {}),
                                youtube: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="#"
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">
                        Twitter/X URL
                      </label>
                      <input
                        type="text"
                        value={homeSettings.footer?.socialLinks?.twitter || ""}
                        onChange={(e) =>
                          setHomeSettings({
                            ...homeSettings,
                            footer: {
                              ...homeSettings.footer,
                              socialLinks: {
                                ...(homeSettings.footer?.socialLinks || {}),
                                twitter: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="#"
                        className="w-full rounded-xl border border-[#e8dfd8] bg-white px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f3ede8]">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettingsPart({ footer: homeSettings.footer }, "Footer & Contact")
                  }
                  className="rounded-xl bg-[#3a1d13] text-white px-5 py-3 text-xs font-bold hover:bg-[#4d2d22] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Save Footer details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
