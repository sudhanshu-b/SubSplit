import LandingPage from "@/components/landing-page";
import { Analytics } from "@vercel/analytics/next"
import { db } from "@/db";
import { testimonial } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function Page() {
  const rows = await db
    .select({
      authorName:  testimonial.authorName,
      authorRole:  testimonial.authorRole,
      body:        testimonial.body,
      metric:      testimonial.metric,
      metricLabel: testimonial.metricLabel,
      avatarUrl:   testimonial.avatarUrl,
    })
    .from(testimonial)
    .where(eq(testimonial.published, true))
    .orderBy(desc(testimonial.createdAt));

  return <LandingPage testimonials={rows} />;
}
