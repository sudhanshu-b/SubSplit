import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscription, membership, membershipPayment } from "@/db/schema";
import { eq, and, inArray, isNotNull } from "drizzle-orm";
import { recalculateTrustScore } from "@/lib/trust-score";

const ALLOWED_STATUSES = ["recruiting", "ready_to_purchase", "active", "completed", "cancelled"] as const;
const UPI_RE = /^[a-zA-Z0-9._\-]{2,256}@[a-zA-Z]{2,64}$/;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  const [listing] = await db
    .select({ hostId: subscription.hostId, status: subscription.status })
    .from(subscription)
    .where(eq(subscription.id, id))
    .limit(1);

  if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });
  if (listing.hostId !== session.user.id)
    return Response.json({ error: "Only the host can update this listing." }, { status: 403 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status && ALLOWED_STATUSES.includes(body.status as typeof ALLOWED_STATUSES[number])) {
    // Once every active member has paid, the plan is locked in — cancelling
    // at that point would strand members who already paid for the period.
    if (body.status === "cancelled" && listing.status === "active") {
      const activeMembers = await db
        .select({ membershipId: membership.id })
        .from(membership)
        .where(and(eq(membership.subscriptionId, id), eq(membership.status, "active")));

      if (activeMembers.length > 0) {
        const paidRows = await db
          .select({ membershipId: membershipPayment.membershipId })
          .from(membershipPayment)
          .where(and(
            inArray(membershipPayment.membershipId, activeMembers.map(m => m.membershipId)),
            isNotNull(membershipPayment.paidAt),
          ));
        const paidSet = new Set(paidRows.map(p => p.membershipId));
        const allPaid = activeMembers.every(m => paidSet.has(m.membershipId));

        if (allPaid) {
          return Response.json(
            { error: "All members have paid — this plan can no longer be cancelled." },
            { status: 403 },
          );
        }
      }
    }
    updates.status = body.status;
  }
  if ("description" in body) {
    updates.description = typeof body.description === "string"
      ? body.description.trim() || null
      : null;
  }
  if (body.title && typeof body.title === "string" && body.title.trim()) {
    updates.title = body.title.trim();
  }
  if ("upiId" in body) {
    const raw = typeof body.upiId === "string" ? body.upiId.trim() : "";
    if (raw && !UPI_RE.test(raw)) {
      return Response.json({ error: "Please enter a valid UPI ID (e.g., username@bank)." }, { status: 400 });
    }
    updates.upiId = raw || null;
  }

  if (Object.keys(updates).length === 1) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await db.update(subscription).set(updates).where(eq(subscription.id, id));

  // Recalculate host trust score when a listing completes or is cancelled —
  // completions are a positive signal; cancellations after members joined are negative.
  const newStatus = updates.status as string | undefined;
  if (newStatus === "completed" || newStatus === "cancelled") {
    recalculateTrustScore(listing.hostId).catch(() => {});
  }

  return Response.json({ success: true });
}
