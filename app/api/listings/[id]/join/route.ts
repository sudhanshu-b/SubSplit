import { auth } from "@/lib/auth";
import { db } from "@/db";
import { membership, subscription } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { id: subscriptionId } = await params;
  const userId = session.user.id;

  // Load the listing to validate it exists and has open seats.
  const [listing] = await db
    .select({
      id: subscription.id,
      hostId: subscription.hostId,
      totalSeats: subscription.totalSeats,
      status: subscription.status,
    })
    .from(subscription)
    .where(eq(subscription.id, subscriptionId))
    .limit(1);

  if (!listing) {
    return Response.json({ error: "Listing not found." }, { status: 404 });
  }

  if (listing.hostId === userId) {
    return Response.json({ error: "You cannot join your own listing." }, { status: 400 });
  }

  if (listing.status !== "recruiting") {
    return Response.json({ error: "This listing is not currently accepting members." }, { status: 400 });
  }

  // Count current active members to check available seats.
  const [{ activeCount }] = await db
    .select({ activeCount: sql<number>`cast(count(*) as int)` })
    .from(membership)
    .where(and(eq(membership.subscriptionId, subscriptionId), eq(membership.status, "active")));

  if (activeCount >= listing.totalSeats) {
    return Response.json({ error: "No seats available." }, { status: 400 });
  }

  // Check for an existing membership row (any status) to prevent duplicates.
  const [existing] = await db
    .select({ status: membership.status })
    .from(membership)
    .where(and(eq(membership.subscriptionId, subscriptionId), eq(membership.memberId, userId)))
    .limit(1);

  if (existing) {
    return Response.json(
      { error: `You already have a ${existing.status} request for this listing.` },
      { status: 400 }
    );
  }

  // Create the pending membership row.
  await db.insert(membership).values({
    subscriptionId,
    memberId: userId,
    status: "pending",
  });

  return Response.json({ success: true }, { status: 201 });
}
