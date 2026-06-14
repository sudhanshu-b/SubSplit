import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscription, service } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json(
      { error: "You must be signed in to create a listing." },
      { status: 401 },
    );
  }

  const body = await request.json();

  const {
    serviceId,
    customServiceName,
    customServiceCategory,
    customServiceUrl,
    title,
    description,
    totalSeats,
    priceTotal,
    currency,
    region,
  } = body;

  if (!title || !totalSeats || !priceTotal) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Resolve service ID — either from the picker or by upserting a custom name
  let resolvedServiceId: string;

  if (serviceId) {
    resolvedServiceId = serviceId;
  } else if (customServiceName?.trim()) {
    const name = (customServiceName as string).trim();

    // Reuse an existing service if the name already exists (case-insensitive)
    const existing = await db
      .select({ id: service.id })
      .from(service)
      .where(sql`lower(${service.name}) = lower(${name})`)
      .limit(1);

    if (existing.length > 0) {
      resolvedServiceId = existing[0].id;
    } else {
      const [created] = await db
        .insert(service)
        .values({
          name,
          category: customServiceCategory?.trim() || null,
          url:      customServiceUrl?.trim()      || null,
        })
        .returning({ id: service.id });
      resolvedServiceId = created.id;
    }
  } else {
    return Response.json({ error: "Please select or enter a service." }, { status: 400 });
  }

  const [created] = await db
    .insert(subscription)
    .values({
      serviceId:   resolvedServiceId,
      hostId:      session.user.id,
      title,
      description: description || null,
      totalSeats:  Number(totalSeats),
      priceTotal:  String(priceTotal),
      currency:    currency || "INR",
      region:      region || null,
      status:      "active",
    })
    .returning({ id: subscription.id });

  return Response.json({ id: created.id }, { status: 201 });
}
