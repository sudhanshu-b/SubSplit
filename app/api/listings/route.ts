import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscription } from "@/db/schema";

export async function POST(request: Request) {
  // Read session from the incoming request headers — this is how Better Auth
  // exposes the session in server-side code (API routes, server actions).
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "You must be signed in to create a listing." }, { status: 401 });
  }

  const body = await request.json();

  const { serviceId, title, description, totalSeats, priceTotal, currency, region } = body;

  if (!serviceId || !title || !totalSeats || !priceTotal) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const [created] = await db
    .insert(subscription)
    .values({
      serviceId,
      hostId: session.user.id,
      title,
      description: description || null,
      totalSeats: Number(totalSeats),
      priceTotal: String(priceTotal),
      currency: currency || "USD",
      region: region || null,
      status: "active",
    })
    .returning({ id: subscription.id });

  return Response.json({ id: created.id }, { status: 201 });
}
