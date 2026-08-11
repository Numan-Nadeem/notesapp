// Vite emits a single index.html, but the deployment resolves every request as
// a literal path inside this service's output — a rewrite can't retarget one
// path to another, so /signup has to exist as a real file or it 404s.
//
// For each client route we emit two shapes so it resolves either way:
//   dist/signup.html        served at /signup by cleanUrls
//   dist/signup/index.html  served at /signup as a directory index
//
// Keep ROUTES in sync with the routes declared in src/App.jsx. Only static
// paths belong here; a route with a dynamic segment can't be prerendered.
import fs from "node:fs";
import path from "node:path";

const ROUTES = [
  "login",
  "signup",
  "pricing",
  "about",
  "faq",
  "contact",
  "notes",
  "admin",
];

const dist = "dist";
const indexPath = path.join(dist, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error(`prerender: ${indexPath} not found — did vite build run?`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, "utf8");

for (const route of ROUTES) {
  fs.writeFileSync(path.join(dist, `${route}.html`), html);

  const dir = path.join(dist, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

console.log(
  `prerender: wrote ${ROUTES.length * 2} files for ${ROUTES.length} routes`
);
