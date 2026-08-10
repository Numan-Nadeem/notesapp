import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode;
  let message = err.message;

  // Map common Mongoose / driver errors to sensible HTTP statuses.
  if (!statusCode) {
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
    } else if (err.name === "CastError") {
      statusCode = 400;
      message = "Invalid identifier";
    } else if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue || {})[0] || "field";
      message = `${field} already in use`;
    } else if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
    } else if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired";
    }
  }

  // If a controller already set a non-200 status, respect it; otherwise 500.
  if (!statusCode) {
    statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  }

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
