import mongoose from "mongoose";

// Serverless functions (Vercel) can run the same module many times across
// separate invocations, so the connection is cached on `global` - without
// this, every request would open a brand new MongoDB connection and you'd
// exhaust your connection limit within minutes of real traffic.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

// If the initial connection attempt fails (wrong MONGO_URI, DB briefly
// unreachable, network hiccup during boot), keep retrying at this interval
// instead of giving up. Only matters outside Vercel - see the note below.
const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  // A cached connection OBJECT stays truthy forever, even after the
  // underlying socket has actually died (Atlas closing an idle connection,
  // or Vercel freezing/thawing the function after a period of no traffic).
  // Without checking readyState, every request after that point kept
  // reusing a dead connection - queries would fail or hang, which is
  // exactly why the site would break after sitting idle and then "fix
  // itself" on redeploy (a fresh deployment starts with no cache at all,
  // forcing one new real connection).
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // Connection exists but isn't actually live (readyState 0 disconnected,
  // 2 connecting-stuck, or 3 disconnecting) - discard it and reconnect
  // instead of handing back something broken.
  if (cached.conn) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        // Fail fast instead of hanging the request for the default 30s if
        // Atlas is briefly unreachable - callers already handle a thrown
        // error here (see the try/catch below and each route's own
        // error handling).
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);

    // If the connection drops later (Atlas closes it, network blip), make
    // sure the NEXT connectDB() call reconnects instead of trusting a
    // now-dead cached object - this is what the readyState check above
    // relies on actually being accurate.
    cached.conn.connection.removeAllListeners("disconnected");
    cached.conn.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected - will reconnect on next request");
      cached.conn = null;
      cached.promise = null;
    });

    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error(`MongoDB connection error: ${err.message}`);

    // On Vercel, a failed connection only fails the one request that
    // triggered it - the next request calls connectDB() again on its own,
    // so there's nothing more to do here.
    //
    // Outside Vercel (a VM/VPS running `node server.js` directly), this
    // used to call process.exit(1) - which kills the entire site, not just
    // this one failed connection. If nothing is watching the process to
    // restart it, one bad boot (a typo'd MONGO_URI, the database being
    // briefly unreachable) takes the whole store offline until someone
    // notices and restarts it by hand. Instead, keep the process alive -
    // the health check and any non-DB routes keep working, DB-backed
    // routes return a clean timeout error in the meantime (see
    // orderRoutes.js etc.) - and retry the connection in the background.
    // Once MongoDB becomes reachable, everything starts working again with
    // no restart needed.
    if (!process.env.VERCEL) {
      setTimeout(() => {
        cached.promise = null;
        connectDB().catch(() => {
          // Already logged above; connectDB will schedule the next retry.
        });
      }, RETRY_DELAY_MS);
    }
    throw err;
  }
};

export default connectDB;

