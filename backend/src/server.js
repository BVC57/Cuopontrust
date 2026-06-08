require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { validationResult } = require("express-validator");
const connectDb = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const couponRoutes = require("./routes/coupon.routes");
const blogRoutes = require("./routes/blog.routes");
const paymentRoutes = require("./routes/payment.routes");
const walletRoutes = require("./routes/wallet.routes");
const disputeRoutes = require("./routes/dispute.routes");
const adminRoutes = require("./routes/admin.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    permissionsPolicy: {
      features: {
        accelerometer: ["self", "https://checkout.razorpay.com"],
        gyroscope: ["self", "https://checkout.razorpay.com"],
        magnetometer: ["self", "https://checkout.razorpay.com"],
        payment: ["self", "https://checkout.razorpay.com"]
      }
    }
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/api/payments/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "CouponTrust API is healthy" });
});

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    if (payload && payload.errors && !Array.isArray(payload.errors)) {
      payload.errors = [payload.errors];
    }
    return originalJson(payload);
  };
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/super-admin", adminRoutes);

app.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: "Validation failed", errors: errors.array() });
  }
  next();
});

app.use(errorMiddleware);

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`CouponTrust API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
