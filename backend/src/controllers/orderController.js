const prisma = require("../config/prisma");

const DEFAULT_STATE_SHIPPING_FEES = { tamilNadu: 30, pondicherry: 30, southStates: 60, otherStates: 80 };

const getStateShippingFee = (state, fees = DEFAULT_STATE_SHIPPING_FEES) => {
  const normalized = String(state || "").trim().toLowerCase();
  if (normalized === "tamil nadu") return Number(fees.tamilNadu);
  if (["puducherry", "pondicherry"].includes(normalized)) return Number(fees.pondicherry);
  if (["karnataka", "kerala", "telangana", "andhra pradesh"].includes(normalized)) return Number(fees.southStates);
  return normalized ? Number(fees.otherStates) : null;
};

const createOrder = async (req, res) => {
  try {
    const {
      items,
      paymentMethod,
      customerName,
      customerPhone,
      address,
      city,
      state,
      pincode,
      country = "India",
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    // 1. Only Cash on Delivery is allowed through this direct orders endpoint
    const isCod = paymentMethod === "Cash on Delivery" || paymentMethod === "COD";
    if (!isCod) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method for this endpoint. Use the Razorpay payment API for online checkout.",
      });
    }

    // 2. COD is allowed only for India
    if (!country || country.trim().toLowerCase() !== "india") {
      return res.status(400).json({
        success: false,
        message: "Cash on Delivery is only allowed within India.",
      });
    }

    // 3. Indian pincode format check
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian pincode. Must be exactly 6 digits.",
      });
    }

    // 4. Fetch dynamic logistics configurations
    const shippingSettings = await prisma.shippingSettings.findFirst();
    const freeShippingCap = shippingSettings ? shippingSettings.freeShippingAbove : 4999;
    const codEnabled = shippingSettings ? shippingSettings.codEnabled : true;

    if (!codEnabled) {
      return res.status(400).json({
        success: false,
        message: "Cash on Delivery (COD) is currently disabled in the store settings.",
      });
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found with ID ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Ordered: ${item.quantity}`,
          );
        }

        // Calculate price (use discountPrice if available, else standard price)
        const price = product.discountPrice !== null ? product.discountPrice : product.price;
        subtotal += price * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: price,
        });

        // Reduce stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity,
          },
        });
      }

      const fees = { ...DEFAULT_STATE_SHIPPING_FEES, ...(shippingSettings?.stateShippingFees || {}) };
      const stateShippingFee = getStateShippingFee(state, fees);
      if (stateShippingFee === null) throw new Error("Please provide a valid Indian state to calculate shipping.");
      const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const shippingFee = subtotal === 0 || subtotal >= freeShippingCap ? 0 : stateShippingFee * totalQuantity;
      const totalAmount = subtotal + shippingFee;

      // Create order
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          shippingFee,
          paymentMethod: "COD",
          paymentStatus: "Pending",
          orderStatus: "Pending",
          customerName,
          customerPhone,
          address,
          city,
          state,
          pincode,
          country: "India",
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Clear customer's cart
      await tx.cart.deleteMany({
        where: { userId: req.user.id },
      });

      return order;
    });

    res.status(201).json({
      success: true,
      message: "COD Order created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Order creation failed",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { orderStatus },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const allowedPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed: ${allowedPaymentStatuses.join(", ")}`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
  updatePaymentStatus,
};
