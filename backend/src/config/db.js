import mongoose from "mongoose";
import dns from "dns";

let connectionPromise = null;

const connect = async () => {
  // Some environments have DNS servers that refuse SRV queries (causing
  // `querySrv ECONNREFUSED`). If the URI is an SRV string, prefer public
  // DNS resolvers which reliably answer SRV records.
  if (
    process.env.MONGO_URI &&
    process.env.MONGO_URI.startsWith("mongodb+srv://")
  ) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (e) {
      // Non-fatal: if we can't set servers for some reason, continue and
      // let the normal connect attempt run.
    }
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
};

// Memoized so a warm serverless container reuses its connection instead of
// dialing MongoDB on every request. Callers decide how to handle failure —
// request handlers surface a 500, startup exits.
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = connect().catch((error) => {
      // Clear the rejected promise so a later attempt can retry rather than
      // replaying the same failure for the life of the container.
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
};
