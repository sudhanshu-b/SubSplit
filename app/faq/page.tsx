"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing-page";

type FaqItem = { q: string; a: React.ReactNode };
type FaqCategory = { key: string; label: string; items: FaqItem[] };

const FAQ_DATA: FaqCategory[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    items: [
      {
        q: "What is LetsSplit?",
        a: "LetsSplit helps you split the cost of subscriptions you're already paying for — Netflix, Spotify, YouTube Premium, and more — with people you trust. Hosts list a spare seat on a plan they own; members request to join and pay their share directly to the host.",
      },
      {
        q: "How do I create an account?",
        a: "Click “Sign up”, enter your name, email, and password, and verify your email from the link we send you. You'll need to accept our Terms of Use and Privacy Policy to finish creating your account.",
      },
      {
        q: "Is LetsSplit free to use?",
        a: "Yes — LetsSplit is free to use during beta. There's no platform fee on top of the amount you agree to pay the host for your seat.",
      },
      {
        q: "How do I find a plan to join?",
        a: "Head to Browse to see open listings, filter by service or price, and open one to see seat availability, price per seat, and the host's profile before requesting to join.",
      },
    ],
  },
  {
    key: "hosting",
    label: "Hosting a Plan",
    items: [
      {
        q: "How do I list a subscription to share?",
        a: "From your dashboard, choose “List a subscription,” pick the service, set the total price, number of seats, plan duration, and payment terms, then publish. Your listing starts in “recruiting” status while members request to join.",
      },
      {
        q: "Can I choose who joins my plan?",
        a: "Yes. Every join request lands in your Actions tab as pending — you approve or reject each one. Nobody is added to your plan automatically.",
      },
      {
        q: "What happens once my plan is full?",
        a: "Once you've reached your minimum required members, you mark the listing “ready to purchase,” collect payment from your members, and then mark it “active” once you've actually purchased or renewed the subscription.",
      },
      {
        q: "Can I cancel a listing after creating it?",
        a: "You can cancel any time before the plan goes active, or while it's active as long as your members haven't all paid yet. Once every active member has a recorded payment, cancellation is locked — this protects members who've already paid from losing access.",
      },
      {
        q: "Can I share a link to my listing with people I know?",
        a: "Yes — open your listing and use the Share button (in the manage page header) to copy a direct link. Anyone can view a public listing; they'll be asked to sign in or create an account before they can request to join.",
      },
    ],
  },
  {
    key: "joining",
    label: "Joining a Plan",
    items: [
      {
        q: "How do I request to join a plan?",
        a: "Open a listing and select “Request to join.” This sends a pending request to the host — you won't be charged or added to the group until the host approves it.",
      },
      {
        q: "How will I know if I've been approved?",
        a: "You'll see your status change to “active” on the listing page, and a group chat for that plan will appear in your Messages — that's also where the host will usually confirm payment details.",
      },
      {
        q: "Can I join more than one plan at a time?",
        a: "Yes, there's no limit on how many plans you can be an active member of.",
      },
      {
        q: "What happens if my request is rejected?",
        a: "You'll see a “Request declined” status on the listing. You're free to request to join a different listing at any time.",
      },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    items: [
      {
        q: "How do payments work on LetsSplit?",
        a: "Payment happens directly between you and the host, outside the platform — typically via UPI. The host shares a UPI ID, you pay your share, and either you or the host records the transaction reference (with an optional screenshot as proof) so everyone in the group can see who's paid.",
      },
      {
        q: "Does LetsSplit process or hold any payments?",
        a: "No. LetsSplit doesn't process, hold, or guarantee any payment — it only helps you track who's paid within a group. Money changes hands directly between members and the host.",
      },
      {
        q: "What if a host doesn't provide access after I've paid?",
        a: "That's a dispute between you and the host — see the host's reviews and trust score before joining to reduce this risk. LetsSplit isn't a party to that payment and can't guarantee or reverse it, but you can report the host so we can review their account.",
      },
      {
        q: "Can I get a refund?",
        a: "Refunds are between you and the host, based on whatever you agreed to. LetsSplit doesn't process payments, so we can't issue refunds ourselves.",
      },
    ],
  },
  {
    key: "trust-safety",
    label: "Trust & Safety",
    items: [
      {
        q: "Is it legal to share a subscription with people I don't live with?",
        a: (
          <>
            It depends entirely on the service you're sharing — many streaming and software
            subscriptions restrict who can use a plan in their own terms of service, and those
            rules vary and change over time. LetsSplit doesn't own or control any of these
            services, and doesn't determine whether a given arrangement is allowed. It's your
            responsibility to check the provider's own terms before listing or joining a plan —
            see our{" "}
            <Link href="/terms" className="underline font-medium text-gray-900 dark:text-white">
              Terms of Use
            </Link>{" "}
            for details.
          </>
        ),
      },
      {
        q: "Does LetsSplit check whether a listing violates the service's terms?",
        a: "No — we don't review listings against any third-party service's terms of service, and listing something on LetsSplit isn't a representation that it's compliant. That said, we do act on reports of unlawful activity.",
      },
      {
        q: "How does the trust score work?",
        a: "A user's trust score is built from reviews left by people they've hosted or shared a plan with, plus signals like completed plans and on-time payments. It's shown on public host profiles as a helpful signal, not a guarantee.",
      },
      {
        q: "Can I report a host or member?",
        a: "Yes — email us at support@letssplit.in with the listing and a description of the issue. We review reports and can suspend accounts that violate our Terms of Use.",
      },
    ],
  },
  {
    key: "messaging",
    label: "Messaging",
    items: [
      {
        q: "How do I talk to my group?",
        a: "Once you're an active member (or the host) of a plan, a group chat appears under Messages automatically — use it to coordinate payment and ask questions.",
      },
      {
        q: "Can I message a host before joining?",
        a: "Not directly — group chats are created once you're approved as a member. Check the listing details and the host's profile and reviews before requesting to join.",
      },
      {
        q: "Is messaging disabled once a plan ends?",
        a: "Yes. Once a plan is marked completed or cancelled, the group chat becomes read-only — you can still see the history, but no new messages can be sent.",
      },
    ],
  },
  {
    key: "account",
    label: "Account & Profile",
    items: [
      {
        q: "Can I change my profile photo?",
        a: "Yes — go to your Profile page and click your avatar to upload a new photo (up to 5 MB). It'll show up anywhere your name appears — listings, group chats, and your host profile.",
      },
      {
        q: "How do I update my phone number?",
        a: "Your phone number can be added or updated from your Profile page.",
      },
      {
        q: "Can I delete my account?",
        a: "Email support@letssplit.in from your account's address and we'll delete your account and personal data, other than records we're required to keep for active memberships or unresolved disputes.",
      },
    ],
  },
  {
    key: "troubleshooting",
    label: "Troubleshooting",
    items: [
      {
        q: "I didn't receive my verification email",
        a: "Check your spam folder first. If it's not there, go to the sign-in page, enter your email and password, and use the “resend it” link that appears on the “email not verified” notice.",
      },
      {
        q: "Why can't I request to join a listing?",
        a: "The join button is replaced with a status message if the listing isn't currently accepting members — for example if it's full, already active, or you already have a pending, active, or rejected request for it.",
      },
      {
        q: "Why is the join button showing “not accepting new members”?",
        a: "That means the listing has moved past its recruiting stage (e.g. it's ready to purchase, already active, completed, or cancelled) and isn't taking new join requests.",
      },
    ],
  },
];

function PlusIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`shrink-0 flex items-center justify-center w-6 h-6 text-2xl leading-none
                  text-gray-400 dark:text-slate-500 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
    >
      +
    </span>
  );
}

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-gray-900 dark:text-white">{item.q}</span>
        <PlusIcon open={open} />
      </button>
      {open && (
        <div className="px-6 pb-5 -mt-1">
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_DATA
      .filter((cat) => activeCategory === "all" || cat.key === activeCategory)
      .map((cat) => ({
        ...cat,
        items: q
          ? cat.items.filter((item) => item.q.toLowerCase().includes(q))
          : cat.items,
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, activeCategory]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <LandingNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">

        {/* ── Sidebar ── */}
        <aside className="lg:sticky lg:top-28 lg:self-start h-fit">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
            Frequently Asked
            <br />
            Questions
          </h1>

          <div className="relative mb-5">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-800
                         bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-gray-900/8 dark:focus:ring-white/8"
            />
          </div>

          <nav className="space-y-0.5 mb-6">
            <button
              onClick={() => setActiveCategory("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors border-l-2 ${
                activeCategory === "all"
                  ? "border-indigo-600 text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-900"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-900/60"
              }`}
            >
              All Topics
            </button>
            {FAQ_DATA.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border-l-2 ${
                  activeCategory === cat.key
                    ? "border-indigo-600 text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-900"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-900/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          <div className="rounded-2xl bg-gray-100 dark:bg-slate-900 p-5">
            <p className="font-bold text-gray-900 dark:text-white mb-1">Still have a question?</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              If you didn&rsquo;t find your answer, feel free to reach out.
            </p>
            <a
              href="mailto:support@letssplit.in"
              className="block text-center rounded-xl border border-gray-300 dark:border-slate-700
                         bg-white dark:bg-slate-950 py-2.5 text-sm font-semibold text-gray-900 dark:text-white
                         hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </aside>

        {/* ── Content ── */}
        <div className="space-y-10">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500">
              No results for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            filtered.map((cat) => (
              <div key={cat.key}>
                <span className="inline-block px-3 py-1 rounded-full bg-gray-200 dark:bg-slate-800 text-xs font-semibold text-gray-600 dark:text-slate-300 mb-4">
                  {cat.label}
                </span>
                <div className="space-y-3">
                  {cat.items.map((item) => (
                    <AccordionItem key={item.q} item={item} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
