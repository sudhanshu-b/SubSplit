"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Types ──────────────────────────────────────────────────────────────────
export type HostInfo = {
  id:         string;
  name:       string;
  image:      string | null;
  createdAt:  string;
  trustScore: string | null;
};

export type ListingRow = {
  id:           string;
  title:        string;
  status:       string;
  totalSeats:   number;
  pricePerSeat: string | null;
  currency:     string;
  durationDays: number | null;
  serviceName:  string;
};

export type ReviewRow = {
  id:           string;
  rating:       number;
  comment:      string | null;
  createdAt:    string;
  reviewerName: string;
};

export type ProfileStats = {
  totalListings:    number;
  activeListings:   number;
  completedListings: number;
  membersHosted:    number;
  reviewCount:      number;
  avgRating:        number | null;
};

// ── Static maps ────────────────────────────────────────────────────────────
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

const STATUS: Record<string, { label: string; color: string; pulse?: boolean }> = {
  recruiting:        { label: "recruiting",        color: "#a1a1aa"               },
  ready_to_purchase: { label: "ready to purchase", color: "#6366f1", pulse: true  },
  active:            { label: "active",            color: "#22c55e", pulse: true  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function svcColor(name: string) {
  return SERVICE_COLOR[name.toLowerCase()] ?? "#6366f1";
}

function avatarColor(name: string) {
  const palette = ["#6366f1", "#0061FF", "#1DB954", "#E50914", "#1FB8CD", "#6941C6", "#FF9933"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function fmtMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function shortName(full: string) {
  const parts = full.trim().split(/\s+/);
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function currSym(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c + " ";
}

function trustLabel(avg: number | null, count: number) {
  if (!avg || count === 0) return "New Host";
  if (avg >= 4.5)          return "Top Rated";
  if (avg >= 4.0)          return "Trusted Host";
  return                          "Good Host";
}

// ── Atoms ──────────────────────────────────────────────────────────────────
function Dot({ color, size = 8, pulse = false }: { color: string; size?: number; pulse?: boolean }) {
  return (
    <span
      className={`rounded-full flex-shrink-0 inline-block ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 20 20" fill="currentColor"
             className={s <= Math.round(rating) ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ── Listing row (mirrors dashboard HostedRow) ──────────────────────────────
function PlanRow({ listing, delay }: { listing: ListingRow; delay: number }) {
  const color   = svcColor(listing.serviceName);
  const status  = STATUS[listing.status] ?? { label: listing.status, color: "#a1a1aa" };
  const price   = listing.pricePerSeat ? Math.round(parseFloat(listing.pricePerSeat)) : null;
  const sym     = currSym(listing.currency);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="group py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Dot color={color} size={10} pulse={listing.status === "active"} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug truncate">
              {listing.title}
            </p>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
              <span className="text-[11px] text-zinc-400">{listing.serviceName}</span>
              {price !== null && (
                <span className="text-[11px] text-zinc-400">{sym}{price}/seat</span>
              )}
              <span className="text-[11px] text-zinc-400">{listing.totalSeats} seats</span>
              <Dot color={status.color} size={5} pulse={status.pulse} />
              <span className="text-[11px] text-zinc-400 -ml-1.5">{status.label}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/listings/${listing.id}`}
          className="flex-shrink-0 text-[11px] font-semibold text-zinc-400
                     hover:text-zinc-900 dark:hover:text-zinc-100
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                     transition-all duration-150 pt-0.5"
        >
          View →
        </Link>
      </div>
    </motion.div>
  );
}

// ── Review row ─────────────────────────────────────────────────────────────
function ReviewCard({ review, delay }: { review: ReviewRow; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <Stars rating={review.rating} size={12} />
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          {shortName(review.reviewerName)}
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          {fmtDate(review.createdAt)}
        </span>
      </div>
      {review.comment && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
    </motion.div>
  );
}

// ── Stat block ─────────────────────────────────────────────────────────────
function StatBlock({
  value,
  label,
  delay,
  accent = false,
}: {
  value: number;
  label: string;
  delay: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className="flex items-baseline gap-2"
    >
      <span
        className={`text-4xl sm:text-5xl font-black tracking-tight leading-none tabular-nums
          ${accent
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-400 dark:text-zinc-600"
          }`}
      >
        {value}
      </span>
      <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
    </motion.div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function HostProfileClient({
  host,
  listings,
  reviews,
  stats,
}: {
  host:     HostInfo;
  listings: ListingRow[];
  reviews:  ReviewRow[];
  stats:    ProfileStats;
}) {
  const initials   = host.name.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const bgColor    = avatarColor(host.name);
  // Use the Bayesian-adjusted trust score stored on the user record
  const trustScore = host.trustScore ? parseFloat(host.trustScore) : null;
  const trust      = trustLabel(trustScore, stats.reviewCount);

  return (
    <main className="bg-zinc-50 dark:bg-[#0e0e10] min-h-[calc(100vh-80px)]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <FadeUp delay={0.04}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]
                        text-zinc-400 dark:text-zinc-600 mb-4">
            Host Profile
          </p>

          {/* Avatar + name */}
          <div className="flex items-center gap-3.5 mb-3">
            {host.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={host.image} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
            ) : (
              <div
                className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center
                           text-white text-sm font-bold"
                style={{ backgroundColor: bgColor }}
              >
                {initials}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100
                           leading-tight break-words">
              {host.name}
            </h1>
          </div>

          {/* Trust score "wow" line — uses Bayesian-adjusted score from appUser.trustScore */}
          {trustScore ? (
            <p className="flex flex-wrap items-baseline gap-x-2 ml-[3.375rem]">
              <span className="text-3xl sm:text-4xl font-bold text-zinc-400 dark:text-zinc-500">
                {trust.toLowerCase()},
              </span>
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {trustScore.toFixed(1)}
                <span className="text-xl sm:text-2xl font-semibold text-zinc-400 ml-1">/ 5 ★</span>
              </span>
            </p>
          ) : (
            <p className="text-3xl sm:text-4xl font-bold text-zinc-400 dark:text-zinc-500 ml-[3.375rem]">
              new host.
            </p>
          )}
        </FadeUp>

        {/* ── Stats grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-7 mt-10 mb-2">
          <StatBlock
            value={stats.activeListings}
            label="Active Plans"
            delay={0.12}
            accent={stats.activeListings > 0}
          />
          <StatBlock
            value={stats.completedListings}
            label="Completed"
            delay={0.16}
            accent={stats.completedListings > 0}
          />
          <StatBlock
            value={stats.membersHosted}
            label="Members"
            delay={0.20}
            accent={stats.membersHosted > 0}
          />
          <StatBlock
            value={stats.reviewCount}
            label="Reviews"
            delay={0.24}
            accent={stats.reviewCount > 0}
          />
        </div>

        {/* Member since — subtle, below the grid */}
        <FadeUp delay={0.28}>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-3 mb-0">
            Member since {fmtMonthYear(host.createdAt)}
          </p>
        </FadeUp>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <FadeUp delay={0.32}>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-8 mb-10" />
        </FadeUp>

        {/* ── Active Plans ──────────────────────────────────────────────── */}
        {listings.length > 0 && (
          <FadeUp delay={0.36} className="mb-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]
                            text-zinc-400 dark:text-zinc-600">
                Active Plans
              </p>
              <Link
                href="/browse"
                className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500
                           hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                browse more →
              </Link>
            </div>
            <div>
              {listings.map((l, i) => (
                <PlanRow key={l.id} listing={l} delay={0.28 + i * 0.06} />
              ))}
            </div>
          </FadeUp>
        )}

        {/* ── Reviews ───────────────────────────────────────────────────── */}
        <FadeUp delay={listings.length > 0 ? 0.48 : 0.36} className="mb-10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]
                          text-zinc-400 dark:text-zinc-600">
              Reviews
            </p>
            {stats.avgRating && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Stars rating={stats.avgRating} size={11} />
                {stats.avgRating.toFixed(1)}
              </span>
            )}
          </div>

          {reviews.length > 0 ? (
            <div>
              {reviews.map((r, i) => (
                <ReviewCard key={r.id} review={r} delay={(listings.length > 0 ? 0.54 : 0.42) + i * 0.06} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-600 py-4">
              No reviews yet.
            </p>
          )}
        </FadeUp>

      </div>

    </main>
  );
}
