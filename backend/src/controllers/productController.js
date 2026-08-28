const prisma = require("../config/prisma");
const {
  resolveProductImage,
  resolveProductImages,
} = require("../utils/imageUrl");

const variantInclude = {
  variants: { orderBy: { sortOrder: "asc" } },
};

const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.image) {
      body.image = resolveProductImage(body.image);
    }

    const variantInput = Array.isArray(body.variants) ? body.variants : null;
    delete body.variants;

    const product = await prisma.product.create({
      data: body,
    });

    if (variantInput && variantInput.length > 0) {
      await prisma.productVariant.createMany({
        data: variantInput.map((v, idx) => ({
          productId: product.id,
          color: String(v.color || "").trim() || `Color ${idx + 1}`,
          images: resolveProductImages(
            Array.isArray(v.images) ? v.images.join("|") : v.images || v.image || ""
          ),
          stock: parseInt(v.stock, 10) || 0,
          sortOrder: idx,
        })),
      });
    }

    const full = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, ...variantInclude },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: full,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product creation failed",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, ...variantInclude },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Products fetch failed",
      error: error.message,
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: req.params.id }, { slug: req.params.id }],
      },
      include: { category: true, ...variantInclude },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product fetch failed",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.image) {
      body.image = resolveProductImage(body.image);
    }

    const variantInput = Array.isArray(body.variants) ? body.variants : null;
    delete body.variants;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: body,
    });

    if (variantInput) {
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      if (variantInput.length > 0) {
        await prisma.productVariant.createMany({
          data: variantInput.map((v, idx) => ({
            productId: product.id,
            color: String(v.color || "").trim() || `Color ${idx + 1}`,
            images: resolveProductImages(
              Array.isArray(v.images) ? v.images.join("|") : v.images || v.image || ""
            ),
            stock: parseInt(v.stock, 10) || 0,
            sortOrder: idx,
          })),
        });
      }
    }

    const full = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, ...variantInclude },
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      data: full,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product update failed",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Product delete failed",
      error: error.message,
    });
  }
};

const createProductBulk = async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body) ? req.body : req.body.products;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Payload must be a non-empty array of product rows",
      });
    }

    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map();
    existingCategories.forEach((cat) => {
      categoryMap.set(cat.name.trim().toLowerCase(), cat);
    });

    const existingProducts = await prisma.product.findMany({
      select: { slug: true, name: true, id: true },
    });
    const usedSlugs = new Set(existingProducts.map((p) => p.slug));
    const productsByName = new Map(
      existingProducts.map((p) => [p.name.trim().toLowerCase(), p])
    );

    const validationErrors = [];
    // Group rows by product name for variants
    const groups = new Map();

    const toBool = (val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val === 1;
      if (typeof val === "string") {
        const clean = val.trim().toLowerCase();
        return clean === "true" || clean === "1" || clean === "yes";
      }
      return false;
    };

    for (let i = 0; i < rawItems.length; i++) {
      const row = rawItems[i] || {};
      const rowNum = i + 1;

      const name = (row.name || row["Product Name"] || row.productName || "")
        .toString()
        .trim();
      const categoryName = (
        row.categoryName ||
        row["Category Name"] ||
        row.category ||
        ""
      )
        .toString()
        .trim();
      const rawPrice = row.price ?? row["Price"];
      const rawDiscount = row.discountPrice ?? row["Discount Price"];
      const rawStock = row.stock ?? row["Stock"];
      const fabric = (row.fabric || row["Fabric"] || "").toString().trim() || null;
      const color = (row.color || row["Color"] || "").toString().trim();
      const occasion =
        (row.occasion || row["Occasion"] || "").toString().trim() || null;
      const description = (row.description || row["Description"] || "")
        .toString()
        .trim();
      const rawSlug = (row.slug || row["Slug"] || "").toString().trim();
      const imageRaw = (
        row.image ||
        row["Image URL"] ||
        row.imageUrl ||
        ""
      )
        .toString()
        .trim();

      const isTrending = toBool(row.isTrending ?? row["Is Trending"]);
      const isFeatured = toBool(row.isFeatured ?? row["Is Featured"]);
      const isOffer = toBool(row.isOffer ?? row["Is Offer"]);

      if (!name) {
        validationErrors.push(`Row ${rowNum}: Product Name is required.`);
        continue;
      }
      if (!categoryName) {
        validationErrors.push(`Row ${rowNum}: Category Name is required.`);
        continue;
      }

      const matchedCategory = categoryMap.get(categoryName.toLowerCase());
      if (!matchedCategory) {
        validationErrors.push(
          `Row ${rowNum}: Category '${categoryName}' does not exist in database.`
        );
        continue;
      }

      const price = parseFloat(rawPrice);
      if (
        rawPrice === undefined ||
        rawPrice === null ||
        rawPrice === "" ||
        isNaN(price) ||
        price <= 0
      ) {
        validationErrors.push(
          `Row ${rowNum}: Price must be a valid positive number.`
        );
        continue;
      }

      const stock = parseInt(rawStock, 10);
      if (
        rawStock === undefined ||
        rawStock === null ||
        rawStock === "" ||
        isNaN(stock) ||
        stock < 0
      ) {
        validationErrors.push(
          `Row ${rowNum}: Stock must be a valid non-negative integer.`
        );
        continue;
      }

      if (!description) {
        validationErrors.push(`Row ${rowNum}: Description is required.`);
        continue;
      }

      let discountPrice = null;
      if (rawDiscount !== undefined && rawDiscount !== null && rawDiscount !== "") {
        const parsedDiscount = parseFloat(rawDiscount);
        if (!isNaN(parsedDiscount) && parsedDiscount >= 0) {
          discountPrice = parsedDiscount;
        }
      }

      const images = resolveProductImages(imageRaw);
      const key = name.toLowerCase();

      if (!groups.has(key)) {
        groups.set(key, {
          name,
          rawSlug,
          description,
          price,
          discountPrice,
          fabric,
          occasion,
          isTrending,
          isFeatured,
          isOffer,
          categoryId: matchedCategory.id,
          variants: [],
        });
      }

      const group = groups.get(key);
      // Keep first row's shared fields; later rows only add color variants
      group.variants.push({
        color: color || "Default",
        images,
        stock,
        rowNum,
      });
    }

    if (groups.size === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid product rows to insert",
        errors: validationErrors,
      });
    }

    let createdCount = 0;
    let variantCount = 0;

    for (const [, group] of groups) {
      let baseSlug = group.rawSlug
        ? group.rawSlug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        : group.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

      if (!baseSlug) baseSlug = `saree-${Date.now()}`;

      let finalSlug = baseSlug;
      let counter = 1;
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      usedSlugs.add(finalSlug);

      const firstVariant = group.variants[0];
      const totalStock = group.variants.reduce((s, v) => s + (v.stock || 0), 0);
      const primaryImage =
        (firstVariant.images && firstVariant.images[0]) || null;

      const product = await prisma.product.create({
        data: {
          name: group.name,
          slug: finalSlug,
          description: group.description,
          price: group.price,
          discountPrice: group.discountPrice,
          stock: totalStock,
          image: primaryImage,
          fabric: group.fabric,
          color: firstVariant.color,
          occasion: group.occasion,
          isTrending: group.isTrending,
          isFeatured: group.isFeatured,
          isOffer: group.isOffer,
          categoryId: group.categoryId,
        },
      });

      createdCount += 1;

      if (group.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: group.variants.map((v, idx) => ({
            productId: product.id,
            color: v.color,
            images: v.images || [],
            stock: v.stock || 0,
            sortOrder: idx,
          })),
        });
        variantCount += group.variants.length;
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdCount} products (${variantCount} color variants)`,
      count: createdCount,
      variantCount,
      errors: validationErrors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Bulk product creation failed due to server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductBulk,
};
