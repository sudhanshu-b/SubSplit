"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggle from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/components/spinner";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const router                        = useRouter();
  const { data: session, isPending }  = useSession();
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [signingOut, setSigningOut]   = useState(false);
  const [searchVal, setSearchVal]     = useState("");
  const menuRef                       = useRef<HTMLDivElement>(null);

  const userName  = session?.user.name  ?? "";
  const userEmail = session?.user.email ?? "";
  const userImage = session?.user.image ?? null;
  const firstName = userName.split(" ")[0] ?? userName;
  const initial   = firstName[0]?.toUpperCase() ?? "U";

  /* Close dropdown on outside click / Escape */
  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMenuOpen(false); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown",   onKey);
    };
  }, []);

  /* Scroll-aware shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/sign-in");
  }

  return (
    <motion.div
      className="fixed top-3 left-0 right-0 z-50 flex justify-center px-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <nav
        className={`flex items-center gap-3 w-full max-w-2xl rounded-2xl px-3 py-2
                    transition-all duration-300 backdrop-blur-xl
                    ${scrolled
                      ? "bg-zinc-50/95 dark:bg-[#0e0e10]/95 shadow-md shadow-black/5 dark:shadow-black/40"
                      : "bg-zinc-50/80 dark:bg-[#0e0e10]/80"
                    }`}
      >
        {/* ── Logo icon ── */}
        <Link href="/home" className="flex-shrink-0 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light-icon.png" alt="SubSplit" className="h-8 w-8 object-contain dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark-icon.png"  alt="SubSplit" className="h-8 w-8 object-contain hidden dark:block" />
        </Link>

        {/* ── Search input ── */}
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-1.5
                        bg-zinc-100 dark:bg-zinc-800/80
                        focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-600
                        transition-shadow">
          <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = searchVal.trim();
                router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
              }
            }}
            placeholder="Search plans…"
            className="flex-1 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200
                       placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                       outline-none min-w-0"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => setSearchVal("")}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Messages ── */}
        <Link
          href="/messages"
          aria-label="Messages"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl
                     text-zinc-500 dark:text-zinc-400
                     hover:bg-zinc-100 dark:hover:bg-zinc-800
                     transition-colors duration-200"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </Link>

        {/* ── Notification bell ── */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl
                     text-zinc-500 dark:text-zinc-400
                     hover:bg-zinc-100 dark:hover:bg-zinc-800
                     transition-colors duration-200"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </button>

        {/* ── Avatar + name ── */}
        {!isPending && session && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(o => !o)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5
                         hover:bg-zinc-100 dark:hover:bg-zinc-800
                         transition-colors duration-200"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              {/* Avatar circle */}
              <span className="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0
                               bg-zinc-200 dark:bg-zinc-700
                               text-xs font-bold text-zinc-700 dark:text-zinc-200 overflow-hidden">
                {userImage
                  ? <img src={userImage} alt="" className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                  : initial}
              </span>

              {/* First name */}
              <span className="hidden sm:block text-sm font-semibold text-zinc-800 dark:text-zinc-200 max-w-24 truncate">
                {firstName}
              </span>

              {/* Chevron */}
              <svg
                className={`hidden sm:block w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* ── Dropdown ── */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1   }}
                  exit={{    opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute right-0 z-50 mt-2 w-64 rounded-2xl
                             bg-white dark:bg-zinc-900
                             shadow-xl shadow-zinc-200/80 dark:shadow-black/50
                             ring-1 ring-zinc-100 dark:ring-zinc-800"
                  role="menu"
                >
                  {/* User info */}
                  <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {userName || firstName}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {userEmail}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { href: "/profile",      label: "Profile",     icon: "M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a7.5 7.5 0 0 1 15 0" },
                      { href: "/listings/new", label: "New listing", icon: "M12 5v14m7-7H5" },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                                   text-zinc-600 dark:text-zinc-400
                                   hover:bg-zinc-50 dark:hover:bg-zinc-800
                                   hover:text-zinc-900 dark:hover:text-zinc-100
                                   transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    ))}

                    <ThemeToggle variant="menu-item" />
                  </div>

                  {/* Sign out */}
                  <div className="p-1.5 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left
                                 text-sm font-medium text-red-500 dark:text-red-400
                                 hover:bg-red-50 dark:hover:bg-red-500/10
                                 disabled:opacity-60 disabled:cursor-not-allowed
                                 transition-colors duration-150"
                    >
                      {signingOut
                        ? <Spinner className="w-4 h-4" />
                        : (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                               stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-3h8.25m0 0-3-3m3 3-3 3" />
                          </svg>
                        )
                      }
                      {signingOut ? "Signing out…" : "Sign out"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>
    </motion.div>
  );
}
