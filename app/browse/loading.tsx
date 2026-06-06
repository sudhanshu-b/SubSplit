export default function BrowseSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="h-9 w-36 bg-gray-200 rounded-lg" />
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>

      {/* Listing cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex justify-between mb-3">
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
              <div className="h-4 w-8 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-4/5 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-100 rounded mb-1" />
            <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
            <div className="h-3 w-24 bg-gray-100 rounded mb-5" />
            <div className="flex justify-between items-end">
              <div>
                <div className="h-6 w-20 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
