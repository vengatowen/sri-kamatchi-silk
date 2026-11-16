const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

// Get all published pages (for customer)
const getPages = async (req, res) => {
  try {
    let user;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await prisma.user.findUnique({
          where: { id: decoded.id },
        });
      } catch (err) {
        // Ignore token decode errors to allow public access fallback
      }
    }

    let pages = await prisma.page.findMany({
      where: user && user.role === "admin" ? {} : { isPublished: true },
      orderBy: { title: "asc" },
    });

    // Dynamically initialize default pages if none exist
    if (pages.length === 0) {
      const defaults = [
        {
          title: "About Us",
          slug: "about",
          content:
            "Weaving stories of grace, purity, and heritage for over twenty-five years. Handcrafted silk sarees direct from the sacred handlooms of Kanchipuram...",
          isPublished: true,
        },
        {
          title: "Contact Us",
          slug: "contact",
          content:
            "Flagship Kanchipuram Showroom hours: 09:00 AM - 09:00 PM. Contact our support on WhatsApp at https://wa.me/917305459199...",
          isPublished: true,
        },
        {
          title: "Privacy Policy",
          slug: "privacy-policy",
          content:
            "We collect your name, contact details, shipping address and payment information solely to process your orders and improve your shopping experience...",
          isPublished: true,
        },
        {
          title: "Terms and Conditions",
          slug: "terms",
          content:
            "By accessing Sri Kamatchi Silk, you agree to our terms of service, payment collection, and product delivery regulations...",
          isPublished: true,
        },
        {
          title: "Shipping Policy",
          slug: "shipping-policy",
          content:
            "Standard delivery takes 3-7 business days across India. Luxury sarees are packed in specialized moisture-proof covers...",
          isPublished: true,
        },
        {
          title: "Return Policy",
          slug: "return-policy",
          content:
            "We offer a 7-day return policy for unused and unwashed sarees with original tags intact. Return transit charges apply...",
          isPublished: true,
        },
      ];

      for (const d of defaults) {
        await prisma.page.create({ data: d });
      }

      pages = await prisma.page.findMany({
        where: user && user.role === "admin" ? {} : { isPublished: true },
        orderBy: { title: "asc" },
      });
    }

    res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pages",
      error: error.message,
    });
  }
};

// Get single page by slug
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch page details",
      error: error.message,
    });
  }
};

// Create a new CMS page (Admin only)
const createPage = async (req, res) => {
  try {
    const { title, slug, content, isPublished } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, slug, and content are required",
      });
    }

    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: "A page with this URL slug already exists",
      });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Page published successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to publish page",
      error: error.message,
    });
  }
};

// Update a CMS page (Admin only)
const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, isPublished } = req.body;

    const pageExists = await prisma.page.findUnique({
      where: { id },
    });

    if (!pageExists) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Check slug clash
    if (slug && slug !== pageExists.slug) {
      const slugClash = await prisma.page.findUnique({
        where: { slug },
      });
      if (slugClash) {
        return res.status(400).json({
          success: false,
          message: "A page with this URL slug already exists",
        });
      }
    }

    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        isPublished,
      },
    });

    res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: updatedPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update page",
      error: error.message,
    });
  }
};

// Delete a CMS page (Admin only)
const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const pageExists = await prisma.page.findUnique({
      where: { id },
    });

    if (!pageExists) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    await prisma.page.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete page",
      error: error.message,
    });
  }
};

module.exports = {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
};
