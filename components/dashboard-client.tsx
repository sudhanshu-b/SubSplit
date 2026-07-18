"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Service → logo/colour map ──────────────────────────────────────────────
const SERVICE_META: Record<string, { bg: string; slug: string }> = {
  netflix:                { bg: "#E50914", slug: "netflix"       },
  spotify:                { bg: "#1DB954", slug: "spotify"       },
  "youtube premium":      { bg: "#FF0000", slug: "youtube"       },
  youtube:                { bg: "#FF0000", slug: "youtube"       },
  "icloud+":              { bg: "#3693F3", slug: "icloud"        },
  icloud:                 { bg: "#3693F3", slug: "icloud"        },
  notion:                 { bg: "#191919", slug: "notion"        },
  "github copilot":       { bg: "#6941C6", slug: "githubcopilot" },
  github:                 { bg: "#24292E", slug: "github"        },
  perplexity:             { bg: "#1FB8CD", slug: "perplexity"    },
  canva:                  { bg: "#00C4CC", slug: "canva"         },
  "adobe creative cloud": { bg: "#FF0000", slug: "adobe"         },
  dropbox:                { bg: "#0061FF", slug: "dropbox"       },
  duolingo:               { bg: "#58CC02", slug: "duolingo"      },
  "1password":            { bg: "#0094F5", slug: "1password"     },
  "apple tv+":            { bg: "#555555", slug: "appletv"       },
};

function serviceMeta(name: string) {
  return SERVICE_META[name.toLowerCase()] ?? { bg: "#6366f1", slug: "" };
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; color: string; pulse?: boolean }> = {
  // listing statuses
  recruiting:        { label: "recruiting",        color: "#a1a1aa"               },
  ready_to_purchase: { label: "ready to purchase", color: "#6366f1", pulse: true  },
  active:            { label: "active",            color: "#22c55e", pulse: true  },
  completed:         { label: "completed",         color: "#3b82f6"               },
  cancelled:         { label: "cancelled",         color: "#f87171"               },
  // membership statuses
  pending:           { label: "pending",           color: "#f59e0b"               },
  left:              { label: "left",              color: "#a1a1aa"               },
  removed:           { label: "removed",           color: "#f87171"               },
  rejected:          { label: "rejected",          color: "#f87171"               },
};

// ── Types ──────────────────────────────────────────────────────────────────
export type HostedPlan = {
  id: string;
  title: string;
  serviceName: string;
  status: string;
  totalSeats: number;
  activeMembers: number;
  pendingRequests: number;
  pricePerSeat: string | null;
  currency: string;
};

export type JoinedPlan = {
  membershipId: string;
  subscriptionId: string;
  title: string;
  serviceName: string;
  membershipStatus: string;
  pricePerSeat: string | null;
  currency: string;
  hostName: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────
function greet(name: string) {
  const h = new Date().getHours();
  const part = h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return { part, first: name.split(" ")[0] ?? name };
}

function formatPrice(raw: string | null) {
  if (!raw) return null;
  return Math.round(parseFloat(raw));
}

// ── Dot ────────────────────────────────────────────────────────────────────
function Dot({ color, pulse = false, size = 8 }: { color: string; pulse?: boolean; size?: number }) {
  return (
    <span
      className={`rounded-full flex-shrink-0 inline-block ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

// ── ServiceLogo ────────────────────────────────────────────────────────────
function ServiceLogo({ name, size = 32 }: { name: string; size?: number }) {
  const { bg, slug } = serviceMeta(name);
  const iconUrl = slug ? `https://cdn.simpleicons.org/${slug}/ffffff` : null;
  return (
    <div
      className="rounded-[9px] flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconUrl} alt={name} className="object-contain" style={{ width: size * 0.55, height: size * 0.55 }} />
      ) : (
        <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>{name[0]}</span>
      )}
    </div>
  );
}

// ── StatusDot ──────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const cfg = STATUS[status] ?? { label: status, color: "#a1a1aa" };
  return (
    <span className="inline-flex items-center gap-1.5">
      <Dot color={cfg.color} pulse={cfg.pulse} size={6} />
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{cfg.label}</span>
    </span>
  );
}

// ── SlotDots ───────────────────────────────────────────────────────────────
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

// ── FadeUp ─────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
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

// ── Quick links (shared between sidebar + mobile bottom) ──────────────────
const QUICK_LINKS = [
  { href: "/browse",       label: "Browse plans" },
  { href: "/listings/new", label: "List a plan"  },
  { href: "/messages",     label: "Messages"     },
];

function QuickLinks() {
  return (
    <>
      {QUICK_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="group inline-flex items-center gap-1 w-fit
                     text-[11px] font-semibold text-zinc-400 dark:text-zinc-500
                     hover:text-zinc-900 dark:hover:text-zinc-100
                     underline-offset-4 decoration-dotted decoration-zinc-300 dark:decoration-zinc-600
                     hover:underline transition-colors duration-150 whitespace-nowrap"
        >
          {label}
          <svg
            className="w-3 h-3 flex-shrink-0 transition-transform duration-200
                       group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </Link>
      ))}
    </>
  );
}

// ── Hosted plan row ────────────────────────────────────────────────────────
function HostedRow({ plan, delay }: { plan: HostedPlan; delay: number }) {
  const price  = formatPrice(plan.pricePerSeat);
  const status = STATUS[plan.status] ?? STATUS.draft;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="group py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: logo + content */}
        <div className="flex items-start gap-3 min-w-0">
          <ServiceLogo name={plan.serviceName} size={32} />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug truncate">
              {plan.title}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
              <SlotDots active={plan.activeMembers} total={plan.totalSeats} />

              <span className="text-[11px] text-zinc-400">
                {plan.activeMembers}/{plan.totalSeats} members
              </span>

              {price && (
                <span className="text-[11px] text-zinc-400">
                  ₹{price}/member
                </span>
              )}

              {plan.pendingRequests > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  <Dot color="#f59e0b" size={5} />
                  {plan.pendingRequests} pending
                </span>
              )}

              <Dot color={status.color} size={5} />
              <span className="text-[11px] text-zinc-400 -ml-1.5">{status.label}</span>
            </div>
          </div>
        </div>

        {/* Right: manage link */}
        <Link
          href={`/listings/${plan.id}/manage`}
          className="flex-shrink-0 text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                     transition-all duration-150 pt-0.5"
        >
          Manage →
        </Link>
      </div>
    </motion.div>
  );
}

// ── Joined plan row ────────────────────────────────────────────────────────
function JoinedRow({ plan, delay }: { plan: JoinedPlan; delay: number }) {
  const price    = formatPrice(plan.pricePerSeat);
  const inactive = ["left", "removed", "rejected"].includes(plan.membershipStatus);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={`group py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0 ${inactive ? "opacity-40" : ""}`}
    >
      <Link href={`/listings/${plan.subscriptionId}/member`} className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <ServiceLogo name={plan.serviceName} size={32} />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug truncate">
              {plan.title}
            </p>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
              <span className="text-[11px] text-zinc-400">by {plan.hostName}</span>
              <StatusDot status={plan.membershipStatus} />
            </div>
          </div>
        </div>

        {/* Right: price */}
        {price && (
          <span className="flex-shrink-0 text-sm font-semibold text-zinc-700 dark:text-zinc-300 pt-0.5 tabular-nums">
            ₹{price}
            <span className="text-[11px] font-normal text-zinc-400">/mo</span>
          </span>
        )}
      </Link>
    </motion.div>
  );
}

// ── Past memberships (collapsed) ───────────────────────────────────────────
function PastMemberships({ plans }: { plans: JoinedPlan[] }) {
  const [open, setOpen] = useState(false);
  if (!plans.length) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18 }}
          className="inline-block"
        >
          ›
        </motion.span>
        {plans.length} past membership{plans.length > 1 ? "s" : ""}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            {plans.map((plan, i) => (
              <JoinedRow key={plan.membershipId} plan={plan} delay={i * 0.04} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function DashboardClient({
  userName,
  hostedPlans,
  joinedPlans,
  unreadMessages,
}: {
  userName: string;
  hostedPlans: HostedPlan[];
  joinedPlans: JoinedPlan[];
  unreadMessages: number;
}) {
  const { part, first } = greet(userName);

  const monthlySavings = joinedPlans
    .filter(p => p.membershipStatus === "active")
    .reduce((sum, p) => sum + (formatPrice(p.pricePerSeat) ?? 0), 0);

  const activePlansCount =
    hostedPlans.filter(p => ["recruiting", "ready_to_purchase", "active"].includes(p.status)).length +
    joinedPlans.filter(p => p.membershipStatus === "active").length;

  const pendingTotal = hostedPlans.reduce((n, p) => n + p.pendingRequests, 0);

  const activeJoined = joinedPlans.filter(p => !["left", "removed", "rejected"].includes(p.membershipStatus));
  const pastJoined   = joinedPlans.filter(p =>  ["left", "removed", "rejected"].includes(p.membershipStatus));

  return (
    <main className="bg-zinc-50 dark:bg-[#0e0e10] min-h-[calc(100vh-80px)]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <FadeUp delay={0.04}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-4">
            {part}
          </p>

          {monthlySavings > 0 ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight break-words">
                {first},
              </h1>
              <p className="flex flex-wrap items-baseline gap-x-2 mt-1">
                <span className="text-3xl sm:text-4xl font-bold text-zinc-400 dark:text-zinc-500 leading-tight">
                  you&rsquo;re saving
                </span>
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  ₹{monthlySavings}
                  <span className="text-xl sm:text-2xl font-semibold text-zinc-400 ml-1">/ month.</span>
                </span>
              </p>
            </>
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight break-words">
              Welcome back,{" "}
              <span className="text-zinc-400 dark:text-zinc-500">{first}.</span>
            </h1>
          )}
        </FadeUp>

        {/* ── Inline stats strip ────────────────────────────────────────── */}
        <FadeUp delay={0.12}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-5 text-[12px] text-zinc-400 dark:text-zinc-500">
            {activePlansCount > 0 && (
              <span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activePlansCount}</span>{" "}
                active plan{activePlansCount !== 1 ? "s" : ""}
              </span>
            )}
            {pendingTotal > 0 && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Dot color="#f59e0b" size={5} />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingTotal}</span>{" "}
                  pending
                </span>
              </>
            )}
            {unreadMessages > 0 && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <Link
                  href="/messages"
                  className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <Dot color="#6366f1" size={5} />
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{unreadMessages}</span>{" "}
                  unread ↗
                </Link>
              </>
            )}
          </div>
        </FadeUp>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <FadeUp delay={0.18}>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-10 mb-10" />
        </FadeUp>

        {/* ── Hosted plans ──────────────────────────────────────────────── */}
        {hostedPlans.length > 0 && (
          <FadeUp delay={0.22} className="mb-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
                Your plans
              </p>
              <Link
                href="/listings/new"
                className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                + new plan
              </Link>
            </div>
            <div>
              {hostedPlans.map((plan, i) => (
                <HostedRow key={plan.id} plan={plan} delay={0.28 + i * 0.06} />
              ))}
            </div>
          </FadeUp>
        )}

        {/* ── Memberships ───────────────────────────────────────────────── */}
        {activeJoined.length > 0 && (
          <FadeUp delay={hostedPlans.length > 0 ? 0.34 : 0.22} className="mb-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
                Your memberships
              </p>
              <Link
                href="/browse"
                className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                browse more →
              </Link>
            </div>
            <div>
              {activeJoined.map((plan, i) => (
                <JoinedRow key={plan.membershipId} plan={plan} delay={0.38 + i * 0.06} />
              ))}
            </div>
            <PastMemberships plans={pastJoined} />
          </FadeUp>
        )}

        {/* ── Quick actions: bottom on mobile ───────────────────────────── */}
        <FadeUp delay={0.5} className="sm:hidden mt-2 mb-10">
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 mb-8" />
          <div className="flex flex-col gap-4">
            <QuickLinks />
          </div>
        </FadeUp>

      </div>

      {/* ── Quick actions: fixed left sidebar on desktop ───────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
        className="hidden sm:flex fixed left-6 lg:left-10 top-1/2 -translate-y-1/2 flex-col gap-5 z-10"
      >
        <QuickLinks />
      </motion.div>

    </main>
  );
}
