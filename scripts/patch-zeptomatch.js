// The published zeptomatch package is ESM-only, which breaks Prisma CLI's
// require() chain (@prisma/dev/dist/state.cjs) on Node < 20.19.
// This replaces every installed copy with the CJS shim in vendor/zeptomatch-cjs.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const shimDir = path.join(root, "vendor", "zeptomatch-cjs");

function findZeptomatchDirs(dir, found = [], depth = 0) {
  if (depth > 6) return found;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    if (e.name === "zeptomatch") {
      found.push(full);
    } else if (e.name === "node_modules" || e.name.startsWith("@")) {
      findZeptomatchDirs(full, found, depth + 1);
    } else {
      const nested = path.join(full, "node_modules");
      if (fs.existsSync(nested)) findZeptomatchDirs(nested, found, depth + 1);
    }
  }
  return found;
}

const targets = findZeptomatchDirs(path.join(root, "node_modules"));
for (const target of targets) {
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  for (const f of ["package.json", "index.js", "index.mjs"]) {
    fs.copyFileSync(path.join(shimDir, f), path.join(target, f));
  }
  console.log(`patched: ${path.relative(root, target)}`);
}
if (targets.length === 0) console.log("zeptomatch not found — nothing to patch");
