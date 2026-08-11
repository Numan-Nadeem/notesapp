#!/usr/bin/env node
const { spawn } = require("child_process");

function start(name, cmd, cwd) {
  const p = spawn(cmd, { shell: true, cwd, env: process.env });
  p.stdout.on("data", (data) => process.stdout.write(`[${name}] ${data}`));
  p.stderr.on("data", (data) => process.stderr.write(`[${name}] ${data}`));
  p.on("exit", (code) => {
    console.log(`[${name}] exited with code ${code}`);
    process.exit(code ?? 0);
  });
  return p;
}

const procs = [];
procs.push(start("backend", "npm run dev", "backend"));
procs.push(start("frontend", "npm run dev", "frontend"));

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  procs.forEach((p) => {
    try {
      p.kill(signal);
    } catch (e) {}
  });
  setTimeout(() => process.exit(0), 500);
}

["SIGINT", "SIGTERM", "SIGHUP"].forEach((sig) =>
  process.on(sig, () => shutdown(sig)),
);
