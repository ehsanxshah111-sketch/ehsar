import { v2 as cloudinary } from "cloudinary";

// Image uploads go to Cloudinary rather than local disk, because Vercel's
// serverless filesystem is read-only/ephemeral - anything saved to disk
// there disappears the moment the function instance recycles. Cloudinary's
// free tier is more than enough for a small product catalog.
export const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;
