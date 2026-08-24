import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// GET /api/products  (public) - supports ?category=men|women&subCategory=&search=&featured=true&sale=true
router.get("/", async (req, res) => {
  try {
    const { category, subCategory, search, featured, sale, isNew } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (featured === "true") filter.isFeatured = true;
    if (sale === "true") filter.isOnSale = true;
    if (isNew === "true") filter.isNew = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/products/:id (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/products (admin only)
router.post("/", protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await logActivity(req.admin.username, "Product Created", `${req.admin.username} created "${product.name}"`);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
});

// PUT /api/products/:id (admin only)
router.put("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    await logActivity(req.admin.username, "Product Updated", `${req.admin.username} updated "${product.name}"`);
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err.message });
  }
});

// DELETE /api/products/:id (admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await logActivity(req.admin.username, "Product Deleted", `${req.admin.username} deleted "${product.name}"`);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
