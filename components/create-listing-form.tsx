"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/components/spinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EASE = [0.22, 1, 0.36, 1] as const;
const STEP_LABELS = ["Service", "Details", "Pricing", "Review"];
const MAX_SEATS   = 10;

const CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
] as const;

const REGION_OPTIONS = ["IN","US","GB","CA","AU","EU","SG","JP","DE","FR"];

const SERVICE_CATEGORIES = [
  "Entertainment","Music & Audio","Cloud Storage","Productivity",
  "Gaming","Education","Security & Privacy","Design",
  "News & Media","Health & Fitness","VPN","Other",
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

type FormData = {
  serviceId:             string;   // "__custom__" = user-typed
  customServiceName:     string;
  customServiceCategory: string;
  customServiceUrl:      string;
  title:                 string;
  description:           string;
  totalSeats:            number;
  priceTotal:            string;
  currency:              string;
  region:                string;
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
              onClick={() => onChange({ serviceId: svc.id })}
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
                onChange={(e) => onChange({ customServiceName: e.target.value })}
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

// ── Step 3 — Seats & pricing ───────────────────────────────────────────────
function Step3({
  form, onChange,
}: {
  form:     FormData;
  onChange: (p: Partial<FormData>) => void;
}) {
  const priceNum = parseFloat(form.priceTotal) || 0;
  const perSeat  = form.totalSeats > 0 && priceNum > 0
    ? (priceNum / form.totalSeats).toFixed(2)
    : null;
  const sym      = CURRENCIES.find((c) => c.code === form.currency)?.symbol ?? "";

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
        Seats &amp; pricing
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-7">
        How many people can join, and what does the plan cost?
      </p>

      {/* Seat slider */}
      <div className="mb-7">
        <div className="flex items-baseline justify-between mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total seats
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

        {/* Dot visualisation */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {Array.from({ length: MAX_SEATS }).map((_, i) => (
            <motion.span
              key={i}
              animate={{
                scale:   i < form.totalSeats ? 1   : 0.65,
                opacity: i < form.totalSeats ? 1   : 0.2,
              }}
              transition={{ duration: 0.18, delay: i * 0.02 }}
              className={`w-4 h-4 rounded-full transition-colors duration-200
                         ${i < form.totalSeats ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"}`}
            />
          ))}
        </div>

        <input
          type="range"
          min={2}
          max={MAX_SEATS}
          step={1}
          value={form.totalSeats}
          onChange={(e) => onChange({ totalSeats: Number(e.target.value) })}
          className="w-full h-1 rounded-full appearance-none cursor-pointer outline-none
                    bg-zinc-200 dark:bg-zinc-800 accent-zinc-900 dark:accent-zinc-100"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium">2</span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium">{MAX_SEATS}</span>
        </div>
      </div>

      {/* Price row */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Total monthly cost <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <Select
            value={form.currency}
            onValueChange={(v) => onChange({ currency: v })}
          >
            <SelectTrigger className="w-28 flex-shrink-0 font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {sym}{perSeat}
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">/mo</span>
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Region chips */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Region{" "}
          <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal">optional</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ region: form.region === r ? "" : r })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider
                         transition-all duration-150
                         ${form.region === r
                           ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                           : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                         }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 4 — Review ────────────────────────────────────────────────────────
function Step4({
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
  const sym = CURRENCIES.find((c) => c.code === form.currency)?.symbol ?? "";

  type ReviewRow = { label: string; value: string; step: number };
  const rows: ReviewRow[] = [
    { label: "Title",         value: form.title,                          step: 2 },
    ...(form.description
      ? [{ label: "Description", value: form.description,                 step: 2 }]
      : []),
    { label: "Total seats",   value: String(form.totalSeats),             step: 3 },
    { label: "Plan cost",     value: `${sym}${priceNum.toFixed(2)}/mo`,   step: 3 },
    ...(perSeat
      ? [{ label: "Per seat", value: `${sym}${perSeat}/mo`,               step: 3 }]
      : []),
    ...(form.region
      ? [{ label: "Region",   value: form.region.toUpperCase(),           step: 3 }]
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
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
                className="ml-auto text-xs font-semibold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex-shrink-0">
          Change
        </button>
      </div>

      {/* Detail rows */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {rows.map((row) => (
          <div key={row.label}
               className="flex items-start justify-between gap-4 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5 w-24">
              {row.label}
            </span>
            <div className="flex items-start gap-3 flex-1 min-w-0 justify-end">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 text-right break-words">
                {row.value}
              </span>
              <button type="button" onClick={() => onEdit(row.step)}
                      className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex-shrink-0 mt-0.5">
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

  const [form, setForm] = useState<FormData>({
    serviceId:             "",
    customServiceName:     "",
    customServiceCategory: "",
    customServiceUrl:      "",
    title:                 "",
    description:           "",
    totalSeats:            4,
    priceTotal:            "",
    currency:              "INR",
    region:                "",
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
    if (step === 3 && (!form.priceTotal || parseFloat(form.priceTotal) <= 0))
      return "Please enter the total plan cost.";
    return "";
  }

  function next() {
    const e = validate();
    if (e) { setError(e); return; }
    setNavigating(true);
    // Brief spinner so the button gives tactile feedback before animating out
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
      serviceId:             isCustom ? undefined                            : form.serviceId,
      customServiceName:     isCustom ? form.customServiceName.trim()        : undefined,
      customServiceCategory: isCustom && form.customServiceCategory ? form.customServiceCategory : undefined,
      customServiceUrl:      isCustom && form.customServiceUrl.trim() ? form.customServiceUrl.trim() : undefined,
      title:                 form.title.trim(),
      description:           form.description.trim() || undefined,
      totalSeats:            form.totalSeats,
      priceTotal:            form.priceTotal,
      currency:              form.currency,
      region:                form.region.trim().toUpperCase() || undefined,
    };

    try {
      const res  = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(`/listings/${data.id}`);
    } catch {
      setError("Network error — please check your connection.");
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
      <StepBar step={step} />

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
          {step === 4 && <Step4 form={form} services={services} onEdit={goTo} />}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 text-sm font-medium text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
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

        {step < 4 ? (
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
              <>
                <Spinner className="w-4 h-4" />
                Loading…
              </>
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
