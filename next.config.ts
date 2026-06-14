import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js not to bundle these packages — use them directly from
  // node_modules at runtime instead. Better Auth bundles dialect-specific
  // code (e.g. Bun SQLite) that breaks when Next.js tries to tree-shake it.
  serverExternalPackages: ["better-auth", "@better-auth/kysely-adapter", "kysely"],
};

export default nextConfig;
