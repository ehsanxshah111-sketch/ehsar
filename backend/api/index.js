// Vercel serverless entrypoint. Every request to /api/* is routed here
// (see vercel.json). We connect to MongoDB (cached - see config/db.js)
// on each cold start, then hand off to the same Express app used locally.
import connectDB from "../config/db.js";
import app from "../app.js";

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
