import mongoose from "mongoose";
import dns from "dns";

let connectionPromise = null;

const connect = async () => {
  // Some environments have DNS servers that refuse SRV queries (causing
  // `querySrv ECONNREFUSED`) against Atlas. Overriding the resolver is a
  // system-level side effect and can break the opposite case (networks that
  // block direct UDP to public resolvers), so it's opt-in: set
  // MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1 to use public resolvers.
  const dnsServers = (process.env.MONGO_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (dnsServers.length > 0) {
    try {
      dns.setServers(dnsServers);
    } catch {
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
