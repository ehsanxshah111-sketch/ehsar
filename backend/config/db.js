import mongoose from "mongoose";

// Serverless functions (Vercel) can run the same module many times across
// separate invocations, so the connection is cached on `global` - without
// this, every request would open a brand new MongoDB connection and you'd
// exhaust your connection limit within minutes of real traffic.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error(`MongoDB connection error: ${err.message}`);
    // In local dev it's fine to crash loudly; on Vercel this just fails
    // the single request instead of killing the whole function runtime.
    if (!process.env.VERCEL) process.exit(1);
    throw err;
  }
};

export default connectDB;
