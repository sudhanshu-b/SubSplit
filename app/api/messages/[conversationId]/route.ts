import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message, conversation, conversationParticipant, subscription, appUser } from "@/db/schema";
import { eq, and, gt, asc } from "drizzle-orm";

// Verify the session user is a participant in the given conversation.
async function assertParticipant(conversationId: string, userId: string) {
  const [row] = await db
    .select({ userId: conversationParticipant.userId })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, userId)
      )
    )
    .limit(1);
  return !!row;
}

// A conversation is closed to new messages once its linked plan has
// finished or been cancelled — no new members will ever transact after that.
async function assertNotLocked(conversationId: string) {
  const [row] = await db
    .select({ status: subscription.status })
    .from(conversation)
    .leftJoin(subscription, eq(subscription.id, conversation.subscriptionId))
    .where(eq(conversation.id, conversationId))
    .limit(1);
  return row?.status !== "completed" && row?.status !== "cancelled";
}

// GET — fetch messages, optionally only those after a given timestamp.
// The client polls this every 3 seconds passing ?after=<ISO timestamp>
// so only new messages are returned instead of the full history.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { conversationId } = await params;

  if (!(await assertParticipant(conversationId, session.user.id))) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const url = new URL(request.url);
  const after = url.searchParams.get("after");

  const conditions = [eq(message.conversationId, conversationId)];
  if (after) conditions.push(gt(message.createdAt, new Date(after)));

  const messages = await db
    .select({
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      senderName: appUser.name,
      senderImage: appUser.image,
      createdAt: message.createdAt,
      readAt: message.readAt,
    })
    .from(message)
    .innerJoin(appUser, eq(message.senderId, appUser.id))
    .where(and(...conditions))
    .orderBy(asc(message.createdAt));

  // Update the current user's last-read timestamp for this conversation.
  await db
    .update(conversationParticipant)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, session.user.id),
      )
    );

  return Response.json({ messages });
}

// POST — send a new message.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { conversationId } = await params;

  if (!(await assertParticipant(conversationId, session.user.id))) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!(await assertNotLocked(conversationId))) {
    return Response.json({ error: "This plan has ended — messaging is closed." }, { status: 403 });
  }

  const { body } = await request.json() as { body: string };

  if (!body?.trim()) {
    return Response.json({ error: "Message cannot be empty." }, { status: 400 });
  }

  const [created] = await db
    .insert(message)
    .values({
      conversationId,
      senderId: session.user.id,
      body: body.trim(),
    })
    .returning({
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      createdAt: message.createdAt,
      readAt: message.readAt,
    });

  return Response.json({
    message: { ...created, senderName: session.user.name, senderImage: session.user.image ?? null },
  }, { status: 201 });
}
