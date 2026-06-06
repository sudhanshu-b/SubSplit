# SubSplit — Project Overview (MVP)

## The Idea

A web app that lets people **split subscriptions with strangers**.

- A **host** lists a subscription they already own (or want to buy but find too expensive) and opens up a number of seats to share.
- A **buyer** searches for the subscription they want, finds an existing post with open seats, and joins to split the cost.

**Guiding principle:** focus on services that officially allow shared or family plans (e.g. Spotify Family, YouTube Premium Family, Apple One, Microsoft 365 Family). This keeps the product on the right side of terms-of-service and avoids the security risk of brokering raw account credentials.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (TypeScript) — frontend + backend in one codebase |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (via Supabase) |
| ORM | Drizzle or Prisma |
| Auth | Better Auth — code-first, sessions in your own database (great for learning) |
| Hosting | Vercel (app) + Supabase (database) |
| Payments (Phase 2+) | Stripe Connect — built for collect-from-many, pay-to-one |

## Phase 1 Features

The goal of Phase 1 is to **validate the core loop** — host posts, buyer finds and joins — with just enough trust and money handling to be safe, before building heavier infrastructure.

1. **Authentication** — sign up and log in (Better Auth). The foundation everything else depends on.
2. **Post creation with slot tracking** — a host lists a subscription (service, number of seats, price per seat, region) with a live count of remaining seats.
3. **Search and discovery** — buyers find subscriptions by service, with basic filters (price, region).
4. **Join request flow** — a buyer requests a seat; the host approves or declines.
5. **In-app messaging** — host and member coordinate inside the app without swapping personal contact details (also the baseline safety measure).
6. **Lightweight trust signals** — email verification and a simple profile that will show join history over time.
7. **Simple payment** — keep money minimal for now: collect the buyer's single share via basic Stripe Checkout, or let parties settle between themselves. Full recurring billing and escrow come in Phase 2.

---

*Phases 2 and 3 (robust payments, reputation system, waitlists, referrals, savings tracker, etc.) build on top of this foundation once the core loop is validated.*
