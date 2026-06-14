import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Neon HTTP driver — stateless HTTP per query, no persistent TCP connections.
// Required for Vercel serverless where postgres.js would exhaust Neon's
// session-mode connection limit (pool_size: 15) under any real traffic.
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql);
