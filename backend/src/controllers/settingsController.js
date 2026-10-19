const prisma = require("../config/prisma");

// --- Shipping Settings ---
const getShippingSettings = async (req, res) => {
  try {
    let settings = await prisma.shippingSettings.findFirst();

    // Dynamically initialize default shipping settings if none exist
    if (!settings) {
      settings = await prisma.shippingSettings.create({
        data: {
          freeShippingAbove: 4999,
          shippingCharge: 99,
          codEnabled: true,
          deliveryDays: 5,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipping settings",
      error: error.message,
    });
  }
};

const updateShippingSettings = async (req, res) => {
  try {
    const { freeShippingAbove, shippingCharge, codEnabled, deliveryDays } = req.body;

    let settings = await prisma.shippingSettings.findFirst();

    if (!settings) {
      settings = await prisma.shippingSettings.create({
        data: {
          freeShippingAbove: parseFloat(freeShippingAbove || 4999),
          shippingCharge: parseFloat(shippingCharge || 99),
          codEnabled: codEnabled !== undefined ? codEnabled : true,
          deliveryDays: parseInt(deliveryDays || 5),
        },
      });
    } else {
      settings = await prisma.shippingSettings.update({
        where: { id: settings.id },
        data: {
          freeShippingAbove:
            freeShippingAbove !== undefined
              ? parseFloat(freeShippingAbove)
              : settings.freeShippingAbove,
          shippingCharge:
            shippingCharge !== undefined ? parseFloat(shippingCharge) : settings.shippingCharge,
          codEnabled: codEnabled !== undefined ? codEnabled : settings.codEnabled,
          deliveryDays: deliveryDays !== undefined ? parseInt(deliveryDays) : settings.deliveryDays,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Shipping settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update shipping settings",
      error: error.message,
    });
  }
};

// --- Payment Settings ---
const getPaymentSettings = async (req, res) => {
  try {
    let settings = await prisma.paymentSettings.findFirst();

    // Dynamically initialize default payment settings if none exist
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          razorpayKeyId: "rzp_test_Kamatchi90281",
          razorpaySecret: "dummysecretvalue12345678",
          razorpayMode: "test",
          razorpayEnabled: true,
        },
      });
    }

    // Hide secret in normal GET request for security
    const secureData = { ...settings };
    if (secureData.razorpaySecret) {
      secureData.razorpaySecret = "••••••••••••••••••••••••";
    }

    res.status(200).json({
      success: true,
      data: secureData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment settings",
      error: error.message,
    });
  }
};

const updatePaymentSettings = async (req, res) => {
  try {
    const { razorpayKeyId, razorpaySecret, razorpayEnabled, razorpayMode } = req.body;

    let settings = await prisma.paymentSettings.findFirst();

    // Prepare update body (preserve existing secret if masked bullet string is received)
    const updateData = {};
    if (razorpayKeyId !== undefined) updateData.razorpayKeyId = razorpayKeyId;
    if (
      razorpaySecret !== undefined &&
      razorpaySecret !== "••••••••••••••••••••••••" &&
      !razorpaySecret.includes("••••")
    ) {
      updateData.razorpaySecret = razorpaySecret;
    }
    if (razorpayEnabled !== undefined) updateData.razorpayEnabled = razorpayEnabled;
    if (razorpayMode !== undefined) updateData.razorpayMode = razorpayMode;

    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          razorpayKeyId: razorpayKeyId || "rzp_test_Kamatchi90281",
          razorpaySecret:
            razorpaySecret && !razorpaySecret.includes("••••")
              ? razorpaySecret
              : "dummysecretvalue12345678",
          razorpayMode: razorpayMode || "test",
          razorpayEnabled: razorpayEnabled !== undefined ? razorpayEnabled : true,
        },
      });
    } else {
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    const secureData = { ...settings };
    if (secureData.razorpaySecret) {
      secureData.razorpaySecret = "••••••••••••••••••••••••";
    }

    res.status(200).json({
      success: true,
      message: "Payment settings updated successfully",
      data: secureData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update payment settings",
      error: error.message,
    });
  }
};

// --- Home Banners & Settings ---
const getHomeSettings = async (req, res) => {
  try {
    let settings = await prisma.homeSettings.findFirst();

    if (!settings) {
      settings = await prisma.homeSettings.create({
        data: {
          heroTitle: "Draped in Timeless Elegance",
          heroSubtitle:
            "Discover the soul of South Indian craftsmanship. Handwoven Kanchipuram and luxury silk sarees.",
          heroImage: "/uploads/products/hero-saree.jpg",
          offerBanner:
            "Up to 30% off on bridal Kanchipuram silks. Make your big day unforgettable.",
        },
      });
    }

    // Load defaults if any dynamic JSON column is null
    const fallbackAnnouncements = [
      { text: "Free shipping on orders above ₹4,999", link: "", enabled: true },
      { text: "Up to 30% off on the Wedding Collection", link: "", enabled: true },
      {
        text: "Contact us on WhatsApp for styling & custom orders",
        link: "https://wa.me/919443210987",
        enabled: true,
      },
    ];

    const fallbackHeader = {
      brandName: "Sri Kamatchi Silk",
      tagline: "Silk",
      logoUrl: "",
      navLinks: [
        { label: "Home", to: "/" },
        { label: "Semi Silks", to: "/category/semi-silks" },
        { label: "Celebrity Silks", to: "/category/celebrity-silks" },
        { label: "Silk Cotton", to: "/category/cotton-silks" },
        { label: "Shop", to: "/shop" },
        { label: "Contact WhatsApp", to: "https://wa.me/919443210987" },
      ],
      contactNumber: "",
    };

    const fallbackHero = {
      eyebrow: "Heritage Weaves",
      title: "Draped in Timeless Elegance",
      subtitle:
        "Discover the soul of South Indian craftsmanship. Handwoven Kanchipuram and luxury silk sarees, made for the moments you'll cherish forever.",
      primaryCtaText: "Explore Collection",
      primaryCtaLink: "/silk-sarees",
      secondaryCtaText: "Shop All Sarees",
      secondaryCtaLink: "/shop",
      imageUrl: settings.heroImage || "",
      ratingValue: "4.9/5",
      ratingText: "Rated by 12,000+ brides",
      stats: [
        { value: "25+", label: "Years of Heritage" },
        { value: "50k+", label: "Happy Customers" },
        { value: "100%", label: "Pure Silk" },
      ],
    };

    const fallbackBanners = [
      {
        id: "wedding",
        label: "Limited Time",
        title: "Wedding Collection",
        description: "Up to 30% off on bridal Kanchipuram silks. Make your big day unforgettable.",
        ctaText: "Shop the Sale",
        ctaLink: "/shop",
        imageUrl: "",
      },
      {
        id: "festival",
        label: "New Season",
        title: "Festival Edit",
        description: "Radiant cotton silks & semi silks to light up every celebration.",
        ctaText: "Discover Now",
        ctaLink: "/shop",
        imageUrl: "",
      },
    ];

    const fallbackToggles = {
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

    const fallbackCategoriesSection = {
      eyebrow: "The House of Silk",
      title: "Silk Sarees",
      subtitle:
        "Handwoven heritage drapes crafted by master weavers — explore our signature collections.",
    };

    const fallbackTrendingSections = {
      trendingTitle: "Trending Sarees",
      trendingEyebrow: "Most Loved",
      newArrivalsTitle: "New Arrivals",
      newArrivalsEyebrow: "Fresh Off the Loom",
      celebrityTitle: "Celebrity Inspired",
      celebrityEyebrow: "As Seen on Stars",
      maxProducts: 4,
    };

    const fallbackOccasionFinder = {
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

    const fallbackPromiseSection = {
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

    const fallbackTestimonials = [
      {
        id: "t1",
        name: "Priya Lakshmi",
        location: "Chennai",
        text: "The Kanchipuram bridal saree I ordered was absolutely breathtaking. The zari work is pure and the weight feels authentic.",
        rating: 5,
        avatar: "PL",
      },
      {
        id: "t2",
        name: "Anjali Menon",
        location: "Bengaluru",
        text: "Superb online buying experience. Their customer styling consultant guided me over video call to inspect the drape details.",
        rating: 5,
        avatar: "AM",
      },
      {
        id: "t3",
        name: "Deepa Subramaniam",
        location: "Coimbatore",
        text: "Beautiful packaging and very fast shipping. The saree quality matches their showroom standards. Definitely purchasing again.",
        rating: 5,
        avatar: "DS",
      },
    ];

    const fallbackGallery = {
      eyebrow: "@srikamatchisilk",
      title: "Follow Our Journey",
      subtitle: "Tag us with #DrapedInKamatchi to be featured.",
      items: [],
    };

    const fallbackNewsletter = {
      title: "Join the Kamatchi Circle",
      subtitle: "Be the first to know about new weaves, private sales and styling tips.",
      buttonText: "Subscribe",
    };

    const fallbackFooter = {
      description:
        "Weaving heritage into every drape. Sri Kamatchi Silk brings you handcrafted Kanchipuram and luxury silk sarees, made by master artisans for life's most treasured moments.",
      address: "No. 24, Silk Bazaar Road, Kanchipuram, Tamil Nadu 631502",
      phone: "",
      email: "care@srikamatchisilk.com",
      copyright: "Sri Kamatchi Silk. All rights reserved.",
      bottomNote: "Handwoven with love in Kanchipuram, India.",
    };

    const data = {
      id: settings.id,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroImage: settings.heroImage,
      offerBanner: settings.offerBanner,
      announcements: settings.announcements || fallbackAnnouncements,
      header: settings.header || fallbackHeader,
      hero: settings.hero || fallbackHero,
      banners: settings.banners || fallbackBanners,
      toggles: settings.toggles || fallbackToggles,
      categoriesSection: settings.categoriesSection || fallbackCategoriesSection,
      trendingSections: settings.trendingSections || fallbackTrendingSections,
      occasionFinder: settings.occasionFinder || fallbackOccasionFinder,
      promiseSection: settings.promiseSection || fallbackPromiseSection,
      testimonials: settings.testimonials || fallbackTestimonials,
      gallery: settings.gallery || fallbackGallery,
      newsletter: settings.newsletter || fallbackNewsletter,
      footer: settings.footer || fallbackFooter,
      sectionContent: settings.sectionContent || {},
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage settings",
      error: error.message,
    });
  }
};

const updateHomeSettings = async (req, res) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      heroImage,
      offerBanner,
      announcements,
      header,
      hero,
      banners,
      toggles,
      categoriesSection,
      trendingSections,
      occasionFinder,
      promiseSection,
      testimonials,
      gallery,
      newsletter,
      footer,
      sectionContent,
    } = req.body;

    let settings = await prisma.homeSettings.findFirst();

    const data = {};
    if (heroTitle !== undefined) data.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) data.heroSubtitle = heroSubtitle;
    if (heroImage !== undefined) data.heroImage = heroImage;
    if (offerBanner !== undefined) data.offerBanner = offerBanner;
    if (announcements !== undefined) data.announcements = announcements;
    if (header !== undefined) data.header = header;
    if (hero !== undefined) data.hero = hero;
    if (banners !== undefined) data.banners = banners;
    if (toggles !== undefined) data.toggles = toggles;
    if (categoriesSection !== undefined) data.categoriesSection = categoriesSection;
    if (trendingSections !== undefined) data.trendingSections = trendingSections;
    if (occasionFinder !== undefined) data.occasionFinder = occasionFinder;
    if (promiseSection !== undefined) data.promiseSection = promiseSection;
    if (testimonials !== undefined) data.testimonials = testimonials;
    if (gallery !== undefined) data.gallery = gallery;
    if (newsletter !== undefined) data.newsletter = newsletter;
    if (footer !== undefined) data.footer = footer;
    if (sectionContent !== undefined) data.sectionContent = sectionContent;

    if (!settings) {
      settings = await prisma.homeSettings.create({ data });
    } else {
      settings = await prisma.homeSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    res.status(200).json({
      success: true,
      message: "Homepage settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update homepage settings",
      error: error.message,
    });
  }
};

module.exports = {
  getShippingSettings,
  updateShippingSettings,
  getPaymentSettings,
  updatePaymentSettings,
  getHomeSettings,
  updateHomeSettings,
};
