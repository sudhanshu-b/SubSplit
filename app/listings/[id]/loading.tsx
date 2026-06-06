// Next.js renders this file instantly on navigation while the server
// component (page.tsx) is still fetching data. The user sees a skeleton
// instead of a blank screen during the 3-4 second DB round-trip.
export default function ListingDetailSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-28 bg-gray-200 rounded mb-8" />

      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>

      {/* Title */}
      <div className="h-8 w-2/3 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-full max-w-xl bg-gray-100 rounded mb-1" />
      <div className="h-4 w-4/5 bg-gray-100 rounded mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="h-4 w-24 bg-gray-200 rounded mb-5" />
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
                  <div className="h-7 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-gray-100 rounded-full" />
            </div>
          </div>

          {/* Host card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="h-9 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-32 bg-gray-100 rounded mb-5" />
            <div className="h-4 w-40 bg-gray-100 rounded mb-6" />
            <div className="h-11 w-full bg-gray-200 rounded-xl" />
            <div className="h-3 w-48 bg-gray-100 rounded mx-auto mt-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
