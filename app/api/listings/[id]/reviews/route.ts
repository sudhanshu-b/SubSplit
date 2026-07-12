import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscription, membership, review } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { recalculateTrustScore } from "@/lib/trust-score";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { rating, comment } = body;

  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5)
    return Response.json({ error: "Rating must be an integer between 1 and 5." }, { status: 400 });

  const [plan] = await db
    .select({ status: subscription.status, hostId: subscription.hostId })
    .from(subscription)
    .where(eq(subscription.id, id))
    .limit(1);

  if (!plan) return Response.json({ error: "Listing not found." }, { status: 404 });
  if (plan.status !== "completed")
    return Response.json({ error: "Reviews can only be submitted after the plan completes." }, { status: 400 });
  if (plan.hostId === session.user.id)
    return Response.json({ error: "You cannot review your own plan." }, { status: 400 });

  const [mem] = await db
    .select({ id: membership.id })
    .from(membership)
    .where(and(eq(membership.subscriptionId, id), eq(membership.memberId, session.user.id)))
    .limit(1);

  if (!mem) return Response.json({ error: "You are not a member of this plan." }, { status: 403 });

  const commentVal = typeof comment === "string" && comment.trim() ? comment.trim() : null;

  const [inserted] = await db
    .insert(review)
    .values({
      subscriptionId: id,
      reviewerId:     session.user.id,
      revieweeId:     plan.hostId,
      rating:         r,
      comment:        commentVal,
    })
    .onConflictDoUpdate({
      target: [review.subscriptionId, review.reviewerId, review.revieweeId],
      set:    { rating: r, comment: commentVal },
    })
    .returning({ id: review.id });

  // Recalculate trust score for the host (reviewee) — fire and forget.
  recalculateTrustScore(plan.hostId).catch(() => {});

  return Response.json({ success: true, id: inserted.id });
}
