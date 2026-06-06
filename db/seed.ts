import { config } from "dotenv";

// Must run before any local imports — in ESM, static imports are hoisted and
// evaluated before module code, so db/index.ts would read DATABASE_URL as
// undefined. Dynamic imports below run at call time, after env is loaded.
config({ path: ".env.local" });

const services = [
  { name: "Spotify Family",       url: "https://spotify.com",              category: "Music" },
  { name: "YouTube Premium",      url: "https://youtube.com/premium",      category: "Video" },
  { name: "Netflix",              url: "https://netflix.com",              category: "Video" },
  { name: "Apple One",            url: "https://apple.com/apple-one",      category: "Bundle" },
  { name: "Microsoft 365 Family", url: "https://microsoft.com/365",        category: "Productivity" },
  { name: "Amazon Prime",         url: "https://amazon.com/prime",         category: "Bundle" },
  { name: "Disney+",              url: "https://disneyplus.com",           category: "Video" },
  { name: "Max",                  url: "https://max.com",                  category: "Video" },
];

async function seed() {
  // Dynamic imports run here at call time — env vars are already loaded above.
  const { db } = await import("./index");
  const { service } = await import("./schema");

  // onConflictDoNothing — safe to re-run; skips rows that already exist.
  await db.insert(service).values(services).onConflictDoNothing();
  console.log(`Seeded ${services.length} services.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
