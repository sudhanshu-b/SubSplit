import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { appUser, subscription, membership, review, report, testimonial } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import AdminClient from "@/components/admin-client";

export const metadata = { title: "Admin Panel · LetsSplit" };

const ACTIVE_STATUSES = ["recruiting", "ready_to_purchase", "active"] as const;

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "ADMIN") redirect("/home");

  const [
    [{ count: totalUsers, avg: avgTrustScoreRaw }],
    [{ count: pendingJoinRequests }],
    users,
    listingCountRows,
    reviewCountRows,
    reportCountRows,
    testimonials,
  ] = await Promise.all([
    db.select({ count: sql<number>`cast(count(*) as int)`, avg: sql<string | null>`avg(${appUser.trustScore})` }).from(appUser),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(membership).where(eq(membership.status, "pending")),
    db
      .select({
        id:         appUser.id,
        name:       appUser.name,
        email:      appUser.email,
        image:      appUser.image,
        trustScore: appUser.trustScore,
        banned:     appUser.banned,
        role:       appUser.role,
        createdAt:  appUser.createdAt,
      })
      .from(appUser)
      .orderBy(desc(appUser.createdAt)),
    db
      .select({
        hostId: subscription.hostId,
        status: subscription.status,
        count:  sql<number>`cast(count(*) as int)`,
      })
      .from(subscription)
      .groupBy(subscription.hostId, subscription.status),
    db
      .select({ revieweeId: review.revieweeId, count: sql<number>`cast(count(*) as int)` })
      .from(review)
      .groupBy(review.revieweeId),
    db
      .select({ reportedUserId: report.reportedUserId, count: sql<number>`cast(count(*) as int)` })
      .from(report)
      .groupBy(report.reportedUserId),
    db.select().from(testimonial).orderBy(desc(testimonial.createdAt)),
  ]);

  // ── Merge per-user aggregates ────────────────────────────────────────────
  const activeByHost    = new Map<string, number>();
  const completedByHost = new Map<string, number>();
  for (const row of listingCountRows) {
    const bucket = ACTIVE_STATUSES.includes(row.status as typeof ACTIVE_STATUSES[number])
      ? activeByHost
      : row.status === "completed" ? completedByHost : null;
    if (bucket) bucket.set(row.hostId, (bucket.get(row.hostId) ?? 0) + row.count);
  }
  const reviewsByUser = new Map(reviewCountRows.map(r => [r.revieweeId, r.count]));
  const reportsByUser = new Map(reportCountRows.map(r => [r.reportedUserId, r.count]));

  const activeListings    = [...activeByHost.values()].reduce((a, b) => a + b, 0);
  const completedListings = [...completedByHost.values()].reduce((a, b) => a + b, 0);
  const totalReviews      = reviewCountRows.reduce((a, r) => a + r.count, 0);

  const userRows = users.map(u => ({
    id:                u.id,
    name:              u.name,
    email:             u.email,
    image:             u.image,
    role:              u.role,
    banned:            u.banned,
    trustScore:        u.trustScore,
    activeListings:    activeByHost.get(u.id)    ?? 0,
    completedListings: completedByHost.get(u.id) ?? 0,
    reviewCount:       reviewsByUser.get(u.id)    ?? 0,
    reportCount:       reportsByUser.get(u.id)    ?? 0,
    createdAt:         u.createdAt.toISOString(),
  }));

  return (
    <AdminClient
      currentUserId={session.user.id}
      analytics={{
        totalUsers,
        activeListings,
        completedListings,
        pendingJoinRequests,
        avgTrustScore: avgTrustScoreRaw ? parseFloat(avgTrustScoreRaw) : null,
        totalReviews,
      }}
      users={userRows}
      testimonials={testimonials.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))}
    />
  );
}
