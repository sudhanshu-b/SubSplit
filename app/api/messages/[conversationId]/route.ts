import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message, conversationParticipant, appUser } from "@/db/schema";
import { eq, and, gt, isNull, ne, asc } from "drizzle-orm";

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
      createdAt: message.createdAt,
      readAt: message.readAt,
    })
    .from(message)
    .innerJoin(appUser, eq(message.senderId, appUser.id))
    .where(and(...conditions))
    .orderBy(asc(message.createdAt));

  // Mark any unread messages from the other participant as read.
  await db
    .update(message)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(message.conversationId, conversationId),
        ne(message.senderId, session.user.id),
        isNull(message.readAt)
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
    message: { ...created, senderName: session.user.name },
  }, { status: 201 });
}
