import { auth } from "@/lib/auth";
import { db } from "@/db";
import { membership, membershipPayment } from "@/db/schema";
import { eq } from "drizzle-orm";
import { recalculateTrustScore } from "@/lib/trust-score";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { membershipId } = await params;

  const [mem] = await db
    .select({ id: membership.id, memberId: membership.memberId })
    .from(membership)
    .where(eq(membership.id, membershipId))
    .limit(1);

  if (!mem) return Response.json({ error: "Membership not found." }, { status: 404 });
  if (mem.memberId !== session.user.id)
    return Response.json({ error: "Unauthorized." }, { status: 403 });

  const body = await request.json() as Record<string, unknown>;
  const slot = Number(body.installmentNumber);

  if (!slot || ![1, 2].includes(slot))
    return Response.json({ error: "Invalid installment number." }, { status: 400 });

  const proofImageUrl  = typeof body.proofImageUrl  === "string" ? body.proofImageUrl  : undefined;
  const transactionRef = typeof body.transactionRef === "string" ? body.transactionRef.trim() || null : undefined;
  const paidAt         = proofImageUrl ? new Date() : (body.paidAt ? new Date(body.paidAt as string) : undefined);

  const values: typeof membershipPayment.$inferInsert = {
    membershipId,
    installmentNumber: slot,
  };
  if (proofImageUrl  !== undefined) values.proofImageUrl  = proofImageUrl;
  if (transactionRef !== undefined) values.transactionRef = transactionRef;
  if (paidAt         !== undefined) values.paidAt         = paidAt;

  const [row] = await db
    .insert(membershipPayment)
    .values(values)
    .onConflictDoUpdate({
      target: [membershipPayment.membershipId, membershipPayment.installmentNumber],
      set: {
        ...(proofImageUrl  !== undefined && { proofImageUrl  }),
        ...(transactionRef !== undefined && { transactionRef }),
        ...(paidAt         !== undefined && { paidAt         }),
      },
    })
    .returning({ id: membershipPayment.id });

  // Recalculate trust score for the member when a payment is confirmed
  // (paidAt set = proof submitted, which is the completion signal we have).
  if (paidAt !== undefined) {
    recalculateTrustScore(mem.memberId).catch(() => {});
  }

  return Response.json({ success: true, id: row.id });
}
