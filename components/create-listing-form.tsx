"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = { id: string; name: string; category: string | null };

export default function CreateListingForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    serviceId: "",
    title: "",
    description: "",
    totalSeats: "",
    priceTotal: "",
    currency: "USD",
    region: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serviceId">
          Subscription service
        </label>
        <select
          id="serviceId"
          name="serviceId"
          required
          value={form.serviceId}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
        >
          <option value="">Select a service…</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.category ? `(${s.category})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
          Listing title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Spotify Family — 1 slot open"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Any details buyers should know…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none"
        />
      </div>

      {/* Seats + Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="totalSeats">
            Total seats
          </label>
          <input
            id="totalSeats"
            name="totalSeats"
            type="number"
            required
            min={2}
            max={20}
            value={form.totalSeats}
            onChange={handleChange}
            placeholder="e.g. 6"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="priceTotal">
            Total plan cost
          </label>
          <input
            id="priceTotal"
            name="priceTotal"
            type="number"
            required
            min={0}
            step="0.01"
            value={form.priceTotal}
            onChange={handleChange}
            placeholder="e.g. 17.99"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
          />
          <p className="text-xs text-gray-400 mt-1">Price per seat is calculated automatically.</p>
        </div>
      </div>

      {/* Currency + Region row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="region">
            Region <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="region"
            name="region"
            type="text"
            value={form.region}
            onChange={handleChange}
            placeholder="e.g. US, IN, GB"
            maxLength={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition uppercase"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? "Publishing…" : "Publish listing"}
      </button>
    </form>
  );
}
