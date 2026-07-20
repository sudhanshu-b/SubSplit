"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PhoneEditor({ current }: { current?: string | null }) {
  const router            = useRouter();
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState("");
  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);

  function open() {
    setValue(current ? current.replace("+91", "") : "");
    setError("");
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError("");
  }

  async function save() {
    const digits = value.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch("/api/profile/phone", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={open}
        className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500
                   hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors underline-offset-2 hover:underline"
      >
        {current ? "Edit" : "Add"}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5 w-full">
      <div className="flex items-center gap-2 w-full justify-end">
        {/* +91 prefix */}
        <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 select-none shrink-0">+91</span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          placeholder="98765 43210"
          className="w-36 px-3 py-1.5 rounded-lg border text-sm font-medium text-right
                     border-zinc-300 dark:border-zinc-600
                     bg-white dark:bg-zinc-900
                     text-zinc-900 dark:text-zinc-100
                     placeholder:text-zinc-300 dark:placeholder:text-zinc-600
                     focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100
                     transition-shadow"
        />
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100
                     text-white dark:text-zinc-900 text-xs font-bold
                     hover:bg-zinc-700 dark:hover:bg-zinc-200
                     disabled:opacity-50 transition-colors shrink-0"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={cancel}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
