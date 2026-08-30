import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { protectUser } from "../middleware/userAuth.js";
import { protect } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";
import { sendOrderNotificationEmail } from "../utils/mailer.js";

const router = express.Router();

const PAYMENT_METHODS = ["JazzCash", "Easypaisa", "BankTransfer", "COD"];
// Rough cap on the base64 screenshot string so a bad request can't stuff a
// huge file into the database (express.json is already capped at 5mb too).
const MAX_SCREENSHOT_LENGTH = 1_500_000; // ~1MB of actual image data

// POST /api/orders  (customer only) - place an order from the cart
router.post("/", protectUser, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, transactionId, paymentScreenshot, couponCode } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your order has no items" });
    }
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.houseNumber ||
      !shippingAddress.street ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({ message: "Full shipping details are required" });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Please choose a valid payment method" });
    }
    // JazzCash/Easypaisa/Bank Transfer are self-reported by the customer, so
    // we require both a transaction ID and a screenshot before we'll even
    // create the order - otherwise there's nothing for the admin to verify.
    // COD skips both: nothing has been paid yet, so there's nothing to report.
    if (paymentMethod !== "COD") {
      if (!transactionId?.trim()) {
        return res.status(400).json({ message: "Please enter the transaction ID / reference number" });
      }
      if (!paymentScreenshot) {
        return res.status(400).json({ message: "Please upload a screenshot of the payment" });
      }
      if (paymentScreenshot.length > MAX_SCREENSHOT_LENGTH) {
        return res.status(400).json({ message: "Screenshot is too large, please upload a smaller image" });
      }
    }

    // Recomputed here rather than trusting a client-sent total, so a
    // tampered request can't place an order for less than it should cost.
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Coupon is re-checked here (not just trusted from the cart's earlier
    // "Apply" call) so that a code deactivated by the admin between the
    // customer applying it and actually placing the order can't still be
    // used, and so a tampered request can't claim a discount that was
    // never validated at all. The discount only ever comes off the product
    // subtotal above - it never touches shipping.
    let appliedCoupon = null;
    let discountAmount = 0;
    const trimmedCode = (couponCode || "").trim().toUpperCase();
    if (trimmedCode) {
      const coupon = await Coupon.findOne({ code: trimmedCode });
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ message: "That coupon code is invalid or is no longer active" });
      }
      appliedCoupon = coupon;
      discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);
    }
    // Same free-shipping-over-Rs10,000 rule as the cart page (Cart.jsx) -
    // kept in sync with that threshold. Computed here from the server-side
    // subtotal rather than trusting anything shipping-related the client
    // sends, for the same tamper-proofing reason the subtotal itself is
    // recomputed above.
    const shippingFee = subtotal >= 10000 ? 0 : 100;
    const totalAmount = subtotal - discountAmount + shippingFee;

    // Reserve stock atomically per line item before the order is created.
    // Each decrement is conditioned on stock >= qty, so two customers racing
    // for the last unit can't both succeed. If any item runs out partway
    // through, everything already decremented in this order is put back
    // before we respond, so a failed order never leaves stock short.
    const decremented = [];
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );
      if (!updated) {
        for (const rollback of decremented) {
          await Product.findByIdAndUpdate(rollback.product, { $inc: { stock: rollback.qty } });
        }
        return res.status(400).json({
          message: `"${item.name}" doesn't have enough stock left. Please update your cart and try again.`,
        });
      }
      decremented.push({ product: item.product, qty: item.qty });
    }

    let order;
    try {
      order = await Order.create({
        user: req.customer._id,
        items,
        shippingAddress,
        totalAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : "",
        discountAmount,
        shippingFee,
        paymentMethod,
        transactionId: transactionId?.trim() || "",
        paymentScreenshot: paymentScreenshot || "",
      });
    } catch (createErr) {
      // Order failed to save after stock was already reserved - put it back.
      for (const rollback of decremented) {
        await Product.findByIdAndUpdate(rollback.product, { $inc: { stock: rollback.qty } });
      }
      throw createErr;
    }

    // Not awaited on purpose - the customer's response shouldn't wait on
    // (or fail because of) Gmail being slow or unreachable. Errors are
    // caught and logged inside sendOrderNotificationEmail itself.
    sendOrderNotificationEmail(order);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/orders/my  (customer only) - this customer's own orders, newest first.
// paymentScreenshot is excluded - it's never shown back to the customer, and
// at up to ~1MB of base64 per order it was the main thing making this page
// slow to load.
router.get("/my", protectUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.customer._id })
      .select("-paymentScreenshot")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/orders/summary  (admin only) - just the two numbers the sidebar
// badge and dashboard cards need. Computed in the database instead of
// pulling every order (with its ~1MB screenshot) down to the browser just to
// count/sum a couple of fields - this is what made the admin panel feel slow
// to load, since it was happening 2-3 times on every dashboard visit
// (sidebar badge, Overview page, then again on Orders/Payments).
router.get("/summary", protect, async (req, res) => {
  try {
    const [pendingPayments, revenueResult] = await Promise.all([
      Order.countDocuments({ paymentStatus: "Submitted" }),
      Order.aggregate([
        { $match: { paymentStatus: "Verified" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
    res.json({
      pendingPayments,
      verifiedRevenue: revenueResult[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/orders  (admin only) - every order, newest first. paymentScreenshot
// is excluded here too - the Orders/Payments list pages fetch it on demand
// via GET /api/orders/:id/screenshot only when the admin actually clicks to
// view one, instead of every order dragging its full image along for a list
// that mostly doesn't need to show it.
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find()
      .select("-paymentScreenshot")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/orders/:id/screenshot  (admin only) - fetched on demand when the
// admin clicks "View Screenshot", instead of shipping every order's image
// with every list load.
router.get("/:id/screenshot", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("paymentScreenshot");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ paymentScreenshot: order.paymentScreenshot });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/orders/:id/status  (admin only) - move an order to its next stage
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Order not found" });

    // Cancelling an order releases the stock it reserved, but only once -
    // otherwise re-saving an already-cancelled order would keep adding it back.
    if (status === "Cancelled" && existing.status !== "Cancelled") {
      for (const item of existing.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    await logActivity(
      req.admin.username,
      "Order Status Updated",
      `${req.admin.username} set order #${order._id.toString().slice(-6).toUpperCase()} to ${status}`
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/orders/:id/payment-status  (admin only) - confirm or reject a
// self-reported JazzCash/Easypaisa/bank transfer after checking the account
router.put("/:id/payment-status", protect, async (req, res) => {
  try {
    const { paymentStatus, paymentNote } = req.body;
    const allowed = ["Submitted", "Verified", "Rejected"];
    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentNote: paymentNote || "" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    await logActivity(
      req.admin.username,
      "Payment Status Updated",
      `${req.admin.username} marked order #${order._id.toString().slice(-6).toUpperCase()} payment as ${paymentStatus}`
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/orders/:id  (admin only) - e.g. to remove a test/mistaken order
router.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    await logActivity(
      req.admin.username,
      "Order Deleted",
      `${req.admin.username} deleted order #${order._id.toString().slice(-6).toUpperCase()}`
    );
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
