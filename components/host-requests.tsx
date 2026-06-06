"use client";

import { useState } from "react";

type Request = {
  memberId: string;
  memberName: string;
  createdAt: Date;
};

type Props = {
  listingId: string;
  initialRequests: Request[];
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HostRequests({ listingId, initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  // Track which memberId is currently being processed so we can show a
  // loading state on that row's buttons only.
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAction(memberId: string, action: "approve" | "reject") {
    setProcessing(memberId);
    setError("");

    const res = await fetch(`/api/listings/${listingId}/requests/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    const data = await res.json();
    setProcessing(null);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    // Remove the processed request from the list immediately.
    setRequests((prev) => prev.filter((r) => r.memberId !== memberId));
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Pending requests
        </h2>
        {requests.length > 0 && (
          <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
            {requests.length} pending
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No pending requests</p>
          <p className="text-xs text-gray-300 mt-1">
            New join requests will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {requests.map((req) => {
            const isProcessing = processing === req.memberId;
            return (
              <li
                key={req.memberId}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                {/* Member info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                    {req.memberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {req.memberName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Requested {timeAgo(req.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(req.memberId, "approve")}
                    disabled={isProcessing}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isProcessing ? "…" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleAction(req.memberId, "reject")}
                    disabled={isProcessing}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isProcessing ? "…" : "Reject"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
