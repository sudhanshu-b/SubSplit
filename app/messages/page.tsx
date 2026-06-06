import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import {
  conversation,
  conversationParticipant,
  subscription,
  appUser,
  message,
} from "@/db/schema";
import { eq, and, ne, isNull, desc, sql, aliasedTable } from "drizzle-orm";

export default async function MessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const otherParticipation = aliasedTable(conversationParticipant, "other_cp");
  const otherUser = aliasedTable(appUser, "other_user");

  const conversations = await db
    .select({
      id: conversation.id,
      subscriptionTitle: subscription.title,
      otherUserName: otherUser.name,
      otherUserId: otherUser.id,
      // Inline subquery for the last message body
      lastMessageBody: sql<string | null>`(
        SELECT body FROM message
        WHERE conversation_id = ${conversation.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      // Inline subquery for the last message timestamp
      lastMessageAt: sql<string | null>`(
        SELECT created_at FROM message
        WHERE conversation_id = ${conversation.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      // Count of unread messages from the other participant
      unreadCount: sql<number>`(
        SELECT cast(count(*) as int) FROM message
        WHERE conversation_id = ${conversation.id}
          AND sender_id != ${session.user.id}
          AND read_at IS NULL
      )`,
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
    .orderBy(desc(conversation.createdAt));

  function timeAgo(dateStr: string | null) {
    if (!dateStr) return "";
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No conversations yet.</p>
          <p className="text-gray-300 text-xs mt-1">
            Conversations are created automatically when a join request is approved.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white overflow-hidden">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base shrink-0 relative">
                  {c.otherUserName.charAt(0).toUpperCase()}
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {c.unreadCount > 9 ? "9+" : c.unreadCount}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${c.unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                      {c.otherUserName}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {timeAgo(c.lastMessageAt)}
                    </span>
                  </div>
                  {c.subscriptionTitle && (
                    <p className="text-xs text-indigo-500 truncate mb-0.5">
                      {c.subscriptionTitle}
                    </p>
                  )}
                  <p className={`text-xs truncate ${c.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                    {c.lastMessageBody ?? "No messages yet"}
                  </p>
                </div>

                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
