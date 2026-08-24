import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    promotionText: { type: String, default: "" },
    image: { type: String, required: true },
    linkUrl: { type: String, default: "/shop" },
    buttonText: { type: String, default: "Shop Now" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
