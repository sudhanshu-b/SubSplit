"use client";

import { useState } from "react";
import Spinner from "@/components/spinner";

type Props = { listingId: string };

export default function JoinButton({ listingId }: Props) {
  const [status, setStatus]   = useState<"idle" | "loading" | "requested" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleJoin() {
    setStatus("loading");
    setErrorMsg("");

    const res  = await fetch(`/api/listings/${listingId}/join`, { method: "POST" });
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
      <div className="flex items-center gap-2">
        <span
          className="rounded-full animate-pulse flex-shrink-0"
          style={{ width: 7, height: 7, backgroundColor: "#22c55e" }}
        />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Request sent · waiting for host
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleJoin}
        disabled={status === "loading"}
        className="w-full rounded-2xl bg-zinc-900 dark:bg-zinc-100
                   text-white dark:text-zinc-900
                   text-sm font-bold py-3.5 px-5
                   hover:bg-zinc-700 dark:hover:bg-zinc-300
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200
                   flex items-center justify-center gap-2"
      >
        {status === "loading" && <Spinner className="w-4 h-4" />}
        {status === "loading" ? "Sending request…" : "Request to join"}
      </button>

      {status === "error" && (
        <p className="text-[11px] text-red-500 dark:text-red-400 text-center">{errorMsg}</p>
      )}

      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center">
        You won&rsquo;t be charged until the host approves.
      </p>
    </div>
  );
}
