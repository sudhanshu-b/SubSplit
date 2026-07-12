export default function MessagesLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 animate-pulse">
      <div className="h-7 w-32 bg-gray-200 rounded mb-6" />
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden divide-y divide-gray-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-8 bg-gray-100 rounded" />
              </div>
              <div className="h-3 w-20 bg-gray-100 rounded mb-1" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
