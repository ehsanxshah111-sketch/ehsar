import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    promotionText: { type: String, default: "" },
    // "video" banners play a looping background video instead of a static
    // photo. `image` doubles as the video's poster frame in that case (what
    // shows while the video loads, and the fallback if the browser can't
    // play it) - so it's no longer required when a video is provided.
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    image: {
      type: String,
      required: function () {
        return this.mediaType !== "video";
      },
      default: "",
    },
    video: {
      type: String,
      default: "",
      required: function () {
        return this.mediaType === "video";
      },
    },
    linkUrl: { type: String, default: "/shop" },
    buttonText: { type: String, default: "Shop Now" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
