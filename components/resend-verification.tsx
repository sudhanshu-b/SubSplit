"use client";

import { useState } from "react";
import Spinner from "@/components/spinner";

export default function ResendVerification({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error,  setError]  = useState("");

  async function handleResend() {
    setStatus("loading");
    setError("");

    const res = await fetch("/api/auth/send-verification-email", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, callbackURL: "/home" }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { message?: string }).message ?? "Failed to send. Try again.");
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span
          className="rounded-full animate-pulse flex-shrink-0"
          style={{ width: 6, height: 6, backgroundColor: "#22c55e", display: "inline-block" }}
        />
        Verification email sent · check your inbox
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleResend}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold
                   text-amber-600 dark:text-amber-400
                   hover:text-zinc-900 dark:hover:text-zinc-100
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-150"
      >
        {status === "loading" && <Spinner className="w-3 h-3" />}
        {status === "loading" ? "Sending…" : "Send verification email ↗"}
      </button>
      {status === "error" && (
        <span className="text-[11px] text-red-500">{error}</span>
      )}
    </div>
  );
}
