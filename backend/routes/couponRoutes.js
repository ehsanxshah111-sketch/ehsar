import express from "express";
import Coupon from "../models/Coupon.js";
import { protect } from "../middleware/auth.js";
import { protectUser } from "../middleware/userAuth.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// GET /api/coupons  (admin only) - every coupon, newest first
router.get("/", protect, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/coupons  (admin only) - create a new coupon code
router.post("/", protect, async (req, res) => {
  try {
    const { code, discountPercent, isActive } = req.body;
    if (!code?.trim()) {
      return res.status(400).json({ message: "Please enter a coupon code" });
    }
    const pct = Number(discountPercent);
    if (!pct || pct < 1 || pct > 100) {
      return res.status(400).json({ message: "Discount must be a percentage between 1 and 100" });
    }

    const coupon = await Coupon.create({
      code: code.trim(),
      discountPercent: pct,
      isActive: isActive !== undefined ? !!isActive : true,
    });
    await logActivity(
      req.admin.username,
      "Coupon Created",
      `${req.admin.username} created coupon "${coupon.code}" (${coupon.discountPercent}% off)`
    );
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A coupon with that code already exists" });
    }
    res.status(400).json({ message: "Failed to create coupon", error: err.message });
  }
});

// PUT /api/coupons/:id  (admin only) - edit a coupon, or flip it active/inactive
router.put("/:id", protect, async (req, res) => {
  try {
    const update = {};
    if (req.body.code !== undefined) {
      if (!req.body.code.trim()) {
        return res.status(400).json({ message: "Please enter a coupon code" });
      }
      update.code = req.body.code.trim();
    }
    if (req.body.discountPercent !== undefined) {
      const pct = Number(req.body.discountPercent);
      if (!pct || pct < 1 || pct > 100) {
        return res.status(400).json({ message: "Discount must be a percentage between 1 and 100" });
      }
      update.discountPercent = pct;
    }
    if (req.body.isActive !== undefined) {
      update.isActive = !!req.body.isActive;
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    // Called out separately in the log, since "a coupon someone might be
    // using right now got switched off" is the kind of change an admin
    // will want to be able to find later.
    if (req.body.isActive !== undefined) {
      await logActivity(
        req.admin.username,
        "Coupon Status Updated",
        `${req.admin.username} ${coupon.isActive ? "activated" : "deactivated"} coupon "${coupon.code}"`
      );
    } else {
      await logActivity(req.admin.username, "Coupon Updated", `${req.admin.username} updated coupon "${coupon.code}"`);
    }
    res.json(coupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A coupon with that code already exists" });
    }
    res.status(400).json({ message: "Failed to update coupon", error: err.message });
  }
});

// DELETE /api/coupons/:id  (admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    await logActivity(req.admin.username, "Coupon Deleted", `${req.admin.username} deleted coupon "${coupon.code}"`);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/coupons/validate  (customer only) - checks a code at checkout
// time, before the order is placed, so the cart page can show the discount
// and an error message right away. The order itself re-validates the code
// again server-side when it's actually created (see orderRoutes.js) -
// this endpoint is just for the live "Apply" button in the cart.
router.post("/validate", protectUser, async (req, res) => {
  try {
    const code = (req.body.code || "").trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ message: "Please enter a coupon code" });
    }
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(404).json({ message: "That coupon code doesn't exist" });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ message: "That coupon code is no longer active" });
    }
    res.json({ code: coupon.code, discountPercent: coupon.discountPercent });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
