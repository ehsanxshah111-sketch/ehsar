import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    category: { type: String, enum: ["men", "women"], required: true },
    type: { type: String, enum: ["clothing", "shoes", "watches"], default: "clothing" },
    subCategory: { type: String, default: "General" },
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 50 },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: true },
    isOnSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
