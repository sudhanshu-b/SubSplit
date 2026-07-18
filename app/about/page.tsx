"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

function fade(delay = 0) {
  return {
    initial:    { opacity: 0, y: 20 },
    animate:    { opacity: 1, y: 0  },
    transition: { duration: 0.55, ease: EASE, delay },
  };
}

const STACK: { name: string; icon?: string; invert?: boolean }[] = [
  { name: "Next.js",      icon: "https://cdn.simpleicons.org/nextdotjs",          invert: true  },
  { name: "TypeScript",   icon: "https://cdn.simpleicons.org/typescript/3178C6"                 },
  { name: "PostgreSQL",   icon: "https://cdn.simpleicons.org/postgresql/4169E1"                 },
  { name: "Supabase",     icon: "https://cdn.simpleicons.org/supabase/3ECF8E"                   },
  { name: "Drizzle ORM",  icon: "https://cdn.simpleicons.org/drizzle/C5F74F"                    },
  { name: "Tailwind CSS", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4"                },
  { name: "Framer Motion",icon: "https://cdn.simpleicons.org/framer",             invert: true  },
  { name: "Better Auth"                                                                          },
];

const PHOTO = "https://media.licdn.com/dms/image/v2/D4D03AQE7E1A1tjMdLA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1690170294818?e=1785974400&v=beta&t=Ro_4Tm00AgFqQShVVyA24jOrINikEZ0DMhILjgdzWRU";

const LINKS = [
  {
    label: "GitHub",
    href:  "https://github.com/sudhanshu-b",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href:  "https://linkedin.com/in/sudhanshub",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Peerlist",
    href:  "https://peerlist.io/burilesudhanshu",
    icon:  <img src="https://cdn.simpleicons.org/peerlist/00AA45" alt="Peerlist" className="w-4 h-4" />,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e10]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-24">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section>
          <motion.p {...fade(0)} className="text-xs font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-4">
            About
          </motion.p>
          <motion.h1 {...fade(0.08)} className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1] mb-6">
            Subscriptions are expensive.<br className="hidden sm:block" />
            They don&apos;t have to be.
          </motion.h1>
          <motion.p {...fade(0.15)} className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
            SubSplit is a marketplace for sharing family-plan subscriptions — connecting people who have spare slots with people who need them. No sketchy group chats. No trust issues. Just a clean, verified platform.
          </motion.p>
        </section>

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <motion.section {...fade(0.2)} className="grid sm:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          {[
            { label: "Mission",  body: "Make premium software affordable by letting people share legitimately, safely, and transparently." },
            { label: "Trust",    body: "Email-verified accounts, in-app messaging, and UPI-based payments — no anonymous actors." },
            { label: "For everyone", body: "Whether you're a student, a developer, or a family — you shouldn't have to pay full price alone." },
          ].map(({ label, body }) => (
            <div key={label} className="bg-zinc-50 dark:bg-[#0e0e10] px-6 py-7">
              <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">{label}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </motion.section>

        {/* ── Founder ──────────────────────────────────────────────────────── */}
        <section>
          <motion.p {...fade(0.1)} className="text-xs font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-8">
            Builder
          </motion.p>

          <motion.div {...fade(0.18)} className="flex flex-col sm:flex-row gap-8 items-start">

            {/* Avatar */}
            <div className="shrink-0">
              <img
                src={PHOTO}
                alt="Sudhanshu Burile"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Sudhanshu Burile
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  Full Stack Developer
                </span>
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">Pune, India · CS TECH AI</p>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 max-w-lg">
                ~2 years building and shipping production-grade applications across React, Next.js, Node.js, and Java Spring Boot. SubSplit is a personal project — built from scratch to solve a real problem and shipped to production end-to-end.
              </p>

              {/* Email */}
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">burilesudhanshu@gmail.com</p>
              </div>

              {/* Social links */}
              <div className="flex flex-wrap gap-2">
                {LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
                               border border-zinc-200 dark:border-zinc-700
                               bg-white dark:bg-zinc-900
                               text-xs font-semibold text-zinc-600 dark:text-zinc-300
                               hover:border-zinc-400 dark:hover:border-zinc-500
                               hover:text-zinc-900 dark:hover:text-zinc-100
                               transition-colors duration-150"
                  >
                    {icon}
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Stack ────────────────────────────────────────────────────────── */}
        <motion.section {...fade(0.15)}>
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-6">
            Built with
          </p>
          <div className="flex flex-wrap gap-2">
            {STACK.map(({ name, icon, invert }) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold
                           bg-white dark:bg-zinc-900
                           border border-zinc-200 dark:border-zinc-800
                           text-zinc-600 dark:text-zinc-400"
              >
                {icon ? (
                  <img
                    src={icon}
                    alt={name}
                    className={`w-3.5 h-3.5 object-contain${invert ? " dark:invert" : ""}`}
                  />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                )}
                {name}
              </span>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <motion.section {...fade(0.2)} className="border-t border-zinc-200 dark:border-zinc-800 pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Ready to split?</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Browse open plans or list your own spare seats.</p>
          </div>
          <Link
            href="/browse"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100
                       text-white dark:text-zinc-900 text-sm font-bold
                       hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Browse plans
          </Link>
        </motion.section>

      </div>
    </div>
  );
}
