import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { subscription, service, membership, appUser, membershipPayment, conversation } from "@/db/schema";
import { eq } from "drizzle-orm";
import HostManageClient from "@/components/host-manage-client";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const [row] = await db
    .select({ title: subscription.title })
    .from(subscription)
    .where(eq(subscription.id, id))
    .limit(1);
  return { title: row ? `Manage · ${row.title}` : "Manage Listing · LetsSplit" };
}

export default async function ManagePage({ params }: { params: Params }) {
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
      status:          subscription.status,
      durationDays:    subscription.durationDays,
      paymentTerms:    subscription.paymentTerms,
      upiId:           subscription.upiId,
      activeFrom:      subscription.activeFrom,
      activeTill:      subscription.activeTill,
      hostId:          subscription.hostId,
      serviceName:     service.name,
      serviceCategory: service.category,
    })
    .from(subscription)
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .where(eq(subscription.id, id))
    .limit(1);

  if (!listing) notFound();
  if (listing.hostId !== session.user.id) redirect(`/listings/${id}`);

  const rawMembers = await db
    .select({
      membershipId: membership.id,
      memberId:     membership.memberId,
      memberName:     appUser.name,
      memberImage:    appUser.image,
      status:         membership.status,
      amountPaid:     membership.amountPaid,
      joinedAt:       membership.joinedAt,
      createdAt:      membership.createdAt,
      lastRemindedAt: membership.lastRemindedAt,
    })
    .from(membership)
    .innerJoin(appUser, eq(membership.memberId, appUser.id))
    .where(eq(membership.subscriptionId, id))
    .orderBy(membership.createdAt);

  const [convRow] = await db
    .select({ id: conversation.id })
    .from(conversation)
    .where(eq(conversation.subscriptionId, id))
    .limit(1);

  // Payment records for all memberships in this subscription
  const rawPayments = await db
    .select({
      membershipId:      membershipPayment.membershipId,
      installmentNumber: membershipPayment.installmentNumber,
      paidAt:            membershipPayment.paidAt,
      transactionRef:    membershipPayment.transactionRef,
      proofImageUrl:     membershipPayment.proofImageUrl,
    })
    .from(membershipPayment)
    .innerJoin(membership, eq(membershipPayment.membershipId, membership.id))
    .where(eq(membership.subscriptionId, id));

  // Group payments by membershipId
  const paymentsByMembership = rawPayments.reduce<
    Record<string, { installmentNumber: number; paidAt: string | null; transactionRef: string | null; proofImageUrl: string | null }[]>
  >((acc, p) => {
    if (!acc[p.membershipId]) acc[p.membershipId] = [];
    acc[p.membershipId].push({
      installmentNumber: p.installmentNumber,
      paidAt:            p.paidAt?.toISOString() ?? null,
      transactionRef:    p.transactionRef ?? null,
      proofImageUrl:     p.proofImageUrl  ?? null,
    });
    return acc;
  }, {});

  const members = rawMembers.map(m => ({
    ...m,
    amountPaid: String(m.amountPaid ?? "0"),
    joinedAt:       m.joinedAt       ? m.joinedAt.toISOString()       : null,
    createdAt:      m.createdAt.toISOString(),
    lastRemindedAt: m.lastRemindedAt ? m.lastRemindedAt.toISOString() : null,
    payments:   (paymentsByMembership[m.membershipId] ?? []).sort(
      (a, b) => a.installmentNumber - b.installmentNumber
    ),
  }));

  return (
    <HostManageClient
      listing={{
        ...listing,
        priceTotal:   String(listing.priceTotal),
        pricePerSeat: listing.pricePerSeat ? String(listing.pricePerSeat) : null,
      }}
      members={members}
      conversationId={convRow?.id ?? null}
    />
  );
}
