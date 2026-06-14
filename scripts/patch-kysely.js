const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "../node_modules/kysely/dist/index.js");

if (!fs.existsSync(indexPath)) {
  console.log("patch-kysely: kysely not found, skipping");
  process.exit(0);
}

const content = fs.readFileSync(indexPath, "utf8");

if (content.includes("DEFAULT_MIGRATION_TABLE")) {
  console.log("patch-kysely: already patched, skipping");
  process.exit(0);
}

const patch =
  "\n// Compatibility shim for @better-auth/kysely-adapter\nexport { DEFAULT_MIGRATION_TABLE, DEFAULT_MIGRATION_LOCK_TABLE } from './migration/migrator.js';\n";

fs.appendFileSync(indexPath, patch, "utf8");
console.log("patch-kysely: added DEFAULT_MIGRATION_TABLE exports to kysely index");
