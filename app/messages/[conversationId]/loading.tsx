export default function ConversationLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] animate-pulse">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 flex items-center gap-4">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div>
          <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-40 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-4 py-6 space-y-6">
        <div className="flex justify-start">
          <div className="h-9 w-48 bg-gray-200 rounded-2xl rounded-bl-sm" />
        </div>
        <div className="flex justify-end">
          <div className="h-9 w-36 bg-indigo-200 rounded-2xl rounded-br-sm" />
        </div>
        <div className="flex justify-start">
          <div className="h-9 w-64 bg-gray-200 rounded-2xl rounded-bl-sm" />
        </div>
        <div className="flex justify-end">
          <div className="h-9 w-52 bg-indigo-200 rounded-2xl rounded-br-sm" />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-3">
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
