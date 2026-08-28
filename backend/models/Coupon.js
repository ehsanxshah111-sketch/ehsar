import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // Stored upper-case so "SAVE10", "save10", "Save10" all collide on the
    // same coupon instead of silently creating near-duplicate codes.
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Percentage off the product subtotal (not shipping). 1-100.
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    // Admin's on/off switch. Turning this off must immediately stop the
    // code from being usable - nothing else needs to change or be deleted
    // for that to take effect, since every validation (both the customer's
    // "Apply" click and the server-side check at checkout) reads this flag
    // live rather than caching it.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
