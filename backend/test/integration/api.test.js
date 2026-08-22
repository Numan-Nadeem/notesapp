// Integration tests for the API surface: auth (signup/login/me/refresh/
// logout) and notes CRUD + ownership. Runs against a real MongoDB — start
// one with `docker compose up -d mongo` (or any local mongod on 27017).
//
// The suite skips with a notice when Mongo is unreachable so `npm test`
// still passes the unit tests on machines without a database; CI runs it
// against a real Mongo service container.
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// Must be set before the app (and its config module) is imported.
process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "true";
process.env.MONGO_URI =
  process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/notsify_test";
process.env.JWT_SECRET ||= "test-access-secret";
process.env.JWT_REFRESH_SECRET ||= "test-refresh-secret";
process.env.CLOUDINARY_CLOUD_NAME ||= "test-cloud";
process.env.CLOUDINARY_API_KEY ||= "test-key";
process.env.CLOUDINARY_API_SECRET ||= "test-secret";

let mongoAvailable = true;
try {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 2000,
  });
  await mongoose.connection.db.admin().command({ ping: 1 });
} catch {
  mongoAvailable = false;
  console.log(
    "integration tests: MongoDB not reachable — skipping. Start one with `docker compose up -d mongo`.",
  );
}

const { default: app } = await import("../../src/app.js");

const skipReason = !mongoAvailable && "MongoDB not reachable";
const it = (name, fn) => test(name, { skip: skipReason }, fn);

let server;
let baseUrl;

before(async () => {
  if (!mongoAvailable) return;
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

beforeEach(async () => {
  if (!mongoAvailable) return;
  await Promise.all([
    mongoose.connection.collection("users").deleteMany({}),
    mongoose.connection.collection("tokens").deleteMany({}),
    mongoose.connection.collection("notes").deleteMany({}),
  ]);
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

// Minimal cookie jar so auth flows exercise the real httpOnly cookies.
class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  absorb(res) {
    for (const cookie of res.headers.getSetCookie()) {
      const [pair] = cookie.split(";");
      const eq = pair.indexOf("=");
      this.cookies.set(pair.slice(0, eq), pair.slice(eq + 1));
    }
  }

  get(name) {
    return this.cookies.get(name);
  }

  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

const request = async (jar, method, path, body, extraHeaders = {}) => {
  const headers = { ...extraHeaders };
  const cookie = jar?.header();
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers["content-type"] = "application/json";

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  jar?.absorb(res);

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
};

const signupUser = async (n) => {
  const jar = new CookieJar();
  const res = await request(jar, "POST", "/auth/signup", {
    name: `User ${n}`,
    email: `user${n}@test.dev`,
    password: "secret123",
  });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  return jar;
};

// --- health ---

it("GET /api answers the liveness probe", async () => {
  const res = await request(null, "GET", "/");
  assert.equal(res.status, 200);
  assert.match(res.data, /Notsify API is running/);
});

// --- auth ---

it("signup creates a user, forces role=user and sets auth cookies", async () => {
  const jar = new CookieJar();
  const res = await request(jar, "POST", "/auth/signup", {
    name: "Ada",
    email: "ada@test.dev",
    password: "secret123",
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.user.email, "ada@test.dev");
  assert.equal(res.data.user.role, "user");
  assert.ok(res.data.user.id);
  assert.ok(jar.get("accessToken"), "expected accessToken cookie");
  assert.ok(jar.get("refreshToken"), "expected refreshToken cookie");
});

it("signup rejects a duplicate email with 409", async () => {
  await signupUser(1);
  const res = await request(new CookieJar(), "POST", "/auth/signup", {
    name: "Copy",
    email: "user1@test.dev",
    password: "secret123",
  });
  assert.equal(res.status, 409);
});

it("signup validates the payload with 400", async () => {
  const res = await request(new CookieJar(), "POST", "/auth/signup", {
    name: "ShortPwd",
    email: "short@test.dev",
    password: "123",
  });
  assert.equal(res.status, 400);
});

it("login sets cookies and returns the user", async () => {
  await signupUser(1);
  const jar = new CookieJar();
  const res = await request(jar, "POST", "/auth/login", {
    email: "user1@test.dev",
    password: "secret123",
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.user.email, "user1@test.dev");
  assert.ok(jar.get("accessToken"));
  assert.ok(jar.get("refreshToken"));
});

it("login with a wrong password fails with 401", async () => {
  await signupUser(1);
  const res = await request(new CookieJar(), "POST", "/auth/login", {
    email: "user1@test.dev",
    password: "wrong-password",
  });
  assert.equal(res.status, 401);
});

it("GET /auth/me returns the authenticated user", async () => {
  const jar = await signupUser(1);
  const res = await request(jar, "GET", "/auth/me");

  assert.equal(res.status, 200);
  assert.equal(res.data.user.email, "user1@test.dev");
  assert.equal(res.data.user.name, "User 1");
  assert.equal(res.data.user.role, "user");
});

it("GET /auth/me without cookies fails with 401", async () => {
  const res = await request(null, "GET", "/auth/me");
  assert.equal(res.status, 401);
});

it("refresh rotates the refresh token — the old one is unusable", async () => {
  const jar = await signupUser(1);
  const originalRefresh = jar.get("refreshToken");

  const rotated = await request(jar, "POST", "/auth/refresh");
  assert.equal(rotated.status, 200);
  assert.notEqual(jar.get("refreshToken"), originalRefresh);

  // Replay the pre-rotation token: it was deleted server-side.
  const replay = await request(null, "POST", "/auth/refresh", undefined, {
    cookie: `refreshToken=${originalRefresh}`,
  });
  assert.equal(replay.status, 401);
});

it("logout revokes the refresh token", async () => {
  const jar = await signupUser(1);
  const refresh = jar.get("refreshToken");

  const res = await request(jar, "POST", "/auth/logout");
  assert.equal(res.status, 200);

  const replay = await request(null, "POST", "/auth/refresh", undefined, {
    cookie: `refreshToken=${refresh}`,
  });
  assert.equal(replay.status, 401);
});

// --- notes ---

it("notes CRUD: create, list, read, update, delete", async () => {
  const jar = await signupUser(1);

  const created = await request(jar, "POST", "/notes", {
    title: "First note",
    content: "Hello world",
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.title, "First note");
  assert.equal(created.data.content, "Hello world");
  assert.deepEqual(created.data.images, []);
  const id = created.data._id;

  const list = await request(jar, "GET", "/notes");
  assert.equal(list.status, 200);
  assert.equal(list.data.notes.length, 1);
  assert.equal(list.data.notes[0]._id, id);

  const read = await request(jar, "GET", `/notes/${id}`);
  assert.equal(read.status, 200);
  assert.equal(read.data.title, "First note");

  const updated = await request(jar, "PUT", `/notes/${id}`, {
    title: "Updated title",
    content: "Updated content",
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.title, "Updated title");

  const deleted = await request(jar, "DELETE", `/notes/${id}`);
  assert.equal(deleted.status, 200);

  const gone = await request(jar, "GET", `/notes/${id}`);
  assert.equal(gone.status, 404);
});

it("notes validation: empty title fails with 400", async () => {
  const jar = await signupUser(1);
  const res = await request(jar, "POST", "/notes", {
    title: "  ",
    content: "content",
  });
  assert.equal(res.status, 400);
});

it("notes are private to their owner", async () => {
  const owner = await signupUser(1);
  const intruder = await signupUser(2);

  const created = await request(owner, "POST", "/notes", {
    title: "Secret",
    content: "private",
  });
  const id = created.data._id;

  assert.equal((await request(intruder, "GET", `/notes/${id}`)).status, 404);
  assert.equal(
    (
      await request(intruder, "PUT", `/notes/${id}`, {
        title: "hijack",
        content: "hijack",
      })
    ).status,
    404,
  );
  assert.equal((await request(intruder, "DELETE", `/notes/${id}`)).status, 404);

  // The owner still sees it — nothing was modified or removed.
  assert.equal((await request(owner, "GET", `/notes/${id}`)).status, 200);
});

// --- admin ---

it("admin routes reject non-admins with 403 and accept admins", async () => {
  const jar = await signupUser(1);

  const denied = await request(jar, "GET", "/admin/users");
  assert.equal(denied.status, 403);

  // Promote directly in the DB (the documented way) and re-login so the
  // access token carries the new role.
  await mongoose.connection
    .collection("users")
    .updateOne({ email: "user1@test.dev" }, { $set: { role: "admin" } });

  const relogin = new CookieJar();
  await request(relogin, "POST", "/auth/login", {
    email: "user1@test.dev",
    password: "secret123",
  });

  const allowed = await request(relogin, "GET", "/admin/users");
  assert.equal(allowed.status, 200);
  assert.ok(Array.isArray(allowed.data));
});
