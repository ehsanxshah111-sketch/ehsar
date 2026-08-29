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
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryTileRoutes from "./routes/categoryTileRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

// dotenv.config() and connectDB() both live here (not in server.js) because
// Vercel's zero-config Express detection may load this file directly as the
// serverless entrypoint and never execute server.js at all. Keeping both
// calls here means the app works correctly no matter which file Vercel
// actually picks as the entry - locally, on Vercel, either way.
dotenv.config();
// Not awaited (this file may run as a Vercel serverless function, which
// can't block its own module load on a DB connection) - but it must still
// be caught here. db.js already logs the failure and, outside Vercel,
// keeps retrying in the background - this .catch() just stops that first
// rejection from becoming an unhandled promise rejection, which would
// otherwise crash the whole process on its own, independent of the retry
// logic in db.js.
connectDB().catch(() => {});

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
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/category-tiles", categoryTileRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/", (req, res) => res.send("Ehsar API is running"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
