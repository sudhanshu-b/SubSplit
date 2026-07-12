import { db } from "@/db";
import { appUser, review, subscription, membership, membershipPayment } from "@/db/schema";
import { eq, and, inArray, isNotNull } from "drizzle-orm";

// Bayesian prior: regresses toward 3.5 (midpoint of 1-5) for users with few reviews.
// WEIGHT phantom reviews anchor the score so a single 5-star doesn't inflate
// and a single 1-star doesn't tank a new user's reputation.
const PRIOR  = 3.5;
const WEIGHT = 5;

/**
 * Recompute and persist appUser.trustScore for `userId`.
 *
 * Formula:
 *   base      = Bayesian avg of all reviews received as reviewee
 *   delta     = sum of behavioral adjustments (verification, host lifecycle, payment history)
 *   score     = clamp(base + delta, 0.00, 5.00)
 *
 * If the user has no reviews at all, score is left as null ("New Host").
 * Behavioral bonuses only add nuance once a review history exists.
 *
 * Call this after any event that could shift the score (see callers).
 * Fire-and-forget: await is optional in non-critical paths.
 */
export async function recalculateTrustScore(userId: string): Promise<void> {
  // ── 1. Verification flags ────────────────────────────────────────────────
  const [user] = await db
    .select({ emailVerified: appUser.emailVerified, isPhoneVerified: appUser.isPhoneVerified })
    .from(appUser)
    .where(eq(appUser.id, userId))
    .limit(1);
  if (!user) return;

  // ── 2. Reviews received (reviewee side) ──────────────────────────────────
  const receivedReviews = await db
    .select({ rating: review.rating })
    .from(review)
    .where(eq(review.revieweeId, userId));

  const reviewCount = receivedReviews.length;
  const sumRatings  = receivedReviews.reduce((s, r) => s + r.rating, 0);

  // No reviews → trust score stays null (shown as "New Host" in the UI).
  // We don't manufacture a score from verification alone — that would be misleading.
  if (reviewCount === 0) {
    await db
      .update(appUser)
      .set({ trustScore: null, updatedAt: new Date() })
      .where(eq(appUser.id, userId));
    return;
  }

  // Bayesian average: pulls toward 3.5 with WEIGHT phantom ratings.
  // With 1 real review this returns ≈ 3.58 for a 5-star (not 5.0).
  // With 20+ reviews the phantom weight becomes negligible.
  const reviewBase = (sumRatings + WEIGHT * PRIOR) / (reviewCount + WEIGHT);

  // ── 3. Host behavioural signals ──────────────────────────────────────────
  const hostedListings = await db
    .select({ id: subscription.id, status: subscription.status })
    .from(subscription)
    .where(eq(subscription.hostId, userId));

  const completedCount = hostedListings.filter(l => l.status === "completed").length;

  // A cancellation only harms a host's score if members were already active —
  // cancelling a plan nobody joined yet is not misconduct.
  let cancelledWithMembersCount = 0;
  const cancelledIds = hostedListings
    .filter(l => l.status === "cancelled")
    .map(l => l.id);

  if (cancelledIds.length > 0) {
    const affected = await db
      .select({ subscriptionId: membership.subscriptionId })
      .from(membership)
      .where(and(
        inArray(membership.subscriptionId, cancelledIds),
        inArray(membership.status, ["active", "left", "removed"]),
      ));
    cancelledWithMembersCount = new Set(affected.map(m => m.subscriptionId)).size;
  }

  // ── 4. Member behavioural signals ────────────────────────────────────────
  // Count payment installments this user has actually completed (paidAt set).
  const memberMemberships = await db
    .select({ id: membership.id })
    .from(membership)
    .where(eq(membership.memberId, userId));

  let paidPaymentCount = 0;
  if (memberMemberships.length > 0) {
    const membershipIds = memberMemberships.map(m => m.id);
    const paidRows = await db
      .select({ id: membershipPayment.id })
      .from(membershipPayment)
      .where(and(
        inArray(membershipPayment.membershipId, membershipIds),
        isNotNull(membershipPayment.paidAt),
      ));
    paidPaymentCount = paidRows.length;
  }

  // ── 5. Compute final score ────────────────────────────────────────────────
  let delta = 0;

  // Verification bonuses (small — trust lives in reviews, not identity alone)
  if (user.emailVerified)   delta += 0.10;
  if (user.isPhoneVerified) delta += 0.10;

  // Host: each completed plan is a reliability signal (+0.05, capped at +0.25)
  delta += Math.min(completedCount * 0.05, 0.25);

  // Host: each cancellation after members joined is a negative signal (-0.20, max -0.60)
  delta -= Math.min(cancelledWithMembersCount * 0.20, 0.60);

  // Member: each completed payment is a reliability signal (+0.05, capped at +0.20)
  delta += Math.min(paidPaymentCount * 0.05, 0.20);

  const finalScore = parseFloat(
    Math.max(0, Math.min(5, reviewBase + delta)).toFixed(2),
  );

  await db
    .update(appUser)
    .set({ trustScore: String(finalScore), updatedAt: new Date() })
    .where(eq(appUser.id, userId));
}
