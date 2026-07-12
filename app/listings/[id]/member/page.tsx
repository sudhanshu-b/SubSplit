import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { subscription, service, appUser, membership, membershipPayment, review } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import MemberPlanClient from "@/components/member-plan-client";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  return { title: `My Plan · ${id.slice(0, 8)} · LetsSplit` };
}

export default async function MemberPlanPage({ params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { id } = await params;
  const userId = session.user.id;

  // Verify viewer is an active member
  const [mem] = await db
    .select({ id: membership.id, status: membership.status })
    .from(membership)
    .where(and(eq(membership.subscriptionId, id), eq(membership.memberId, userId)))
    .limit(1);

  if (!mem || mem.status !== "active") redirect(`/listings/${id}`);

  // Fetch listing details
  const [listing] = await db
    .select({
      id:           subscription.id,
      title:        subscription.title,
      pricePerSeat: subscription.pricePerSeat,
      currency:     subscription.currency,
      status:       subscription.status,
      activeTill:   subscription.activeTill,
      durationDays: subscription.durationDays,
      paymentTerms: subscription.paymentTerms,
      upiId:        subscription.upiId,
      serviceName:  service.name,
      hostId:       subscription.hostId,
      hostName:     appUser.name,
      hostImage:    appUser.image,
    })
    .from(subscription)
    .innerJoin(service,  eq(subscription.serviceId, service.id))
    .innerJoin(appUser,  eq(subscription.hostId, appUser.id))
    .where(eq(subscription.id, id))
    .limit(1);

  if (!listing) notFound();

  // All active members (names + ids for "You" marking)
  const allMembers = await db
    .select({ name: appUser.name, image: appUser.image, memberId: membership.memberId })
    .from(membership)
    .innerJoin(appUser, eq(membership.memberId, appUser.id))
    .where(and(eq(membership.subscriptionId, id), eq(membership.status, "active")));

  // Existing review submitted by this user for this subscription
  const [existingReview] = await db
    .select({ id: review.id, rating: review.rating, comment: review.comment })
    .from(review)
    .where(
      and(
        eq(review.subscriptionId, id),
        eq(review.reviewerId, userId),
        eq(review.revieweeId, listing.hostId),
      ),
    )
    .limit(1);

  // Payment records for this membership
  const payments = await db
    .select({
      id:                membershipPayment.id,
      installmentNumber: membershipPayment.installmentNumber,
      amount:            membershipPayment.amount,
      paidAt:            membershipPayment.paidAt,
      transactionRef:    membershipPayment.transactionRef,
      proofImageUrl:     membershipPayment.proofImageUrl,
    })
    .from(membershipPayment)
    .where(eq(membershipPayment.membershipId, mem.id))
    .orderBy(membershipPayment.installmentNumber);

  const groupMembers = [
    { name: listing.hostName, image: listing.hostImage, isYou: listing.hostId === userId, isHost: true },
    ...allMembers.map(m => ({
      name:   m.name,
      image:  m.image,
      isYou:  m.memberId === userId,
      isHost: false,
    })),
  ];

  return (
    <MemberPlanClient
        membershipId={mem.id}
        listing={{
          id:           listing.id,
          title:        listing.title,
          serviceName:  listing.serviceName,
          status:       listing.status,
          pricePerSeat: listing.pricePerSeat ?? null,
          currency:     listing.currency,
          activeTill:   listing.activeTill ?? null,
          durationDays: listing.durationDays ?? null,
          paymentTerms: listing.paymentTerms ?? null,
          upiId:        listing.upiId ?? null,
          hostName:     listing.hostName,
          hostId:       listing.hostId,
        }}
        existingReview={existingReview ?? null}
        payments={payments.map(p => ({
          id:                p.id,
          installmentNumber: p.installmentNumber,
          amount:            p.amount ?? null,
          paidAt:            p.paidAt?.toISOString() ?? null,
          transactionRef:    p.transactionRef ?? null,
          proofImageUrl:     p.proofImageUrl ?? null,
        }))}
        members={groupMembers}
      />
  );
}
