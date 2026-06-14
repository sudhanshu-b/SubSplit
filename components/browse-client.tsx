"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrowseCard, { BrowseCardSkeleton, type BrowseListing } from "@/components/browse-card";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  initialListings: BrowseListing[];
  initialHasMore:  boolean;
  query:           string;       // from server — SSR'd from URL ?q=
};

export default function BrowseClient({ initialListings, initialHasMore, query }: Props) {
  const [listings, setListings] = useState<BrowseListing[]>(initialListings);
  const [hasMore,  setHasMore]  = useState(initialHasMore);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // When SSR re-runs (user navigates to a new search), reset client state
  useEffect(() => {
    setListings(initialListings);
    setHasMore(initialHasMore);
    setPage(1);
    setFetchErr("");
  }, [initialListings, initialHasMore]);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/browse?q=${encodeURIComponent(query)}&page=${nextPage}`
      );
      if (!res.ok) throw new Error("fetch failed");
      const data: { listings: BrowseListing[]; hasMore: boolean } = await res.json();
      setListings((prev) => [...prev, ...data.listings]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      setFetchErr("Couldn't load more listings. Try scrolling again.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, query]);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading) fetchMore(); },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchMore, loading]);

  const isEmpty = listings.length === 0 && !loading;

  return (
    <div>
      {/* ── Section heading ── */}
      <motion.div
        key={query}                       // re-animate when query changes
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: EASE }}
        className="mb-8"
      >
        {query ? (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
              Search results
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              &ldquo;{query}&rdquo;
            </h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5">
              {isEmpty
                ? "No listings match your search"
                : `${listings.length}${hasMore ? "+" : ""} listing${listings.length !== 1 ? "s" : ""} found`}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
              Discover
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Popular listings
            </h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5">
              Join a shared plan and start saving today
            </p>
          </>
        )}
      </motion.div>

      {/* ── Empty state ── */}
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800
                            flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-zinc-400 dark:text-zinc-500"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
              {query ? "No listings found" : "No listings yet"}
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs">
              {query
                ? "Try a different search term, or browse all listings."
                : "Be the first to host a shared subscription plan."}
            </p>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* ── Card grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing, i) => (
                <BrowseCard key={listing.id} listing={listing} index={i} />
              ))}

              {/* Loading skeletons appended to the grid */}
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <BrowseCardSkeleton key={`sk-${i}`} index={i} />
                ))}
            </div>

            {/* Error inline */}
            {fetchErr && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-red-400 mt-6"
              >
                {fetchErr}
              </motion.p>
            )}

            {/* End-of-feed label */}
            {!hasMore && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mt-10 mb-4"
              >
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                <span className="text-[11px] font-semibold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
                  All listings shown
                </span>
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible sentinel — IntersectionObserver watches this */}
      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
