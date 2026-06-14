"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/spinner";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [form,      setForm]      = useState({ password: "", confirm: "" });
  const [showPass,  setShowPass]  = useState(false);
  const [status,    setStatus]    = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error,     setError]     = useState("");

  const passwordOk = form.password.length >= 8;
  const matchOk    = form.password === form.confirm && form.confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordOk || !matchOk) return;
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    const res  = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ newPassword: form.password, token }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { message?: string }).message ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("done");
    setTimeout(() => router.push("/sign-in"), 2500);
  }

  if (status === "done") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-6">
          <span
            className="rounded-full animate-pulse"
            style={{ width: 8, height: 8, backgroundColor: "#22c55e", display: "inline-block" }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            Password updated
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          All done.
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Your password has been reset. Redirecting you to sign in…
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-[420px]">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          Invalid link.
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          This password reset link is missing or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-gray-900 dark:text-white underline underline-offset-2"
        >
          Request a new link →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
        New password
      </h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* New password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
          >
            New password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700
                         bg-white dark:bg-slate-900 px-4 py-3 pr-11 text-sm text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-slate-500
                         focus:border-gray-400 dark:focus:border-slate-500 focus:outline-none
                         focus:ring-2 focus:ring-gray-900/8 dark:focus:ring-white/8 transition"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400
                         hover:text-gray-600 dark:hover:text-slate-300 transition"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.168-3.568M6.343 6.343A9.956 9.956 0 0112 5c5 0 9 4 9 7a9.77 9.77 0 01-1.507 2.897M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Requirements */}
          {form.password.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className="rounded-full"
                style={{
                  width: 5, height: 5, display: "inline-block", flexShrink: 0,
                  backgroundColor: passwordOk ? "#22c55e" : "#a1a1aa",
                }}
              />
              <span className={`text-[11px] ${passwordOk ? "text-green-600 dark:text-green-400" : "text-zinc-400"}`}>
                At least 8 characters
              </span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirm"
            className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
          >
            Confirm password <span className="text-red-500">*</span>
          </label>
          <input
            id="confirm"
            type={showPass ? "text" : "password"}
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
            placeholder="Repeat your password"
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-slate-500
                       focus:border-gray-400 dark:focus:border-slate-500 focus:outline-none
                       focus:ring-2 focus:ring-gray-900/8 dark:focus:ring-white/8 transition"
          />
          {form.confirm.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className="rounded-full"
                style={{
                  width: 5, height: 5, display: "inline-block", flexShrink: 0,
                  backgroundColor: matchOk ? "#22c55e" : "#f87171",
                }}
              />
              <span className={`text-[11px] ${matchOk ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {matchOk ? "Passwords match" : "Passwords don't match"}
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {status === "error" && (
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
          disabled={status === "loading" || !passwordOk || !matchOk}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl
                     bg-gray-900 dark:bg-white px-4 py-3.5 text-sm font-bold
                     text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-slate-100
                     disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
        >
          {status === "loading" && <Spinner className="w-4 h-4" />}
          {status === "loading" ? "Updating…" : "Set new password →"}
        </button>

      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[420px]"><p className="text-sm text-gray-400">Loading…</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
