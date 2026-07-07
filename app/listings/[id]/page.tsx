import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { subscription, service, appUser, membership } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import ListingDrawer from "@/components/listing-drawer";

type Params = Promise<{ id: string }>;

export default async function ListingDetailPage({ params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { id } = await params;

  const [listing] = await db
    .select({
      id:              subscription.id,
      title:           subscription.title,
      description:     subscription.description,
      totalSeats:      subscription.totalSeats,
      priceTotal:      subscription.priceTotal,
      pricePerSeat:    subscription.pricePerSeat,
      currency:        subscription.currency,
      region:          subscription.region,
      status:          subscription.status,
      activeFrom:      subscription.activeFrom,
      activeTill:      subscription.activeTill,
      createdAt:       subscription.createdAt,
      serviceId:       subscription.serviceId,
      serviceName:     service.name,
      serviceCategory: service.category,
      hostId:          appUser.id,
      hostName:        appUser.name,
      durationDays:    subscription.durationDays,
      paymentTerms:    subscription.paymentTerms,
    })
    .from(subscription)
    .innerJoin(service,  eq(subscription.serviceId, service.id))
    .innerJoin(appUser,  eq(subscription.hostId,    appUser.id))
    .where(eq(subscription.id, id))
    .limit(1);

  if (!listing) notFound();

  const [memberCount, viewerMembership] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(membership)
      .where(and(eq(membership.subscriptionId, id), eq(membership.status, "active")))
      .then(([r]) => r.count),
    db
      .select({ status: membership.status })
      .from(membership)
      .where(and(eq(membership.subscriptionId, id), eq(membership.memberId, session.user.id)))
      .limit(1)
      .then(rows => rows[0] ?? null),
  ]);

  const remainingSeats = listing.totalSeats - memberCount;
  const isHost         = listing.hostId === session.user.id;

  const pendingRequests = isHost
    ? await db
        .select({
          memberId:   membership.memberId,
          memberName: appUser.name,
          createdAt:  membership.createdAt,
        })
        .from(membership)
        .innerJoin(appUser, eq(membership.memberId, appUser.id))
        .where(and(eq(membership.subscriptionId, id), eq(membership.status, "pending")))
        .orderBy(membership.createdAt)
    : [];

  type ActionState = "host" | "active" | "pending" | "rejected" | "full" | "join";
  let actionState: ActionState = "join";
  if (isHost)                                        actionState = "host";
  else if (viewerMembership?.status === "active")    actionState = "active";
  else if (viewerMembership?.status === "pending")   actionState = "pending";
  else if (viewerMembership?.status === "rejected")  actionState = "rejected";
  else if (remainingSeats <= 0)                      actionState = "full";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e10]">
      <ListingDrawer
        listing={listing}
        memberCount={memberCount}
        remainingSeats={remainingSeats}
        actionState={actionState}
        pendingRequests={pendingRequests}
      />
    </div>
  );
}
