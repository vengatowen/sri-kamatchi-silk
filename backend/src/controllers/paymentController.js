const prisma = require("../config/prisma");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const DEFAULT_STATE_SHIPPING_FEES = { tamilNadu: 30, pondicherry: 30, southStates: 60, otherStates: 80 };

const getStateShippingFee = (state, fees = DEFAULT_STATE_SHIPPING_FEES) => {
  const normalized = String(state || "").trim().toLowerCase();
  if (normalized === "tamil nadu") return Number(fees.tamilNadu);
  if (["puducherry", "pondicherry"].includes(normalized)) return Number(fees.pondicherry);
  if (["karnataka", "kerala", "telangana", "andhra pradesh"].includes(normalized)) return Number(fees.southStates);
  return normalized ? Number(fees.otherStates) : null;
};

// Create a real Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const {
      items,
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

    // 1. Primary Check: Country must be India
    if (!country || country.trim().toLowerCase() !== "india") {
      return res.status(400).json({
        success: false,
        message: "Direct checkout is only allowed for shipping addresses in India.",
      });
    }

    // 2. Validate Indian Pincode (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian pincode. Must be exactly 6 digits.",
      });
    }

    // 3. Load dynamic settings
    const shippingSettings = await prisma.shippingSettings.findFirst();
    const freeShippingCap = shippingSettings ? shippingSettings.freeShippingAbove : 4999;

    let paymentSettings = await prisma.paymentSettings.findFirst();
    if (!paymentSettings || !paymentSettings.razorpayEnabled) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment gateway is not enabled by the administrator.",
      });
    }

    // Prefer deployment environment variables so stale placeholder values in the
    // admin settings cannot override the credentials configured for this backend.
    const keyId = process.env.RAZORPAY_KEY_ID || paymentSettings.razorpayKeyId;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || paymentSettings.razorpaySecret;
    const hasPlaceholderCredentials =
      !keyId ||
      !keySecret ||
      keyId === "rzp_test_Kamatchi90281" ||
      keySecret.includes("dummy") ||
      keySecret === "dummysecretvalue12345678";

    if (hasPlaceholderCredentials) {
      return res.status(400).json({
        success: false,
        message: "Razorpay configuration keys are missing on the server.",
      });
    }

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 4. Calculate subtotal from DB to prevent client-side price tampering
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Ordered: ${item.quantity}`,
        });
      }

      const price = product.discountPrice !== null ? product.discountPrice : product.price;
      subtotal += price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: price,
      });
    }

    const fees = { ...DEFAULT_STATE_SHIPPING_FEES, ...(shippingSettings?.stateShippingFees || {}) };
    const stateShippingFee = getStateShippingFee(state, fees);
    if (stateShippingFee === null) {
      return res.status(400).json({ success: false, message: "Please provide a valid Indian state to calculate shipping." });
    }
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const shippingFee = subtotal === 0 || subtotal >= freeShippingCap ? 0 : stateShippingFee * totalQuantity;
    const totalAmount = subtotal + shippingFee;

    // 6. Create internal order in DB in PENDING payment status
    // Note: Do NOT decrement stock yet
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        shippingFee,
        paymentMethod: "Razorpay",
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
    });

    // 7. Create Razorpay order in paise
    const amountInPaise = Math.round(totalAmount * 100);
    if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be at least ₹1.00.",
      });
    }

    // Never fabricate an order ID after an API/authentication failure. Checkout
    // must only receive a real order created by Razorpay.
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.id,
    });

    // 8. Save Razorpay Order ID to database Order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: rzpOrder.id,
      },
    });

    res.status(200).json({
      success: true,
      keyId,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount,
      currency: "INR",
      internalOrderId: updatedOrder.id,
    });
  } catch (error) {
    console.error("PAYMENT_CREATION_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment order creation failed",
      error: error.message,
    });
  }
};

// Verify real Razorpay Payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "payment_id, order_id, and signature are required",
      });
    }

    // 1. Fetch payment settings to get Key Secret
    const paymentSettings = await prisma.paymentSettings.findFirst();
    const keySecret = paymentSettings?.razorpaySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(400).json({
        success: false,
        message: "Razorpay key secret is not configured on the server",
      });
    }

    // 2. Verify Razorpay signature using HMAC SHA256
    const signData = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(signData.toString())
      .digest("hex");

    // Resolve the internal order before changing its status; only its owner may
    // complete checkout for it.
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id, userId: req.user.id },
      include: {
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
        message: "Associated order not found for this account",
      });
    }

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    const isValidSignature =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValidSignature) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "Failed" },
      });

      return res.status(400).json({
        success: false,
        message: "Razorpay signature verification failed. Invalid payment.",
      });
    }

    // Signature is valid; finalize the order inside a transaction.

    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: order,
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Decrement stock for each item in the order
      for (const item of order.orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity,
          },
        });
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "Paid",
          orderStatus: "Confirmed",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      // Clear user's cart
      await tx.cart.deleteMany({
        where: { userId: order.userId },
      });

      return updated;
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully and stock decremented",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
