// Centralized cookie options so access/refresh/clear all stay consistent
// and the secure flag follows the environment.
const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // "none" is required for cross-site cookies over HTTPS in production.
  sameSite: isProduction ? "none" : "lax",
};

export const accessCookieOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshCookieOptions = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const clearCookieOptions = baseCookieOptions;
