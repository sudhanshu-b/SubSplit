"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggle from "@/components/theme-toggle";

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user.name ?? "Account";
  const userEmail = session?.user.email ?? "";
  const userImage = session?.user.image;
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleSignOut() {
    setIsMenuOpen(false);
    await signOut();
    router.push("/sign-in");
  }

  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight dark:text-indigo-400">
            SubSplit
          </Link>
          <Link href="/browse" className="text-sm text-gray-500 hover:text-gray-900 transition dark:text-slate-400 dark:hover:text-white">
            Browse
          </Link>
          {session && (
            <Link href="/messages" className="text-sm text-gray-500 hover:text-gray-900 transition dark:text-slate-400 dark:hover:text-white">
              Messages
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Show nothing while session is loading to avoid layout flash */}
          {isPending ? null : session ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <span className="flex h-8 w-8 overflow-hidden rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                  {userImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="m-auto">{initials}</span>
                  )}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{userName}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 transition dark:text-slate-400 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30"
                  role="menu"
                >
                  <div className="border-b border-gray-100 px-3 py-3 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 overflow-hidden rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                        {userImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={userImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="m-auto">{initials}</span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {userName}
                        </p>
                        <p className="truncate text-xs text-gray-400 dark:text-slate-400">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      role="menuitem"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-slate-700 dark:text-slate-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a7.5 7.5 0 0 1 15 0"
                          />
                        </svg>
                      </span>
                      Profile
                    </Link>

                    <Link
                      href="/listings/new"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      role="menuitem"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-slate-700 dark:text-slate-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                        </svg>
                      </span>
                      New listing
                    </Link>

                    <Link
                      href="/messages"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      role="menuitem"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-slate-700 dark:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                      </span>
                      Messages
                    </Link>

                    <ThemeToggle variant="menu-item" />
                  </div>

                  <div className="border-t border-gray-100 pt-2 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                      role="menuitem"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 dark:border-red-400/30 dark:text-red-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-3h8.25m0 0-3-3m3 3-3 3"
                          />
                        </svg>
                      </span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <ThemeToggle />
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition dark:text-slate-400 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
