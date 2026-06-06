import { db } from "@/db";
import { subscription, service, appUser, membership } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import BrowseFilters from "@/components/browse-filters";
import ListingCard from "@/components/listing-card";

type SearchParams = Promise<{ serviceId?: string; region?: string }>;

export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  // Protect this page — only signed-in users can browse listings.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { serviceId, region } = await searchParams;

  const services = await db
    .select({ id: service.id, name: service.name })
    .from(service)
    .orderBy(service.name);

  const filters = [eq(subscription.status, "active")];
  if (serviceId) filters.push(eq(subscription.serviceId, serviceId));
  if (region) filters.push(eq(subscription.region, region.toUpperCase()));

  const activeMemberCounts = db
    .select({
      subscriptionId: membership.subscriptionId,
      count: sql<number>`cast(count(*) as int)`.as("count"),
    })
    .from(membership)
    .where(eq(membership.status, "active"))
    .groupBy(membership.subscriptionId)
    .as("active_member_counts");

  const listings = await db
    .select({
      id: subscription.id,
      title: subscription.title,
      description: subscription.description,
      totalSeats: subscription.totalSeats,
      pricePerSeat: subscription.pricePerSeat,
      currency: subscription.currency,
      region: subscription.region,
      serviceName: service.name,
      hostName: appUser.name,
      activeMembers: sql<number>`coalesce(${activeMemberCounts.count}, 0)`,
    })
    .from(subscription)
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .innerJoin(appUser, eq(subscription.hostId, appUser.id))
    .leftJoin(activeMemberCounts, eq(subscription.id, activeMemberCounts.subscriptionId))
    .where(and(...filters))
    .orderBy(subscription.createdAt);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse listings</h1>
        <p className="text-gray-500">Find a shared subscription plan and split the cost.</p>
      </div>

      <div className="mb-6">
        <Suspense>
          <BrowseFilters services={services} />
        </Suspense>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No listings found.</p>
          <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              description={listing.description}
              serviceName={listing.serviceName}
              hostName={listing.hostName}
              pricePerSeat={listing.pricePerSeat}
              currency={listing.currency}
              totalSeats={listing.totalSeats}
              remainingSeats={listing.totalSeats - listing.activeMembers}
              region={listing.region}
            />
          ))}
        </div>
      )}
    </main>
  );
}
