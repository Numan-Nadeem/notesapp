import rateLimit from "express-rate-limit";

// Throttle auth endpoints to slow down brute-force / credential-stuffing.
// Integration tests hammer these endpoints from a single IP, so they set
// DISABLE_RATE_LIMIT=true to opt out of the limiter entirely.
const limiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
};

export const authLimiter =
  process.env.DISABLE_RATE_LIMIT === "true"
    ? (req, res, next) => next()
    : rateLimit(limiterOptions);
