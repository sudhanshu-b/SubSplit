"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import JoinButton from "@/components/join-button";
import HostRequests from "@/components/host-requests";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Service colors ─────────────────────────────────────────────────────────
const SERVICE_COLOR: Record<string, string> = {
  netflix:                "#E50914",
  spotify:                "#1DB954",
  "youtube premium":      "#FF0000",
  youtube:                "#FF0000",
  "icloud+":              "#3693F3",
  icloud:                 "#3693F3",
  notion:                 "#191919",
  "github copilot":       "#6941C6",
  github:                 "#24292E",
  perplexity:             "#1FB8CD",
  canva:                  "#00C4CC",
  "adobe creative cloud": "#FF0000",
  dropbox:                "#0061FF",
  duolingo:               "#58CC02",
  "1password":            "#0094F5",
  "apple tv+":            "#555555",
};

function svcColor(name: string) {
  return SERVICE_COLOR[name.toLowerCase()] ?? "#6366f1";
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; pulse?: boolean }> = {
  active:    { label: "active",    color: "#22c55e", pulse: true },
  full:      { label: "full",      color: "#3b82f6"              },
  draft:     { label: "draft",     color: "#a1a1aa"              },
  expired:   { label: "expired",   color: "#f87171"              },
  cancelled: { label: "cancelled", color: "#f87171"              },
};

// ── Types ──────────────────────────────────────────────────────────────────
export type ListingData = {
  id: string;
  title: string;
  description: string | null;
  totalSeats: number;
  priceTotal: string;
  pricePerSeat: string | null;
  currency: string;
  region: string | null;
  status: string;
  activeFrom: string | null;
  activeTill: string | null;
  createdAt: Date;
  serviceName: string;
  serviceCategory: string | null;
  hostId: string;
  hostName: string;
  durationDays: number | null;
  paymentTerms: string | null;
};

export type PendingRequest = {
  memberId: string;
  memberName: string;
  createdAt: Date;
};

// ── Helpers ────────────────────────────────────────────────────────────────
function Dot({ color, size = 8, pulse = false }: { color: string; size?: number; pulse?: boolean }) {
  return (
    <span
      className={`rounded-full flex-shrink-0 inline-block ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

function SlotDots({ active, total }: { active: number; total: number }) {
  const show = Math.min(total, 10);
  return (
    <span className="inline-flex items-center gap-[3px]">
      {Array.from({ length: show }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full ${i < active ? "bg-green-400" : "bg-zinc-200 dark:bg-zinc-700"}`}
          style={{ width: 6, height: 6 }}
        />
      ))}
      {total > 10 && <span className="text-[10px] text-zinc-400 ml-0.5">+{total - 10}</span>}
    </span>
  );
}

function formatDate(raw: string | null) {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function durationLabel(days: number | null) {
  if (!days) return null;
  if (days === 30)  return "Monthly";
  if (days === 60)  return "2 Months";
  if (days === 90)  return "Quarterly";
  if (days === 180) return "6 Months";
  if (days === 365) return "Annual";
  return `${days} days`;
}

function paymentLabel(terms: string | null) {
  if (!terms) return null;
  if (terms === "upfront")  return "Full upfront";
  if (terms === "split_30") return "50% now · 50% after 30 days";
  return terms;
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function ListingDrawer({
  listing,
  memberCount,
  remainingSeats,
  actionState,
  pendingRequests,
}: {
  listing: ListingData;
  memberCount: number;
  remainingSeats: number;
  actionState: "host" | "active" | "pending" | "rejected" | "full" | "join";
  pendingRequests: PendingRequest[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function close() {
    setOpen(false);
    setTimeout(() => router.back(), 300);
  }

  const color     = svcColor(listing.serviceName);
  const statusCfg = STATUS_CFG[listing.status] ?? STATUS_CFG.draft;
  const price     = listing.pricePerSeat ? Math.round(parseFloat(listing.pricePerSeat)) : null;
  const listedOn  = new Date(listing.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260, mass: 0.85 }}
            className="fixed bottom-0 left-0 right-0 z-50
                       max-h-[92vh] bg-white dark:bg-zinc-950
                       rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)]
                       dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)]
                       flex flex-col"
          >
            {/* Drag handle + close */}
            <div className="flex items-center justify-between px-5 sm:px-8 pt-4 pb-2 flex-shrink-0">
              <div className="w-10 h-[3px] rounded-full bg-zinc-200 dark:bg-zinc-800 mx-auto absolute left-1/2 -translate-x-1/2 top-4" />
              <div className="w-8" /> {/* spacer */}
              <button
                onClick={close}
                aria-label="Close"
                className="ml-auto flex items-center justify-center w-7 h-7 rounded-full
                           bg-zinc-100 dark:bg-zinc-800
                           text-zinc-500 dark:text-zinc-400
                           hover:bg-zinc-200 dark:hover:bg-zinc-700
                           transition-colors duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-14">

                {/* ── Service + status ─────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08, ease: EASE }}
                  className="flex items-center justify-between pt-2 pb-3"
                >
                  <div className="flex items-center gap-2">
                    <Dot color={color} size={9} pulse={listing.status === "active"} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                      {listing.serviceName}
                    </span>
                    {listing.serviceCategory && (
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                        · {listing.serviceCategory}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5">
                    <Dot color={statusCfg.color} size={6} pulse={statusCfg.pulse} />
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{statusCfg.label}</span>
                  </span>
                </motion.div>

                {/* ── Title ─────────────────────────────────────────────── */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12, ease: EASE }}
                  className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-5"
                >
                  {listing.title}
                </motion.h1>

                {/* ── Price hero ────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.16, ease: EASE }}
                  className="flex items-baseline gap-2 mb-3"
                >
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                    {price === 0 ? "Free" : `₹${price}`}
                  </span>
                  {price !== 0 && (
                    <span className="text-base text-zinc-400">
                      / seat · {durationLabel(listing.durationDays) ?? "mo"}
                    </span>
                  )}
                </motion.div>

                {/* ── Slot dots ─────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2, ease: EASE }}
                  className="flex items-center gap-3 mb-7"
                >
                  <SlotDots active={memberCount} total={listing.totalSeats} />
                  <span className="text-[12px] text-zinc-400">
                    {remainingSeats > 0 ? (
                      <>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{remainingSeats}</span>
                        {" "}of {listing.totalSeats} seats left
                      </>
                    ) : (
                      <span className="text-red-400 font-medium">No seats left</span>
                    )}
                  </span>
                </motion.div>

                {/* ── Divider ───────────────────────────────────────────── */}
                <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 mb-7" />

                {/* ── Action ────────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.24, ease: EASE }}
                  className="mb-7"
                >
                  {actionState === "join" && <JoinButton listingId={listing.id} />}

                  {actionState === "host" && (
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <Dot color="#6366f1" size={6} />
                        This is your listing
                      </span>
                      <Link
                        href={`/listings/${listing.id}/edit`}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        Edit →
                      </Link>
                    </div>
                  )}

                  {actionState === "active" && (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <Dot color="#22c55e" size={7} pulse />
                      You&rsquo;re an active member
                    </span>
                  )}

                  {actionState === "pending" && (
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Dot color="#f59e0b" size={6} />
                      Request pending · waiting for host
                    </span>
                  )}

                  {actionState === "rejected" && (
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Dot color="#f87171" size={6} />
                      Request declined by host
                    </span>
                  )}

                  {actionState === "full" && (
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Dot color="#a1a1aa" size={6} />
                      No seats available
                    </span>
                  )}
                </motion.div>

                {/* ── Description ───────────────────────────────────────── */}
                {listing.description && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.28, ease: EASE }}
                    className="mb-7"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-2">
                      About
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {listing.description}
                    </p>
                  </motion.div>
                )}

                {/* ── Divider ───────────────────────────────────────────── */}
                <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 mb-7" />

                {/* ── Host ──────────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3, ease: EASE }}
                  className="mb-7"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-3">
                    Host
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0
                                     bg-zinc-100 dark:bg-zinc-800
                                     text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {listing.hostName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {listing.hostName}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Listed {listedOn}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ── Plan meta ─────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.34, ease: EASE }}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 mb-8"
                >
                  <span>
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">{listing.totalSeats}</span> total seats
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span>
                    ₹{Math.round(parseFloat(listing.priceTotal))} full plan
                  </span>
                  {listing.durationDays && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                        {durationLabel(listing.durationDays)}
                      </span>
                    </>
                  )}
                  {listing.paymentTerms && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span>{paymentLabel(listing.paymentTerms)}</span>
                    </>
                  )}
                  {listing.region && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="uppercase">{listing.region}</span>
                    </>
                  )}
                  {listing.activeFrom && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span>from {formatDate(listing.activeFrom)}</span>
                    </>
                  )}
                  {listing.activeTill && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span>till {formatDate(listing.activeTill)}</span>
                    </>
                  )}
                </motion.div>

                {/* ── Host: pending requests ─────────────────────────────── */}
                {actionState === "host" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.38, ease: EASE }}
                  >
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 mb-7" />
                    <HostRequests listingId={listing.id} initialRequests={pendingRequests} />
                  </motion.div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
