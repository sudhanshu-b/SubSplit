import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appUser } from "@/db/schema";
import { eq } from "drizzle-orm";

const INDIA_PHONE_RE = /^[6-9]\d{9}$/;

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { phone } = await request.json();

  if (!phone || typeof phone !== "string") {
    return Response.json({ error: "Phone number is required." }, { status: 400 });
  }

  const digits = phone.replace(/\D/g, "").replace(/^91/, "");

  if (!INDIA_PHONE_RE.test(digits)) {
    return Response.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  await db
    .update(appUser)
    .set({ phone: `+91${digits}`, isPhoneVerified: false })
    .where(eq(appUser.id, session.user.id));

  return Response.json({ phone: `+91${digits}` });
}
