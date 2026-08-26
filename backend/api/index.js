// Vercel serverless entry point for the STANDALONE backend project.
// Deploy this "backend" folder as its own Vercel project (Root Directory =
// backend). Vercel auto-detects any file under api/ as a function - no
// vercel.json builds/routes config needed for that part.
//
// ../app.js already calls dotenv.config() and connectDB() itself, so
// nothing extra is needed here.
import app from "../app.js";

export default app;
