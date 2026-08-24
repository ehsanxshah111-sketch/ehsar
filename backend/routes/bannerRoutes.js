import express from "express";
import Banner from "../models/Banner.js";
import { protect } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// GET /api/banners (public) - active banners only, sorted
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/banners/all (admin only) - includes inactive
router.get("/all", protect, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/banners (admin only)
router.post("/", protect, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    await logActivity(req.admin.username, "Banner Created", `${req.admin.username} created banner "${banner.title}"`);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: "Failed to create banner", error: err.message });
  }
});

// PUT /api/banners/:id (admin only)
router.put("/:id", protect, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    await logActivity(req.admin.username, "Banner Updated", `${req.admin.username} updated banner "${banner.title}"`);
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: "Failed to update banner", error: err.message });
  }
});

// DELETE /api/banners/:id (admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    await logActivity(req.admin.username, "Banner Deleted", `${req.admin.username} deleted banner "${banner.title}"`);
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
