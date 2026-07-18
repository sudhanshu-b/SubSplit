"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

// ─── Data ─────────────────────────────────────────────────────────────────────

// Subscription services shown in the rotating hero icon
const SERVICES = [
  { name: "Netflix",    bg: "#E50914", icon: "https://cdn.simpleicons.org/netflix/ffffff",        filter: undefined },
  { name: "ChatGPT",    bg: "#10a37f", icon: "/ChatGPT-Logo.png",                                filter: "brightness(0) invert(1)" },
  { name: "Spotify",    bg: "#1DB954", icon: "https://cdn.simpleicons.org/spotify/ffffff",        filter: undefined },
  { name: "Claude",     bg: "#ffffff", icon: "/claude.png",                                       filter: undefined },
  { name: "YouTube",    bg: "#FF0000", icon: "https://cdn.simpleicons.org/youtube/ffffff",        filter: undefined },
  { name: "Gemini",     bg: "#ffffff", icon: "/Gemini-logo.png",                                  filter: undefined },
  { name: "iCloud+",    bg: "#3693F3", icon: "https://cdn.simpleicons.org/icloud/ffffff",         filter: undefined },
  { name: "Perplexity", bg: "#1FB8CD", icon: "https://cdn.simpleicons.org/perplexity/ffffff",    filter: undefined },
  { name: "Copilot",    bg: "#6941C6", icon: "https://cdn.simpleicons.org/githubcopilot/ffffff",  filter: undefined },
  { name: "Notion",     bg: "#191919", icon: "https://cdn.simpleicons.org/notion/ffffff",         filter: undefined },
  { name: "GitHub",     bg: "#24292E", icon: "https://cdn.simpleicons.org/github/ffffff",         filter: undefined },
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

export type LandingTestimonial = {
  authorName:  string;
  authorRole:  string;
  body:        string;
  metric:      string;
  metricLabel: string;
  avatarUrl:   string | null;
};

// Shown only if the database has no published testimonials yet (e.g. before
// the admin panel's testimonial table has been seeded).
const FALLBACK_TESTIMONIALS: LandingTestimonial[] = [
  {
    authorName: "Priya Sharma", authorRole: "Student, Delhi",
    body: "Saving ₹600/month on Netflix and Spotify. The host was super friendly and payment was totally seamless.",
    metric: "₹600", metricLabel: "saved per month",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
  },
  {
    authorName: "Arjun Mehta", authorRole: "Developer, Bengaluru",
    body: "I host 3 plans and completely offset my own subscription costs. The messaging feature makes coordination effortless.",
    metric: "3×", metricLabel: "subscription costs recovered",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
  },
  {
    authorName: "Sneha Rao", authorRole: "Designer, Mumbai",
    body: "Finally a clean, trustworthy way to share subscriptions. No more sketchy WhatsApp groups. I feel safe here.",
    metric: "100%", metricLabel: "stress-free sharing",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    authorName: "Karan Patel", authorRole: "Entrepreneur, Ahmedabad",
    body: "Split YouTube Premium with 3 others. Paying ₹50/month instead of ₹189. The browse UX is really polished.",
    metric: "₹139", metricLabel: "saved every month",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
  },
  {
    authorName: "Divya Nair", authorRole: "Teacher, Kochi",
    body: "Simple, clean, honest. LetsSplit does exactly what it promises. I've recommended it to my entire family.",
    metric: "5★", metricLabel: "rated by my whole family",
    avatarUrl: "https://i.pravatar.cc/150?img=44",
  },
  {
    authorName: "Rohan Gupta", authorRole: "Product Manager, Pune",
    body: "Found a Notion plan in 2 minutes, requested to join, and was approved the same day. Perfect experience.",
    metric: "2 min", metricLabel: "to find the right plan",
    avatarUrl: "https://i.pravatar.cc/150?img=57",
  },
  {
    authorName: "Meera Joshi", authorRole: "Freelancer, Hyderabad",
    body: "Splitting ChatGPT Plus with two colleagues through LetsSplit. We each pay ₹670 instead of ₹2000. Honestly brilliant.",
    metric: "₹1330", metricLabel: "saved on ChatGPT Plus",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
  },
  {
    authorName: "Vikram Nair", authorRole: "Researcher, Chennai",
    body: "Found a Claude Pro plan to share within a day. The host setup everything, I just pay my share — totally hassle-free.",
    metric: "66%", metricLabel: "off Claude Pro",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
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
  { name: "ChatGPT",              icon: "/ChatGPT-Logo.png"  },
  { name: "Claude",               icon: "https://thesvg.org/icons/claude/default.svg"        },
  { name: "Gemini",               icon: "/Gemini-logo.png"   },
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
          <img
            src={SERVICES[idx].icon}
            alt={SERVICES[idx].name}
            className="w-10 h-10 object-contain"
            style={SERVICES[idx].filter ? { filter: SERVICES[idx].filter } : undefined}
          />
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

/** Browse listings mockup — rich 3-card preview of the LetsSplit browse page */
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
              <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate">letssplit.in/browse</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* ── In-app navbar ── */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-5">
            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">LetsSplit</span>
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
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex-shrink-0 flex-1 min-w-0 flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border
                            border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
              <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">Search by service, price…</span>
            </div>
            {["All", "Streaming", "Productivity", "AI Tools"].map((f, i) => (
              <span key={f} className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                i === 0
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              }`}>{f}</span>
            ))}
          </div>
        </div>

        {/* ── 3 rich listing cards ── */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
export function LandingNav() {
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
                      ? "bg-white/95 dark:bg-zinc-950/95 shadow-lg shadow-black/8 dark:shadow-black/40 border border-gray-200 dark:border-zinc-800"
                      : "bg-gray-50/95 dark:bg-zinc-900/95 border border-gray-200 dark:border-zinc-800"
                    }`}
      >
        {/* Logo — switches between light/dark variants based on theme */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="LetsSplit" className="h-10 w-auto object-contain dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png"  alt="LetsSplit" className="h-10 w-auto object-contain hidden dark:block" />
        </Link>

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-6">
          {([["Browse", "/browse"], ["About", "/about"], ["FAQ", "/faq"]] as [string, string][]).map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900
                         dark:text-zinc-400 dark:hover:text-white transition-colors"
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
                           hover:bg-gray-700 dark:hover:bg-zinc-100 transition-colors"
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
                           dark:text-zinc-400 dark:hover:text-white transition-colors px-2 hidden sm:block"
              >
                Log in
              </Link>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-full text-sm font-bold bg-gray-900 dark:bg-white
                             text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-zinc-100
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
      <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-none
                     text-gray-900 dark:text-white mb-6 max-w-4xl">
        <RevealText text="Split subscriptions." delay={0.1} />
        <br />
        <RevealText text="Save real money." delay={0.38} />
      </h1>

      {/* Subtext */}
      <motion.p
        className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-slate-400 font-medium
                   max-w-xl mb-10 leading-relaxed px-2 sm:px-0"
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
        className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
      >
        <motion.div whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
          <Link
            href="/sign-up"
            className="flex items-center justify-center px-7 py-3.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900
                       text-base font-bold hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors
                       shadow-lg shadow-gray-900/10 w-full sm:w-auto"
          >
            Join for free
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
          <Link
            href="/browse"
            className="flex items-center justify-center px-7 py-3.5 rounded-full text-base font-bold text-gray-900 dark:text-white
                       border border-gray-300 dark:border-slate-700 hover:border-gray-500
                       dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-900
                       transition-all gap-1.5 w-full sm:w-auto"
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


/**
 * ⑥ Features — sticky-scroll section.
 * The section is 3 × 100vh tall. A sticky inner div pins to the viewport
 * while scrollYProgress drives which feature (0/1/2) is displayed.
 * Tab bar + content + mockup all swap with AnimatePresence.
 */
function FeaturesEyebrow() {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-widest">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M4 1H1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Features
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M6 1h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the raw scroll signal so the crossfade below tracks the
  // gesture fluidly instead of jittering on fast/short scroll ticks.
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 260, damping: 38, mass: 0.4 });

  // Map 0→1 scroll to 0→(N−ε) so Math.floor gives indices 0, 1, 2 (drives
  // the tab bar + dot indicators only — the content crossfade below is
  // driven directly and continuously by smoothProgress, not this index).
  const rawIndex = useTransform(smoothProgress, [0, 1], [0, FEATURES.length - 0.001]);
  useMotionValueEvent(rawIndex, "change", (v) =>
    setActiveIdx(Math.max(0, Math.min(FEATURES.length - 1, Math.floor(v)))),
  );

  // Continuous cross-fade windows centered on each 1/3 scroll boundary, so
  // adjacent features dissolve into each other in lockstep with the scroll
  // position instead of snapping on a fixed-duration timer.
  const b1 = 1 / 3, b2 = 2 / 3, w = 0.08;
  const opacities = [
    useTransform(smoothProgress, [0, b1 - w, b1 + w], [1, 1, 0]),
    useTransform(smoothProgress, [b1 - w, b1 + w, b2 - w, b2 + w], [0, 1, 1, 0]),
    useTransform(smoothProgress, [b2 - w, b2 + w, 1], [0, 1, 1]),
  ];
  const ys = [
    useTransform(smoothProgress, [0, b1 - w, b1 + w], [0, 0, -16]),
    useTransform(smoothProgress, [b1 - w, b1 + w, b2 - w, b2 + w], [16, 0, 0, -16]),
    useTransform(smoothProgress, [b2 - w, b2 + w, 1], [16, 0, 0]),
  ];

  function jumpTo(i: number) {
    const el = containerRef.current;
    if (!el) return;
    const top = el.offsetTop + (el.offsetHeight * (i + 0.5)) / FEATURES.length;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <>

      {/* ── Mobile: stacked feature cards (no sticky scroll) ── */}
      <div className="md:hidden px-4 py-16 bg-white dark:bg-slate-950 space-y-20">
        <div className="text-center mb-2">
          <FeaturesEyebrow />
        </div>
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center text-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-slate-900 text-sm font-bold text-gray-600 dark:text-slate-400">
              {f.tab}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-pre-line">
              {f.headline}
            </h2>
            <p className="text-base text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
              {f.body}
            </p>
            <div className="w-full">
              {i === 0 && <BrowseMockup />}
              {i === 1 && <ListingDetailMockup />}
              {i === 2 && <MessagesMockup />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Desktop: sticky scroll (md and up) ── */}
      <div
        ref={containerRef}
        style={{ height: `${FEATURES.length * 100}vh` }}
        className="relative hidden md:block"
      >
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center
                        px-4 py-6 bg-white dark:bg-slate-950 overflow-hidden">

          <div className="mb-3 shrink-0">
            <FeaturesEyebrow />
          </div>

          {/* Tab bar — click to jump, active pill tracks scroll position */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-900 rounded-full p-1 mb-6 shrink-0">
            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className={`relative px-5 py-2 rounded-full text-sm font-bold transition-colors duration-300 select-none cursor-pointer ${
                  activeIdx === i
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                }`}
              >
                {activeIdx === i && (
                  <motion.span
                    layoutId="features-tab-pill"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 420, damping: 38 }}
                  />
                )}
                <span className="relative">{f.tab}</span>
              </button>
            ))}
          </div>

          {/* Cross-fading content — all three stacked, opacity/position driven
              continuously by scroll so the transition feels glued to the gesture */}
          <div className="relative w-full max-w-2xl flex-1 min-h-0">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                style={{ opacity: opacities[i], y: ys[i] }}
                className={`absolute inset-0 flex flex-col items-center text-center overflow-hidden ${
                  i === activeIdx ? "" : "pointer-events-none"
                }`}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight
                               text-gray-900 dark:text-white mb-2.5 whitespace-pre-line shrink-0">
                  {f.headline}
                </h2>
                <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 font-medium leading-relaxed mb-5 max-w-md shrink-0">
                  {f.body}
                </p>
                <div className="w-full min-h-0 scale-[0.85] sm:scale-90 lg:scale-100 origin-top">
                  {i === 0 && <BrowseMockup />}
                  {i === 1 && <ListingDetailMockup />}
                  {i === 2 && <MessagesMockup />}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center items-center gap-1.5 mt-3 shrink-0">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                aria-label={`Jump to ${FEATURES[i].tab}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIdx ? "w-6 bg-emerald-500" : "w-1.5 bg-gray-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/** ⑦ How it works — 3-column feature cards */
const HOW_IT_WORKS_STEPS = [
  {
    title: "List it, or find it.",
    body:  "Host a plan for a subscription you already pay for, or browse open listings filtered by service, price, and available seats.",
  },
  {
    title: "Request, then get approved.",
    body:  "Send a join request with one tap. Hosts review and approve who joins — no surprise members, no bots.",
  },
  {
    title: "Pay your share, together.",
    body:  "Confirm UPI details in the group chat and track who's paid, right on the listing — no spreadsheets, no chasing.",
  },
  {
    title: "Get access, arranged directly.",
    body:  "Access is shared directly by the host through the service's normal sharing features or a shared sign-in, and SubSplit never sees, stores, or brokers login credentials.",
  },
  {
    title: "Trust builds with every plan.",
    body:  "Completed plans and reviews shape your trust score, so hosts and members can vet each other before joining.",
  },
];

/** ⑦ How it works — plain numbered steps, one after another */
function HowItWorksSection() {
  return (
    <section className="py-16 md:py-28 px-4 bg-white dark:bg-slate-950">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-5">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M4 1H1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          How it works
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6 1h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
          From browsing to sharing.
        </h2>
      </div>

      <div className="max-w-xl mx-auto">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <motion.div
            key={i}
            className={`text-center py-10 md:py-12 ${
              i > 0 ? "border-t border-gray-100 dark:border-slate-800" : ""
            }`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <span className="inline-flex items-center justify-center min-w-11 px-3 py-1 rounded-full border
                             border-gray-200 dark:border-slate-700 text-sm font-semibold
                             text-gray-500 dark:text-slate-400 mb-5">
              {i + 1}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
              {step.title}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {step.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function initialsOf(name: string) {
  return name.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

function testimonialColor(name: string) {
  const palette = ["#4f46e5", "#0ea5e9", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#10a37f", "#D97757"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

/** ⑧ Testimonials — bento-grid with auto-cycling cards */
function TestimonialsSection({ testimonials }: { testimonials: LandingTestimonial[] }) {
  const n = testimonials.length;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % n), 3800);
    return () => clearInterval(id);
  }, [n]);

  const t0 = testimonials[idx % n];
  const t1 = testimonials[(idx + 1) % n];
  const t2 = testimonials[(idx + 2) % n];
  const t3 = testimonials[(idx + 3) % n];

  const enter = { opacity: 0, y: 28 };
  const show  = { opacity: 1, y: 0  };
  const leave = { opacity: 0, y: -18 };

  const QuoteIcon = ({ size = 5 }: { size?: number }) => (
    <svg
      className={`w-${size} h-${size} text-emerald-500 mb-2 flex-shrink-0`}
      fill="currentColor" viewBox="0 0 24 24"
    >
      <path d="M14.017 21v-7.391c0-5.704 3.748-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
    </svg>
  );

  return (
    <section className="py-16 md:py-28 px-4 bg-gray-50 dark:bg-slate-900">

      {/* Header */}
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-5">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M4 1H1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Testimonials
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6 1h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-2">
          Results that speak for themselves.
        </h2>
      </div>

      {/* Bento grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Large left card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`large-${idx}`}
            initial={enter} animate={show} exit={leave}
            transition={{ duration: 0.45, ease: EASE }}
            className="bg-white dark:bg-slate-950 rounded-3xl p-8 flex flex-col
                       border border-gray-100 dark:border-slate-800 min-h-[340px]"
          >
            <div className="mb-5">
              <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                {t0.metric}
              </span>
              <p className="text-sm font-semibold text-gray-400 dark:text-slate-500 mt-1">{t0.metricLabel}</p>
            </div>
            <QuoteIcon size={6} />
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed flex-1">
              &ldquo;{t0.body}&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
              {t0.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t0.avatarUrl} alt={t0.authorName}
                     className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-slate-800" />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: testimonialColor(t0.authorName) }}
                >
                  {initialsOf(t0.authorName)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{t0.authorName}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{t0.authorRole}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Medium top card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`mid-${idx}`}
              initial={enter} animate={show} exit={leave}
              transition={{ duration: 0.45, delay: 0.07, ease: EASE }}
              className="bg-white dark:bg-slate-950 rounded-3xl p-6 flex flex-col
                         border border-gray-100 dark:border-slate-800"
            >
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  {t1.metric}
                </span>
                <span className="text-sm font-semibold text-gray-400 dark:text-slate-500">{t1.metricLabel}</span>
              </div>
              <QuoteIcon size={5} />
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed flex-1">
                &ldquo;{t1.body}&rdquo;
              </p>
              <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                {t1.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t1.avatarUrl} alt={t1.authorName}
                       className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-gray-100 dark:ring-slate-800" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: testimonialColor(t1.authorName) }}
                  >
                    {initialsOf(t1.authorName)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{t1.authorName}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{t1.authorRole}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Two small cards */}
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`sm1-${idx}`}
                initial={enter} animate={show} exit={leave}
                transition={{ duration: 0.45, delay: 0.13, ease: EASE }}
                className="bg-white dark:bg-slate-950 rounded-3xl p-5 flex flex-col
                           border border-gray-100 dark:border-slate-800"
              >
                <QuoteIcon size={4} />
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed flex-1 line-clamp-4">
                  &ldquo;{t2.body}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                  {t2.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t2.avatarUrl} alt={t2.authorName}
                         className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-gray-100 dark:ring-slate-800" />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: testimonialColor(t2.authorName) }}
                    >
                      {initialsOf(t2.authorName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none truncate">{t2.authorName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{t2.authorRole.split(",")[0]}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`sm2-${idx}`}
                initial={enter} animate={show} exit={leave}
                transition={{ duration: 0.45, delay: 0.19, ease: EASE }}
                className="bg-white dark:bg-slate-950 rounded-3xl p-5 flex flex-col
                           border border-gray-100 dark:border-slate-800"
              >
                <QuoteIcon size={4} />
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed flex-1 line-clamp-4">
                  &ldquo;{t3.body}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                  {t3.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t3.avatarUrl} alt={t3.authorName}
                         className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-gray-100 dark:ring-slate-800" />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: testimonialColor(t3.authorName) }}
                    >
                      {initialsOf(t3.authorName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none truncate">{t3.authorName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{t3.authorRole.split(",")[0]}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-1.5 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === idx ? "w-6 bg-emerald-500" : "w-1.5 bg-gray-300 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    </section>
  );
}



/** ⑪ Final CTA — card with orbit visual */
function CTASection() {
  const ORBIT_POS = [
    { top: "14%", left: "52%" },
    { top: "32%", left: "86%" },
    { top: "66%", left: "88%" },
    { top: "84%", left: "52%" },
    { top: "54%", left: "10%" },
    { top: "20%", left: "18%" },
  ];
  const avatars = ORBIT_POS.map((pos, i) => ({ ...pos, ...FALLBACK_TESTIMONIALS[i] }));

  return (
    <section className="py-16 md:py-20 px-4 bg-gray-50 dark:bg-slate-900">
      <motion.div
        className="max-w-5xl mx-auto bg-white dark:bg-slate-950 rounded-3xl overflow-hidden
                   border border-gray-100 dark:border-slate-800 shadow-sm"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Left: text + CTA */}
          <div className="flex flex-col justify-center p-10 md:p-14">
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Start splitting today
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-4">
              Split smarter,<br />save more.
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xs">
              Share subscriptions with verified members. Save up to{" "}
              <span className="font-bold text-gray-900 dark:text-white">₹2,000/month</span>{" "}
              on the tools you love — completely{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">free</span>.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 dark:bg-white
                         text-white dark:text-gray-900 text-sm font-bold w-fit
                         hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors shadow-sm"
            >
              Get started for free
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
          </div>

          {/* Right: orbit visual */}
          <div className="relative hidden md:block min-h-[320px] bg-gray-50 dark:bg-slate-900/40 overflow-hidden">
            {/* Concentric dashed rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[34, 58, 84].map((pct, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-dashed border-gray-200 dark:border-slate-700/60"
                  style={{ width: `${pct}%`, height: `${pct}%` }}
                />
              ))}
            </div>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
            </div>

            {/* Orbiting avatars */}
            {avatars.map((a, i) => (
              <motion.div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: a.top, left: a.left }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3 + i * 0.55, repeat: Infinity, ease: "easeInOut", delay: i * 0.45 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.avatarUrl ?? undefined}
                  alt={a.authorName}
                  className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white dark:ring-slate-950"
                />
              </motion.div>
            ))}
          </div>

        </div>
      </motion.div>
    </section>
  );
}

/** ⑫ Footer */
function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 px-4 pb-10">
      <div className="max-w-5xl mx-auto">

        <div className="border-t border-gray-200 dark:border-slate-800 mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Logo + tagline */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="LetsSplit" className="h-8 w-auto object-contain mb-3 dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png"  alt="LetsSplit" className="h-8 w-auto object-contain mb-3 hidden dark:block" />
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
              The cleanest way to share subscriptions with people you trust.
            </p>
          </div>

          {/* Company links */}
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Company
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Browse plans", href: "/browse"  },
                { label: "About",        href: "/about"   },
                { label: "FAQ",          href: "/faq"     },
                { label: "Contact us",   href: "/contact" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-gray-500 dark:text-slate-400
                             hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Newsletter
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
              Get updates on new features and early access.
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 rounded-full
                            border border-gray-200 dark:border-slate-700 px-3.5 py-2 shadow-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-slate-200
                           placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none min-w-0"
              />
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center
                           hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-slate-800 pt-6
                        flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            © 2026 LetsSplit · All rights reserved
          </p>
          <div className="flex gap-5">
            {[
              { label: "Privacy policy", href: "/privacy" },
              { label: "Terms",          href: "/terms"   },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-gray-400 dark:text-slate-500
                           hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function LandingPage({ testimonials }: { testimonials?: LandingTestimonial[] }) {
  return (
    <main className="bg-white dark:bg-slate-950">
      <LandingNav />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection testimonials={testimonials?.length ? testimonials : FALLBACK_TESTIMONIALS} />
      <CTASection />
      <Footer />
    </main>
  );
}
