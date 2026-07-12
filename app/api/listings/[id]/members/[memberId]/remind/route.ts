import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { subscription, membership, appUser } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendMail, paymentReminderEmailHtml } from "@/lib/mailer";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string; memberId: string }>;

function isToday(ts: Date): boolean {
  const now = new Date();
  return (
    ts.getUTCFullYear() === now.getUTCFullYear() &&
    ts.getUTCMonth()    === now.getUTCMonth()    &&
    ts.getUTCDate()     === now.getUTCDate()
  );
}

export async function POST(_req: Request, { params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: subscriptionId, memberId } = await params;

  const [listing] = await db
    .select({
      hostId:       subscription.hostId,
      status:       subscription.status,
      title:        subscription.title,
      pricePerSeat: subscription.pricePerSeat,
      currency:     subscription.currency,
    })
    .from(subscription)
    .where(eq(subscription.id, subscriptionId))
    .limit(1);

  if (!listing)                           return NextResponse.json({ error: "Not found" },          { status: 404 });
  if (listing.hostId !== session.user.id) return NextResponse.json({ error: "Forbidden" },          { status: 403 });
  if (listing.status !== "active")        return NextResponse.json({ error: "Plan is not active" }, { status: 400 });

  const [mem] = await db
    .select({
      id:             membership.id,
      status:         membership.status,
      lastRemindedAt: membership.lastRemindedAt,
      memberEmail:    appUser.email,
      memberName:     appUser.name,
    })
    .from(membership)
    .innerJoin(appUser, eq(membership.memberId, appUser.id))
    .where(and(eq(membership.subscriptionId, subscriptionId), eq(membership.memberId, memberId)))
    .limit(1);

  if (!mem)                    return NextResponse.json({ error: "Member not found" },      { status: 404 });
  if (mem.status !== "active") return NextResponse.json({ error: "Member is not active" }, { status: 400 });

  if (mem.lastRemindedAt && isToday(mem.lastRemindedAt)) {
    return NextResponse.json({ error: "Already reminded today" }, { status: 429 });
  }

  const [host] = await db
    .select({ name: appUser.name })
    .from(appUser)
    .where(eq(appUser.id, session.user.id))
    .limit(1);

  const sym    = listing.currency === "INR" ? "₹" : listing.currency === "USD" ? "$" : `${listing.currency} `;
  const amount = listing.pricePerSeat
    ? `${sym}${Math.round(parseFloat(String(listing.pricePerSeat)))}`
    : "your share";

  await sendMail({
    to:      mem.memberEmail,
    subject: `Payment reminder — ${listing.title}`,
    html:    paymentReminderEmailHtml(mem.memberName, host?.name ?? "Your host", listing.title, amount),
  });

  await db
    .update(membership)
    .set({ lastRemindedAt: new Date() })
    .where(eq(membership.id, mem.id));

  return NextResponse.json({ ok: true });
}
