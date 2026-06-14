import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { service } from "@/db/schema";
import { asc } from "drizzle-orm";
import CreateListingForm from "@/components/create-listing-form";

export const metadata = { title: "New listing · SubSplit" };

export default async function NewListingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const services = await db
    .select({ id: service.id, name: service.name, category: service.category })
    .from(service)
    .orderBy(asc(service.name));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e10]">
      <div className="max-w-xl mx-auto px-5 pt-[72px] pb-10">
        <CreateListingForm services={services} />
      </div>
    </main>
  );
}
