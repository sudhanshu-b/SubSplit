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
import { eq, and, asc, sql } from "drizzle-orm";
import MessageThread from "@/components/message-thread";

type Params = Promise<{ conversationId: string }>;

export default async function ConversationPage({ params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { conversationId } = await params;

  // Verify participant and load conversation metadata
  const [convo] = await db
    .select({
      id:                conversation.id,
      subscriptionTitle: subscription.title,
      subscriptionStatus: subscription.status,
      memberCount: sql<number>`(
        SELECT cast(count(*) as int) FROM conversation_participant
        WHERE conversation_id = ${conversation.id}
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
    .where(eq(conversation.id, conversationId))
    .limit(1);

  if (!convo) notFound();

  // Participant names for the header (capped at 3 for display)
  const participants = await db
    .select({ name: appUser.name, userId: conversationParticipant.userId })
    .from(conversationParticipant)
    .innerJoin(appUser, eq(appUser.id, conversationParticipant.userId))
    .where(eq(conversationParticipant.conversationId, conversationId));

  const messages = await db
    .select({
      id:          message.id,
      body:        message.body,
      senderId:    message.senderId,
      senderName:  appUser.name,
      senderImage: appUser.image,
      createdAt:   message.createdAt,
    })
    .from(message)
    .innerJoin(appUser, eq(message.senderId, appUser.id))
    .where(eq(message.conversationId, conversationId))
    .orderBy(asc(message.createdAt));

  // Mark conversation as read for this user
  await db
    .update(conversationParticipant)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, session.user.id),
      ),
    );

  const chatName = convo.subscriptionTitle ?? "Group Chat";
  const isLocked = convo.subscriptionStatus === "completed" || convo.subscriptionStatus === "cancelled";

  // "You, Alice, Bob + N more"
  const othersFirst = participants.filter(p => p.userId !== session.user.id).slice(0, 2);
  const extra       = convo.memberCount - othersFirst.length - 1; // -1 for "you"
  const memberLine  = [
    "You",
    ...othersFirst.map(p => p.name),
    ...(extra > 0 ? [`+${extra} more`] : []),
  ].join(", ");

  return (
    <div className="flex justify-center items-start bg-zinc-50 dark:bg-[#0e0e10] min-h-[calc(100vh-80px)] md:py-6 md:px-4">
    <div className="flex flex-col w-full md:max-w-[70%] h-[calc(100vh-80px)] md:h-[calc(100vh-116px)] bg-white dark:bg-zinc-900 md:border md:border-zinc-200 md:dark:border-zinc-800 md:rounded-2xl overflow-hidden md:shadow-sm">

      {/* ── Header ── */}
      <div className="shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        {/* Back */}
        <Link
          href="/messages"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Back to messages"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Group icon */}
        <div className="shrink-0 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>

        {/* Name + members */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
            {chatName}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
            {memberLine}
          </p>
        </div>

        {isLocked && (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
            {convo.subscriptionStatus === "cancelled" ? "Cancelled" : "Completed"}
          </span>
        )}
      </div>

      {/* ── Thread ── */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          conversationId={conversationId}
          currentUserId={session.user.id}
          initialMessages={messages}
          conversationName={chatName}
          disabled={isLocked}
        />
      </div>
    </div>
    </div>
  );
}
