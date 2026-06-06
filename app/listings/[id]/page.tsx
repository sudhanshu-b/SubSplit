import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { subscription, service, appUser, membership } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import JoinButton from "@/components/join-button";
import HostRequests from "@/components/host-requests";

type Params = Promise<{ id: string }>;

export default async function ListingDetailPage({ params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { id } = await params;

  // Fetch the listing with service and host details in one query.
  const [listing] = await db
    .select({
      id: subscription.id,
      title: subscription.title,
      description: subscription.description,
      totalSeats: subscription.totalSeats,
      priceTotal: subscription.priceTotal,
      pricePerSeat: subscription.pricePerSeat,
      currency: subscription.currency,
      region: subscription.region,
      status: subscription.status,
      activeFrom: subscription.activeFrom,
      activeTill: subscription.activeTill,
      createdAt: subscription.createdAt,
      serviceId: subscription.serviceId,
      serviceName: service.name,
      serviceCategory: service.category,
      hostId: appUser.id,
      hostName: appUser.name,
    })
    .from(subscription)
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .innerJoin(appUser, eq(subscription.hostId, appUser.id))
    .where(eq(subscription.id, id))
    .limit(1);

  if (!listing) notFound();

  // Run seat count and viewer membership check in parallel.
  const [memberCountResult, viewerMembership] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(membership)
      .where(and(eq(membership.subscriptionId, id), eq(membership.status, "active")))
      .then(([r]) => r.count),
    db
      .select({ status: membership.status })
      .from(membership)
      .where(and(eq(membership.subscriptionId, id), eq(membership.memberId, session.user.id)))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ]);

  const remainingSeats = listing.totalSeats - memberCountResult;
  const isHost = listing.hostId === session.user.id;
  const isFull = remainingSeats <= 0;

  // Fetch pending requests only when the viewer is the host.
  const pendingRequests = isHost
    ? await db
        .select({
          memberId: membership.memberId,
          memberName: appUser.name,
          createdAt: membership.createdAt,
        })
        .from(membership)
        .innerJoin(appUser, eq(membership.memberId, appUser.id))
        .where(
          and(eq(membership.subscriptionId, id), eq(membership.status, "pending"))
        )
        .orderBy(membership.createdAt)
    : [];

  // Determine action state for the sidebar.
  type ActionState = "host" | "active" | "pending" | "rejected" | "full" | "join";
  let actionState: ActionState = "join";
  if (isHost) actionState = "host";
  else if (viewerMembership?.status === "active") actionState = "active";
  else if (viewerMembership?.status === "pending") actionState = "pending";
  else if (viewerMembership?.status === "rejected") actionState = "rejected";
  else if (isFull) actionState = "full";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Back link */}
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-8"
      >
        ← Back to browse
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-3 py-1">
          {listing.serviceName}
        </span>
        {listing.serviceCategory && (
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
            {listing.serviceCategory}
          </span>
        )}
        <span
          className={`text-xs font-semibold rounded-full px-3 py-1 ${
            listing.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : listing.status === "full"
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
      {listing.description && (
        <p className="text-gray-500 leading-relaxed max-w-2xl mb-10">{listing.description}</p>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Listing details grid */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Plan details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Price per seat</p>
                <p className="text-xl font-bold text-gray-900">
                  {listing.currency} {Number(listing.pricePerSeat).toFixed(2)}
                  <span className="text-sm font-normal text-gray-400"> / mo</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Total seats</p>
                <p className="text-xl font-bold text-gray-900">{listing.totalSeats}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Seats available</p>
                <p className={`text-xl font-bold ${remainingSeats === 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {remainingSeats}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Full plan cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  {listing.currency} {Number(listing.priceTotal).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Currency</p>
                <p className="text-lg font-semibold text-gray-900">{listing.currency}</p>
              </div>
              {listing.region && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Region</p>
                  <p className="text-lg font-semibold text-gray-900 uppercase">{listing.region}</p>
                </div>
              )}
            </div>

            {/* Seat fill bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{memberCountResult} seats taken</span>
                <span>{remainingSeats} remaining</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(memberCountResult / listing.totalSeats) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Host */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Hosted by
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                {listing.hostName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{listing.hostName}</p>
                <p className="text-sm text-gray-400">
                  Listed {new Date(listing.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Pending requests — only rendered for the host */}
          {isHost && (
            <HostRequests
              listingId={listing.id}
              initialRequests={pendingRequests}
            />
          )}
        </div>

        {/* Right — action sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-3xl font-extrabold text-gray-900 mb-1">
              {listing.currency} {Number(listing.pricePerSeat).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mb-5">per seat / month</p>

            {/* Seat indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <span className={`w-2 h-2 rounded-full ${remainingSeats > 0 ? "bg-emerald-500" : "bg-red-400"}`} />
              <span className="text-gray-600">
                {remainingSeats > 0
                  ? `${remainingSeats} of ${listing.totalSeats} seats left`
                  : "No seats available"}
              </span>
            </div>

            {/* Action */}
            {actionState === "host" && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-indigo-700">This is your listing</p>
                <p className="text-xs text-indigo-500 mt-0.5">You can manage it from your dashboard.</p>
              </div>
            )}
            {actionState === "active" && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-emerald-700">✓ You're a member</p>
                <p className="text-xs text-emerald-600 mt-0.5">You have an active seat on this plan.</p>
              </div>
            )}
            {actionState === "pending" && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-amber-700">⏳ Request pending</p>
                <p className="text-xs text-amber-600 mt-0.5">Waiting for the host to respond.</p>
              </div>
            )}
            {actionState === "rejected" && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-red-700">Request declined</p>
                <p className="text-xs text-red-500 mt-0.5">The host declined your request.</p>
              </div>
            )}
            {actionState === "full" && (
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-gray-600">No seats available</p>
                <p className="text-xs text-gray-400 mt-0.5">Check back later or browse other listings.</p>
              </div>
            )}
            {actionState === "join" && <JoinButton listingId={listing.id} />}

            <p className="text-xs text-gray-400 text-center mt-4">
              You won't be charged until the host approves your request.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
