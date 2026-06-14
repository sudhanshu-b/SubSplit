import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home-client";
import DashboardClient from "@/components/dashboard-client";
import { db } from "@/db";
import {
  subscription,
  membership,
  service,
  appUser,
  message,
  conversationParticipant,
} from "@/db/schema";
import { eq, and, ne, isNull, count, sql, aliasedTable } from "drizzle-orm";

export const metadata = { title: "Home · LetsSplit" };

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  // ── Determine if this is a brand-new user ─────────────────────────────
  const [[{ hostedCount }], [{ memberCount }]] = await Promise.all([
    db.select({ hostedCount: count() }).from(subscription).where(eq(subscription.hostId, userId)),
    db.select({ memberCount: count() }).from(membership).where(eq(membership.memberId, userId)),
  ]);

  if (hostedCount === 0 && memberCount === 0) {
    return (
      <HomeClient
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
      />
    );
  }

  // ── Fetch returning-user dashboard data ───────────────────────────────
  const hostUserAlias = aliasedTable(appUser, "host_user");
  const svcAlias      = aliasedTable(service, "svc");

  const [hostedPlans, joinedPlans, [{ unread }]] = await Promise.all([

    // Subscriptions hosted by this user, with live member/request counts
    db
      .select({
        id:              subscription.id,
        title:           subscription.title,
        status:          subscription.status,
        totalSeats:      subscription.totalSeats,
        pricePerSeat:    subscription.pricePerSeat,
        currency:        subscription.currency,
        serviceName:     service.name,
        activeMembers:   sql<number>`cast(count(case when ${membership.status} = 'active'  then 1 end) as int)`,
        pendingRequests: sql<number>`cast(count(case when ${membership.status} = 'pending' then 1 end) as int)`,
      })
      .from(subscription)
      .innerJoin(service,    eq(service.id,    subscription.serviceId))
      .leftJoin(membership,  eq(membership.subscriptionId, subscription.id))
      .where(eq(subscription.hostId, userId))
      .groupBy(
        subscription.id,
        subscription.title,
        subscription.status,
        subscription.totalSeats,
        subscription.pricePerSeat,
        subscription.currency,
        service.name,
      ),

    // Memberships this user has joined (all statuses)
    db
      .select({
        membershipId:     membership.id,
        subscriptionId:   subscription.id,
        title:            subscription.title,
        membershipStatus: membership.status,
        pricePerSeat:     subscription.pricePerSeat,
        currency:         subscription.currency,
        serviceName:      svcAlias.name,
        hostName:         hostUserAlias.name,
      })
      .from(membership)
      .innerJoin(subscription,   eq(subscription.id,   membership.subscriptionId))
      .innerJoin(svcAlias,       eq(svcAlias.id,       subscription.serviceId))
      .innerJoin(hostUserAlias,  eq(hostUserAlias.id,  subscription.hostId))
      .where(eq(membership.memberId, userId)),

    // Unread message count across all conversations
    db
      .select({ unread: sql<number>`cast(count(*) as int)` })
      .from(message)
      .innerJoin(
        conversationParticipant,
        and(
          eq(conversationParticipant.conversationId, message.conversationId),
          eq(conversationParticipant.userId, userId),
        ),
      )
      .where(and(ne(message.senderId, userId), isNull(message.readAt))),
  ]);

  return (
    <DashboardClient
      userName={session.user.name ?? ""}
      hostedPlans={hostedPlans}
      joinedPlans={joinedPlans}
      unreadMessages={unread}
    />
  );
}
