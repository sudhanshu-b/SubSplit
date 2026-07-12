"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export type ToastType = "success" | "error" | "info";
export type ToastState = { msg: string; type: ToastType } | null;

// ── Icons ──────────────────────────────────────────────────────────────────
function SuccessIcon() {
  return (
    <span className="flex-shrink-0 flex items-center justify-center
                     w-[18px] h-[18px] rounded-full bg-green-500">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ErrorIcon() {
  return (
    <span className="flex-shrink-0 flex items-center justify-center
                     w-[18px] h-[18px] rounded-full bg-red-500">
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M1 1L8 8M8 1L1 8" stroke="white" strokeWidth="1.6"
              strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
export function Toast({
  msg,
  type = "info",
  onDone,
}: {
  msg:    string;
  type?:  ToastType;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                 flex items-center gap-2.5
                 px-5 py-3 rounded-xl shadow-2xl
                 bg-zinc-900 dark:bg-zinc-800
                 text-white text-sm font-medium
                 border border-zinc-700/60
                 whitespace-nowrap"
    >
      {type === "success" && <SuccessIcon />}
      {type === "error"   && <ErrorIcon />}
      {msg}
    </motion.div>
  );
}
