import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, connect_timeout: 10 });

  console.log("=== Sessions (pg_stat_activity) ===");
  const activity = await sql`
    select pid, state, wait_event_type, wait_event, query_start, state_change, left(query, 120) as query
    from pg_stat_activity
    where datname = current_database()
    order by query_start asc
  `;
  console.table(activity);

  console.log("\n=== Blocking locks ===");
  const locks = await sql`
    select
      blocked_locks.pid     as blocked_pid,
      blocked_activity.query as blocked_query,
      blocking_locks.pid     as blocking_pid,
      blocking_activity.query as blocking_query,
      blocking_activity.state as blocking_state
    from pg_catalog.pg_locks blocked_locks
    join pg_catalog.pg_stat_activity blocked_activity on blocked_activity.pid = blocked_locks.pid
    join pg_catalog.pg_locks blocking_locks
      on blocking_locks.locktype = blocked_locks.locktype
      and blocking_locks.database is not distinct from blocked_locks.database
      and blocking_locks.relation is not distinct from blocked_locks.relation
      and blocking_locks.pid != blocked_locks.pid
    join pg_catalog.pg_stat_activity blocking_activity on blocking_activity.pid = blocking_locks.pid
    where not blocked_locks.granted
  `;
  console.table(locks);

  await sql.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("Diagnostic failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
