import { auth } from "@/lib/auth";
import { db } from "@/db";
import { testimonial } from "@/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// GET — list all testimonials (published and unpublished). Admin-only.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden." }, { status: 403 });

  const rows = await db.select().from(testimonial).orderBy(desc(testimonial.createdAt));
  return Response.json({ testimonials: rows });
}

// POST — create a testimonial. Admin-only.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const authorName  = typeof body.authorName === "string" ? body.authorName.trim() : "";
  const authorRole  = typeof body.authorRole === "string" ? body.authorRole.trim() : "";
  const text        = typeof body.body === "string" ? body.body.trim() : "";
  const metric      = typeof body.metric === "string" ? body.metric.trim() : "";
  const metricLabel = typeof body.metricLabel === "string" ? body.metricLabel.trim() : "";
  const avatarUrl   = typeof body.avatarUrl === "string" && body.avatarUrl.trim() ? body.avatarUrl.trim() : null;

  if (!authorName || !authorRole || !text || !metric || !metricLabel) {
    return Response.json({ error: "Name, role, testimonial text, and the highlighted stat are all required." }, { status: 400 });
  }

  const [created] = await db
    .insert(testimonial)
    .values({ authorName, authorRole, body: text, metric, metricLabel, avatarUrl })
    .returning();

  revalidatePath("/");
  return Response.json({ testimonial: created }, { status: 201 });
}
