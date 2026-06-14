"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/components/spinner";

const EASE = [0.22, 1, 0.36, 1] as const;

// Services cycled in the savings ticker
const SAVINGS_ITEMS = [
  {
    service: "Netflix",
    amount: "₹150",
    bg: "#E50914",
    icon: "https://cdn.simpleicons.org/netflix/ffffff",
  },
  {
    service: "Spotify",
    amount: "₹89",
    bg: "#1DB954",
    icon: "https://cdn.simpleicons.org/spotify/ffffff",
  },
  {
    service: "YouTube",
    amount: "₹119",
    bg: "#FF0000",
    icon: "https://cdn.simpleicons.org/youtube/ffffff",
  },
  {
    service: "iCloud+",
    amount: "₹79",
    bg: "#3693F3",
    icon: "https://cdn.simpleicons.org/icloud/ffffff",
  },
  {
    service: "Notion",
    amount: "₹99",
    bg: "#191919",
    icon: "https://cdn.simpleicons.org/notion/ffffff",
  },
];

// ── Time-aware greeting ────────────────────────────────────────────────────
function greeting(name: string) {
  const h = new Date().getHours();
  const part =
    h < 5
      ? "Good night"
      : h < 12
        ? "Good morning"
        : h < 17
          ? "Good afternoon"
          : "Good evening";
  const first = name.split(" ")[0] ?? name;
  return { part, first };
}

// ── Fade-up wrapper ────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
// ── Service savings ticker ─────────────────────────────────────────────────
// Fixed-height, fixed-width clip box so animating children never shift layout.
function SavingsTicker() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDir(1);
      setIdx((i) => (i + 1) % SAVINGS_ITEMS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const item = SAVINGS_ITEMS[idx];

  return (
    <span
      className="relative inline-block overflow-hidden align-middle"
      style={{ height: "1.6em", minWidth: 220 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={dir}>
        <motion.span
          key={idx}
          custom={dir}
          variants={{
            enter: (d: number) => ({ y: d * 14, opacity: 0 }),
            center: { y: 0, opacity: 1 },
            exit: (d: number) => ({ y: d * -14, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: EASE }}
          className="absolute inset-0 flex items-center gap-1.5 whitespace-nowrap"
        >
          {/* Service icon bubble */}
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: item.bg }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.icon}
              alt={item.service}
              className="w-3 h-3 object-contain"
            />
          </span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {item.amount}/mo
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">
            on {item.service}
          </span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ── Action card ────────────────────────────────────────────────────────────
type CardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  loading?: boolean;
  onClick?: () => void;
  delay?: number;
};

function ActionCard({ href, eyebrow, title, description, loading = false, onClick, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover={loading ? {} : { y: -3, transition: { duration: 0.22, ease: EASE } }}
      whileTap={loading ? {} : { scale: 0.985 }}
    >
      <Link
        href={href}
        onClick={onClick}
        className="group flex flex-col rounded-2xl p-4 sm:p-5 border
                   border-zinc-200 dark:border-zinc-700/60
                   bg-white dark:bg-zinc-900
                   hover:bg-zinc-900 dark:hover:bg-zinc-800
                   hover:border-zinc-900 dark:hover:border-zinc-500
                   transition-all duration-300
                   shadow-sm dark:shadow-none
                   hover:shadow-lg hover:shadow-zinc-200/60 dark:hover:shadow-black/50
                   relative overflow-hidden"
      >
        {/* Eyebrow */}
        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5
                      text-zinc-400 dark:text-zinc-500
                      group-hover:text-white/50
                      transition-colors duration-300">
          {eyebrow}
        </p>

        {/* Title */}
        <h3 className="text-lg font-bold tracking-tight leading-snug mb-1.5
                       text-zinc-900 dark:text-zinc-100
                       group-hover:text-white
                       transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed font-medium mb-5
                      text-zinc-500 dark:text-zinc-400
                      group-hover:text-white/60
                      transition-colors duration-300">
          {description}
        </p>

        {/* Arrow / loader */}
        <div className="flex items-center gap-1.5 text-sm font-bold
                        text-zinc-900 dark:text-zinc-100
                        group-hover:text-white
                        group-hover:gap-2.5 transition-all duration-300">
          {loading ? (
            <>
              <Spinner className="w-3.5 h-3.5" />
              <span>Getting things ready...</span>
            </>
          ) : (
            <>
              Get started
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function HomeClient({
  userName,
}: {
  userName: string;
  userEmail: string;
}) {
  const router = useRouter();
  const { part, first } = greeting(userName);
  const [loadingCard, setLoadingCard] = useState<string | null>(null);

  function handleCardClick(href: string) {
    setLoadingCard(href);
    router.push(href);
  }

  return (
    <main className="bg-zinc-50 dark:bg-[#0e0e10]">
      <div className="max-w-2xl mx-auto px-4 sm:px-5 py-10 sm:py-16 md:py-24">
        {/* ── Greeting ── */}
        <FadeUp delay={0.05}>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-4">
            {part}
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] text-zinc-900 dark:text-zinc-100 mb-5 break-words overflow-hidden">
            {first ? (
              <>
                Welcome,&nbsp;
                <span className="text-zinc-400 dark:text-zinc-500">
                  {first}.
                </span>
              </>
            ) : (
              "Welcome."
            )}
          </h1>
        </FadeUp>

        {/* ── Journey message + savings counter ── */}
        <FadeUp delay={0.18}>
          <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-3">
            You&apos;re one step ahead in your savings journey.
          </p>

          {/* Savings strip */}
          <div className="flex items-center gap-x-2.5 gap-y-1.5 text-sm flex-wrap">
            <span className="text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap">
              Members save up to
            </span>

            <SavingsTicker />
          </div>
        </FadeUp>

        {/* ── Divider ── */}
        <FadeUp delay={0.28}>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800/80 my-10" />
        </FadeUp>

        {/* ── Action cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            href="/listings/new"
            eyebrow="For hosts"
            title="List a subscription"
            description="Share a plan you already pay for and split the cost with trusted members."
            loading={loadingCard === "/listings/new"}
            onClick={() => handleCardClick("/listings/new")}
            delay={0.35}
          />

          <ActionCard
            href="/browse"
            eyebrow="For members"
            title="Find a plan to join"
            description="Browse verified subscription slots and start saving on services you already use."
            loading={loadingCard === "/browse"}
            onClick={() => handleCardClick("/browse")}
            delay={0.44}
          />
        </div>
      </div>
    </main>
  );
}
