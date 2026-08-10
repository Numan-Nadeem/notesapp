import { test } from "node:test";
import assert from "node:assert/strict";
import { errorHandler } from "../src/middlewares/errorMiddleware.js";
import { ApiError } from "../src/utils/ApiError.js";

// Fake Express res that records status()/json() calls.
const mockRes = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("errorHandler honors ApiError.statusCode", () => {
  const res = mockRes();
  errorHandler(new ApiError(409, "dup"), {}, res, () => {});
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.error, "dup");
});

test("errorHandler maps Mongo duplicate-key (11000) to 409", () => {
  const res = mockRes();
  const err = { code: 11000, keyValue: { email: "a@b.co" } };
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 409);
  assert.match(res.body.error, /email/);
});

test("errorHandler maps Mongoose ValidationError to 400", () => {
  const res = mockRes();
  const err = {
    name: "ValidationError",
    errors: { title: { message: "Title is required" } },
  };
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Title is required");
});

test("errorHandler maps JWT errors to 401", () => {
  const res = mockRes();
  errorHandler({ name: "JsonWebTokenError" }, {}, res, () => {});
  assert.equal(res.statusCode, 401);
});

test("errorHandler defaults to 500 for unknown errors", () => {
  const res = mockRes();
  errorHandler(new Error("boom"), {}, res, () => {});
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, "boom");
});

test("errorHandler hides stack in production", () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const res = mockRes();
  errorHandler(new Error("boom"), {}, res, () => {});
  assert.equal(res.body.stack, undefined);
  process.env.NODE_ENV = prev;
});
