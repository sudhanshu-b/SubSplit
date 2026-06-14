import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// In Next.js dev mode, hot reloads re-evaluate modules and would create a new
// postgres connection pool on every save. Storing the client on globalThis
// means it's reused across reloads instead of reconnecting every time.
const globalForDb = globalThis as unknown as { pgClient: postgres.Sql };

const client =
  globalForDb.pgClient ??
  postgres(process.env.DATABASE_URL!, {
    max: 5,          // cap connections per serverless instance
    idle_timeout: 20, // release idle connections after 20s
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client);
