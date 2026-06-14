"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import Spinner from "@/components/spinner";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [showPassword, setShow] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [verified, setVerified] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp.email({
      name:        form.name,
      email:       form.email,
      password:    form.password,
      callbackURL: "/home",
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    // Email verification is required — show confirmation instead of redirecting
    setVerified(true);
  }

  if (verified) {
    return (
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-6">
          <span
            className="rounded-full animate-pulse"
            style={{ width: 8, height: 8, backgroundColor: "#22c55e", display: "inline-block" }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-slate-500">
            Account created
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          Check your inbox.
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-8">
          We sent a verification link to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{form.email}</span>.
          Click it to activate your account.
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          Already verified?{" "}
          <button
            onClick={() => router.push("/sign-in")}
            className="font-semibold text-gray-900 dark:text-white underline underline-offset-2"
          >
            Sign in →
          </button>
        </p>
      </div>
    );
  }

  // Live password requirement checks
  const checks = {
    length:  form.password.length >= 8,
    number:  /\d/.test(form.password),
  };

  return (
    <div className="w-full max-w-[420px]">

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
        Create your account
      </h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-gray-900 dark:text-white underline underline-offset-2">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5" htmlFor="name">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Smith"
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-slate-500
                       focus:border-gray-400 dark:focus:border-slate-500 focus:outline-none
                       focus:ring-2 focus:ring-gray-900/8 dark:focus:ring-white/8 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5" htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700
                       bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-slate-500
                       focus:border-gray-400 dark:focus:border-slate-500 focus:outline-none
                       focus:ring-2 focus:ring-gray-900/8 dark:focus:ring-white/8 transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5" htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700
                         bg-white dark:bg-slate-900 px-4 py-3 pr-11 text-sm text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-slate-500
                         focus:border-gray-400 dark:focus:border-slate-500 focus:outline-none
                         focus:ring-2 focus:ring-gray-900/8 dark:focus:ring-white/8 transition"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400
                         hover:text-gray-600 dark:hover:text-slate-300 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
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

          {/* Live password requirements */}
          {form.password.length > 0 && (
            <div className="mt-2.5 space-y-1">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                Password must include:
              </p>
              {[
                { ok: checks.length, label: "At least 8 characters"      },
                { ok: checks.number, label: "One number or special character" },
              ].map(({ ok, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black
                    ${ok ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-transparent"}`}>
                    ✓
                  </span>
                  <span className={`text-[11px] font-medium ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-500"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-800/40
                          bg-red-50 dark:bg-red-900/20 px-4 py-3">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl
                     bg-gray-900 dark:bg-white px-4 py-3.5 text-sm font-bold
                     text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-slate-100
                     disabled:opacity-60 disabled:cursor-not-allowed transition mt-2"
        >
          {loading && <Spinner className="w-4 h-4" />}
          {loading ? "Creating account…" : "Create account →"}
        </button>

      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
        <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">or</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
      </div>

      {/* Social buttons — coming soon */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex items-center justify-center gap-2.5 rounded-xl border border-gray-200
                     dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold
                     text-gray-700 dark:text-slate-300 opacity-50 cursor-not-allowed transition"
        >
          {/* Google "G" icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex items-center justify-center gap-2.5 rounded-xl border border-gray-200
                     dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold
                     text-gray-700 dark:text-slate-300 opacity-50 cursor-not-allowed transition"
        >
          {/* Apple icon */}
          <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.12 1.24-2.1 3.7.03 2.94 2.57 3.92 2.6 3.93l-.05.14c-.26.78-.6 1.55-1.2 2.45zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>

      <p className="text-[11px] text-center text-gray-400 dark:text-slate-500 mt-6">
        By creating an account you agree to our{" "}
        <Link href="#" className="underline hover:text-gray-600 dark:hover:text-slate-300">Terms</Link>
        {" "}and{" "}
        <Link href="#" className="underline hover:text-gray-600 dark:hover:text-slate-300">Privacy Policy</Link>.
      </p>

    </div>
  );
}
