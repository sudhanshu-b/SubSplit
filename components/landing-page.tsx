"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ─── Data ─────────────────────────────────────────────────────────────────────

// Subscription services shown in the rotating hero icon
const SERVICES = [
  { name: "Netflix",    bg: "#E50914", icon: "https://cdn.simpleicons.org/netflix/ffffff"       },
  { name: "Spotify",    bg: "#1DB954", icon: "https://cdn.simpleicons.org/spotify/ffffff"       },
  { name: "YouTube",    bg: "#FF0000", icon: "https://cdn.simpleicons.org/youtube/ffffff"       },
  { name: "iCloud+",    bg: "#3693F3", icon: "https://cdn.simpleicons.org/icloud/ffffff"        },
  { name: "Perplexity", bg: "#1FB8CD", icon: "https://cdn.simpleicons.org/perplexity/ffffff"   },
  { name: "Copilot",    bg: "#6941C6", icon: "https://cdn.simpleicons.org/githubcopilot/ffffff" },
  { name: "Notion",     bg: "#191919", icon: "https://cdn.simpleicons.org/notion/ffffff"        },
  { name: "GitHub",     bg: "#24292E", icon: "https://cdn.simpleicons.org/github/ffffff"        },
];

// Floating icon badges that orbit the stats section
const FLOATING_ICONS: Array<{
  icon: string; color: string; delay: number;
  top?: string; left?: string; right?: string;
}> = [
  { icon: "https://cdn.simpleicons.org/netflix/ffffff",       color: "#E50914", top: "8%",  left: "4%",   delay: 0   },
  { icon: "https://cdn.simpleicons.org/spotify/ffffff",       color: "#1DB954", top: "18%", right: "4%",  delay: 0.4 },
  { icon: "https://cdn.simpleicons.org/youtube/ffffff",       color: "#FF0000", top: "62%", left: "2%",   delay: 0.8 },
  { icon: "https://cdn.simpleicons.org/icloud/ffffff",        color: "#3693F3", top: "70%", right: "5%",  delay: 0.2 },
  { icon: "https://cdn.simpleicons.org/perplexity/ffffff",   color: "#1FB8CD", top: "40%", left: "9%",   delay: 0.6 },
  { icon: "https://cdn.simpleicons.org/githubcopilot/ffffff", color: "#6941C6", top: "14%", right: "12%", delay: 1.0 },
  { icon: "https://cdn.simpleicons.org/notion/ffffff",        color: "#191919", top: "80%", left: "12%",  delay: 0.3 },
  { icon: "https://cdn.simpleicons.org/github/ffffff",        color: "#24292E", top: "52%", right: "2%",  delay: 0.7 },
];

// Tab-driven sticky feature sections (like Mobbin's "Screens | UI Elements | Flows")
const FEATURES = [
  {
    tab:      "Browse Plans",
    headline: "Find the perfect plan\nin seconds.",
    body:     "Filter by service, price, and available slots. Every listing is real, posted by real people — updated weekly.",
  },
  {
    tab:      "Listing Detail",
    headline: "Review everything\nbefore you commit.",
    body:     "Slot count, monthly cost, host rating, plan rules — all on one page. No hidden fees, no surprises.",
  },
  {
    tab:      "Messages",
    headline: "Stay in sync with\nyour co-subscribers.",
    body:     "Built-in messaging connects you directly to hosts. Coordinate payments, ask questions, get instant updates.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma", role: "Student, Delhi",
    text: "Saving ₹600/month on Netflix and Spotify. The host was super friendly and payment was totally seamless.",
    initials: "PS", color: "#4f46e5",
  },
  {
    name: "Arjun Mehta", role: "Developer, Bengaluru",
    text: "I host 3 plans and completely offset my own subscription costs. The messaging feature makes coordination effortless.",
    initials: "AM", color: "#0ea5e9",
  },
  {
    name: "Sneha Rao", role: "Designer, Mumbai",
    text: "Finally a clean, trustworthy way to share subscriptions. No more sketchy WhatsApp groups. I feel safe here.",
    initials: "SR", color: "#ec4899",
  },
  {
    name: "Karan Patel", role: "Entrepreneur, Ahmedabad",
    text: "Split YouTube Premium with 3 others. Paying ₹50/month instead of ₹189. The browse UX is really polished.",
    initials: "KP", color: "#f59e0b",
  },
  {
    name: "Divya Nair", role: "Teacher, Kochi",
    text: "Simple, clean, honest. SubSplit does exactly what it promises. I've recommended it to my entire family.",
    initials: "DN", color: "#10b981",
  },
  {
    name: "Rohan Gupta", role: "Product Manager, Pune",
    text: "Found a Notion plan in 2 minutes, requested to join, and was approved the same day. Perfect experience.",
    initials: "RG", color: "#8b5cf6",
  },
];

// Items scrolling in the infinite marquee — each has a name + Simple Icons CDN logo
const MARQUEE_ITEMS = [
  { name: "Netflix",              icon: "https://cdn.simpleicons.org/netflix/E50914"        },
  { name: "Spotify",              icon: "https://cdn.simpleicons.org/spotify/1DB954"        },
  { name: "YouTube Premium",      icon: "https://cdn.simpleicons.org/youtube/FF0000"        },
  { name: "Notion",               icon: "https://cdn.simpleicons.org/notion/374151"         },
  { name: "GitHub Copilot",       icon: "https://cdn.simpleicons.org/githubcopilot/6941C6"  },
  { name: "iCloud+",              icon: "https://cdn.simpleicons.org/icloud/3693F3"         },
  { name: "Perplexity",           icon: "https://cdn.simpleicons.org/perplexity/1FB8CD"     },
  { name: "Canva Pro",            icon: "https://cdn.simpleicons.org/canva/00C4CC"          },
  { name: "Adobe Creative Cloud", icon: "https://cdn.simpleicons.org/adobe/FF0000"          },
  { name: "Apple TV+",            icon: "https://cdn.simpleicons.org/appletv/374151"        },
  { name: "1Password",            icon: "https://cdn.simpleicons.org/1password/0094F5"      },
  { name: "Dropbox",              icon: "https://cdn.simpleicons.org/dropbox/0061FF"        },
  { name: "Duolingo",             icon: "https://cdn.simpleicons.org/duolingo/58CC02"       },
];

// Shared easing curve — same feel as Mobbin's entrance transitions
const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Mock listing data for the UI mockups ─────────────────────────────────────

const MOCK_LISTINGS = [
  {
    icon: "https://cdn.simpleicons.org/netflix/ffffff",
    color: "#E50914",
    svc: "Netflix", plan: "Standard with Ads",
    price: 149, slots: 2, totalSlots: 4,
    host: "Rahul M.", initials: "RM", hostColor: "#4f46e5",
    rating: 4.9, reviews: 28,
    tags: ["1080p", "Ad-supported"], verified: true,
  },
  {
    icon: "https://cdn.simpleicons.org/spotify/ffffff",
    color: "#1DB954",
    svc: "Spotify", plan: "Duo Premium",
    price: 119, slots: 1, totalSlots: 2,
    host: "Sneha R.", initials: "SR", hostColor: "#ec4899",
    rating: 5.0, reviews: 14,
    tags: ["Ad-free", "Offline"], verified: true,
  },
  {
    icon: "https://cdn.simpleicons.org/youtube/ffffff",
    color: "#FF0000",
    svc: "YouTube", plan: "Premium Family",
    price: 89, slots: 3, totalSlots: 5,
    host: "Arjun K.", initials: "AK", hostColor: "#0ea5e9",
    rating: 4.7, reviews: 41,
    tags: ["No ads", "Downloads"], verified: false,
  },
];

// ─── Small reusable components ────────────────────────────────────────────────

/**
 * Rotating hero icon — flips through subscription service brands every 2.2 s.
 * Uses AnimatePresence with a 3-D rotateY flip (same as Mobbin's hero icon).
 */
function HeroIcon() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % SERVICES.length), 2200);
    return () => clearInterval(id);
  }, []);

  // Cards stacked visually behind the current one
  const behind1 = SERVICES[(idx + 1) % SERVICES.length];
  const behind2 = SERVICES[(idx + 2) % SERVICES.length];

  // perspective on parent gives rotateX its 3-D depth
  return (
    <div className="relative w-20 h-20" style={{ perspective: "800px" }}>

      {/* ── Stack card 2 — furthest back ── */}
      <div
        className="absolute inset-0 rounded-[22px]"
        style={{
          backgroundColor: behind2.bg,
          transform: "translateY(16px) scale(0.80)",
          opacity: 0.28,
          filter: "blur(2px)",
        }}
      />

      {/* ── Stack card 1 — middle ── */}
      <div
        className="absolute inset-0 rounded-[22px] shadow-lg"
        style={{
          backgroundColor: behind1.bg,
          transform: "translateY(8px) scale(0.90)",
          opacity: 0.55,
        }}
      />

      {/* ── Active card — zooms forward from behind ── */}
      {/* mode="sync" lets exit + enter overlap so there is never an empty frame */}
      <AnimatePresence mode="sync">
        <motion.div
          key={SERVICES[idx].name}
          initial={{ scale: 0.35, opacity: 0, rotateX: 22, y: 10 }}
          animate={{ scale: 1,    opacity: 1, rotateX: 0,  y: 0  }}
          exit={{   scale: 1.22,  opacity: 0, rotateX: -14, y: -8 }}
          transition={{ duration: 0.48, ease: EASE }}
          className="absolute inset-0 rounded-[22px] flex items-center justify-center
                     shadow-2xl select-none"
          style={{ backgroundColor: SERVICES[idx].bg }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SERVICES[idx].icon} alt={SERVICES[idx].name} className="w-10 h-10 object-contain" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Word-by-word upward curtain reveal for headings.
 * Each word slides up from behind a clip so the reveal feels editorial.
 */
function RevealText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden leading-[1.05]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, delay: delay + i * 0.07, ease: EASE }}
          >
            {word}
            {i < text.split(" ").length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * A floating service-brand badge that bobs up and down infinitely.
 * Used in the stats section to mimic Mobbin's orbiting app icons.
 */
function FloatingBadge({
  icon,
  color,
  style,
  delay,
}: {
  icon: string;
  color: string;
  style: React.CSSProperties;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={style}
      initial={{ opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 0.9, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.7, ease: EASE }}
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: 3.5 + delay,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.4,
        }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
        style={{ backgroundColor: color }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" className="w-8 h-8 object-contain" />
      </motion.div>
    </motion.div>
  );
}

/**
 * One infinite-scrolling row of subscription service names.
 * Items are duplicated so the loop is seamless.
 */
function MarqueeRow({
  items,
  direction = "left",
  speed = 30,
}: {
  items: { name: string; icon: string }[];
  direction?: "left" | "right";
  speed?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex gap-3 w-max"
        animate={{ x: direction === "left" ? [0, "-50%"] : ["-50%", 0] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border
                       border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900
                       text-sm font-semibold text-gray-700 dark:text-slate-300
                       whitespace-nowrap shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.icon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
            {item.name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Inline UI Mockups ────────────────────────────────────────────────────────

/** Browse listings mockup — rich 3-card preview of the SubSplit browse page */
function BrowseMockup() {
  return (
    <div className="w-full bg-gray-100 dark:bg-slate-900 rounded-2xl p-1.5 shadow-2xl
                    shadow-gray-300/50 dark:shadow-black/60 border border-gray-200 dark:border-slate-700">
      <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden">

        {/* ── macOS browser chrome ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-900
                        border-b border-gray-100 dark:border-slate-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200
                            dark:border-slate-700 rounded-lg px-3 py-1 w-56">
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zm0 0c0 3.314 2.686 6 6 6" />
              </svg>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate">subsplit.app/browse</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* ── In-app navbar ── */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-5">
            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">SubSplit</span>
            {["Browse", "My Plans", "Messages"].map((l) => (
              <span key={l} className={`text-xs font-semibold ${l === "Browse"
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-slate-500"}`}>{l}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center
                            justify-center text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">R</div>
          </div>
        </div>

        {/* ── Page header + search ── */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Browse Plans</h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">247 listings available</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white
                               text-white dark:text-gray-900 text-[10px] font-bold">
              + List a plan
            </button>
          </div>
          {/* Search + filters */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border
                            border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">Search by service, price…</span>
            </div>
            {["All", "Streaming", "Productivity", "AI Tools"].map((f, i) => (
              <span key={f} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                i === 0
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              }`}>{f}</span>
            ))}
          </div>
        </div>

        {/* ── 3 rich listing cards ── */}
        <div className="p-4 grid grid-cols-3 gap-3">
          {MOCK_LISTINGS.map((l, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700
                         rounded-xl overflow-hidden hover:border-gray-400 dark:hover:border-slate-500
                         transition-colors shadow-sm"
            >
              {/* Card header — colored service banner */}
              <div className="px-3 pt-3 pb-2.5 flex items-start justify-between"
                   style={{ background: `${l.color}12` }}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                       style={{ backgroundColor: l.color }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.icon} alt={l.svc} className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{l.svc}</p>
                    <p className="text-[9px] text-gray-500 dark:text-slate-400 leading-tight">{l.plan}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50
                                 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold
                                 border border-emerald-200 dark:border-emerald-800/40 whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Open
                </span>
              </div>

              {/* Price + slots */}
              <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-end justify-between mb-1.5">
                  <div>
                    <span className="text-lg font-black text-gray-900 dark:text-white leading-none">₹{l.price}</span>
                    <span className="text-[9px] text-gray-400 dark:text-slate-500 font-normal"> /mo</span>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500 dark:text-slate-400">
                    {l.slots}/{l.totalSlots} slots
                  </span>
                </div>
                {/* Slot bar */}
                <div className="flex gap-0.5">
                  {Array.from({ length: l.totalSlots }).map((_, s) => (
                    <div key={s} className={`h-1 flex-1 rounded-full ${
                      s < l.slots
                        ? "bg-emerald-400"
                        : "bg-gray-200 dark:bg-slate-700"
                    }`} />
                  ))}
                </div>
              </div>

              {/* Host info */}
              <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-800 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                     style={{ backgroundColor: l.hostColor }}>
                  {l.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold text-gray-700 dark:text-slate-300 leading-tight truncate">{l.host}</p>
                  <div className="flex items-center gap-0.5">
                    <span className="text-yellow-400 text-[9px]">★</span>
                    <span className="text-[9px] text-gray-500 dark:text-slate-400">{l.rating} · {l.reviews} reviews</span>
                  </div>
                </div>
                {l.verified && (
                  <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50
                                   dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full border border-indigo-200
                                   dark:border-indigo-800/40 whitespace-nowrap">✓ Verified</span>
                )}
              </div>

              {/* Tags + CTA */}
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex gap-1 flex-wrap">
                  {l.tags.map((tag) => (
                    <span key={tag} className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md
                                               bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-gray-900 dark:bg-white
                                   text-white dark:text-gray-900 text-[9px] font-bold">
                  Join →
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/** Listing detail mockup — full-detail view for a single plan */
function ListingDetailMockup() {
  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-950 rounded-2xl shadow-2xl
                    shadow-gray-200/60 dark:shadow-black/40 border border-gray-200 dark:border-slate-800">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://cdn.simpleicons.org/netflix/ffffff" alt="Netflix" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Netflix Standard</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">4 slots · 2 open</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50
                             dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs
                             font-bold border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
        </div>
        {/* Details */}
        {[
          ["Monthly cost", "₹149 / member"],
          ["Plan type",    "Standard (1080p)"],
          ["Host since",   "Jan 2024"],
          ["Trust score",  "★ 4.9 (28 reviews)"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5 border-b border-gray-100
                                  dark:border-slate-800 last:border-0">
            <span className="text-sm text-gray-500 dark:text-slate-400">{k}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{v}</span>
          </div>
        ))}
        <button className="mt-5 w-full py-3 rounded-full bg-gray-900 dark:bg-white text-white
                           dark:text-gray-900 text-sm font-bold hover:bg-gray-700
                           dark:hover:bg-slate-100 transition-colors">
          Request to Join
        </button>
      </div>
    </div>
  );
}

/** Messages mockup — a chat thread between a member and a host */
function MessagesMockup() {
  const msgs = [
    { me: false, text: "Hi! I saw your Netflix listing. Is the Standard slot still open?" },
    { me: true,  text: "Yes it is! ₹149/month. Payment is on the 5th each month."        },
    { me: false, text: "Perfect, can I request to join?"                                  },
    { me: true,  text: "Absolutely — go ahead! I'll approve right away 🎉"              },
  ];

  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-950 rounded-2xl shadow-2xl
                    shadow-gray-200/60 dark:shadow-black/40 border border-gray-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center
                        justify-center text-indigo-700 dark:text-indigo-300 text-xs font-black">R</div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Rahul (Host)</p>
          <p className="text-xs text-emerald-500">Online</p>
        </div>
      </div>
      {/* Messages */}
      <div className="p-4 space-y-3 bg-gray-50 dark:bg-slate-900">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                m.me
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-br-sm"
                  : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
        <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-8" />
        <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Page Sections ────────────────────────────────────────────────────────────

/** ① Floating Pill Navbar — glass blur, same pill shape as Mobbin */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-3 left-0 right-0 z-50 flex justify-center px-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <nav
        className={`flex items-center justify-between w-full max-w-4xl rounded-full px-5 py-2
                    transition-all duration-300 backdrop-blur-xl
                    ${scrolled
                      ? "bg-white/95 dark:bg-slate-950/95 shadow-lg shadow-black/8 dark:shadow-black/40 border border-gray-200 dark:border-slate-800"
                      : "bg-gray-50/95 dark:bg-slate-900/95 border border-gray-200 dark:border-slate-800"
                    }`}
      >
        {/* Logo — switches between light/dark variants based on theme */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="SubSplit" className="h-10 w-auto object-contain dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png"  alt="SubSplit" className="h-10 w-auto object-contain hidden dark:block" />
        </Link>

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-6">
          {([["Pricing", "/pricing"], ["Browse", "/browse"], ["About", "/about"]] as [string, string][]).map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900
                         dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right CTAs — session-aware */}
        <div className="flex items-center gap-2">
          {isPending ? null : session ? (
            /* Logged in — link to the app */
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/home"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold
                           bg-gray-900 dark:bg-white text-white dark:text-gray-900
                           hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors"
              >
                Go to app
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          ) : (
            /* Logged out — show login + join */
            <>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900
                           dark:text-slate-400 dark:hover:text-white transition-colors px-2 hidden sm:block"
              >
                Log in
              </Link>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-full text-sm font-bold bg-gray-900 dark:bg-white
                             text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-slate-100
                             transition-colors"
                >
                  Join for free
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </nav>
    </motion.div>
  );
}

/** ② Hero — big headline, rotating icon, two pill CTAs */
function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center
                        px-4 pt-24 pb-20 bg-white dark:bg-slate-950">
      {/* Rotating service icon */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <HeroIcon />
      </motion.div>

      {/* Main headline — word-by-word curtain reveal */}
      <h1 className="text-6xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tight leading-none
                     text-gray-900 dark:text-white mb-6 max-w-4xl">
        <RevealText text="Split subscriptions." delay={0.1} />
        <br />
        <RevealText text="Save real money." delay={0.38} />
      </h1>

      {/* Subtext */}
      <motion.p
        className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 font-medium
                   max-w-xl mb-10 leading-relaxed"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
      >
        Share Netflix, Spotify, YouTube & more with people you trust.
        <br />
        Pay less. Get more.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/sign-up"
            className="px-7 py-3.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900
                       text-base font-bold hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors
                       shadow-lg shadow-gray-900/10"
          >
            Join for free
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/browse"
            className="px-7 py-3.5 rounded-full text-base font-bold text-gray-900 dark:text-white
                       border border-gray-300 dark:border-slate-700 hover:border-gray-500
                       dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-900
                       transition-all flex items-center gap-1.5"
          >
            Browse plans
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/** ③ Social proof — rolling marquee of muted service logos directly below the hero */
function SocialProofSection() {
  return (
    <section className="border-y border-gray-100 dark:border-slate-900 py-10 bg-white dark:bg-slate-950 overflow-hidden">
      <motion.p
        className="text-center text-xs font-bold text-gray-400 dark:text-slate-600
                   uppercase tracking-widest mb-7 px-4"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        Works with the services you love
      </motion.p>
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
      >
        <MarqueeRow items={MARQUEE_ITEMS} direction="left"  speed={35} />
        <MarqueeRow items={MARQUEE_ITEMS} direction="right" speed={28} />
      </motion.div>
    </section>
  );
}

/** ④ Product preview — browser chrome wrapping the browse-page mockup */
function ProductPreviewSection() {
  return (
    <section className="pt-24 pb-0 px-4 bg-white dark:bg-slate-950">
      <motion.div
        className="max-w-5xl mx-auto relative"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <BrowseMockup />

        {/* Downward fade — bottom of the window melts into the page background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none rounded-b-2xl"
          style={{
            background: "linear-gradient(to top, var(--fade-bg, #ffffff) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* CSS variable so the fade matches light / dark background */}
      <style>{`
        html:not(.dark) .max-w-5xl { --fade-bg: #ffffff; }
        html.dark        .max-w-5xl { --fade-bg: #020617; }
      `}</style>
    </section>
  );
}

/**
 * ⑤ Stats section — GSAP ScrollTrigger count-up animation.
 * Floating service badges orbit the numbers just like Mobbin's app-icon cloud.
 */
function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const els = statsRef.current?.querySelectorAll<HTMLElement>("[data-target]");
    if (!els) return;

    const tweens = Array.from(els).map((el) => {
      const target = parseFloat(el.dataset.target ?? "0");
      const prefix = el.dataset.prefix ?? "";
      const suffix = el.dataset.suffix ?? "";
      const obj    = { val: 0 };

      return gsap.to(obj, {
        val: target,
        duration: 2.2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
        onUpdate() {
          el.textContent =
            prefix + Math.round(obj.val).toLocaleString("en-IN") + suffix;
        },
      });
    });

    return () => {
      tweens.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const stats = [
    { target: "500",   prefix: "",  suffix: "+", label: "active listings"   },
    { target: "12000", prefix: "",  suffix: "+", label: "verified members"  },
    { target: "40",    prefix: "₹", suffix: "L+",label: "saved by members" },
  ];

  return (
    <section className="relative py-36 px-4 overflow-hidden bg-white dark:bg-slate-950">
      {/* Orbiting floating badges */}
      {FLOATING_ICONS.map((item, i) => (
        <FloatingBadge
          key={i}
          icon={item.icon}
          color={item.color}
          delay={item.delay}
          style={{
            top:   item.top,
            left:  item.left,
            right: item.right,
          }}
        />
      ))}

      {/* Counters */}
      <div ref={statsRef} className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.p
          className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          A growing community of
        </motion.p>

        {stats.map(({ target, prefix, suffix, label }, i) => (
          <motion.div
            key={label}
            className="mb-3"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: EASE }}
          >
            <span
              className="font-bold tracking-tight leading-none text-gray-900 dark:text-white block"
              style={{ fontSize: "clamp(3.5rem, 10vw, 6.5rem)" }}
              data-target={target}
              data-prefix={prefix}
              data-suffix={suffix}
            >
              {prefix}0{suffix}
            </span>
            <span className="text-lg text-gray-400 dark:text-slate-500 font-medium">{label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/**
 * ⑥ Features — sticky-scroll section.
 * The section is 3 × 100vh tall. A sticky inner div pins to the viewport
 * while scrollYProgress drives which feature (0/1/2) is displayed.
 * Tab bar + content + mockup all swap with AnimatePresence.
 */
function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map 0→1 scroll to 0→(N−ε) so Math.floor gives indices 0, 1, 2
  const rawIndex = useTransform(scrollYProgress, [0, 1], [0, FEATURES.length - 0.001]);
  useMotionValueEvent(rawIndex, "change", (v) =>
    setActiveIdx(Math.max(0, Math.min(FEATURES.length - 1, Math.floor(v)))),
  );

  return (
    <>
      {/* Small green accent pill — same as Mobbin's section divider */}
      <motion.div
        className="w-8 h-1 rounded-full bg-emerald-500 mx-auto"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE }}
      />

      <div
        ref={containerRef}
        style={{ height: `${FEATURES.length * 100}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center
                        px-4 bg-white dark:bg-slate-950 overflow-hidden">

          {/* Tab bar */}
          <motion.div
            className="flex items-center gap-1 bg-gray-100 dark:bg-slate-900 rounded-full p-1 mb-14"
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 select-none ${
                  activeIdx === i
                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-400 dark:text-slate-500"
                }`}
              >
                {f.tab}
              </div>
            ))}
          </motion.div>

          {/* Headline + body text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${activeIdx}`}
              className="text-center max-w-2xl mb-12"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{   opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <h2 className="text-5xl sm:text-6xl font-bold tracking-tight leading-none
                             text-gray-900 dark:text-white mb-6 whitespace-pre-line">
                {FEATURES[activeIdx].headline}
              </h2>
              <p className="text-lg text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                {FEATURES[activeIdx].body}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* UI mockup */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`mockup-${activeIdx}`}
              className="w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.93, y: 24  }}
              animate={{ opacity: 1, scale: 1,    y: 0   }}
              exit={{   opacity: 0, scale: 0.97,  y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {activeIdx === 0 && <BrowseMockup />}
              {activeIdx === 1 && <ListingDetailMockup />}
              {activeIdx === 2 && <MessagesMockup />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/** ⑦ How it works — 3-column feature cards */
function HowItWorksSection() {
  const steps = [
    {
      icon: "🔍",
      title: "Discover a plan",
      body:  "Browse hundreds of verified listings. Filter by service, price, or available slots.",
    },
    {
      icon: "🤝",
      title: "Request to join",
      body:  "Send a request with one tap. Chat with the host and confirm every detail.",
    },
    {
      icon: "💸",
      title: "Split and save",
      body:  "Pay your share every month. Track savings and manage memberships in one place.",
    },
  ];

  return (
    <section className="py-28 px-4 bg-white dark:bg-slate-950">
      <motion.h2
        className="text-5xl sm:text-6xl font-bold tracking-tight leading-none text-center
                   text-gray-900 dark:text-white mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        From inspiration to creation.
      </motion.h2>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-7 border border-gray-100
                       dark:border-slate-800 flex flex-col gap-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.55, ease: EASE }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <span className="text-3xl">{step.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              {step.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** ⑧ Testimonials — masonry-style quote cards */
function TestimonialsSection() {
  return (
    <section className="py-28 px-4 bg-white dark:bg-slate-950">
      <motion.h2
        className="text-5xl sm:text-6xl font-bold tracking-tight leading-none text-center
                   text-gray-900 dark:text-white mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        What our users are saying.
      </motion.h2>

      <div className="max-w-5xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            className="break-inside-avoid bg-white dark:bg-slate-900 rounded-2xl p-6
                       border border-gray-100 dark:border-slate-800
                       hover:shadow-lg hover:shadow-gray-100/80 dark:hover:shadow-black/20
                       transition-shadow duration-200"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.55, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center
                           text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: t.color }}
              >
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{t.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{t.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


/** ⑩ Pricing — free during beta, urgency-driven */
function PricingSection() {
  const features = [
    "Browse all available listings",
    "Join up to 3 subscription plans",
    "Host unlimited plans",
    "Built-in member messaging",
    "Verified member badge",
    "Priority support during beta",
  ];

  return (
    <section className="relative py-28 px-4 bg-gray-50 dark:bg-slate-900 overflow-hidden">

      {/* ── Background gradient orbs ── */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)" }}
      />

      {/* ── Section heading ── */}
      <div className="relative z-10 text-center mb-14 max-w-2xl mx-auto">

        {/* Live badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border
                     border-emerald-200 dark:border-emerald-800/50
                     bg-emerald-50 dark:bg-emerald-900/20 mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Free during early access
          </span>
        </motion.div>

        <h2 className="text-5xl sm:text-6xl font-bold tracking-tight leading-none
                       text-gray-900 dark:text-white mb-5">
          <RevealText text="Everything's free," delay={0.05} />
          <br />
          <RevealText text="for now." delay={0.25} />
        </h2>

        <motion.p
          className="text-lg text-gray-500 dark:text-slate-400 font-medium leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.35, ease: EASE }}
        >
          We&apos;re in early access. All features are completely free while we grow.
          <br />
          Lock in your spot before pricing starts.
        </motion.p>
      </div>

      {/* ── Pricing card ── */}
      <motion.div
        className="relative z-10 max-w-md mx-auto"
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        {/* Animated gradient border wrapper */}
        <motion.div
          className="rounded-3xl p-[1.5px]"
          style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)" }}
          animate={{
            boxShadow: [
              "0 0 0px 0px rgba(99,102,241,0)",
              "0 0 40px 8px rgba(99,102,241,0.20)",
              "0 0 0px 0px rgba(99,102,241,0)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="bg-white dark:bg-slate-950 rounded-[22px] p-8">

            {/* Card top — badge + plan name */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Early Access
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900
                               dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-wide">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  ●
                </motion.span>
                Limited time
              </span>
            </div>

            {/* Price block */}
            <div className="mb-7">
              {/* Strikethrough old price with animated line */}
              <div className="relative inline-flex items-center gap-2 mb-2">
                <span className="text-lg text-gray-400 dark:text-slate-500 font-semibold">₹299</span>
                <motion.div
                  className="absolute top-1/2 left-0 h-[2px] bg-red-400 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.7, ease: EASE }}
                />
                <span className="text-xs font-semibold text-red-400">saved</span>
              </div>

              {/* Free price */}
              <div className="flex items-end gap-2">
                <motion.span
                  className="text-7xl font-black text-gray-900 dark:text-white leading-none tracking-tighter"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
                >
                  ₹0
                </motion.span>
                <span className="text-base text-gray-400 dark:text-slate-500 font-medium mb-2">/ month</span>
              </div>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                No credit card required
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-slate-800 mb-6" />

            {/* Feature list */}
            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <motion.li
                  key={f}
                  className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300 font-medium"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.07, duration: 0.4, ease: EASE }}
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40
                                   flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </motion.li>
              ))}
            </ul>

            {/* CTA button */}
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-up"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl
                           bg-gray-900 dark:bg-white text-white dark:text-gray-900
                           text-base font-bold hover:bg-gray-700 dark:hover:bg-slate-100
                           transition-colors shadow-lg shadow-gray-900/15"
              >
                Join for free — it&apos;s ₹0
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex items-center justify-center gap-2 mt-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <motion.span
                className="text-yellow-400"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                ⚡
              </motion.span>
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                12,000+ members already joined for free
              </span>
            </motion.div>

          </div>
        </motion.div>
      </motion.div>

      {/* ── Urgency note below card ── */}
      <motion.p
        className="relative z-10 text-center text-xs text-gray-400 dark:text-slate-600
                   font-medium mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Pricing will be introduced when we exit beta. Early members keep free access.
      </motion.p>

    </section>
  );
}

/** ⑪ Final CTA */
function CTASection() {
  return (
    <section className="py-28 px-4 text-center bg-white dark:bg-slate-950">
      <motion.h2
        className="text-5xl sm:text-6xl font-bold tracking-tight leading-none
                   text-gray-900 dark:text-white mb-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        Start splitting today.
      </motion.h2>

      <motion.p
        className="text-xl text-gray-500 dark:text-slate-400 font-medium mb-10
                   max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
      >
        Join thousands of members already saving money every month on the subscriptions they love.
      </motion.p>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
      >
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/sign-up"
            className="px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900
                       text-base font-bold hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors
                       shadow-xl shadow-gray-900/15"
          >
            Join for free
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/browse"
            className="px-8 py-4 rounded-full text-base font-bold text-gray-900 dark:text-white
                       border border-gray-300 dark:border-slate-700 hover:border-gray-500
                       dark:hover:border-slate-500 transition-all"
          >
            Browse plans →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/** ⑪ Footer — dark background, minimal links */
function Footer() {
  return (
    <footer className="bg-gray-950 dark:bg-black text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-10 mb-12">
          <div>
            {/* Footer is always dark bg — use dark logo directly */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dark.png"
              alt="SubSplit"
              className="h-12 w-auto object-contain mb-3"
            />
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              The cleanest way to share subscriptions with people you trust.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Product</p>
              {["Browse", "Pricing", "How it works", "Blog"].map((l) => (
                <Link key={l} href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Connect</p>
              {["X (Twitter)", "LinkedIn", "Instagram", "Discord"].map((l) => (
                <Link key={l} href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-xs text-gray-600">© SubSplit 2024–2025. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy policy", "Terms"].map((l) => (
              <Link key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <LandingNav />
      <HeroSection />
      <SocialProofSection />
      <ProductPreviewSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
