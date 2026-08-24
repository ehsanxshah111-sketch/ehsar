import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentSettingsRoutes from "./routes/paymentSettingsRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";

// dotenv.config() and connectDB() both live here (not in server.js) because
// Vercel's zero-config Express detection may load this file directly as the
// serverless entrypoint and never execute server.js at all. Keeping both
// calls here means the app works correctly no matter which file Vercel
// actually picks as the entry - locally, on Vercel, either way.
dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(
  cors({
    // CLIENT_URL can be a comma-separated list, so the same API can serve
    // a production frontend and a Vercel preview deployment at once.
    origin: (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((url) => url.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

// Basic rate limiting on the login route to slow brute force attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts, please try again later." },
});
app.use("/api/auth/login", loginLimiter);
app.use("/api/users/login", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", paymentSettingsRoutes);
app.use("/api/activity-logs", activityLogRoutes);

app.get("/", (req, res) => res.send("Ehsar API is running"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
