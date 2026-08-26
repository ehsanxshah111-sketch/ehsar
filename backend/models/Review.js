import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // snapshot of the customer's name at review time
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// A customer can only review a given product once - re-submitting updates
// their existing review instead of creating a second one.
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
