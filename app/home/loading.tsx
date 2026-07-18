// Next.js renders this instantly on navigation while page.tsx runs its
// DB queries (hosted plans, joined plans, unread count) server-side.
export default function HomeSkeleton() {
  return (
    <main className="bg-zinc-50 dark:bg-[#0e0e10] min-h-[calc(100vh-80px)] animate-pulse">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Hero */}
        <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="h-10 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded mb-2" />
        <div className="h-10 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded" />

        {/* Stats strip */}
        <div className="flex gap-3 mt-5">
          <div className="h-3 w-20 bg-gray-100 dark:bg-zinc-800/70 rounded" />
          <div className="h-3 w-16 bg-gray-100 dark:bg-zinc-800/70 rounded" />
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-10 mb-10" />

        {/* Hosted plans */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-16 bg-gray-100 dark:bg-zinc-800/70 rounded" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-zinc-800 mt-1" />
              <div className="flex-1">
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-zinc-800/70 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Memberships */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-28 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-zinc-800/70 rounded" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-zinc-800 mt-1" />
              <div className="flex-1">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-1/3 bg-gray-100 dark:bg-zinc-800/70 rounded" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
