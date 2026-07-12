"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toast, type ToastState } from "@/components/ui/toast";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Types ──────────────────────────────────────────────────────────────────
type Analytics = {
  totalUsers:          number;
  activeListings:      number;
  completedListings:   number;
  pendingJoinRequests: number;
  avgTrustScore:       number | null;
  totalReviews:        number;
};

export type AdminUser = {
  id:                string;
  name:              string;
  email:             string;
  image:             string | null;
  role:              string;
  banned:            boolean;
  trustScore:        string | null;
  activeListings:    number;
  completedListings: number;
  reviewCount:       number;
  reportCount:       number;
  createdAt:         string;
};

export type AdminTestimonial = {
  id:          string;
  authorName:  string;
  authorRole:  string;
  body:        string;
  metric:      string;
  metricLabel: string;
  avatarUrl:   string | null;
  published:   boolean;
  createdAt:   string;
  updatedAt:   string;
};

type Props = {
  currentUserId: string;
  analytics:     Analytics;
  users:         AdminUser[];
  testimonials:  AdminTestimonial[];
};

const TABS = ["Analytics", "Users", "Testimonials"] as const;
type Tab = typeof TABS[number];

// ── Helpers ────────────────────────────────────────────────────────────────
function avatarColor(name: string) {
  const palette = ["#E50914", "#1DB954", "#0061FF", "#6941C6", "#1FB8CD", "#FF9933", "#138808"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return <img src={image} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />; // eslint-disable-line @next/next/no-img-element
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
      style={{ backgroundColor: avatarColor(name) }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, delay }: { label: string; value: string | number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: EASE }}
      className="rounded-2xl px-5 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600 mb-2">
        {label}
      </p>
      <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </motion.div>
  );
}

// ── Analytics tab ──────────────────────────────────────────────────────────
function AnalyticsContent({ analytics }: { analytics: Analytics }) {
  const cards = [
    { label: "Total Users",           value: analytics.totalUsers },
    { label: "Active Listings",       value: analytics.activeListings },
    { label: "Completed Listings",    value: analytics.completedListings },
    { label: "Pending Join Requests", value: analytics.pendingJoinRequests },
    { label: "Average Trust Score",   value: analytics.avgTrustScore ? `${analytics.avgTrustScore.toFixed(2)} / 5` : "—" },
    { label: "Total Reviews",         value: analytics.totalReviews },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map((c, i) => <StatCard key={c.label} label={c.label} value={c.value} delay={i * 0.04} />)}
    </div>
  );
}

// ── Users tab ──────────────────────────────────────────────────────────────
function UsersContent({
  currentUserId, users, onToast,
}: {
  currentUserId: string;
  users:         AdminUser[];
  onToast:       (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [rows, setRows]         = useState(users);
  const [query, setQuery]       = useState("");
  const [busyId, setBusyId]     = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [rows, query]);

  async function handleSuspendConfirmed(id: string) {
    setConfirmId(null);
    setBusyId(id);
    try {
      const res  = await fetch(`/api/admin/users/${id}/suspend`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { onToast(data.error ?? "Action failed.", "error"); return; }
      setRows(prev => prev.map(u => u.id === id ? { ...u, banned: data.banned } : u));
      onToast(data.banned ? "Account suspended." : "Account reinstated.", "success");
    } catch {
      onToast("Network error. Try again.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="relative mb-4 max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900
                     pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100
                     placeholder-zinc-400 dark:placeholder-zinc-600
                     focus:outline-none focus:ring-2 focus:ring-zinc-900/8 dark:focus:ring-zinc-100/8"
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                {["User", "Trust Score", "Active", "Completed", "Reviews", "Reports", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={u.name} image={u.image} />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{u.name}</p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{u.email}</p>
                      </div>
                      {u.banned && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                          Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300 font-semibold whitespace-nowrap">
                    {u.trustScore ? parseFloat(u.trustScore).toFixed(1) : "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{u.activeListings}</td>
                  <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{u.completedListings}</td>
                  <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{u.reviewCount}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={u.reportCount > 0 ? "text-red-500 dark:text-red-400 font-semibold" : "text-zinc-400 dark:text-zinc-600"}>
                      {u.reportCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {u.id === currentUserId ? (
                      <span className="text-[11px] text-zinc-300 dark:text-zinc-700">You</span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(u.id)}
                        disabled={busyId === u.id}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                          u.banned
                            ? "text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 hover:bg-red-100 dark:hover:bg-red-400/20"
                        }`}
                      >
                        {busyId === u.id ? "…" : u.banned ? "Unsuspend" : "Suspend"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    No users match &ldquo;{query}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl"
            >
              {(() => {
                const target = rows.find(u => u.id === confirmId);
                const willSuspend = !target?.banned;
                return (
                  <>
                    <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white mb-2">
                      {willSuspend ? "Suspend this account?" : "Reinstate this account?"}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                      {willSuspend
                        ? `${target?.name} will be signed out immediately and won't be able to sign back in until reinstated.`
                        : `${target?.name} will be able to sign in again.`}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmId && handleSuspendConfirmed(confirmId)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          willSuspend
                            ? "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/25 hover:bg-red-100 dark:hover:bg-red-500/25"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300"
                        }`}
                      >
                        {willSuspend ? "Suspend" : "Reinstate"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Testimonials tab ─────────────────────────────────────────────────────────
function TestimonialsContent({
  testimonials, onToast,
}: {
  testimonials: AdminTestimonial[];
  onToast:      (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [rows, setRows]     = useState(testimonials);
  const [form, setForm]     = useState({ authorName: "", authorRole: "", body: "", metric: "", metricLabel: "", avatarUrl: "" });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.authorName.trim() || !form.authorRole.trim() || !form.body.trim() || !form.metric.trim() || !form.metricLabel.trim()) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/testimonials", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { onToast(data.error ?? "Failed to add testimonial.", "error"); return; }
      setRows(prev => [data.testimonial, ...prev]);
      setForm({ authorName: "", authorRole: "", body: "", metric: "", metricLabel: "", avatarUrl: "" });
      onToast("Testimonial added.", "success");
    } catch {
      onToast("Network error. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(id: string) {
    setBusyId(id);
    try {
      const res  = await fetch(`/api/admin/testimonials/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) { onToast(data.error ?? "Failed to update.", "error"); return; }
      setRows(prev => prev.map(t => t.id === id ? { ...t, published: data.published } : t));
      onToast(data.published ? "Now visible on the landing page." : "Hidden from the landing page.", "success");
    } catch {
      onToast("Network error. Try again.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) { onToast("Failed to delete.", "error"); return; }
      setRows(prev => prev.filter(t => t.id !== id));
      onToast("Testimonial deleted.", "success");
    } catch {
      onToast("Network error. Try again.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-5 space-y-3"
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600 mb-1">
          Add a testimonial
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={form.authorName}
            onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))}
            placeholder="Name (e.g. Priya Sharma)"
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 dark:focus:ring-zinc-100/8"
          />
          <input
            value={form.authorRole}
            onChange={e => setForm(p => ({ ...p, authorRole: e.target.value }))}
            placeholder="Role (e.g. Student, Delhi)"
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 dark:focus:ring-zinc-100/8"
          />
        </div>
        <textarea
          value={form.body}
          onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
          placeholder="What did they say?"
          rows={3}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 dark:focus:ring-zinc-100/8 resize-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={form.metric}
            onChange={e => setForm(p => ({ ...p, metric: e.target.value }))}
            placeholder="Highlighted stat (e.g. ₹600)"
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 dark:focus:ring-zinc-100/8"
          />
          <input
            value={form.metricLabel}
            onChange={e => setForm(p => ({ ...p, metricLabel: e.target.value }))}
            placeholder="Stat label (e.g. saved per month)"
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 dark:focus:ring-zinc-100/8"
          />
        </div>
        <input
          value={form.avatarUrl}
          onChange={e => setForm(p => ({ ...p, avatarUrl: e.target.value }))}
          placeholder="Photo URL (optional — falls back to initials)"
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 dark:focus:ring-zinc-100/8"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold px-4 py-2.5 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 transition-colors"
        >
          {saving ? "Adding…" : "Add testimonial"}
        </button>
      </form>

      {/* Existing testimonials */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
            {rows.length} testimonial{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-400 dark:text-zinc-600">
            No testimonials yet.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {rows.map(t => (
              <div key={t.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.authorName}</p>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">· {t.authorRole}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      t.published
                        ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}>
                      {t.published ? "Live" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    {t.metric} <span className="font-normal text-zinc-400 dark:text-zinc-600">{t.metricLabel}</span>
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{t.body}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => togglePublished(t.id)}
                    disabled={busyId === t.id}
                    className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-40 transition-colors"
                  >
                    {t.published ? "Hide" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={busyId === t.id}
                    className="text-[11px] font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function AdminClient({ currentUserId, analytics, users, testimonials }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Analytics");
  const [toast, setToast]         = useState<ToastState>(null);

  function showToast(msg: string, type: "success" | "error" | "info" = "info") {
    setToast({ msg, type });
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="sticky top-20 z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end gap-0 -mb-px">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="admin-tab-underline"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-200"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-1">
          Admin
        </p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {activeTab}
        </h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "Analytics"    && <AnalyticsContent analytics={analytics} />}
            {activeTab === "Users"        && <UsersContent currentUserId={currentUserId} users={users} onToast={showToast} />}
            {activeTab === "Testimonials" && <TestimonialsContent testimonials={testimonials} onToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
