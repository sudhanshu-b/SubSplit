"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Service → icon/colour mapping ─────────────────────────────────────────
function getServiceMeta(name: string): { slug: string; bg: string } {
  const n = name.toLowerCase();
  if (n.includes("netflix"))     return { slug: "netflix",        bg: "#E50914" };
  if (n.includes("spotify"))     return { slug: "spotify",        bg: "#1DB954" };
  if (n.includes("youtube"))     return { slug: "youtube",        bg: "#FF0000" };
  if (n.includes("notion"))      return { slug: "notion",         bg: "#191919" };
  if (n.includes("icloud"))      return { slug: "icloud",         bg: "#3693F3" };
  if (n.includes("copilot"))     return { slug: "githubcopilot",  bg: "#6941C6" };
  if (n.includes("github"))      return { slug: "github",         bg: "#24292E" };
  if (n.includes("dropbox"))     return { slug: "dropbox",        bg: "#0061FF" };
  if (n.includes("canva"))       return { slug: "canva",          bg: "#00C4CC" };
  if (n.includes("adobe"))       return { slug: "adobe",          bg: "#FF0000" };
  if (n.includes("duolingo"))    return { slug: "duolingo",       bg: "#58CC02" };
  if (n.includes("perplexity"))  return { slug: "perplexity",     bg: "#1FB8CD" };
  if (n.includes("apple") || n.includes("tv+")) return { slug: "appletv", bg: "#1C1C1E" };
  if (n.includes("1password"))   return { slug: "1password",      bg: "#0094F5" };
  return { slug: "", bg: "#71717a" };
}

// ── Types ──────────────────────────────────────────────────────────────────
export type BrowseListing = {
  id:             string;
  title:          string;
  description:    string | null;
  serviceName:    string;
  hostName:       string;
  pricePerSeat:   number;
  currency:       string;
  totalSeats:     number;
  remainingSeats: number;
  region:         string | null;
};

// ── Currency symbol helper ─────────────────────────────────────────────────
function currSym(currency: string) {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return currency + " ";
}

// ── Card ───────────────────────────────────────────────────────────────────
export default function BrowseCard({
  listing,
  index = 0,
}: {
  listing: BrowseListing;
  index?: number;
}) {
  const { slug, bg } = getServiceMeta(listing.serviceName);
  const iconUrl       = slug ? `https://cdn.simpleicons.org/${slug}/ffffff` : null;
  const hostInitial   = listing.hostName?.[0]?.toUpperCase() ?? "?";
  const filledSeats   = listing.totalSeats - listing.remainingSeats;
  const fillPct       = listing.totalSeats > 0 ? (filledSeats / listing.totalSeats) * 100 : 0;
  const isFull        = listing.remainingSeats <= 0;
  const sym           = currSym(listing.currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.045, 0.28), ease: EASE }}
    >
      <Link
        href={`/listings/${listing.id}`}
        className="group flex flex-col h-full rounded-2xl border
                   border-zinc-200 dark:border-zinc-800
                   bg-white dark:bg-zinc-900
                   hover:border-zinc-300 dark:hover:border-zinc-700
                   hover:shadow-lg hover:shadow-zinc-100/80 dark:hover:shadow-black/40
                   transition-all duration-200 p-5"
      >
        {/* ── Service row ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bg }}
            >
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt={listing.serviceName} className="w-5 h-5 object-contain" />
              ) : (
                <span className="text-white text-xs font-bold">{listing.serviceName[0]}</span>
              )}
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
              {listing.serviceName}
            </span>
          </div>

          {listing.region && (
            <span className="text-[10px] font-black uppercase tracking-wider
                             text-zinc-400 dark:text-zinc-500
                             bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-0.5">
              {listing.region}
            </span>
          )}
        </div>

        {/* ── Title ── */}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100
                       leading-snug line-clamp-1 mb-1.5">
          {listing.title}
        </h3>

        {/* ── Description ── */}
        {listing.description ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed line-clamp-2 mb-4">
            {listing.description}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        {/* ── Seat progress ── */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isFull ? "text-red-400 dark:text-red-500" : "text-zinc-400 dark:text-zinc-500"
            }`}>
              {isFull
                ? "Full"
                : `${listing.remainingSeats} seat${listing.remainingSeats !== 1 ? "s" : ""} left`}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
              {filledSeats}/{listing.totalSeats} filled
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-[3px] w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: isFull ? "#ef4444" : bg }}
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{
                duration: 0.65,
                delay: Math.min(index * 0.045, 0.28) + 0.15,
                ease: EASE,
              }}
            />
          </div>

          {/* ── Footer: host + price ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                           text-[9px] font-bold text-zinc-600 dark:text-zinc-300"
                style={{ backgroundColor: bg + "22" }}
              >
                {hostInitial}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate">
                {listing.hostName}
              </span>
            </div>

            <div className="flex items-baseline gap-0.5 flex-shrink-0">
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {sym}{listing.pricePerSeat.toFixed(0)}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">/mo</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
export function BrowseCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex flex-col h-full rounded-2xl border border-zinc-100 dark:border-zinc-800/60
                 bg-white dark:bg-zinc-900 p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-[10px] bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-3.5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
      <div className="h-4 w-3/4 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-2" />
      <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-1.5" />
      <div className="h-3 w-1/2 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-6" />
      <div className="mt-auto">
        <div className="h-[3px] w-full rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-4" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
