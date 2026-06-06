import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import {
  message,
  conversation,
  conversationParticipant,
  subscription,
  appUser,
} from "@/db/schema";
import { eq, and, ne, isNull, asc, aliasedTable } from "drizzle-orm";
import MessageThread from "@/components/message-thread";

type Params = Promise<{ conversationId: string }>;

export default async function ConversationPage({ params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { conversationId } = await params;

  // Verify the user is a participant and get the other participant's name.
  const otherParticipation = aliasedTable(conversationParticipant, "other_cp");
  const otherUser = aliasedTable(appUser, "other_user");

  const [convo] = await db
    .select({
      id: conversation.id,
      subscriptionTitle: subscription.title,
      otherUserName: otherUser.name,
    })
    .from(conversation)
    .innerJoin(
      conversationParticipant,
      and(
        eq(conversationParticipant.conversationId, conversation.id),
        eq(conversationParticipant.userId, session.user.id)
      )
    )
    .innerJoin(
      otherParticipation,
      and(
        eq(otherParticipation.conversationId, conversation.id),
        ne(otherParticipation.userId, session.user.id)
      )
    )
    .innerJoin(otherUser, eq(otherUser.id, otherParticipation.userId))
    .leftJoin(subscription, eq(subscription.id, conversation.subscriptionId))
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!convo) notFound();

  // Fetch all messages with sender names.
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
    .where(eq(message.conversationId, conversationId))
    .orderBy(asc(message.createdAt));

  // Mark all unread messages from the other participant as read on page load.
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

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Chat header */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 flex items-center gap-4">
        <Link
          href="/messages"
          className="text-gray-400 hover:text-gray-700 transition"
          aria-label="Back to messages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            {convo.otherUserName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {convo.otherUserName}
            </p>
            {convo.subscriptionTitle && (
              <p className="text-xs text-gray-400 truncate">
                {convo.subscriptionTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Message thread — takes all remaining height */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          conversationId={conversationId}
          currentUserId={session.user.id}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
