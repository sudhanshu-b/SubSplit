import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  membership,
  subscription,
  conversation,
  conversationParticipant,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: subscriptionId, memberId } = await params;
  const { action } = (await request.json()) as { action: "approve" | "reject" };

  if (action !== "approve" && action !== "reject") {
    return Response.json({ error: "Invalid action." }, { status: 400 });
  }

  // Verify the requesting user is the host of this listing.
  const [listing] = await db
    .select({
      hostId: subscription.hostId,
      totalSeats: subscription.totalSeats,
    })
    .from(subscription)
    .where(eq(subscription.id, subscriptionId))
    .limit(1);

  if (!listing) {
    return Response.json({ error: "Listing not found." }, { status: 404 });
  }

  if (listing.hostId !== session.user.id) {
    return Response.json(
      { error: "Only the host can manage requests." },
      { status: 403 },
    );
  }

  if (action === "approve") {
    // Re-check seat availability before approving — another request may have
    // been approved since the page was loaded.
    const [{ activeCount }] = await db
      .select({ activeCount: sql<number>`cast(count(*) as int)` })
      .from(membership)
      .where(
        and(
          eq(membership.subscriptionId, subscriptionId),
          eq(membership.status, "active"),
        ),
      );

    if (activeCount >= listing.totalSeats) {
      return Response.json({ error: "No seats remaining." }, { status: 400 });
    }

    await db
      .update(membership)
      .set({ status: "active", joinedAt: new Date() })
      .where(
        and(
          eq(membership.subscriptionId, subscriptionId),
          eq(membership.memberId, memberId),
          eq(membership.status, "pending"),
        ),
      );

    // Ensure one group conversation per subscription. If one already exists
    // (a previous member was approved), just add the new member to it.
    const [existing] = await db
      .select({ id: conversation.id })
      .from(conversation)
      .where(eq(conversation.subscriptionId, subscriptionId))
      .limit(1);

    if (existing) {
      await db
        .insert(conversationParticipant)
        .values({ conversationId: existing.id, userId: memberId })
        .onConflictDoNothing();
    } else {
      const [created] = await db
        .insert(conversation)
        .values({ subscriptionId })
        .returning({ id: conversation.id });

      await db.insert(conversationParticipant).values([
        { conversationId: created.id, userId: session.user.id }, // host
        { conversationId: created.id, userId: memberId },         // member
      ]);
    }
  } else {
    await db
      .update(membership)
      .set({ status: "rejected" })
      .where(
        and(
          eq(membership.subscriptionId, subscriptionId),
          eq(membership.memberId, memberId),
          eq(membership.status, "pending"),
        ),
      );
  }

  return Response.json({ success: true });
}
