import express from "express";
import CategoryTile from "../models/CategoryTile.js";
import { protect } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// GET /api/category-tiles (public) - active tiles only, sorted
router.get("/", async (req, res) => {
  try {
    const tiles = await CategoryTile.find({ isActive: true }).sort({ order: 1 });
    res.json(tiles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/category-tiles/all (admin only) - includes inactive
router.get("/all", protect, async (req, res) => {
  try {
    const tiles = await CategoryTile.find().sort({ order: 1 });
    res.json(tiles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/category-tiles (admin only)
router.post("/", protect, async (req, res) => {
  try {
    const tile = await CategoryTile.create(req.body);
    await logActivity(req.admin.username, "Category Tile Created", `${req.admin.username} created tile "${tile.label}"`);
    res.status(201).json(tile);
  } catch (err) {
    res.status(400).json({ message: "Failed to create tile", error: err.message });
  }
});

// PUT /api/category-tiles/:id (admin only)
router.put("/:id", protect, async (req, res) => {
  try {
    const tile = await CategoryTile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tile) return res.status(404).json({ message: "Tile not found" });
    await logActivity(req.admin.username, "Category Tile Updated", `${req.admin.username} updated tile "${tile.label}"`);
    res.json(tile);
  } catch (err) {
    res.status(400).json({ message: "Failed to update tile", error: err.message });
  }
});

// DELETE /api/category-tiles/:id (admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const tile = await CategoryTile.findByIdAndDelete(req.params.id);
    if (!tile) return res.status(404).json({ message: "Tile not found" });
    await logActivity(req.admin.username, "Category Tile Deleted", `${req.admin.username} deleted tile "${tile.label}"`);
    res.json({ message: "Tile deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
