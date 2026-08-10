import mongoose from "mongoose";
import dns from "dns";

export const connectDB = async () => {
  try {
    // Some environments have DNS servers that refuse SRV queries (causing
    // `querySrv ECONNREFUSED`). If the URI is an SRV string, prefer public
    // DNS resolvers which reliably answer SRV records.
    if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch (e) {
        // Non-fatal: if we can't set servers for some reason, continue and
        // let the normal connect attempt run.
      }
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error!", error);
    // Don't start the server against a dead database.
    process.exit(1);
  }
};
