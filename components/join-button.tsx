"use client";

import { useState } from "react";

type Props = { listingId: string };

export default function JoinButton({ listingId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "requested" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleJoin() {
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch(`/api/listings/${listingId}/join`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error ?? "Something went wrong.");
      return;
    }

    setStatus("requested");
  }

  if (status === "requested") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-emerald-700">✓ Request sent!</p>
        <p className="text-xs text-emerald-600 mt-0.5">The host will review your request.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleJoin}
        disabled={status === "loading"}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {status === "loading" ? "Sending request…" : "Request to join"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
