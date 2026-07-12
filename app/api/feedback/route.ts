import { auth } from "@/lib/auth";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json();
  const { type, title, description } = body;

  if (!type || !title?.trim() || !description?.trim()) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!["bug", "feature_request", "other"].includes(type)) {
    return Response.json({ error: "Invalid feedback type." }, { status: 400 });
  }

  if (title.trim().length > 120) {
    return Response.json({ error: "Title must be under 120 characters." }, { status: 400 });
  }

  const [row] = await db
    .insert(feedback)
    .values({
      userId:      session.user.id,
      type,
      title:       title.trim(),
      description: description.trim(),
    })
    .returning({ id: feedback.id });

  return Response.json({ id: row.id }, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const rows = await db
    .select({
      id:          feedback.id,
      type:        feedback.type,
      title:       feedback.title,
      description: feedback.description,
      status:      feedback.status,
      createdAt:   feedback.createdAt,
    })
    .from(feedback)
    .where(eq(feedback.userId, session.user.id))
    .orderBy(desc(feedback.createdAt));

  return Response.json(rows);
}
