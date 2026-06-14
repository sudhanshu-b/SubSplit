import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscription, service, appUser, membership } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q      = searchParams.get("q")?.trim() ?? "";
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  // Subquery: active member count per listing
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

  // Raw SQL search so nullable description doesn't cause TS issues
  const searchFilter = q
    ? sql`(
        ${subscription.title}       ilike ${"%" + q + "%"}
        or ${service.name}          ilike ${"%" + q + "%"}
        or coalesce(${subscription.description}, '') ilike ${"%" + q + "%"}
      )`
    : undefined;

  const where = searchFilter ? and(baseFilter, searchFilter) : baseFilter;

  // Popular (no query): sort by most members then newest
  // Search: sort newest first
  const orderBy = q
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
    .limit(PAGE_SIZE + 1)
    .offset(offset);

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

  return NextResponse.json({ listings, hasMore, page });
}
