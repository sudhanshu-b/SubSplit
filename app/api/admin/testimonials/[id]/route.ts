import { auth } from "@/lib/auth";
import { db } from "@/db";
import { testimonial } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// PATCH — toggle whether a testimonial is published on the landing page. Admin-only.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;

  const [existing] = await db
    .select({ published: testimonial.published })
    .from(testimonial)
    .where(eq(testimonial.id, id))
    .limit(1);

  if (!existing) return Response.json({ error: "Testimonial not found." }, { status: 404 });

  const nextPublished = !existing.published;
  await db
    .update(testimonial)
    .set({ published: nextPublished, updatedAt: new Date() })
    .where(eq(testimonial.id, id));

  revalidatePath("/");
  return Response.json({ published: nextPublished });
}

// DELETE — remove a testimonial. Admin-only.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  await db.delete(testimonial).where(eq(testimonial.id, id));

  revalidatePath("/");
  return Response.json({ success: true });
}
