import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { appUser, subscription, service, membership, review } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import HostProfileClient from "@/components/host-profile-client";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const [row] = await db.select({ name: appUser.name }).from(appUser).where(eq(appUser.id, id)).limit(1);
  return { title: row ? `${row.name} · LetsSplit` : "Host Profile · LetsSplit" };
}

export default async function HostProfilePage({ params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { id } = await params;

  const [host] = await db
    .select({ id: appUser.id, name: appUser.name, image: appUser.image, createdAt: appUser.createdAt, trustScore: appUser.trustScore })
    .from(appUser)
    .where(eq(appUser.id, id))
    .limit(1);

  if (!host) notFound();

  // All listings this host has ever created (for total count + filtered display)
  const allListings = await db
    .select({
      id:          subscription.id,
      title:       subscription.title,
      status:      subscription.status,
      totalSeats:  subscription.totalSeats,
      pricePerSeat: subscription.pricePerSeat,
      currency:    subscription.currency,
      durationDays: subscription.durationDays,
      serviceName: service.name,
    })
    .from(subscription)
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .where(eq(subscription.hostId, id))
    .orderBy(desc(subscription.createdAt));

  // Reviews left for this host (reviewee)
  const reviewer = alias(appUser, "reviewer");
  const reviews = await db
    .select({
      id:           review.id,
      rating:       review.rating,
      comment:      review.comment,
      createdAt:    review.createdAt,
      reviewerName: reviewer.name,
    })
    .from(review)
    .innerJoin(reviewer, eq(review.reviewerId, reviewer.id))
    .where(eq(review.revieweeId, id))
    .orderBy(desc(review.createdAt));

  // Active member count across this host's plans
  const activeMembers = await db
    .select({ memberId: membership.memberId })
    .from(membership)
    .innerJoin(subscription, eq(membership.subscriptionId, subscription.id))
    .where(and(eq(subscription.hostId, id), eq(membership.status, "active")));

  const publicStatuses = ["recruiting", "ready_to_purchase", "active"];
  const publicListings = allListings.filter(l => publicStatuses.includes(l.status));
  const reviewCount    = reviews.length;
  const avgRating      = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : null;

  return (
    <HostProfileClient
      host={{
        id:         host.id,
        name:       host.name,
        image:      host.image,
        createdAt:  host.createdAt.toISOString(),
        trustScore: host.trustScore ?? null,
      }}
      listings={publicListings.map(l => ({
        id:          l.id,
        title:       l.title,
        status:      l.status,
        totalSeats:  l.totalSeats,
        pricePerSeat: l.pricePerSeat ? String(l.pricePerSeat) : null,
        currency:    l.currency,
        durationDays: l.durationDays ?? null,
        serviceName: l.serviceName,
      }))}
      reviews={reviews.map(r => ({
        id:           r.id,
        rating:       r.rating,
        comment:      r.comment ?? null,
        createdAt:    r.createdAt.toISOString(),
        reviewerName: r.reviewerName,
      }))}
      stats={{
        totalListings:    allListings.length,
        activeListings:   publicListings.length,
        completedListings: allListings.filter(l => l.status === "completed").length,
        membersHosted:    activeMembers.length,
        reviewCount,
        avgRating,
      }}
    />
  );
}
