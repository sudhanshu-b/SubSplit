import { auth } from "@/lib/auth";
import { db } from "@/db";
import { message, conversationParticipant } from "@/db/schema";
import { eq, and, gt, ne, isNull, or } from "drizzle-orm";

// Returns the total number of unread messages for the current user across
// all conversations they participate in.
// A message is "unread" when:
//   - the sender is not the current user, AND
//   - the message was created after the user's lastReadAt for that conversation
//     (or lastReadAt is null, meaning they've never opened it)
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const userId = session.user.id;

  const rows = await db
    .select({ id: message.id })
    .from(message)
    .innerJoin(
      conversationParticipant,
      and(
        eq(conversationParticipant.conversationId, message.conversationId),
        eq(conversationParticipant.userId, userId),
      ),
    )
    .where(
      and(
        ne(message.senderId, userId),
        or(
          isNull(conversationParticipant.lastReadAt),
          gt(message.createdAt, conversationParticipant.lastReadAt),
        ),
      ),
    );

  return Response.json({ count: rows.length });
}
