import dotenv from "dotenv";

dotenv.config();

const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

// Fail fast on a misconfigured environment rather than crashing later with a
// cryptic error deep inside a request handler.
export const validateEnv = () => {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

const parseOrigins = (value) =>
  (value || "http://localhost:5173,http://localhost:4173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  // Comma-separated list of allowed frontend origins (dev: 5173, preview: 4173).
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
};
