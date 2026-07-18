"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Toast, type ToastState, type ToastType } from "@/components/ui/toast";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Types ──────────────────────────────────────────────────────────────────
export type PlanListing = {
  id:           string;
  title:        string;
  serviceName:  string;
  status:       string;
  pricePerSeat: string | null;
  currency:     string;
  activeTill:   string | null;
  durationDays: number | null;
  paymentTerms: string | null;
  upiId:        string | null;
  hostName:     string;
  hostId:       string;
};

export type ExistingReview = {
  id:      string;
  rating:  number;
  comment: string | null;
};

export type PaymentRecord = {
  id:                string;
  installmentNumber: number;
  amount:            string | null;
  paidAt:            string | null;
  transactionRef:    string | null;
  proofImageUrl:     string | null;
};

export type GroupMember = {
  name:   string;
  image:  string | null;
  isYou:  boolean;
  isHost: boolean;
};

// ── Static maps ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; dotBg: string; text: string; pulse?: boolean }> = {
  recruiting:        { label: "Recruiting",        dotBg: "bg-zinc-400 dark:bg-zinc-500",   text: "text-zinc-600 dark:text-zinc-300"               },
  ready_to_purchase: { label: "Ready to Purchase", dotBg: "bg-zinc-500 dark:bg-zinc-400",   text: "text-zinc-700 dark:text-zinc-200", pulse: true   },
  active:            { label: "Active",            dotBg: "bg-green-500 dark:bg-green-400", text: "text-green-600 dark:text-green-400", pulse: true },
  completed:         { label: "Completed",         dotBg: "bg-zinc-400 dark:bg-zinc-600",   text: "text-zinc-500 dark:text-zinc-500"               },
  cancelled:         { label: "Cancelled",         dotBg: "bg-red-400",                     text: "text-red-500 dark:text-red-400"                 },
};

type Tab = "Overview" | "Payment" | "Members";
const TABS: Tab[] = ["Overview", "Payment", "Members"];

// ── Helpers ────────────────────────────────────────────────────────────────

function avatarColor(name: string) {
  const palette = ["#E50914", "#1DB954", "#0061FF", "#6941C6", "#1FB8CD", "#FF9933", "#138808"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function fmtDate(raw: string | null) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtShort(raw: string | null) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function currSym(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c + " ";
}

function durationLabel(days: number | null): string | null {
  if (!days) return null;
  if (days % 365 === 0) return `${days / 365} yr${days / 365 !== 1 ? "s" : ""}`;
  if (days % 30  === 0) return `${days / 30} mo`;
  return `${days} days`;
}

async function resizeToDataUrl(file: File, maxPx = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}


// ── Star rating ────────────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value:    number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => { if (!readonly) setHovered(star); }}
          onMouseLeave={() => { if (!readonly) setHovered(0); }}
          className={`transition-transform ${
            !readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-8 h-8 transition-colors ${
              star <= active ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"
            }`}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ── Review section ──────────────────────────────────────────────────────────
function ReviewSection({
  listingId,
  initialReview,
  onToast,
}: {
  listingId:     string;
  initialReview: ExistingReview | null;
  onToast:       (msg: string, type?: ToastType) => void;
}) {
  const [submitted, setSubmitted] = useState<ExistingReview | null>(initialReview);
  const [rating,    setRating]    = useState(initialReview?.rating ?? 0);
  const [comment,   setComment]   = useState(initialReview?.comment ?? "");
  const [saving,    setSaving]    = useState(false);

  async function handleSubmit() {
    if (rating === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/reviews`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { onToast(data.error ?? "Failed to submit review.", "error"); return; }
      setSubmitted({ id: data.id, rating, comment: comment.trim() || null });
      onToast("Review submitted — thank you!", "success");
    } catch {
      onToast("Network error. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
            Your Review
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <StarRating value={submitted.rating} readonly />
          {submitted.comment && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
              &ldquo;{submitted.comment}&rdquo;
            </p>
          )}
          <p className="text-xs text-zinc-400 dark:text-zinc-600">Thank you for your feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
          Rate Your Experience
        </p>
      </div>
      <div className="px-5 py-4 space-y-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">Rate your experience with the host.</p>
        <StarRating value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Leave a comment (optional)"
          rows={3}
          className="w-full bg-zinc-50 dark:bg-zinc-800
                     border border-zinc-200 dark:border-zinc-700
                     rounded-xl px-4 py-3 text-sm
                     text-zinc-900 dark:text-zinc-100
                     placeholder-zinc-400 dark:placeholder-zinc-600
                     focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500
                     resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || saving}
          className="w-full py-2.5 rounded-xl text-sm font-semibold
                     bg-zinc-900 dark:bg-white
                     text-white dark:text-zinc-900
                     hover:bg-zinc-700 dark:hover:bg-zinc-100
                     disabled:opacity-40 transition-colors"
        >
          {saving ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

// ── UPI card ───────────────────────────────────────────────────────────────
function UpiCard({ upiId, hostName }: { upiId: string; hostName: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
          Pay to Host
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
          Send your payment to {hostName} using any UPI app.
        </p>
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-9 h-9 rounded-xl bg-[#097939]/10 dark:bg-[#097939]/15 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L8 28h9.6L24 44l6.4-16H40L24 4z" fill="#097939"/>
          </svg>
        </div>
        <p className="flex-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all select-all">
          {upiId}
        </p>
        <button
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg
                      transition-all duration-200 ${
            copied
              ? "bg-green-50 dark:bg-green-400/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-400/20"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800/40">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
          After paying, mark it as paid in <strong className="text-zinc-600 dark:text-zinc-400">My Payment</strong> below and upload your proof.
        </p>
      </div>
    </div>
  );
}

// ── Payment section ────────────────────────────────────────────────────────
function PaymentSection({
  isSplit,
  payments,
  membershipId,
  onPaymentSaved,
  onToast,
}: {
  isSplit:        boolean;
  payments:       PaymentRecord[];
  membershipId:   string;
  onPaymentSaved: (p: PaymentRecord) => void;
  onToast:        (msg: string, type?: ToastType) => void;
}) {
  const expectedSlots = isSplit ? [1, 2] : [1];
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const [uploading,    setUploading]    = useState<number | null>(null);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [editingRef,   setEditingRef]   = useState<number | null>(null);
  const [refDraft,     setRefDraft]     = useState("");

  function getPayment(slot: number) {
    return payments.find(p => p.installmentNumber === slot) ?? null;
  }

  function getDueLabel(slot: number) {
    if (slot === 1) return "Due now";
    const p1 = getPayment(1);
    if (!p1?.paidAt) return "After first payment";
    const due = new Date(p1.paidAt);
    due.setDate(due.getDate() + 30);
    const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
    if (days <= 0) return "Overdue";
    return `Due in ${days} day${days === 1 ? "" : "s"}`;
  }

  async function handleFile(slot: number, file: File) {
    setUploading(slot);
    try {
      const proofImageUrl = await resizeToDataUrl(file);
      const existing = getPayment(slot);
      const res = await fetch(`/api/memberships/${membershipId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installmentNumber: slot,
          proofImageUrl,
          transactionRef: existing?.transactionRef ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { onToast(data.error ?? "Upload failed.", "error"); return; }
      onPaymentSaved({
        id:                data.id ?? existing?.id ?? "",
        installmentNumber: slot,
        amount:            existing?.amount ?? null,
        paidAt:            new Date().toISOString(),
        transactionRef:    existing?.transactionRef ?? null,
        proofImageUrl,
      });
      onToast("Payment proof uploaded.", "success");
    } finally {
      setUploading(null);
    }
  }

  async function handleSaveRef(slot: number) {
    const existing = getPayment(slot);
    const res = await fetch(`/api/memberships/${membershipId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        installmentNumber: slot,
        transactionRef:    refDraft.trim() || null,
        proofImageUrl:     existing?.proofImageUrl ?? null,
        paidAt:            existing?.paidAt ?? null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { onToast(data.error ?? "Failed to save reference.", "error"); return; }
    const base: PaymentRecord = existing ?? {
      id: data.id ?? "", installmentNumber: slot,
      amount: null, paidAt: null, transactionRef: null, proofImageUrl: null,
    };
    onPaymentSaved({ ...base, transactionRef: refDraft.trim() || null });
    setEditingRef(null);
    onToast("Transaction reference saved.", "success");
  }

  return (
    <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
      {expectedSlots.map((slot, idx) => {
        const payment  = getPayment(slot);
        const isPaid   = !!payment?.paidAt;
        const dueLabel = getDueLabel(slot);
        const fileRef  = fileRefs[idx];

        return (
          <div
            key={slot}
            className={idx > 0 ? "border-t border-zinc-200 dark:border-zinc-800/60" : ""}
          >
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
                {isSplit ? `Payment ${slot}` : "My Payment"}
              </p>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">

              <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3">
                <span className="text-sm text-zinc-400 dark:text-zinc-600">Status</span>
                <span className={`text-sm font-semibold ${
                  isPaid ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  {isPaid ? "Paid" : dueLabel}
                </span>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3">
                <span className="text-sm text-zinc-400 dark:text-zinc-600">Date</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {isPaid ? fmtDate(payment!.paidAt) : "—"}
                </span>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3 items-center">
                <span className="text-sm text-zinc-400 dark:text-zinc-600">Transaction ref</span>
                <div>
                  {editingRef === slot ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={refDraft}
                        onChange={e => setRefDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter")  handleSaveRef(slot);
                          if (e.key === "Escape") setEditingRef(null);
                        }}
                        placeholder="UPI / ref ID"
                        className="flex-1 min-w-0 bg-zinc-50 dark:bg-zinc-800
                                   border border-zinc-200 dark:border-zinc-700
                                   rounded-lg px-2.5 py-1.5 text-xs
                                   text-zinc-900 dark:text-zinc-100
                                   placeholder-zinc-400 dark:placeholder-zinc-600
                                   focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                      />
                      <button
                        onClick={() => handleSaveRef(slot)}
                        className="text-xs font-bold text-zinc-900 dark:text-zinc-100 shrink-0
                                   hover:opacity-70 transition-opacity"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingRef(null)}
                        className="text-xs text-zinc-400 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setRefDraft(payment?.transactionRef ?? ""); setEditingRef(slot); }}
                      className="text-left group"
                    >
                      {payment?.transactionRef ? (
                        <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100 group-hover:underline">
                          {payment.transactionRef}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400 dark:text-zinc-600
                                         group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                          Add ref ID
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3 items-center">
                <span className="text-sm text-zinc-400 dark:text-zinc-600">Proof</span>
                <div className="flex items-center gap-2.5">
                  {payment?.proofImageUrl && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <button onClick={() => setViewingProof(payment.proofImageUrl!)}>
                        <img
                          src={payment.proofImageUrl}
                          alt="Payment proof thumbnail"
                          className="w-10 h-10 rounded-lg object-cover
                                     border border-zinc-200 dark:border-zinc-700
                                     hover:opacity-80 transition-opacity"
                        />
                      </button>
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading === slot}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600
                                   dark:hover:text-zinc-300 transition-colors"
                      >
                        Replace
                      </button>
                    </>
                  )}
                  {!payment?.proofImageUrl && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading === slot}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold
                                 text-zinc-600 dark:text-zinc-400
                                 hover:text-zinc-900 dark:hover:text-zinc-100
                                 disabled:opacity-50 transition-colors"
                    >
                      {uploading === slot ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2
                                           border-zinc-400 border-t-transparent animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                               stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                          </svg>
                          Upload photo
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(slot, f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        );
      })}

      {/* Proof viewer lightbox */}
      <AnimatePresence>
        {viewingProof && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingProof(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: EASE }}
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
                onClick={() => setViewingProof(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full
                           bg-[#ffffff] dark:bg-zinc-800
                           text-zinc-700 dark:text-zinc-300
                           shadow-lg flex items-center justify-center
                           hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2.5}>
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

// ── Root ───────────────────────────────────────────────────────────────────
export default function MemberPlanClient({
  membershipId,
  listing,
  payments: initialPayments,
  members,
  existingReview,
}: {
  membershipId:   string;
  listing:        PlanListing;
  payments:       PaymentRecord[];
  members:        GroupMember[];
  existingReview: ExistingReview | null;
}) {
  const router = useRouter();
  const [activeTab,    setActiveTab]    = useState<Tab>("Overview");
  const [payments,     setPayments]     = useState<PaymentRecord[]>(initialPayments);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving,      setLeaving]      = useState(false);
  const [toast,        setToast]        = useState<ToastState>(null);

  const sym       = currSym(listing.currency);
  const price     = listing.pricePerSeat ? Math.round(parseFloat(listing.pricePerSeat)) : null;
  const isSplit   = listing.paymentTerms === "split_30";
  const statusCfg = STATUS_CFG[listing.status] ?? STATUS_CFG.recruiting;

  function handlePaymentSaved(p: PaymentRecord) {
    setPayments(prev => {
      const exists = prev.some(x => x.installmentNumber === p.installmentNumber);
      return exists
        ? prev.map(x => x.installmentNumber === p.installmentNumber ? p : x)
        : [...prev, p];
    });
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      const res = await fetch(`/api/memberships/${membershipId}/leave`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setToast({ msg: data.error ?? "Failed to leave.", type: "error" });
        return;
      }
      setToast({ msg: "You have left the plan.", type: "success" });
      setTimeout(() => router.push("/home"), 1000);
    } catch {
      setToast({ msg: "Network error. Try again.", type: "error" });
    } finally {
      setLeaving(false);
      setConfirmLeave(false);
    }
  }

  // ── Tab content ──────────────────────────────────────────────────────────

  const overviewContent = (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Status",     value: statusCfg.label,  cls: statusCfg.text },
          { label: "Host",       value: listing.hostName, cls: "text-zinc-900 dark:text-zinc-100" },
          { label: "Seat Price", value: price ? `${sym}${price}` : "—", cls: "text-zinc-900 dark:text-zinc-100" },
          {
            label: "Ends",
            value: listing.activeTill
              ? fmtShort(listing.activeTill)
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

      {/* Plan Details card */}
      <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
            Plan Details
          </p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {/* Host row — links to host profile */}
          <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3">
            <span className="text-sm text-zinc-400 dark:text-zinc-600">Host</span>
            <Link
              href={`/hosts/${listing.hostId}`}
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100
                         hover:underline underline-offset-2 w-fit"
            >
              {listing.hostName} →
            </Link>
          </div>
          {[
            { key: "Payment",  val: isSplit ? "Split (30-day)" : "Upfront" },
            { key: "Price",    val: price ? `${sym}${price} / seat` : "—" },
            {
              key: "Duration",
              val: listing.activeTill
                ? `Ends ${fmtDate(listing.activeTill)}`
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

      {/* Review — only when completed */}
      {listing.status === "completed" && (
        <ReviewSection
          listingId={listing.id}
          initialReview={existingReview}
          onToast={(msg, type) => setToast({ msg, type: type ?? "info" })}
        />
      )}

      {/* Danger zone — only while still recruitable */}
      {["recruiting", "ready_to_purchase"].includes(listing.status) && (
        <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                        border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
              Danger Zone
            </p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Leave Plan</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                You&apos;ll lose access to this subscription.
              </p>
            </div>
            <button
              onClick={() => setConfirmLeave(true)}
              className="shrink-0 text-sm font-semibold px-4 py-2 rounded-xl
                         text-red-600 dark:text-red-400
                         bg-red-50 dark:bg-red-400/10
                         border border-red-200 dark:border-red-400/20
                         hover:bg-red-100 dark:hover:bg-red-400/20
                         transition-colors"
            >
              Leave Plan
            </button>
          </div>
        </div>
      )}

    </div>
  );

  const paymentContent = (
    <div className="space-y-6">
      {listing.upiId && (
        <UpiCard upiId={listing.upiId} hostName={listing.hostName} />
      )}
      <PaymentSection
        isSplit={isSplit}
        payments={payments}
        membershipId={membershipId}
        onPaymentSaved={handlePaymentSaved}
        onToast={(msg, type) => setToast({ msg, type: type ?? "info" })}
      />
    </div>
  );

  const membersContent = (
    <div className="rounded-2xl bg-[#ffffff] dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-600">
          Group Members
        </p>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            {m.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center
                           text-white text-xs font-bold"
                style={{ backgroundColor: avatarColor(m.name) }}
              >
                {m.name[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {m.name}
              </span>
              {m.isYou && (
                <span className="ml-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-600">
                  (You)
                </span>
              )}
            </div>
            {m.isHost && (
              <span className="text-[10px] font-bold uppercase tracking-wider shrink-0
                               text-zinc-600 dark:text-zinc-400
                               bg-zinc-100 dark:bg-zinc-800
                               border border-zinc-200 dark:border-zinc-700
                               rounded-full px-2 py-0.5">
                Host
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    Overview: overviewContent,
    Payment:  paymentContent,
    Members:  membersContent,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e10] -mt-5">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-15 z-30
                      bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md
                      border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
                    layoutId="member-tab-underline"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-200"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Leave confirm dialog ─────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmLeave(false)}
            />
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
              <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white mb-2">
                Leave this plan?
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                You&apos;ll lose access to{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  {listing.serviceName}
                </span>
                . The host will be notified.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLeave(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                             bg-zinc-100 dark:bg-zinc-800
                             text-zinc-700 dark:text-zinc-300
                             hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeave}
                  disabled={leaving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                             bg-red-50 dark:bg-red-500/15
                             text-red-600 dark:text-red-400
                             border border-red-200 dark:border-red-500/25
                             hover:bg-red-100 dark:hover:bg-red-500/25
                             transition-colors disabled:opacity-50"
                >
                  {leaving ? "Leaving…" : "Leave Plan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
