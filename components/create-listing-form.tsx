"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/components/spinner";
import { Toast, type ToastState } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EASE        = [0.22, 1, 0.36, 1] as const;
const STEP_LABELS = ["Service", "Details", "Seats", "Payment", "Review"];
const MAX_SEATS   = 10;
const CURRENCY    = { code: "INR", symbol: "₹" };

const SERVICE_CATEGORIES = [
  "Entertainment","Music & Audio","Cloud Storage","Productivity",
  "Gaming","Education","Security & Privacy","Design",
  "Development","News & Media","Health & Fitness","VPN","Other",
] as const;

// ── Service → icon / brand colour ─────────────────────────────────────────
function getServiceMeta(name: string): { slug: string; bg: string } {
  const n = name.toLowerCase();
  if (n.includes("netflix"))    return { slug: "netflix",       bg: "#E50914" };
  if (n.includes("spotify"))    return { slug: "spotify",       bg: "#1DB954" };
  if (n.includes("youtube"))    return { slug: "youtube",       bg: "#FF0000" };
  if (n.includes("notion"))     return { slug: "notion",        bg: "#191919" };
  if (n.includes("icloud"))     return { slug: "icloud",        bg: "#3693F3" };
  if (n.includes("copilot"))    return { slug: "githubcopilot", bg: "#6941C6" };
  if (n.includes("github"))     return { slug: "github",        bg: "#24292E" };
  if (n.includes("dropbox"))    return { slug: "dropbox",       bg: "#0061FF" };
  if (n.includes("canva"))      return { slug: "canva",         bg: "#00C4CC" };
  if (n.includes("adobe"))      return { slug: "adobe",         bg: "#FF0000" };
  if (n.includes("duolingo"))   return { slug: "duolingo",      bg: "#58CC02" };
  if (n.includes("perplexity")) return { slug: "perplexity",    bg: "#1FB8CD" };
  if (n.includes("apple") || n.includes("tv+"))
    return { slug: "appletv", bg: "#1C1C1E" };
  if (n.includes("1password"))  return { slug: "1password",     bg: "#0094F5" };
  return { slug: "", bg: "#71717a" };
}

// ── Types ──────────────────────────────────────────────────────────────────
type DbService = { id: string; name: string; category: string | null };

const DURATION_OPTIONS = [
  { days: 30,  label: "Monthly",   sub: "30 days"  },
  { days: 60,  label: "2 Months",  sub: "60 days"  },
  { days: 90,  label: "Quarterly", sub: "90 days"  },
  { days: 180, label: "6 Months",  sub: "180 days" },
  { days: 365, label: "Annual",    sub: "365 days" },
] as const;

const UPI_RE = /^[a-zA-Z0-9._\-]{2,256}@[a-zA-Z]{2,64}$/;

type FormData = {
  serviceId:             string;   // "__custom__" = user-typed
  customServiceName:     string;
  customServiceCategory: string;
  customServiceUrl:      string;
  title:                 string;
  description:           string;
  totalSeats:            number;
  priceTotal:            string;
  durationDays:          number;
  paymentTerms:          "upfront" | "split_30" | "";
  upiId:                 string;
};

// ── Step progress bar ──────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const pct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;
  return (
    <div className="mb-7">
      <div className="h-[2px] bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const n      = i + 1;
          const done   = n < step;
          const active = n === step;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ duration: 0.25 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300
                           ${active || done ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"}`}
              >
                {done ? (
                  <svg className="w-2.5 h-2.5 text-white dark:text-zinc-900"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-[9px] font-bold
                                  ${active ? "text-white dark:text-zinc-900" : "text-zinc-400 dark:text-zinc-600"}`}>
                    {n}
                  </span>
                )}
              </motion.div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300
                               ${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 1 — Service picker ────────────────────────────────────────────────
function Step1({
  services, form, onChange,
}: {
  services: DbService[];
  form:     FormData;
  onChange: (p: Partial<FormData>) => void;
}) {
  const tiles = [
    ...services,
    { id: "__custom__", name: "Other", category: null } as DbService,
  ];
  
  const autoTitleRef = useRef("");
  const titleIsAuto = form.title === "" || form.title === autoTitleRef.current;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
        Choose a service
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
        Pick the subscription you want to share.
      </p>

      {/* ── Compact horizontal chip grid ── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {tiles.map((svc) => {
          const isOther    = svc.id === "__custom__";
          const isSelected = form.serviceId === svc.id;
          const { slug, bg } = getServiceMeta(svc.name);
          const iconUrl    = slug ? `https://cdn.simpleicons.org/${slug}/ffffff` : null;

          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => {
                const next: Partial<FormData> = { serviceId: svc.id };
                if (!isOther && titleIsAuto) {
                  const t = `${svc.name} Plan`;
                  next.title = t;
                  autoTitleRef.current = t;
                }
                onChange(next);
              }}
              className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5
                         transition-all duration-150 text-left
                         ${isSelected
                           ? "border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/70"
                           : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                         }`}
            >
              {/* Icon bubble */}
              {isOther ? (
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150
                                 ${isSelected ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                  <svg
                    className={`w-3.5 h-3.5 transition-colors duration-150
                               ${isSelected ? "text-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              ) : (
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  {iconUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={iconUrl} alt={svc.name} className="w-4 h-4 object-contain" />
                    : <span className="text-white text-[10px] font-bold">{svc.name[0]}</span>
                  }
                </span>
              )}

              {/* Name */}
              <span className={`text-xs font-semibold truncate leading-tight transition-colors duration-150
                               ${isSelected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                {isOther ? "Other / Not listed" : svc.name}
              </span>

              {/* Checkmark */}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  className="ml-auto flex-shrink-0 w-4 h-4 rounded-full
                             bg-zinc-900 dark:bg-zinc-100
                             flex items-center justify-center"
                >
                  <svg className="w-2 h-2 text-white dark:text-zinc-900"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                  </svg>
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom service fields */}
      <AnimatePresence>
        {form.serviceId === "__custom__" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div className="pt-1 space-y-2">
              <Input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                type="text"
                value={form.customServiceName}
                onChange={(e) => {
                  const name = e.target.value;
                  const next: Partial<FormData> = { customServiceName: name };
                  if (titleIsAuto) {
                    const t = name ? `${name} Plan` : "";
                    next.title = t;
                    autoTitleRef.current = t;
                  }
                  onChange(next);
                }}
                placeholder="Service name — e.g. Cursor, Linear, Figma…"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={form.customServiceCategory || undefined}
                  onValueChange={(v) => onChange({ customServiceCategory: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="url"
                  value={form.customServiceUrl}
                  onChange={(e) => onChange({ customServiceUrl: e.target.value })}
                  placeholder="Website URL (optional)"
                  className="px-3"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Step 2 — Listing details ───────────────────────────────────────────────
function Step2({
  form, onChange,
}: {
  form:     FormData;
  onChange: (p: Partial<FormData>) => void;
}) {
  const MAX_DESC = 280;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
        Plan details
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Give your listing a clear title so members know what they&apos;re joining.
      </p>

      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Title <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Netflix Standard — 2 slots open"
          maxLength={100}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Description{" "}
            <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal">
              optional
            </span>
          </label>
          <span className={`text-[11px] font-medium tabular-nums transition-colors
                           ${form.description.length > MAX_DESC - 30
                             ? "text-red-400"
                             : "text-zinc-400 dark:text-zinc-600"}`}>
            {form.description.length}/{MAX_DESC}
          </span>
        </div>
        <Textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Briefly describe your plan — e.g. region, screen quality, any rules…"
          maxLength={MAX_DESC}
          rows={4}
        />
      </div>
    </div>
  );
}

// ── Step 3 — Seats ────────────────────────────────────────────────────────
function Step3({
  form, onChange,
}: {
  form:     FormData;
  onChange: (p: Partial<FormData>) => void;
}) {
  const memberCount = form.totalSeats; // seats are for members; host is separate

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
        Member seats
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-7">
        How many members can join your plan? You (the host) are not counted.
      </p>

      <div className="mb-7">
        {/* Count header */}
        <div className="flex items-baseline justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Member seats
          </label>
          <motion.span
            key={form.totalSeats}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100 leading-none"
          >
            {form.totalSeats}
          </motion.span>
        </div>

        {/* "You + X members" label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={form.totalSeats}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 mb-4"
          >
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">You</span>
            <span className="text-zinc-400 dark:text-zinc-600 text-sm">+</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
            <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
              {memberCount + 1} total
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Avatar visualisation */}
        <div className="flex items-end gap-2 mb-4 flex-wrap">
          {/* Host avatar — always active */}
          <div className="flex flex-col items-center gap-1" title="You (host)">
            <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">You</span>
          </div>

          {/* Member avatars */}
          {Array.from({ length: MAX_SEATS }).map((_, i) => {
            const active = i < form.totalSeats;
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1"
                animate={{ scale: active ? 1 : 0.75, opacity: active ? 1 : 0.2 }}
                transition={{ duration: 0.18, delay: i * 0.02 }}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200
                                ${active ? "bg-green-400" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                  <svg className={`w-5 h-5 transition-colors duration-200 ${active ? "text-white" : "text-zinc-400 dark:text-zinc-500"}`}
                       viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                {active && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-green-500">M{i + 1}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        <input
          type="range"
          min={1}
          max={MAX_SEATS}
          step={1}
          value={form.totalSeats}
          onChange={(e) => onChange({ totalSeats: Number(e.target.value) })}
          className="w-full h-1 rounded-full appearance-none cursor-pointer outline-none
                    bg-zinc-200 dark:bg-zinc-800 accent-zinc-900 dark:accent-zinc-100"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium">1 member</span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium">{MAX_SEATS} members</span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-4 py-3">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">Host seat is yours</span> — the {memberCount} slot{memberCount !== 1 ? "s" : ""} above are for members who join your listing. You control access and can remove members at any time.
        </p>
      </div>
    </div>
  );
}

// ── Step 4 — Payment ──────────────────────────────────────────────────────
function Step4({
  form, onChange,
}: {
  form:     FormData;
  onChange: (p: Partial<FormData>) => void;
}) {
  const priceNum   = parseFloat(form.priceTotal) || 0;
  const perSeat    = form.totalSeats > 0 && priceNum > 0
    ? (priceNum / form.totalSeats).toFixed(2)
    : null;
  const needsTerms = form.durationDays > 30;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
        Pricing &amp; payment
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-7">
        Set the plan cost, duration, and how members will pay.
      </p>

      {/* Total cost — INR locked */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Total plan cost <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                          bg-zinc-50 dark:bg-zinc-800 text-sm font-bold text-zinc-500 dark:text-zinc-400
                          select-none shrink-0">
            {/* India flag */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
              <rect width="900" height="600" fill="#138808"/>
              <rect width="900" height="400" fill="#fff"/>
              <rect width="900" height="200" fill="#FF9933"/>
              {/* Ashoka Chakra */}
              <circle cx="450" cy="300" r="90" fill="none" stroke="#000080" strokeWidth="9"/>
              <circle cx="450" cy="300" r="13.5" fill="#000080"/>
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad   = (angle * Math.PI) / 180;
                const x1    = 450 + 13.5 * Math.sin(rad);
                const y1    = 300 - 13.5 * Math.cos(rad);
                const x2    = 450 + 90  * Math.sin(rad);
                const y2    = 300 - 90  * Math.cos(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="4.5"/>;
              })}
            </svg>
            ₹ INR
          </div>
          <Input
            type="number"
            min={1}
            step={0.01}
            value={form.priceTotal}
            onChange={(e) => onChange({ priceTotal: e.target.value })}
            placeholder="0.00"
            className="flex-1"
          />
        </div>
      </div>

      {/* Live per-seat */}
      <AnimatePresence>
        {perSeat && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex items-center justify-between rounded-xl
                      bg-zinc-50 dark:bg-zinc-800/60
                      border border-zinc-100 dark:border-zinc-800
                      px-4 py-3 mb-6"
          >
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Each member pays
            </span>
            <motion.span
              key={perSeat}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100"
            >
              ₹{perSeat}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan duration */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Plan duration <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {DURATION_OPTIONS.map((opt) => {
            const selected = form.durationDays === opt.days;
            return (
              <button
                key={opt.days}
                type="button"
                onClick={() => onChange({
                  durationDays: opt.days,
                  paymentTerms: opt.days <= 30 ? "" : form.paymentTerms,
                })}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-3
                           border transition-all duration-150
                           ${selected
                             ? "border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/70"
                             : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                           }`}
              >
                <span className={`text-xs font-bold transition-colors duration-150
                                 ${selected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                  {opt.label}
                </span>
                <span className={`text-[10px] transition-colors duration-150
                                 ${selected ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}`}>
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment terms — only when duration > 30 days */}
      <AnimatePresence>
        {needsTerms && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Payment terms <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "upfront"  as const, title: "Full upfront",   desc: "Member pays the full amount before getting access.", icon: "↑" },
                { value: "split_30" as const, title: "Split payment",  desc: "50% now to join · 50% after 30 days.",               icon: "½" },
              ]).map((opt) => {
                const selected = form.paymentTerms === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ paymentTerms: opt.value })}
                    className={`flex flex-col items-start gap-1.5 rounded-xl px-4 py-3.5 text-left
                               border transition-all duration-150
                               ${selected
                                 ? "border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/70"
                                 : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                               }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm font-bold transition-colors duration-150
                                       ${selected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                        {opt.title}
                      </span>
                      <span className={`text-base font-black leading-none transition-colors duration-150
                                       ${selected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-300 dark:text-zinc-600"}`}>
                        {opt.icon}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-snug">
                      {opt.desc}
                    </span>
                    {selected && (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Selected
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI ID */}
      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
          Your UPI ID <span className="font-normal normal-case text-zinc-400">(optional)</span>
        </label>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mb-2">
          Approved members will use this to send their payment. Only visible after joining.
        </p>
        <Input
          type="text"
          value={form.upiId}
          onChange={(e) => onChange({ upiId: e.target.value.trim() })}
          placeholder="username@bank"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// ── Step 5 — Review ────────────────────────────────────────────────────────
function Step5({
  form, services, onEdit,
}: {
  form:     FormData;
  services: DbService[];
  onEdit:   (step: number) => void;
}) {
  const isCustom = form.serviceId === "__custom__";
  const svcName  = isCustom
    ? form.customServiceName
    : (services.find((s) => s.id === form.serviceId)?.name ?? "");
  const { slug, bg } = getServiceMeta(svcName);
  const iconUrl  = slug ? `https://cdn.simpleicons.org/${slug}/ffffff` : null;
  const priceNum = parseFloat(form.priceTotal) || 0;
  const perSeat  = form.totalSeats > 0 && priceNum > 0
    ? (priceNum / form.totalSeats).toFixed(2)
    : null;

  type ReviewRow = { label: string; value: string; step: number };
  const rows: ReviewRow[] = [
    { label: "Title",       value: form.title,                                                                                          step: 2 },
    ...(form.description
      ? [{ label: "Desc",   value: form.description,                                                                                    step: 2 }]
      : []),
    { label: "Seats",       value: `You + ${form.totalSeats} member${form.totalSeats !== 1 ? "s" : ""}`,                               step: 3 },
    { label: "Cost",        value: `₹${priceNum.toFixed(2)}`,                                                                          step: 4 },
    ...(perSeat
      ? [{ label: "Per seat", value: `₹${perSeat} / member`,                                                                           step: 4 }]
      : []),
    { label: "Duration",    value: DURATION_OPTIONS.find((d) => d.days === form.durationDays)?.label ?? `${form.durationDays} days`,   step: 4 },
    ...(form.durationDays > 30 && form.paymentTerms
      ? [{ label: "Payment", value: form.paymentTerms === "upfront" ? "Full upfront" : "50% now · 50% after 30 days",                  step: 4 }]
      : []),
    ...(form.upiId
      ? [{ label: "UPI ID",  value: form.upiId,                                                                                         step: 4 }]
      : []),
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
        Review listing
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Everything look good? Hit publish to go live.
      </p>

      {/* Service card */}
      <div className="flex items-center gap-3 rounded-xl
                      bg-zinc-50 dark:bg-zinc-800/60
                      border border-zinc-100 dark:border-zinc-800
                      px-4 py-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style={{ backgroundColor: bg }}>
          {iconUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={iconUrl} alt={svcName} className="w-6 h-6 object-contain" />
            : <span className="text-white font-bold text-sm">{svcName[0]}</span>
          }
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Service</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{svcName}</p>
        </div>
        <button type="button" onClick={() => onEdit(1)}
                className="ml-auto text-xs font-semibold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0">
          Change
        </button>
      </div>

      {/* Detail rows */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {rows.map((row) => (
          <div key={row.label}
               className="flex items-start justify-between gap-4 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5 w-20">
              {row.label}
            </span>
            <div className="flex items-start gap-3 flex-1 min-w-0 justify-end">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 text-right">
                {row.value}
              </span>
              <button type="button" onClick={() => onEdit(row.step)}
                      className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0 mt-0.5">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function CreateListingForm({ services }: { services: DbService[] }) {
  const router = useRouter();

  const [step,       setStep]       = useState(1);
  const [dir,        setDir]        = useState<1 | -1>(1);
  const [loading,    setLoading]    = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error,      setError]      = useState("");
  const [toast,      setToast]      = useState<ToastState>(null);

  const [form, setForm] = useState<FormData>({
    serviceId:             "",
    customServiceName:     "",
    customServiceCategory: "",
    customServiceUrl:      "",
    title:                 "",
    description:           "",
    totalSeats:            4,
    priceTotal:            "",
    durationDays:          30,
    paymentTerms:          "",
    upiId:                 "",
  });

  function patch(p: Partial<FormData>) {
    setForm((f) => ({ ...f, ...p }));
    setError("");
  }

  function goTo(n: number) {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setError("");
  }

  function validate(): string {
    if (step === 1) {
      if (!form.serviceId) return "Please select a service.";
      if (form.serviceId === "__custom__" && !form.customServiceName.trim())
        return "Please enter the service name.";
    }
    if (step === 2 && !form.title.trim()) return "Please enter a listing title.";
    if (step === 4) {
      if (!form.priceTotal || parseFloat(form.priceTotal) <= 0)
        return "Please enter the total plan cost.";
      if (form.durationDays > 30 && !form.paymentTerms)
        return "Please select payment terms for this plan duration.";
      if (form.upiId && !UPI_RE.test(form.upiId))
        return "Please enter a valid UPI ID (e.g., username@bank).";
    }
    return "";
  }

  function next() {
    const e = validate();
    if (e) { setError(e); return; }
    setNavigating(true);
    setTimeout(() => {
      setNavigating(false);
      goTo(step + 1);
    }, 320);
  }

  async function handlePublish() {
    const e = validate();
    if (e) { setError(e); return; }

    setLoading(true);
    setError("");

    const isCustom = form.serviceId === "__custom__";
    const body = {
      serviceId:             isCustom ? undefined                                          : form.serviceId,
      customServiceName:     isCustom ? form.customServiceName.trim()                      : undefined,
      customServiceCategory: isCustom && form.customServiceCategory ? form.customServiceCategory : undefined,
      customServiceUrl:      isCustom && form.customServiceUrl.trim() ? form.customServiceUrl.trim() : undefined,
      title:                 form.title.trim(),
      description:           form.description.trim() || undefined,
      totalSeats:            form.totalSeats,
      priceTotal:            form.priceTotal,
      currency:              CURRENCY.code,   // locked to INR
      region:                "IN",            // India only for now
      durationDays:          form.durationDays,
      paymentTerms:          form.durationDays > 30 ? form.paymentTerms : undefined,
      upiId:                 form.upiId || undefined,
    };

    try {
      const res  = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ msg: data.error ?? "Something went wrong. Please try again.", type: "error" });
        return;
      }
      setToast({ msg: "Listing published!", type: "success" });
      setTimeout(() => router.push(`/listings/${data.id}`), 900);
    } catch {
      setToast({ msg: "Network error — please check your connection.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const variants = {
    enter:  (d: number) => ({ x: d * 28, opacity: 0 }),
    center:              ({ x: 0, opacity: 1 }),
    exit:   (d: number) => ({ x: d * -28, opacity: 0 }),
  };

  return (
    <div className="w-full">
      {/* Header row: step bar + exit button */}
      <div className="flex items-center gap-3 mb-0">
        <div className="flex-1">
          <StepBar step={step} />
        </div>
        <button
          type="button"
          onClick={() => router.push("/home")}
          aria-label="Exit form"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                    text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100
                    hover:bg-zinc-100 dark:hover:bg-zinc-800
                    transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: EASE }}
        >
          {step === 1 && <Step1 services={services} form={form} onChange={patch} />}
          {step === 2 && <Step2 form={form} onChange={patch} />}
          {step === 3 && <Step3 form={form} onChange={patch} />}
          {step === 4 && <Step4 form={form} onChange={patch} />}
          {step === 5 && <Step5 form={form} services={services} onEdit={goTo} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>

      {/* Navigation */}
      <div className={`flex items-center mt-7 gap-3 ${step > 1 ? "justify-between" : "justify-end"}`}>
        {step > 1 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="flex items-center gap-1.5 text-sm font-semibold
                      text-zinc-500 dark:text-zinc-400
                      hover:text-zinc-900 dark:hover:text-zinc-100
                      transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={next}
            disabled={navigating}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5
                      bg-zinc-900 dark:bg-zinc-100
                      text-white dark:text-zinc-900
                      text-sm font-bold
                      hover:bg-zinc-700 dark:hover:bg-zinc-300
                      disabled:opacity-70 disabled:cursor-not-allowed
                      transition-all duration-150"
          >
            {navigating ? (
              <><Spinner className="w-4 h-4" />Loading…</>
            ) : (
              <>
                Continue
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5
                      bg-zinc-900 dark:bg-zinc-100
                      text-white dark:text-zinc-900
                      text-sm font-bold
                      hover:bg-zinc-700 dark:hover:bg-zinc-300
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-colors duration-150"
          >
            {loading ? (
              <><Spinner className="w-4 h-4" />Publishing…</>
            ) : (
              <>
                Publish listing
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
