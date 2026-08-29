import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// GET /api/products  (public) - supports ?category=men|women&type=clothing|shoes|watches&subCategory=&search=&featured=true&sale=true
router.get("/", async (req, res) => {
  try {
    const { category, type, subCategory, search, featured, sale, isNew } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
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

// PUT /api/products/bulk-update (admin only) - apply Featured / On Sale /
// Clear to many products at once, e.g. after selecting several with the
// "select all" checkbox in the admin product table. Registered before the
// PUT /:id route below so Express matches this literal path first - if it
// came after, "/bulk-update" would itself get treated as an :id value.
router.put("/bulk-update", protect, async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No products selected" });
    }

    let update;
    if (action === "feature") update = { isFeatured: true };
    else if (action === "sale") update = { isOnSale: true };
    else if (action === "none") update = { isFeatured: false, isOnSale: false };
    else return res.status(400).json({ message: "Invalid action" });

    const result = await Product.updateMany({ _id: { $in: ids } }, update);
    const actionLabel = action === "feature" ? "Featured" : action === "sale" ? "On Sale" : "Cleared (no flags)";
    await logActivity(
      req.admin.username,
      "Bulk Product Update",
      `${req.admin.username} set ${result.modifiedCount} product(s) to "${actionLabel}"`
    );
    res.json({ message: "Updated", modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ message: "Failed to bulk update products", error: err.message });
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
