import mongoose from "mongoose";

/**
 * Global cache interface for Mongoose connection in Next.js.
 * Prevents multiple connections during hot module reloading in development.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: MONGODB_URI environment variable is missing. " +
    "Please check your .env.local file. Localhost fallback (127.0.0.1) has been disabled."
  );
}

// Safe diagnostic logging: extract host/database without leaking user credentials or passwords
function logSafeConnectionDetails(uri: string) {
  try {
    const parsed = new URL(uri.replace(/^mongodb\+srv:\/\//, "https://").replace(/^mongodb:\/\//, "http://"));
    const host = parsed.hostname || "Atlas Cluster";
    const dbName = parsed.pathname ? parsed.pathname.replace(/^\//, "") : "unknown";
    console.log(`🔌 [MongoDB] Connecting to host: ${host} | Database: ${dbName}`);
  } catch {
    console.log("🔌 [MongoDB] Connecting using configured MONGODB_URI");
  }
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connects to MongoDB using Mongoose with connection pooling and caching.
 * Reuses existing connection if available.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    logSafeConnectionDetails(MONGODB_URI!);

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log("✅ [MongoDB] Atlas connection established successfully.");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      reason: error?.reason ? String(error.reason) : undefined,
    });
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
