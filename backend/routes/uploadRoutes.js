import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const router = express.Router();

// Files are held in memory only long enough to stream to Cloudinary - never
// written to disk, since that wouldn't survive a Vercel serverless instance
// recycling anyway.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5MB per image, up to 6 at once
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ehsar-products" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// POST /api/upload  (admin only) - accepts up to 6 images under the field
// name "images" and returns their hosted Cloudinary URLs, ready to drop
// straight into a product's images array.
router.post("/", protect, upload.array("images", 6), async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      message:
        "Image upload isn't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the backend .env (free account at cloudinary.com), or paste image URLs directly for now.",
    });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images were uploaded" });
  }
  try {
    const results = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );
    res.json({ urls: results.map((r) => r.secure_url) });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default router;
