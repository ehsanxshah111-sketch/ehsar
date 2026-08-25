// Vercel serverless entry point. Every request to /api/* (see vercel.json)
// is routed here, which just hands off to the same Express app used for
// local development - backend/app.js already calls dotenv.config() and
// connectDB() itself, so nothing extra is needed here.
import app from "../backend/app.js";

export default app;
