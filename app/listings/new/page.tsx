import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { service } from "@/db/schema";
import { asc } from "drizzle-orm";
import CreateListingForm from "@/components/create-listing-form";

export default async function NewListingPage() {
  // Server-side session check — no round trip to the browser needed.
  // auth.api.getSession reads the session cookie directly from the request.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  // Fetch services directly from the DB — this is a server component so
  // we can query the database without going through an API route.
  const services = await db
    .select({ id: service.id, name: service.name, category: service.category })
    .from(service)
    .orderBy(asc(service.name));

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Create a listing
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Share your subscription plan and split the cost with others.
      </p>
      <CreateListingForm services={services} />
    </main>
  );
}
