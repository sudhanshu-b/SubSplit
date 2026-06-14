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

  const initial = convo.otherUserName.charAt(0).toUpperCase();

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

        {/* Avatar */}
        <div className="shrink-0 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
          {initial}
        </div>

        {/* Name + subscription */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
              {convo.otherUserName}
            </p>
            {convo.subscriptionTitle && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                {convo.subscriptionTitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Thread ── */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          conversationId={conversationId}
          currentUserId={session.user.id}
          initialMessages={messages}
          otherUserName={convo.otherUserName}
        />
      </div>
    </div>
    </div>
  );
}
