"use client";

import { useState } from "react";
import Link from "next/link";
import Spinner from "@/components/spinner";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res  = await fetch("/api/auth/request-password-reset", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, redirectTo: "/reset-password" }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { message?: string }).message ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-6">
          <span
            className="rounded-full animate-pulse"
            style={{ width: 8, height: 8, backgroundColor: "#22c55e", display: "inline-block" }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            Email sent
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          Check your inbox.
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-8">
          We sent a password reset link to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
          It expires in 1 hour.
        </p>

        <p className="text-xs text-gray-400 dark:text-slate-500">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <button
            onClick={() => setStatus("idle")}
            className="font-semibold text-gray-900 dark:text-white underline underline-offset-2"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
        Forgot password?
      </h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
        Enter your email and we&apos;ll send you a reset link.{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-gray-900 dark:text-white underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-slate-500
                       focus:border-gray-400 dark:focus:border-slate-500 focus:outline-none
                       focus:ring-2 focus:ring-gray-900/8 dark:focus:ring-white/8 transition"
          />
        </div>

        {(status === "error") && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-800/40
                          bg-red-50 dark:bg-red-900/20 px-4 py-3">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl
                     bg-gray-900 dark:bg-white px-4 py-3.5 text-sm font-bold
                     text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-slate-100
                     disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
        >
          {status === "loading" && <Spinner className="w-4 h-4" />}
          {status === "loading" ? "Sending…" : "Send reset link →"}
        </button>
      </form>
    </div>
  );
}
