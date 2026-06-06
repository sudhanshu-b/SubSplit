"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Service = { id: string; name: string };

export default function BrowseFilters({ services }: { services: Service[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string) {
    // Build a new URLSearchParams from the current ones, then update the key.
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // startTransition marks the navigation as non-urgent so the current UI
    // stays visible while the server re-renders with the new params.
    startTransition(() => {
      router.push(`/?${next.toString()}`);
    });
  }

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""} transition-opacity`}>
      {/* Service filter */}
      <select
        defaultValue={params.get("serviceId") ?? ""}
        onChange={(e) => update("serviceId", e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
      >
        <option value="">All services</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Region filter */}
      <input
        type="text"
        defaultValue={params.get("region") ?? ""}
        onChange={(e) => update("region", e.target.value.toUpperCase())}
        placeholder="Region (e.g. US)"
        maxLength={2}
        className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition uppercase"
      />
    </div>
  );
}
