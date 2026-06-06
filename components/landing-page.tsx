"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v)}${suffix}`);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, motionVal, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

// ─── Mock dashboard card (Payoneer-inspired) ─────────────────────────────────
const bars = [38, 62, 48, 75, 55, 68, 92];
const days = ["M", "T", "W", "T", "F", "S", "S"];

const mockServices = [
  { name: "Spotify", price: "$2.50", seats: "4 / 6", color: "bg-emerald-500" },
  { name: "Netflix", price: "$3.75", seats: "2 / 4", color: "bg-red-500" },
  { name: "YouTube", price: "$1.67", seats: "5 / 6", color: "bg-rose-500" },
];

function DashboardCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
      className="w-full max-w-sm mx-auto"
    >
      {/* Main dark card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="bg-slate-950 rounded-2xl p-6 shadow-2xl border border-white/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-indigo-400 text-sm font-semibold tracking-wide">SubSplit</span>
          <span className="text-xs text-slate-500">This month</span>
        </div>

        {/* Big number */}
        <p className="text-slate-400 text-sm mb-1">Total saved</p>
        <div className="flex items-end gap-2 mb-6">
          <span className="text-white text-4xl font-bold tracking-tight">$47.50</span>
          <span className="text-emerald-400 text-sm font-medium mb-1">↑ 12%</span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5 h-16 mb-2">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-t ${i === bars.length - 1 ? "bg-indigo-500" : "bg-slate-700"}`}
              style={{ height: `${h}%` }}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.06, ease: "easeOut" }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {days.map((d, i) => (
            <span
              key={i}
              className={`flex-1 text-center text-xs ${i === days.length - 1 ? "text-indigo-400 font-medium" : "text-slate-600"}`}
            >
              {d}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Three service mini-cards */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        {mockServices.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
          >
            <div className={`w-5 h-5 rounded-full ${s.color} mb-2`} />
            <p className="text-xs text-gray-500 font-medium">{s.name}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{s.price}</p>
            <p className="text-xs text-gray-400">{s.seats} seats</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Fade-up wrapper ──────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-56px)] flex items-center">
        {/* Background gradient blob */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-100 opacity-60 blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-[300px] h-[300px] rounded-full bg-violet-100 opacity-40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Now in beta · Join free
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4"
              >
                Split subscriptions.
                <br />
                <span className="text-indigo-600">Save together.</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md"
            >
              Find people to share Netflix, Spotify, YouTube Premium and more.
              Split the cost — not the quality.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link
                href="/browse"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                Browse listings →
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
              >
                Create a listing
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {["bg-indigo-400", "bg-violet-400", "bg-pink-400", "bg-emerald-400"].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">2,000+</span> active splits worldwide
              </p>
            </motion.div>
          </div>

          {/* Right — dashboard visual */}
          <DashboardCard />
        </div>
      </section>

      {/* ── DARK STATS BAR ───────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {[
              { value: 8, suffix: "+", label: "Services available", sub: "Spotify, Netflix, YouTube & more" },
              { value: 3, suffix: "×", label: "Average savings", sub: "vs. paying solo" },
              { value: 100, suffix: "%", label: "Credential-free", sub: "No passwords shared, ever" },
            ].map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.1}>
                <div>
                  <p className="text-5xl font-extrabold text-white tracking-tight">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-indigo-400 font-semibold mt-2">{stat.label}</p>
                  <p className="text-slate-500 text-sm mt-1">{stat.sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <FadeUp className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-semibold tracking-widest uppercase mb-3">How it works</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Three steps to start saving
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Host posts a slot",
                body: "List your existing family plan — set the price, seats, and region. Takes 60 seconds.",
                icon: "📋",
              },
              {
                step: "02",
                title: "Buyer requests a seat",
                body: "Browse active listings, find your service, and send a join request to the host.",
                icon: "🔍",
              },
              {
                step: "03",
                title: "Split the bill",
                body: "Host approves, you pay your share. Everyone saves — no credentials exchanged.",
                icon: "💸",
              },
            ].map((card, i) => (
              <FadeUp key={card.step} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(79,70,229,0.15)" }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-7 border border-gray-100 h-full"
                >
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <span className="text-xs font-bold text-indigo-400 tracking-widest">{card.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.body}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <FadeUp className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-semibold tracking-widest uppercase mb-3">Available now</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Officially supported plans
            </h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              We only list services with official family or group plans — fully within their terms of service.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Spotify Family",       price: "$2.50", color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
              { name: "YouTube Premium",      price: "$1.67", color: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50" },
              { name: "Netflix",              price: "$3.75", color: "bg-red-600",     text: "text-red-800",     bg: "bg-red-50" },
              { name: "Apple One",            price: "$5.00", color: "bg-slate-700",   text: "text-slate-700",   bg: "bg-slate-50" },
              { name: "Microsoft 365",        price: "$2.17", color: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50" },
              { name: "Amazon Prime",         price: "$2.50", color: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50" },
              { name: "Disney+",              price: "$2.75", color: "bg-blue-700",    text: "text-blue-800",    bg: "bg-blue-50" },
              { name: "Max",                  price: "$3.25", color: "bg-violet-600",  text: "text-violet-700",  bg: "bg-violet-50" },
            ].map((s, i) => (
              <FadeUp key={s.name} delay={i * 0.06}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                    <div className={`w-4 h-4 rounded-full ${s.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                  <p className="text-lg font-extrabold text-gray-900 mt-1">{s.price}</p>
                  <p className="text-xs text-gray-400">/ seat / mo</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAVINGS CALCULATOR PREVIEW ────────────────────────────────────── */}
      <section className="bg-slate-950 py-24">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <FadeUp>
            <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-4">The math is simple</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Stop paying full price<br />for services you share.
            </h2>
            <div className="space-y-4 mb-8">
              {[
                { label: "Spotify Family plan", full: "$17.99", split: "$2.99", seats: 6 },
                { label: "YouTube Premium",     full: "$22.99", split: "$3.83", seats: 6 },
                { label: "Netflix Standard",    full: "$15.49", split: "$3.87", seats: 4 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-white font-medium text-sm">{row.label}</p>
                    <p className="text-slate-500 text-xs">{row.seats} seats</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs line-through">{row.full} / mo</p>
                    <p className="text-emerald-400 font-bold">{row.split} / mo</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
            >
              Find a split now →
            </Link>
          </FadeUp>

          {/* Right — stacked visual */}
          <FadeUp delay={0.2}>
            <div className="space-y-3">
              {[
                { label: "Week 1", val: 62 },
                { label: "Week 2", val: 78 },
                { label: "Week 3", val: 55 },
                { label: "This week", val: 91, highlight: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className={`text-xs w-20 shrink-0 ${row.highlight ? "text-indigo-400 font-semibold" : "text-slate-500"}`}>
                    {row.label}
                  </span>
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                      className={`h-full rounded-full ${row.highlight ? "bg-indigo-500" : "bg-slate-600"}`}
                    />
                  </div>
                  <span className={`text-xs w-10 text-right ${row.highlight ? "text-indigo-400 font-bold" : "text-slate-500"}`}>
                    {row.val}%
                  </span>
                </div>
              ))}
              <p className="text-slate-600 text-xs pt-2">Seat fill rate across all active listings</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <FadeUp className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Ready to start saving?
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of people already splitting subscriptions on SubSplit.
            Free to join, no credit card needed.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/sign-up"
              className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Get started free
            </Link>
            <Link
              href="/browse"
              className="rounded-xl border border-gray-200 px-8 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Browse listings
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between text-sm text-gray-400">
          <span className="font-bold text-indigo-600">SubSplit</span>
          <span>Split subscriptions. Save together.</span>
        </div>
      </footer>
    </div>
  );
}
