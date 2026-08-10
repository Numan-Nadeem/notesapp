import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateSignup,
  validateLogin,
  validateNote,
} from "../src/middlewares/validate.js";

// Minimal harness: run a validator and capture whatever it passes to next().
const run = (validator, body) => {
  let nextArg = "UNCALLED";
  const req = { body };
  const res = {};
  validator(req, res, (err) => {
    nextArg = err;
  });
  return nextArg;
};

test("validateSignup passes a well-formed body", () => {
  const err = run(validateSignup, {
    name: "Ada",
    email: "ada@example.com",
    password: "secret1",
  });
  assert.equal(err, undefined);
});

test("validateSignup rejects a missing name", () => {
  const err = run(validateSignup, {
    email: "ada@example.com",
    password: "secret1",
  });
  assert.equal(err.statusCode, 400);
});

test("validateSignup rejects an invalid email", () => {
  const err = run(validateSignup, {
    name: "Ada",
    email: "not-an-email",
    password: "secret1",
  });
  assert.equal(err.statusCode, 400);
});

test("validateSignup rejects a short password", () => {
  const err = run(validateSignup, {
    name: "Ada",
    email: "ada@example.com",
    password: "123",
  });
  assert.equal(err.statusCode, 400);
});

test("validateLogin requires email and password", () => {
  assert.equal(run(validateLogin, { email: "a@b.co", password: "x" }), undefined);
  assert.equal(run(validateLogin, { email: "a@b.co" }).statusCode, 400);
  assert.equal(run(validateLogin, {}).statusCode, 400);
});

test("validateNote requires title and content", () => {
  assert.equal(run(validateNote, { title: "T", content: "C" }), undefined);
  assert.equal(run(validateNote, { title: "T" }).statusCode, 400);
  assert.equal(run(validateNote, { title: "  ", content: "C" }).statusCode, 400);
});
