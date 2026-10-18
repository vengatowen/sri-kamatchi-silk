const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from absolute path
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("Supabase Env Existence Logs:", {
  supabaseUrl: !!process.env.SUPABASE_URL,
  serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  bucket: !!process.env.SUPABASE_BUCKET
});

const express = require("express");
const cors = require("cors");

const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const pageRoutes = require("./routes/pageRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sri Kamatchi Silk Backend Running",
  });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payments/razorpay", paymentRoutes);

// Global error handling middleware to guarantee JSON responses on errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
