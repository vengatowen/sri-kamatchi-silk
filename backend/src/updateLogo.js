const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  let settings = await prisma.homeSettings.findFirst();
  
  const defaultHeader = {
    brandName: "Sri Kamatchi Silk",
    tagline: "Silk",
    logoUrl: "/uploads/logo.png",
    navLinks: [
      { label: "Home", to: "/" },
      { label: "Semi Silks", to: "/category/semi-silks" },
      { label: "Celebrity Silks", to: "/category/celebrity-silks" },
      { label: "Silk Cotton", to: "/category/cotton-silks" },
      { label: "Shop", to: "/shop" },
      { label: "Contact WhatsApp", to: "https://wa.me/917305459199" }
    ],
    contactNumber: ""
  };

  if (!settings) {
    settings = await prisma.homeSettings.create({
      data: {
        heroTitle: "Draped in Timeless Elegance",
        heroSubtitle: "Discover the soul of South Indian craftsmanship. Handwoven Kanchipuram and luxury silk sarees.",
        heroImage: "/uploads/products/hero-saree.jpg",
        offerBanner: "Up to 30% off on bridal Kanchipuram silks. Make your big day unforgettable.",
        header: defaultHeader
      }
    });
    console.log("Created home settings with logo!");
  } else {
    const header = settings.header || {};
    header.logoUrl = "/uploads/logo.png";
    if (!header.brandName) header.brandName = "Sri Kamatchi Silk";
    if (!header.tagline) header.tagline = "Silk";
    if (!header.navLinks) header.navLinks = defaultHeader.navLinks;
    
    await prisma.homeSettings.update({
      where: { id: settings.id },
      data: {
        header: header
      }
    });
    console.log("Updated existing home settings with logo!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
