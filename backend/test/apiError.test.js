import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  badRequest,
  conflict,
  notFoundError,
  unauthorized,
} from "../src/utils/ApiError.js";

test("ApiError carries statusCode and message", () => {
  const err = new ApiError(418, "teapot");
  assert.equal(err.statusCode, 418);
  assert.equal(err.message, "teapot");
  assert.equal(err.name, "ApiError");
  assert.ok(err instanceof Error);
});

test("helper factories set the right status codes", () => {
  assert.equal(badRequest("x").statusCode, 400);
  assert.equal(unauthorized("x").statusCode, 401);
  assert.equal(notFoundError("x").statusCode, 404);
  assert.equal(conflict("x").statusCode, 409);
});
