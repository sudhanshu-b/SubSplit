"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toast, type ToastState } from "@/components/ui/toast";

const EASE = [0.22, 1, 0.36, 1] as const;

type Request = {
  memberId: string;
  memberName: string;
  memberImage: string | null;
  createdAt: Date;
};

type Props = {
  listingId: string;
  initialRequests: Request[];
};

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60)  return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60)  return `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HostRequests({ listingId, initialRequests }: Props) {
  const [requests,   setRequests]   = useState(initialRequests);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast,      setToast]      = useState<ToastState>(null);

  async function handleAction(memberId: string, action: "approve" | "reject") {
    setProcessing(memberId);

    try {
      const res  = await fetch(`/api/listings/${listingId}/requests/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ msg: data.error ?? "Something went wrong.", type: "error" });
        return;
      }

      setRequests(prev => prev.filter(r => r.memberId !== memberId));
      setToast({
        msg:  action === "approve" ? "Member approved." : "Request rejected.",
        type: action === "approve" ? "success" : "info",
      });
    } catch {
      setToast({ msg: "Network error. Try again.", type: "error" });
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
          Pending requests
        </p>
        {requests.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <span
              className="rounded-full flex-shrink-0"
              style={{ width: 5, height: 5, backgroundColor: "#f59e0b" }}
            />
            {requests.length}
          </span>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>

      {requests.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          No pending requests
        </p>
      ) : (
        <AnimatePresence initial={false}>
          {requests.map((req) => {
            const busy = processing === req.memberId;
            return (
              <motion.div
                key={req.memberId}
                initial={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="group flex items-center justify-between py-4
                                border-b border-zinc-100 dark:border-zinc-800/70 last:border-0">
                  {/* Left: initial + name + time */}
                  <div className="flex items-center gap-3 min-w-0">
                    {req.memberImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={req.memberImage}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0
                                       bg-zinc-100 dark:bg-zinc-800
                                       text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {req.memberName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {req.memberName}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {timeAgo(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right: approve / reject as text actions */}
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleAction(req.memberId, "approve")}
                      disabled={busy}
                      className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100
                                 hover:text-green-600 dark:hover:text-green-400
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors duration-150"
                    >
                      {busy ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(req.memberId, "reject")}
                      disabled={busy}
                      className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500
                                 hover:text-red-500 dark:hover:text-red-400
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors duration-150"
                    >
                      {busy ? "…" : "Reject"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
