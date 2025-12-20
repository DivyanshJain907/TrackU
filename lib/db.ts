import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI && process.env.NODE_ENV !== "production") {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalAny = global as any;

if (!globalAny.mongooseCache) {
  globalAny.mongooseCache = { conn: null, promise: null };
}

const cached: MongooseCache = globalAny.mongooseCache;

export async function connectDB() {
  // Return cached connection if it already exists
  if (cached.conn) {
    return cached.conn;
  }

  // If mongoose is already connected (outside cached), reuse it
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  if (!cached.promise) {
    // Keep the promise on the global object so it's reused across module reloads
    // Allow relaxing TLS checks in development only to avoid local OpenSSL/TLS issues.
    const devTlsOptions =
      process.env.NODE_ENV === "production"
        ? {}
        : {
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
          };

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // Optimized connection settings for faster performance
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // keep bufferCommands false so operations fail fast if disconnected
        bufferCommands: false,
        // Connection pool settings for better performance
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        // merge TLS options
        ...devTlsOptions,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
