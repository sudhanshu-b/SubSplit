import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Drizzle Kit runs outside Next.js, so it won't auto-load .env.local.
// We load it explicitly here so DATABASE_URL_DIRECT is available.
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    // Using the session-mode pooler (DATABASE_URL, port 5432) for migrations.
    // Supabase newer projects block direct IPv4 connections, so we avoid DATABASE_URL_DIRECT.
    url: process.env.DATABASE_URL!,
  },
});
