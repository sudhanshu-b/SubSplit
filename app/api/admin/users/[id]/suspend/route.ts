import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appUser, session as sessionTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST — toggle a user's suspended (banned) status. Admin-only.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;

  if (id === session.user.id) {
    return Response.json({ error: "You can't suspend your own account." }, { status: 400 });
  }

  const [target] = await db
    .select({ banned: appUser.banned })
    .from(appUser)
    .where(eq(appUser.id, id))
    .limit(1);

  if (!target) return Response.json({ error: "User not found." }, { status: 404 });

  const nextBanned = !target.banned;

  await db.update(appUser).set({ banned: nextBanned, updatedAt: new Date() }).where(eq(appUser.id, id));

  // Suspending logs the user out of every active session immediately.
  if (nextBanned) {
    await db.delete(sessionTable).where(eq(sessionTable.userId, id));
  }

  return Response.json({ banned: nextBanned });
}
