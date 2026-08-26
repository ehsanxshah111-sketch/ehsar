import express from "express";
import Review from "../models/Review.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

// GET /api/reviews/:productId  (public) - all reviews for a product, newest
// first, plus the average rating and count so the frontend doesn't have to
// recompute it from the full list.
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    const count = reviews.length;
    const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    res.json({ reviews, average, count });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/reviews/:productId  (customer only) - create or update this
// customer's own review for the product (one review per customer, upsert
// rather than reject on a second submission so editing a review is just
// "review again").
router.post("/:productId", protectUser, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Please select a rating from 1 to 5" });
    }
    const review = await Review.findOneAndUpdate(
      { product: req.params.productId, customer: req.customer._id },
      {
        product: req.params.productId,
        customer: req.customer._id,
        name: req.customer.name,
        rating: ratingNum,
        comment: (comment || "").trim(),
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/reviews/:id  (customer only) - a customer removing their own review
router.delete("/:id", protectUser, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.customer.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own review" });
    }
    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
