import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import {
  conversation,
  conversationParticipant,
  subscription,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const metadata = { title: "Messages · LetsSplit" };

export default async function MessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const conversations = await db
    .select({
      id:                conversation.id,
      subscriptionTitle: subscription.title,
      memberCount: sql<number>`(
        SELECT cast(count(*) as int) FROM conversation_participant
        WHERE conversation_id = ${conversation.id}
      )`,
      lastMessageBody: sql<string | null>`(
        SELECT body FROM message
        WHERE conversation_id = ${conversation.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageAt: sql<string | null>`(
        SELECT created_at FROM message
        WHERE conversation_id = ${conversation.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageSender: sql<string | null>`(
        SELECT au.name FROM message m
        JOIN app_user au ON au.id = m.sender_id
        WHERE m.conversation_id = ${conversation.id}
        ORDER BY m.created_at DESC LIMIT 1
      )`,
      unreadCount: sql<number>`(
        SELECT cast(count(*) as int) FROM message m
        WHERE m.conversation_id = ${conversation.id}
          AND m.sender_id != ${session.user.id}
          AND (conversation_participant.last_read_at IS NULL
            OR m.created_at > conversation_participant.last_read_at)
      )`,
    })
    .from(conversation)
    .innerJoin(
      conversationParticipant,
      and(
        eq(conversationParticipant.conversationId, conversation.id),
        eq(conversationParticipant.userId, session.user.id),
      ),
    )
    .leftJoin(subscription, eq(subscription.id, conversation.subscriptionId))
    .orderBy(
      sql`(SELECT created_at FROM message WHERE conversation_id = ${conversation.id} ORDER BY created_at DESC LIMIT 1) DESC NULLS LAST`,
      desc(conversation.createdAt),
    );

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

  const totalUnread = conversations.reduce((n, c) => n + (c.unreadCount ?? 0), 0);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">

      {/* ── Title row ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Messages</h1>
          {conversations.length > 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
              {conversations.length} group chat{conversations.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {totalUnread > 0 && (
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
            {totalUnread} unread
          </span>
        )}
      </div>

      {/* ── Empty state ── */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No group chats yet</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              A group chat opens automatically when a join request is approved.
            </p>
          </div>
          <Link
            href="/browse"
            className="mt-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl transition-colors"
          >
            Browse plans
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => {
            const hasUnread = (c.unreadCount ?? 0) > 0;
            const chatName  = c.subscriptionTitle ?? "Group Chat";
            const preview   = c.lastMessageBody
              ? (c.lastMessageSender ? `${c.lastMessageSender}: ${c.lastMessageBody}` : c.lastMessageBody)
              : "No messages yet";

            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="group flex items-center gap-3.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-2xl px-4 py-3.5 transition-all duration-150 hover:shadow-sm"
              >
                {/* Group avatar */}
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    hasUnread
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                  </div>
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-100 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-white dark:text-zinc-900 text-[9px] font-black">
                      {c.unreadCount > 9 ? "9+" : c.unreadCount}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${hasUnread ? "font-bold text-zinc-900 dark:text-zinc-100" : "font-medium text-zinc-700 dark:text-zinc-300"}`}>
                      {chatName}
                    </p>
                    <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {timeAgo(c.lastMessageAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-0.5">
                    {c.memberCount} member{c.memberCount !== 1 ? "s" : ""}
                  </p>

                  <p className={`text-xs truncate ${hasUnread ? "text-zinc-600 dark:text-zinc-300 font-medium" : "text-zinc-400 dark:text-zinc-500"}`}>
                    {preview}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 shrink-0 transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
