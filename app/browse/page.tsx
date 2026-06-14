import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscription, service, appUser, membership } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import BrowseClient from "@/components/browse-client";
import { BrowseCardSkeleton } from "@/components/browse-card";
import type { BrowseListing } from "@/components/browse-card";

export const metadata = { title: "Browse · LetsSplit" };

type SearchParams = Promise<{ q?: string }>;

const PAGE_SIZE = 12;

async function getInitialListings(query: string): Promise<{
  listings: BrowseListing[];
  hasMore:  boolean;
}> {
  const activeMemberCounts = db
    .select({
      subscriptionId: membership.subscriptionId,
      count: sql<number>`cast(count(*) as int)`.as("count"),
    })
    .from(membership)
    .where(eq(membership.status, "active"))
    .groupBy(membership.subscriptionId)
    .as("active_member_counts");

  const baseFilter = eq(subscription.status, "active");

  const searchFilter = query
    ? sql`(
        ${subscription.title}       ilike ${"%" + query + "%"}
        or ${service.name}          ilike ${"%" + query + "%"}
        or coalesce(${subscription.description}, '') ilike ${"%" + query + "%"}
      )`
    : undefined;

  const where = searchFilter ? and(baseFilter, searchFilter) : baseFilter;

  // Popular (no query): most-filled listings first, then newest
  // Search: newest first
  const orderBy = query
    ? [desc(subscription.createdAt)]
    : [desc(sql`coalesce(${activeMemberCounts.count}, 0)`), desc(subscription.createdAt)];

  const rows = await db
    .select({
      id:            subscription.id,
      title:         subscription.title,
      description:   subscription.description,
      totalSeats:    subscription.totalSeats,
      pricePerSeat:  subscription.pricePerSeat,
      currency:      subscription.currency,
      region:        subscription.region,
      serviceName:   service.name,
      hostName:      appUser.name,
      activeMembers: sql<number>`coalesce(${activeMemberCounts.count}, 0)`,
    })
    .from(subscription)
    .innerJoin(service,           eq(subscription.serviceId, service.id))
    .innerJoin(appUser,           eq(subscription.hostId, appUser.id))
    .leftJoin(activeMemberCounts, eq(subscription.id, activeMemberCounts.subscriptionId))
    .where(where)
    .orderBy(...orderBy)
    .limit(PAGE_SIZE + 1);

  const hasMore  = rows.length > PAGE_SIZE;
  const listings = rows.slice(0, PAGE_SIZE).map((r) => ({
    id:             r.id,
    title:          r.title,
    description:    r.description,
    serviceName:    r.serviceName,
    hostName:       r.hostName,
    pricePerSeat:   Number(r.pricePerSeat ?? 0),
    currency:       r.currency,
    totalSeats:     r.totalSeats,
    remainingSeats: r.totalSeats - r.activeMembers,
    region:         r.region,
  }));

  return { listings, hasMore };
}

// ── Skeleton fallback while Suspense resolves ──────────────────────────────
function BrowseSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-3 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-3" />
        <div className="h-8 w-52 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-2" />
        <div className="h-3 w-36 rounded-full bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <BrowseCardSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { q = "" } = await searchParams;
  const query = q.trim();

  const { listings, hasMore } = await getInitialListings(query);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-zinc-50 dark:bg-[#0e0e10]">
      <div className="max-w-5xl mx-auto px-5 py-12">
        <Suspense fallback={<BrowseSkeleton />}>
          <BrowseClient
            initialListings={listings}
            initialHasMore={hasMore}
            query={query}
          />
        </Suspense>
      </div>
    </main>
  );
}
