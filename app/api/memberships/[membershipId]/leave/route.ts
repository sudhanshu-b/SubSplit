import { auth } from "@/lib/auth";
import { db } from "@/db";
import { membership, subscription } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { membershipId } = await params;

  const [mem] = await db
    .select({
      id:             membership.id,
      memberId:       membership.memberId,
      status:         membership.status,
      subscriptionId: membership.subscriptionId,
    })
    .from(membership)
    .where(eq(membership.id, membershipId))
    .limit(1);

  if (!mem) return Response.json({ error: "Membership not found." }, { status: 404 });
  if (mem.memberId !== session.user.id)
    return Response.json({ error: "Unauthorized." }, { status: 403 });
  if (!["active", "pending"].includes(mem.status))
    return Response.json({ error: "Cannot leave this membership." }, { status: 400 });

  // Block leaving once the subscription is live
  const [plan] = await db
    .select({ status: subscription.status })
    .from(subscription)
    .where(eq(subscription.id, mem.subscriptionId))
    .limit(1);

  if (plan && !["recruiting", "ready_to_purchase"].includes(plan.status))
    return Response.json(
      { error: "You cannot leave a plan that is already active." },
      { status: 400 },
    );

  await db
    .update(membership)
    .set({ status: "left", updatedAt: new Date() })
    .where(eq(membership.id, membershipId));

  return Response.json({ success: true });
}
