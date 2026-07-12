"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Toast, type ToastState } from "@/components/ui/toast";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Types ──────────────────────────────────────────────────────────────────
export type PaymentInfo = {
  installmentNumber: number;
  paidAt:            string | null;
  transactionRef:    string | null;
  proofImageUrl:     string | null;
};

export type MemberRow = {
  membershipId:   string;
  memberId:       string;
  memberName:     string;
  memberImage:    string | null;
  status:         string;
  amountPaid:     string;
  joinedAt:       string | null;
  createdAt:      string;
  lastRemindedAt: string | null;
  payments:       PaymentInfo[];
};

export type ListingDetail = {
  id:              string;
  title:           string;
  description:     string | null;
  totalSeats:      number;
  priceTotal:      string;
  pricePerSeat:    string | null;
  currency:        string;
  status:          string;
  durationDays:    number | null;
  paymentTerms:    string | null;
  activeFrom:      string | null;
  activeTill:      string | null;
  serviceName:     string;
  serviceCategory: string | null;
  upiId:           string | null;
};

// ── Config ─────────────────────────────────────────────────────────────────
const MEMBERSHIP_STATUS: Record<string, { label: string; textColor: string; dotBg: string; pulse?: boolean }> = {
  active:   { label: "Active",    textColor: "text-green-600 dark:text-green-400", dotBg: "bg-green-500 dark:bg-green-400", pulse: true },
  pending:  { label: "Requested", textColor: "text-amber-600 dark:text-amber-400", dotBg: "bg-amber-500 dark:bg-amber-400"              },
  left:     { label: "Left",      textColor: "text-zinc-500  dark:text-zinc-500",  dotBg: "bg-zinc-400  dark:bg-zinc-600"               },
  removed:  { label: "Removed",   textColor: "text-zinc-500  dark:text-zinc-500",  dotBg: "bg-zinc-400  dark:bg-zinc-600"               },
  rejected: { label: "Rejected",  textColor: "text-zinc-500  dark:text-zinc-500",  dotBg: "bg-zinc-400  dark:bg-zinc-600"               },
};

const LISTING_STATUS: Record<string, { label: string; textColor: string; dotBg: string; pulse?: boolean }> = {
  recruiting:        { label: "Recruiting",        textColor: "text-zinc-600 dark:text-zinc-300",   dotBg: "bg-zinc-400 dark:bg-zinc-500"               },
  ready_to_purchase: { label: "Ready to Purchase", textColor: "text-zinc-700 dark:text-zinc-200",   dotBg: "bg-zinc-500 dark:bg-zinc-400", pulse: true  },
  active:            { label: "Active",            textColor: "text-green-600 dark:text-green-400", dotBg: "bg-green-500 dark:bg-green-400", pulse: true },
  completed:         { label: "Completed",         textColor: "text-zinc-600 dark:text-zinc-400",   dotBg: "bg-zinc-500 dark:bg-zinc-500"               },
  cancelled:         { label: "Cancelled",         textColor: "text-zinc-500 dark:text-zinc-600",   dotBg: "bg-zinc-400 dark:bg-zinc-600"               },
};

const TABS = ["Overview", "Members", "Actions"] as const;
type Tab = typeof TABS[number];

// ── Helpers ─────────────────────────────────────────────────────────────────
function avatarColor(name: string) {
  const palette = ["#E50914", "#1DB954", "#0061FF", "#6941C6", "#1FB8CD", "#FF9933", "#138808"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function formatDate(raw: string | null) {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function durationLabel(days: number | null) {
  if (!days) return null;
  const map: Record<number, string> = { 30: "Monthly", 60: "2 Months", 90: "Quarterly", 180: "6 Months", 365: "Annual" };
  return map[days] ?? `${days} days`;
}

// ── Atoms ──────────────────────────────────────────────────────────────────
function Dot({ bg, pulse = false }: { bg: string; pulse?: boolean }) {
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${bg} ${pulse ? "animate-pulse" : ""}`} />;
}

function Avatar({ name, image, size = "md" }: { name: string; image?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
  if (image) {
    return <img src={image} alt="" className={`${dim} rounded-full object-cover shrink-0`} />; // eslint-disable-line @next/next/no-img-element
  }
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center shrink-0 text-white font-bold`}
      style={{ backgroundColor: avatarColor(name) }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}


// ── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({
  title, body, confirmLabel, loading, onConfirm, onCancel,
}: {
  title: string; body: string; confirmLabel: string;
  loading?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-sm
                   bg-[#ffffff] dark:bg-zinc-900
                   rounded-2xl border border-zinc-200 dark:border-zinc-800
                   p-6 shadow-2xl"
      >
        <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">{body}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                       bg-zinc-100 dark:bg-zinc-800
                       text-zinc-700 dark:text-zinc-300
                       hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                       bg-red-50 dark:bg-red-500/15
                       text-red-600 dark:text-red-400
                       border border-red-200 dark:border-red-500/25
                       hover:bg-red-100 dark:hover:bg-red-500/25
                       transition-colors disabled:opacity-50"
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Edit description modal ─────────────────────────────────────────────────
function EditDescModal({
  initial, loading, onSave, onCancel,
}: {
  initial: string; loading?: boolean;
  onSave: (v: string) => void; onCancel: () => void;
}) {
  const [val, setVal] = useState(initial);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-md
                   bg-[#ffffff] dark:bg-zinc-900
                   rounded-2xl border border-zinc-200 dark:border-zinc-800
                   p-6 shadow-2xl"
      >
        <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white mb-4">Edit Description</h3>
        <textarea
          value={val}
          onChange={e => setVal(e.target.value)}
          rows={5}
          placeholder="Describe your listing…"
          className="w-full bg-zinc-50 dark:bg-zinc-900
                     border border-zinc-200 dark:border-zinc-700
                     rounded-xl px-4 py-3 text-sm
                     text-zinc-900 dark:text-zinc-100
                     placeholder-zinc-400 dark:placeholder-zinc-600
                     resize-none focus:outline-none
                     focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                       bg-zinc-100 dark:bg-zinc-800
                       text-zinc-700 dark:text-zinc-300
                       hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(val)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                       bg-zinc-900 dark:bg-zinc-100
                       text-white dark:text-zinc-900
                       hover:bg-zinc-700 dark:hover:bg-zinc-200
                       transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Payment details modal ──────────────────────────────────────────────────
function PaymentDetailsModal({
  member,
  onViewProof,
  onClose,
}: {
  member:      MemberRow;
  onViewProof: (url: string) => void;
  onClose:     () => void;
}) {
  const paid = member.payments.some(p => p.paidAt);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-sm
                   bg-[#ffffff] dark:bg-zinc-900
                   rounded-2xl border border-zinc-200 dark:border-zinc-800
                   shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider
                          text-zinc-500 dark:text-zinc-600 mb-0.5">
              Payment Details
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {member.memberName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
              paid
                ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/20"
                : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20"
            }`}>
              {paid ? "Paid" : "Pending"}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                         text-zinc-400 hover:text-zinc-700
                         dark:text-zinc-600 dark:hover:text-zinc-300
                         hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Installments */}
        <div className="px-5 py-4 space-y-3">
          {member.payments.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-600 text-center py-4">
              No payment records yet.
            </p>
          ) : (
            member.payments.map(p => (
              <div key={p.installmentNumber}
                   className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60
                              border border-zinc-100 dark:border-zinc-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider
                                  text-zinc-400 dark:text-zinc-600 mb-1">
                      {member.payments.length > 1 ? `Installment ${p.installmentNumber}` : "Payment"}
                    </p>
                    <p className={`text-sm font-semibold ${
                      p.paidAt
                        ? "text-green-700 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}>
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "Awaiting payment"}
                    </p>
                    {p.transactionRef && (
                      <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600 mt-0.5 break-all">
                        Ref: {p.transactionRef}
                      </p>
                    )}
                  </div>
                  {p.proofImageUrl && (
                    <button
                      onClick={() => onViewProof(p.proofImageUrl!)}
                      title="View proof"
                      className="shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.proofImageUrl}
                        alt="Payment proof"
                        className="w-14 h-14 rounded-xl object-cover
                                   border border-zinc-200 dark:border-zinc-700
                                   hover:opacity-80 transition-opacity"
                      />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function isRemindedToday(ts: string | null): boolean {
  if (!ts) return false;
  const d = new Date(ts), n = new Date();
  return d.getUTCFullYear() === n.getUTCFullYear() &&
    d.getUTCMonth()    === n.getUTCMonth()    &&
    d.getUTCDate()     === n.getUTCDate();
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function HostManageClient({
  listing,
  members: initialMembers,
  conversationId,
}: {
  listing:        ListingDetail;
  members:        MemberRow[];
  conversationId: string | null;
}) {
  const router      = useRouter();
  const [members, setMembers]      = useState<MemberRow[]>(initialMembers);
  const [loadingKey, setLoading]   = useState<string | null>(null);
  const [confirm, setConfirm]      = useState<"cancel" | null>(null);
  const [editDesc, setEditDesc]    = useState(false);
  const [editUpi, setEditUpi]      = useState(false);
  const [upiId, setUpiId]          = useState(listing.upiId ?? "");
  const [status, setStatus]        = useState(listing.status);
  const [toast, setToast]          = useState<ToastState>(null);
  const [viewingProof, setProof]   = useState<string | null>(null);
  const [activeTab, setActiveTab]  = useState<Tab>("Overview");
  const [remindingKey, setReminding]          = useState<string | null>(null);
  const [remindedSet, setRemindedSet]         = useState<Set<string>>(new Set());
  const [viewingPayments, setViewingPayments] = useState<MemberRow | null>(null);

  const activeCount  = members.filter(m => m.status === "active").length;
  const pendingCount = members.filter(m => m.status === "pending").length;
  const activeMembers   = members.filter(m => m.status === "active");
  const allMembersPaid  = activeMembers.length > 0 && activeMembers.every(m => m.payments.some(p => p.paidAt));
  const cancelLocked     = status === "active" && allMembersPaid;
  const statusCfg    = LISTING_STATUS[status] ?? LISTING_STATUS.recruiting;
  const price        = listing.pricePerSeat ? Math.round(parseFloat(listing.pricePerSeat)) : null;
  const sym          = listing.currency === "INR" ? "₹" : listing.currency === "USD" ? "$" : listing.currency + " ";

  function showToast(msg: string, type: "success" | "error" | "info" = "info") {
    setToast({ msg, type });
  }

  function shareListing() {
    const url = `${window.location.origin}/listings/${listing.id}`;
    navigator.clipboard.writeText(url).then(() => showToast("Link copied!", "success"));
  }

  async function handleMember(membershipId: string, memberId: string, action: "approve" | "reject") {
    const key = `${action}-${membershipId}`;
    setLoading(key);
    try {
      const res  = await fetch(`/api/listings/${listing.id}/requests/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Action failed.", "error"); return; }
      setMembers(prev =>
        prev.map(m => m.membershipId === membershipId
          ? { ...m, status: action === "approve" ? "active" : "rejected" }
          : m,
        ),
      );
      showToast(action === "approve" ? "Member approved." : "Request rejected.", "success");
    } catch { showToast("Network error. Try again.", "error"); }
    finally   { setLoading(null); }
  }

  async function handleListingStatus(newStatus: "recruiting" | "ready_to_purchase" | "active" | "completed" | "cancelled") {
    setLoading("listing");
    try {
      const res  = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Failed.", "error"); return; }
      setStatus(newStatus);
      setConfirm(null);
      const messages: Record<string, string> = {
        ready_to_purchase: "Minimum members reached!",
        active:            "Plan is now active.",
        completed:         "Plan marked as completed.",
        cancelled:         "Listing cancelled.",
      };
      showToast(messages[newStatus] ?? "Status updated.", "success");
    } catch { showToast("Network error. Try again.", "error"); }
    finally  { setLoading(null); }
  }

  async function handleSaveDesc(description: string) {
    setLoading("desc");
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) { showToast("Failed to save description.", "error"); return; }
      setEditDesc(false);
      showToast("Description updated.", "success");
      router.refresh();
    } catch { showToast("Network error. Try again.", "error"); }
    finally  { setLoading(null); }
  }

  async function handleSaveUpi(val: string) {
    setLoading("upi");
    try {
      const res  = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId: val }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Failed to save UPI ID.", "error"); return; }
      setUpiId(val);
      setEditUpi(false);
      showToast("UPI ID updated.", "success");
    } catch { showToast("Network error. Try again.", "error"); }
    finally  { setLoading(null); }
  }

  async function handleRemind(memberId: string, memberName: string) {
    setReminding(memberId);
    try {
      const res  = await fetch(`/api/listings/${listing.id}/members/${memberId}/remind`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Failed to send reminder.", "error"); return; }
      setRemindedSet(prev => new Set([...prev, memberId]));
      showToast(`Reminder sent to ${memberName.split(" ")[0]}.`, "success");
    } catch { showToast("Network error. Try again.", "error"); }
    finally   { setReminding(null); }
  }

  // ── Tab content ─────────────────────────────────────────────────────────

  const overviewContent = (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Status",   value: statusCfg.label, cls: statusCfg.textColor },
          { label: "Members",  value: `${activeCount} / ${listing.totalSeats}`, cls: "text-zinc-900 dark:text-zinc-100" },
          { label: "Price",    value: price ? `${sym}${price} / seat` : "—", cls: "text-zinc-900 dark:text-zinc-100" },
          {
            label: "Duration",
            value: listing.activeFrom && listing.activeTill
              ? `${formatDate(listing.activeFrom)} – ${formatDate(listing.activeTill)}`
              : (durationLabel(listing.durationDays) ?? "—"),
            cls: "text-zinc-900 dark:text-zinc-100",
          },
        ].map(s => (
          <div key={s.label}
               className="rounded-2xl px-4 py-4
                          bg-[#ffffff] dark:bg-zinc-900
                          border border-zinc-200 dark:border-zinc-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5
                          text-zinc-500 dark:text-zinc-600">
              {s.label}
            </p>
            <p className={`text-sm font-bold leading-snug ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider
                        text-zinc-500 dark:text-zinc-600">
            Description
          </p>
          <button
            onClick={() => setEditDesc(true)}
            className="text-[11px] font-semibold flex items-center gap-1
                       text-zinc-400 hover:text-zinc-700
                       dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
            Edit
          </button>
        </div>
        <p className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {listing.description ?? (
            <span className="text-zinc-400 dark:text-zinc-600 italic">No description added yet.</span>
          )}
        </p>
      </div>

      {/* UPI ID */}
      <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider
                        text-zinc-500 dark:text-zinc-600">
            UPI ID
          </p>
          {!editUpi && (
            <button
              onClick={() => setEditUpi(true)}
              className="text-[11px] font-semibold flex items-center gap-1
                         text-zinc-400 hover:text-zinc-700
                         dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              Edit
            </button>
          )}
        </div>
        <div className="px-5 py-4">
          {editUpi ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={upiId}
                onChange={e => setUpiId(e.target.value.trim())}
                placeholder="username@bank"
                className="flex-1 text-sm rounded-xl px-3 py-2.5
                           bg-zinc-50 dark:bg-zinc-800
                           border border-zinc-200 dark:border-zinc-700
                           text-zinc-900 dark:text-zinc-100
                           placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                           focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveUpi(upiId)}
                  disabled={loadingKey === "upi"}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold
                             bg-zinc-900 dark:bg-zinc-100
                             text-white dark:text-zinc-900
                             hover:bg-zinc-700 dark:hover:bg-white
                             transition-colors disabled:opacity-50"
                >
                  {loadingKey === "upi" ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => { setEditUpi(false); setUpiId(listing.upiId ?? ""); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold
                             bg-zinc-100 dark:bg-zinc-800
                             text-zinc-700 dark:text-zinc-300
                             hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : upiId ? (
            <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 select-all">{upiId}</p>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">
              No UPI ID added yet. Members won&apos;t be able to pay until you add one.
            </p>
          )}
        </div>
      </div>

      {/* Plan details */}
      <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider
                        text-zinc-500 dark:text-zinc-600">
            Plan Details
          </p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {[
            { key: "Service",      val: listing.serviceName },
            { key: "Seats",        val: `${listing.totalSeats} total` },
            { key: "Payment",      val: listing.paymentTerms === "split_30" ? "Split (30-day)" : "Upfront" },
            { key: "Total price",  val: `${sym}${Math.round(parseFloat(listing.priceTotal))}` },
            {
              key: "Period",
              val: listing.activeFrom && listing.activeTill
                ? `${formatDate(listing.activeFrom)} – ${formatDate(listing.activeTill)}`
                : (durationLabel(listing.durationDays) ?? "—"),
            },
          ].map(row => (
            <div key={row.key} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3">
              <span className="text-sm text-zinc-400 dark:text-zinc-600">{row.key}</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{row.val}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  const membersContent = (
    <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">

      {/* Seat fill bar */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60
                      flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {activeCount} / {listing.totalSeats} seats filled
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                · {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(listing.totalSeats, 10) }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < activeCount ? "bg-green-500 dark:bg-green-400" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            />
          ))}
          {listing.totalSeats > 10 && (
            <span className="text-[10px] ml-1 text-zinc-400 dark:text-zinc-600">
              +{listing.totalSeats - 10}
            </span>
          )}
        </div>
      </div>

      {members.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-700">No members yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">

          {/* Pending first */}
          {members.filter(m => m.status === "pending").map((m, i) => (
            <motion.div
              key={m.membershipId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04, ease: EASE }}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <Avatar name={m.memberName} image={m.memberImage} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {m.memberName}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Requested {formatDate(m.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleMember(m.membershipId, m.memberId, "approve")}
                  disabled={loadingKey === `approve-${m.membershipId}`}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50
                             text-green-700 dark:text-green-400
                             bg-green-50 dark:bg-green-400/10
                             border border-green-200 dark:border-green-400/20
                             hover:bg-green-100 dark:hover:bg-green-400/20"
                >
                  {loadingKey === `approve-${m.membershipId}` ? "…" : "Approve"}
                </button>
                <button
                  onClick={() => handleMember(m.membershipId, m.memberId, "reject")}
                  disabled={loadingKey === `reject-${m.membershipId}`}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50
                             text-zinc-600 dark:text-zinc-400
                             bg-zinc-100 dark:bg-zinc-800
                             border border-zinc-200 dark:border-zinc-700
                             hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  {loadingKey === `reject-${m.membershipId}` ? "…" : "Decline"}
                </button>
              </div>
            </motion.div>
          ))}

          {/* Active members */}
          {members.filter(m => m.status === "active").map((m, i) => {
            const paid            = m.payments.some(p => p.paidAt);
            const alreadyReminded = remindedSet.has(m.memberId) || isRemindedToday(m.lastRemindedAt);
            const isReminding     = remindingKey === m.memberId;
            return (
              <motion.div
                key={m.membershipId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: (pendingCount + i) * 0.04, ease: EASE }}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <Avatar name={m.memberName} image={m.memberImage} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {m.memberName}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
                    Joined {formatDate(m.joinedAt ?? m.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">

                  {/* Paid / Pending badge */}
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                    paid
                      ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/20"
                      : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20"
                  }`}>
                    {paid ? "Paid" : "Pending"}
                  </span>

                  {/* Payment details button */}
                  <button
                    onClick={() => setViewingPayments(m)}
                    title="View payment details"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               text-zinc-400 hover:text-zinc-700
                               dark:text-zinc-600 dark:hover:text-zinc-300
                               hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </button>

                  {/* Chat icon */}
                  {conversationId && (
                    <Link
                      href={`/messages/${conversationId}`}
                      title="Group chat"
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                                 text-zinc-400 hover:text-zinc-700
                                 dark:text-zinc-600 dark:hover:text-zinc-300
                                 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                      </svg>
                    </Link>
                  )}

                  {/* Remind button — only when plan active + member unpaid */}
                  {status === "active" && !paid && (
                    <button
                      onClick={() => handleRemind(m.memberId, m.memberName)}
                      disabled={isReminding || alreadyReminded}
                      title={alreadyReminded ? "Reminder sent today" : "Send payment reminder"}
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg
                                  transition-colors disabled:opacity-60 ${
                        alreadyReminded
                          ? "text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50"
                          : "text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {isReminding ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : alreadyReminded ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                      )}
                      {isReminding ? "" : alreadyReminded ? "Reminded" : "Remind"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Left / rejected (collapsed into a subtle list) */}
          {members.filter(m => ["left", "removed", "rejected"].includes(m.status)).map(m => {
            const mCfg = MEMBERSHIP_STATUS[m.status] ?? MEMBERSHIP_STATUS.left;
            return (
              <div key={m.membershipId} className="flex items-center gap-3 px-5 py-3 opacity-50">
                <Avatar name={m.memberName} image={m.memberImage} size="sm" />
                <p className="text-sm text-zinc-500 dark:text-zinc-600 flex-1 truncate">
                  {m.memberName}
                </p>
                <span className={`text-[11px] font-semibold ${mCfg.textColor}`}>
                  {mCfg.label}
                </span>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );

  const isDone = ["completed", "cancelled"].includes(status);

  const actionsContent = (
    <div className="space-y-4 max-w-2xl">

      {/* Status progression */}
      <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider
                        text-zinc-500 dark:text-zinc-600">
            Plan Status
          </p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-2">
            <Dot bg={statusCfg.dotBg} pulse={statusCfg.pulse} />
            <span className={`text-sm font-semibold ${statusCfg.textColor}`}>
              {statusCfg.label}
            </span>
          </div>

          {status === "recruiting" && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Mark minimum reached
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                  Close recruiting once enough members have joined to proceed.
                </p>
              </div>
              <button
                onClick={() => handleListingStatus("ready_to_purchase")}
                disabled={loadingKey === "listing"}
                className="shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl
                           transition-all disabled:opacity-40
                           bg-zinc-900 dark:bg-zinc-800
                           text-white dark:text-zinc-100
                           hover:bg-zinc-700 dark:hover:bg-zinc-700"
              >
                Mark reached
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          )}

          {status === "ready_to_purchase" && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Activate plan
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                  Confirm payment was collected and start the subscription.
                </p>
              </div>
              <button
                onClick={() => handleListingStatus("active")}
                disabled={loadingKey === "listing"}
                className="shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl
                           transition-all disabled:opacity-40
                           bg-zinc-900 dark:bg-zinc-800
                           text-white dark:text-zinc-100
                           hover:bg-zinc-700 dark:hover:bg-zinc-700"
              >
                Activate
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          )}

          {status === "active" && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Mark as completed
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                  Close this listing once the subscription period has ended.
                </p>
              </div>
              <button
                onClick={() => handleListingStatus("completed")}
                disabled={loadingKey === "listing"}
                className="shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl
                           transition-all disabled:opacity-40
                           bg-zinc-900 dark:bg-zinc-800
                           text-white dark:text-zinc-100
                           hover:bg-zinc-700 dark:hover:bg-zinc-700"
              >
                Complete
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </button>
            </div>
          )}

          {isDone && (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">
              No further transitions available.
            </p>
          )}
        </div>
      </div>

      {/* Create similar */}
      <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider
                        text-zinc-500 dark:text-zinc-600">
            Listing
          </p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Create a similar listing
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
              Reuse these plan details to quickly list another subscription.
            </p>
          </div>
          <Link
            href="/listings/new"
            className="shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl
                       text-zinc-700 dark:text-zinc-300
                       bg-zinc-50 dark:bg-zinc-800/60
                       border border-zinc-200 dark:border-zinc-700
                       hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Create
            <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Danger zone */}
      {!isDone && (
        <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                        border border-red-200 dark:border-red-500/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 dark:border-red-500/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-500">
              Danger Zone
            </p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Cancel listing
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                {cancelLocked
                  ? "All members have paid — this plan can no longer be cancelled."
                  : "This will stop accepting new members."}
              </p>
            </div>
            <button
              onClick={() => setConfirm("cancel")}
              disabled={cancelLocked}
              title={cancelLocked ? "All members have paid — cancellation is locked." : undefined}
              className="shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl
                         text-red-600 dark:text-red-400
                         bg-red-50 dark:bg-red-400/10
                         border border-red-200 dark:border-red-400/20
                         hover:bg-red-100 dark:hover:bg-red-400/20 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50 dark:disabled:hover:bg-red-400/10"
            >
              {cancelLocked && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              )}
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-30
                      bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md
                      border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Tab bar + chat shortcut */}
          <div className="flex items-center">
            <div className="flex items-end gap-0 -mb-px flex-1">
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
                {tab === "Members" && pendingCount > 0 && (
                  <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full
                                   bg-amber-100 text-amber-700
                                   dark:bg-zinc-800 dark:text-zinc-400">
                    {pendingCount}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-200"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
            </div>

            <button
              type="button"
              onClick={shareListing}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 mb-1 rounded-xl text-[11px] font-semibold
                         text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100
                         dark:hover:text-zinc-100 dark:hover:bg-zinc-800
                         transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185z" />
              </svg>
              Share
            </button>

          </div>

        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {activeTab === "Overview" && overviewContent}
            {activeTab === "Members" && membersContent}
            {activeTab === "Actions" && actionsContent}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editDesc && (
          <EditDescModal
            initial={listing.description ?? ""}
            loading={loadingKey === "desc"}
            onSave={handleSaveDesc}
            onCancel={() => setEditDesc(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm === "cancel" && (
          <ConfirmDialog
            title="Cancel this listing?"
            body="The listing will be cancelled. No new members will be accepted and it will be hidden from browse."
            confirmLabel="Cancel Listing"
            loading={loadingKey === "listing"}
            onConfirm={() => handleListingStatus("cancelled")}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {viewingPayments && (
          <PaymentDetailsModal
            member={viewingPayments}
            onViewProof={url => setProof(url)}
            onClose={() => setViewingPayments(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Proof lightbox ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingProof && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setProof(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingProof}
                alt="Payment proof"
                className="w-full rounded-2xl shadow-2xl object-contain max-h-[75vh]"
              />
              <button
                onClick={() => setProof(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full
                           bg-[#ffffff] dark:bg-zinc-800
                           text-zinc-700 dark:text-zinc-300
                           shadow-lg flex items-center justify-center
                           hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
