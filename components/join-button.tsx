"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Spinner from "@/components/spinner";
import { Toast, type ToastState } from "@/components/ui/toast";

type Props = { listingId: string };

export default function JoinButton({ listingId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "requested">("idle");
  const [toast,  setToast]  = useState<ToastState>(null);

  async function handleJoin() {
    setStatus("loading");

    try {
      const res  = await fetch(`/api/listings/${listingId}/join`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setToast({ msg: data.error ?? "Something went wrong.", type: "error" });
        setStatus("idle");
        return;
      }

      setStatus("requested");
      setToast({ msg: "Request sent — waiting for host approval.", type: "success" });
    } catch {
      setToast({ msg: "Network error. Please try again.", type: "error" });
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>

      {status === "requested" ? (
        <div className="flex items-center gap-2">
          <span
            className="rounded-full animate-pulse shrink-0"
            style={{ width: 7, height: 7, backgroundColor: "#22c55e" }}
          />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Request sent · waiting for host
          </p>
        </div>
      ) : (
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
      )}

      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center">
        You won&rsquo;t be charged until the host approves.
      </p>
    </div>
  );
}
