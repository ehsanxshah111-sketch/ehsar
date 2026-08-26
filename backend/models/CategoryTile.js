import mongoose from "mongoose";

// The 4 (or however many) image tiles on the homepage linking to a
// category - "Women", "Men", "Shoes", "Watches" etc. Previously these were
// hardcoded directly in Home.jsx with fixed images/links; this lets the
// admin panel edit them the same way banners are already editable.
const categoryTileSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    image: { type: String, required: true },
    linkUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("CategoryTile", categoryTileSchema);
