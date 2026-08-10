import { badRequest } from "../utils/ApiError.js";

// Minimal, dependency-free request-body validation. Each validator throws an
// ApiError(400) on the first problem it finds.

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body || {};
  if (!isNonEmptyString(name)) return next(badRequest("Name is required"));
  if (!isNonEmptyString(email)) return next(badRequest("Email is required"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return next(badRequest("A valid email is required"));
  if (typeof password !== "string" || password.length < 6)
    return next(badRequest("Password must be at least 6 characters long"));
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!isNonEmptyString(email)) return next(badRequest("Email is required"));
  if (!isNonEmptyString(password))
    return next(badRequest("Password is required"));
  next();
};

export const validateNote = (req, res, next) => {
  const { title, content } = req.body || {};
  if (!isNonEmptyString(title)) return next(badRequest("Title is required"));
  if (!isNonEmptyString(content))
    return next(badRequest("Content is required"));
  next();
};
