"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toast, type ToastState } from "@/components/ui/toast";

const TYPES = [
  {
    value: "bug",
    label: "Bug report",
    desc: "Something is broken or not working as expected",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44a23.912 23.912 0 0 0 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.778 3.778 0 0 1 .4-2.25m0 0a3.002 3.002 0 0 1 5.044 0" />
      </svg>
    ),
  },
  {
    value: "feature_request",
    label: "Feature request",
    desc: "Suggest a new feature or improvement",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a7.5 7.5 0 0 1-3 0M3 8.25a9 9 0 0 1 18 0M9.75 9h4.5" />
      </svg>
    ),
  },
  {
    value: "other",
    label: "Other",
    desc: "General feedback or anything else",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
] as const;

type FeedbackType = "bug" | "feature_request" | "other";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:      { label: "Open",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"     },
  in_review: { label: "In review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  done:      { label: "Done",      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  closed:    { label: "Closed",    color: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"        },
};

const TYPE_LABELS: Record<string, string> = {
  bug:             "Bug",
  feature_request: "Feature",
  other:           "Other",
};

type Submission = {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function FeedbackPage() {
  const [type,        setType]        = useState<FeedbackType>("bug");
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState<ToastState>(null);
  const [submitted,   setSubmitted]   = useState<Submission[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [tab,         setTab]         = useState<"form" | "history">("form");

  async function loadHistory() {
    setLoadingList(true);
    try {
      const res  = await fetch("/api/feedback");
      const data = await res.json();
      if (res.ok) setSubmitted(data);
    } finally {
      setLoadingList(false);
    }
  }

  function switchTab(t: "form" | "history") {
    setTab(t);
    if (t === "history") loadHistory();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setToast({ msg: "Please fill in all fields.", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res  = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ msg: data.error ?? "Something went wrong.", type: "error" });
        return;
      }
      setToast({ msg: "Feedback submitted — thank you!", type: "success" });
      setTitle("");
      setDescription("");
      setType("bug");
    } catch {
      setToast({ msg: "Network error. Try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e10] px-4 py-10">
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Feedback
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Report a bug or suggest a feature — we read every submission.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl mb-6 w-fit">
          {(["form", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {t === "form" ? "Submit" : "My submissions"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "form" ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                  Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TYPES.map(({ value, label, desc, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                        type === value
                          ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500"
                      }`}
                    >
                      <div className="mb-2">{icon}</div>
                      <p className="text-sm font-semibold leading-none mb-1">{label}</p>
                      <p className={`text-[11px] leading-relaxed ${
                        type === value ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400 dark:text-zinc-500"
                      }`}>
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary of the issue or idea"
                  maxLength={120}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700
                             bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100
                             placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                             focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100
                             transition-shadow"
                />
                <p className="text-[11px] text-zinc-400 mt-1 text-right">{title.length}/120</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    type === "bug"
                      ? "Describe what happened, what you expected, and steps to reproduce…"
                      : type === "feature_request"
                      ? "Describe the feature and why it would be useful…"
                      : "Tell us anything on your mind…"
                  }
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700
                             bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100
                             placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                             focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100
                             transition-shadow resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100
                           text-white dark:text-zinc-900 text-sm font-bold
                           hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit feedback"}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {loadingList ? (
                <div className="flex justify-center py-16">
                  <svg className="w-5 h-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              ) : submitted.length === 0 ? (
                <div className="text-center py-16 text-zinc-400 dark:text-zinc-600 text-sm">
                  No submissions yet.
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_80px_90px_100px] gap-3 px-4 py-3
                                  border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Title</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</span>
                  </div>

                  {/* Rows */}
                  {submitted.map((row, i) => {
                    const status = STATUS_LABELS[row.status] ?? STATUS_LABELS.open;
                    const date   = new Date(row.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "2-digit",
                    });
                    return (
                      <motion.details
                        key={row.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
                        className="group border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                      >
                        <summary className="grid grid-cols-[1fr_80px_90px_100px] gap-3 px-4 py-4
                                            cursor-pointer list-none select-none
                                            hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-2">
                            {row.title}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">
                            {TYPE_LABELS[row.type] ?? row.type}
                          </span>
                          <span className="self-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.color}`}>
                              {status.label}
                            </span>
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 self-center">{date}</span>
                        </summary>
                        <div className="px-4 pb-4 pt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed
                                        border-t border-zinc-50 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-800/20">
                          {row.description}
                        </div>
                      </motion.details>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
