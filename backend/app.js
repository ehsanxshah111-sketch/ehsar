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

// dotenv.config() lives here (not in server.js) because Vercel's zero-config
// Express detection may load this file directly as the serverless
// entrypoint and never execute server.js at all - keeping it here means
// env vars are loaded correctly no matter which file Vercel actually picks
// as the entry, locally or on Vercel.
dotenv.config();
// A best-effort warm-up: if this succeeds before the first request arrives,
// that request doesn't have to wait on the connection at all. It is NOT the
// only place a connection is attempted, though - see the middleware below,
// which is what actually keeps the app working if this one attempt fails.
connectDB().catch(() => {});

const app = express();

// Vercel sits in front of this app as a proxy and adds an X-Forwarded-For
// header to every request. Without telling Express to trust that header,
// express-rate-limit refuses to run at all - it throws a ValidationError
// (visible in your logs as "ValidationError: The 'X-Forwarded-For' header
// is set...") since trusting that header blindly, without this setting,
// would let anyone bypass IP-based rate limiting by forging it themselves.
// This is what was actually breaking POST /api/auth/login with a 500.
app.set("trust proxy", 1);

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

// This is the actual fix for "works, then breaks after sitting idle, then
// redeploying fixes it again": connectDB() above only ever runs ONCE, at
// the moment this serverless instance cold-starts. If that one attempt
// hits a transient failure (a brief Atlas/network hiccup - exactly what
// your logs show: "MongoDB connection error: Could not connect to any
// servers..."), nothing was ever calling connectDB() again afterwards.
// db.js's caching correctly clears itself on failure and is ready to
// retry - but nothing was invoking it, so that one instance stayed broken
// for its entire lifetime, silently 500-ing every request, until Vercel
// eventually recycled it or you redeployed. This middleware gives every
// single request the chance to retry a dead connection before it reaches
// a route - if already connected, connectDB() returns instantly (see the
// readyState check in db.js), so this adds no real overhead.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: "Database temporarily unavailable, please try again shortly." });
  }
});

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
