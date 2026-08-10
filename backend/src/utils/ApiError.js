// Lightweight typed error so services can signal an HTTP status without
// depending on Express (req/res). The error middleware reads `statusCode`.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export const badRequest = (message) => new ApiError(400, message);
export const unauthorized = (message) => new ApiError(401, message);
export const forbidden = (message) => new ApiError(403, message);
export const notFoundError = (message) => new ApiError(404, message);
export const conflict = (message) => new ApiError(409, message);
