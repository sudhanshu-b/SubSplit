# LetsSplit — UI Design Standards

> Inspired by the editorial minimalism of Mobbin's landing page. Clean, confident,
> near-monochromatic with tight typography and smooth motion. Every design decision
> serves clarity and trust — two things users need when sharing subscriptions.

---

## Table of Contents

1. [Typography](#1-typography)
2. [Color System](#2-color-system)
3. [Spacing & Layout](#3-spacing--layout)
4. [Navbar](#4-navbar)
5. [Buttons](#5-buttons)
6. [Cards](#6-cards)
7. [Form Inputs](#7-form-inputs)
8. [Badges & Tags](#8-badges--tags)
9. [Animations & Motion](#9-animations--motion)
10. [Dark Mode](#10-dark-mode)
11. [CSS Variables Setup](#11-css-variables-setup)
12. [Do's & Don'ts](#12-dos--donts)

---

## 1. Typography

**Font:** `Outfit` (Google Fonts — already loaded in `app/layout.tsx`)  
Geometric, clean, rounded terminals. Excellent weight range from 400 to 800.

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing | Tailwind Class |
|------|------|--------|-------------|----------------|----------------|
| **Hero H1** | 72–80px | 700 | 1:1 (equal to size) | `-0.04em` | `text-7xl font-bold tracking-tight leading-none` |
| **Section H2** | 48–56px | 700 | 1:1 | `-0.03em` | `text-5xl font-bold tracking-tight leading-none` |
| **Card H3** | 24px | 600 | 1.2 | `-0.01em` | `text-2xl font-semibold tracking-tight` |
| **Body Large** | 20px | 400–500 | 1.4 | normal | `text-xl font-normal` |
| **Body** | 16px | 400 | 1.5 | normal | `text-base` |
| **Small / Caption** | 14px | 400 | 1.4 | `0.01em` | `text-sm` |
| **Label / Nav** | 16px | 600 | 1 | normal | `text-base font-semibold` |
| **Stat Counter** | 64–80px | 700 | 1 | `-0.04em` | `text-7xl font-bold tracking-tighter leading-none` |

### Rules

- **Never use pure `font-black` (900)** for body — max is `font-bold` (700) on headings.
- **Negative letter-spacing on all headings** — tight tracking makes large type feel premium.
- **1:1 line-height on display headings** — `leading-none` (`line-height: 1`). This is the Mobbin editorial signature.
- **Muted gray for subtitles** — never use the same color as the heading for supporting text.
- **Don't center-align body paragraphs longer than 2 lines** — use center only for short headlines.

### Usage Example

```tsx
{/* Page hero */}
<h1 className="text-7xl font-bold tracking-tight leading-none text-gray-900 dark:text-white">
  Split smarter,<br />save together.
</h1>
<p className="mt-6 text-xl text-gray-500 dark:text-gray-400 font-normal max-w-xl mx-auto text-center">
  Share subscriptions with people you trust.
  Pay less. Get more.
</p>
```

---

## 2. Color System

### Core Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--color-bg` | `#f8fafc` (slate-50) | `#020617` (slate-950) | Page background |
| `--color-surface` | `#ffffff` | `#0f172a` (slate-900) | Cards, panels |
| `--color-surface-2` | `#f1f5f9` (slate-100) | `#1e293b` (slate-800) | Subtle sections, hover |
| `--color-text` | `#111827` (gray-900) | `#f8fafc` (slate-50) | Primary text |
| `--color-text-muted` | `#6b7280` (gray-500) | `#94a3b8` (slate-400) | Subtitles, captions |
| `--color-text-faint` | `#9ca3af` (gray-400) | `#475569` (slate-600) | Placeholder, disabled |
| `--color-border` | `#e2e8f0` (slate-200) | `#1e293b` (slate-800) | Dividers, card borders |

> **Key insight from Mobbin:** Use `#141414` (not pure `#000000`) for text.  
> LetsSplit equivalent → `#111827` (gray-900). Softer on eyes, still authoritative.

### Brand / Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#4f46e5` (indigo-600) | CTAs, links, focus rings |
| `--color-primary-hover` | `#4338ca` (indigo-700) | Hover state of primary |
| `--color-primary-subtle` | `#eef2ff` (indigo-50) | Tinted backgrounds |
| `--color-success` | `#10b981` (emerald-500) | Active, paid, approved |
| `--color-warning` | `#f59e0b` (amber-500) | Pending, expiring soon |
| `--color-danger` | `#ef4444` (red-500) | Error, rejected, overdue |

### Color Usage Rules

- **Primary CTA:** Always indigo background + white text. Never use outline on the most important action.
- **Success state:** Emerald — for "Active" membership badges, payment confirmations.
- **One accent per screen** — don't mix indigo + emerald + amber all in one view.
- **Backgrounds should be almost white** (`#f8fafc`), not pure white — reduces eye strain.
- **Never use more than 3 colors** in a single card component.

---

## 3. Spacing & Layout

### Spacing Scale

Use Tailwind's default spacing. Key values:

| Usage | Value | Tailwind |
|-------|-------|---------|
| Micro gap (icon ↔ text) | 8px | `gap-2` |
| Component internal padding | 16–24px | `p-4` to `p-6` |
| Card padding | 24px | `p-6` |
| Section vertical padding | 64–96px | `py-16` to `py-24` |
| Max content width | 1280px | `max-w-7xl mx-auto` |
| Navbar max width | 1024px | `max-w-5xl mx-auto` |
| Readable prose width | 640px | `max-w-xl` or `max-w-2xl` |

### Layout Rules

- **Always use `px-4 sm:px-6 lg:px-8`** on page wrappers for responsive gutters.
- **Grid over flex** for card grids — use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- **Whitespace is intentional** — don't stack sections too tightly. Breathe.
- **Sections should have 80–96px top/bottom padding** (`py-20` to `py-24`).

---

## 4. Navbar

> **Mobbin's signature:** A floating **pill navbar** with frosted-glass blur.  
> LetsSplit uses this same pattern for its top navigation.

### Design Spec

```
Position:       Sticky top-0, centered horizontally
Shape:          Fully rounded pill — border-radius: 9999px
Background:     rgba(248, 250, 252, 0.80) light / rgba(2, 6, 23, 0.80) dark
Blur:           backdrop-filter: blur(20px)
Border:         1px solid rgba(226, 232, 240, 0.6) — subtle separator
Shadow:         0 1px 3px rgba(0,0,0,0.06)
Padding:        8px top/bottom, 24px left/right
Max width:      1024px
Margin top:     12px (floats above page content)
```

### Tailwind Implementation

```tsx
{/* Floating pill navbar wrapper */}
<div className="sticky top-3 z-50 flex justify-center px-4">
  <nav className="
    flex items-center justify-between
    w-full max-w-5xl
    rounded-full
    px-6 py-2
    bg-white/80 dark:bg-slate-950/80
    backdrop-blur-xl
    border border-slate-200/60 dark:border-slate-800/60
    shadow-sm
  ">
    {/* Logo */}
    <a href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
      LetsSplit
    </a>

    {/* Nav links */}
    <div className="hidden md:flex items-center gap-6">
      <a href="/pricing" className="text-base font-semibold text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">
        Pricing
      </a>
      <a href="/about" className="text-base font-semibold text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">
        About
      </a>
    </div>

    {/* CTAs */}
    <div className="flex items-center gap-3">
      <a href="/sign-in" className="text-base font-semibold text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">
        Log in
      </a>
      <a href="/sign-up" className="
        px-4 py-2 rounded-full text-sm font-semibold
        bg-gray-900 dark:bg-white
        text-white dark:text-gray-900
        hover:bg-gray-700 dark:hover:bg-slate-100
        transition-colors
      ">
        Join for free
      </a>
    </div>
  </nav>
</div>
```

---

## 5. Buttons

### Button Variants

#### Primary (Solid Dark — Most Important Action)
```
Background:   #111827 (gray-900) light / white dark
Text:         white light / gray-900 dark
Border-radius: 9999px (pill)
Padding:      10px 20px (sm) | 12px 24px (md) | 14px 28px (lg)
Font:         16px, weight 600
Hover:        slight opacity or color shift
```

```tsx
<button className="
  px-6 py-3 rounded-full
  bg-gray-900 dark:bg-white
  text-white dark:text-gray-900
  text-base font-semibold
  hover:bg-gray-700 dark:hover:bg-slate-100
  active:scale-[0.97]
  transition-all duration-150
">
  Join for free
</button>
```

#### Secondary (Ghost / Outline)
```tsx
<button className="
  px-6 py-3 rounded-full
  bg-transparent
  text-gray-900 dark:text-white
  text-base font-semibold
  border border-gray-300 dark:border-slate-700
  hover:border-gray-500 dark:hover:border-slate-500
  hover:bg-gray-50 dark:hover:bg-slate-900
  active:scale-[0.97]
  transition-all duration-150
">
  See our plans →
</button>
```

#### Primary Brand (Indigo — In-app actions)
```tsx
<button className="
  px-6 py-3 rounded-full
  bg-indigo-600 hover:bg-indigo-700
  text-white text-base font-semibold
  active:scale-[0.97]
  transition-all duration-150
  shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30
">
  Request to Join
</button>
```

#### Destructive
```tsx
<button className="
  px-6 py-3 rounded-full
  bg-red-500 hover:bg-red-600
  text-white text-base font-semibold
  active:scale-[0.97]
  transition-all duration-150
">
  Leave Group
</button>
```

### Button Rules

- **Always pill-shaped** (`rounded-full`) — never use `rounded-md` on standalone buttons.
- **Active state must scale** — `active:scale-[0.97]` gives tactile press feedback.
- **Loading state:** Replace text with a spinner, keep same width (`min-w` or fixed width).
- **Never use two primary buttons side by side** — one primary, one secondary.
- **Icon buttons:** Use `rounded-full p-2` — same pill philosophy applied to icon-only buttons.

---

## 6. Cards

### Standard Card

```tsx
<div className="
  bg-white dark:bg-slate-900
  border border-slate-200 dark:border-slate-800
  rounded-2xl
  p-6
  hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700
  transition-all duration-200
">
  {/* Card content */}
</div>
```

### Subscription Listing Card

```tsx
<div className="
  group
  bg-white dark:bg-slate-900
  border border-slate-200 dark:border-slate-800
  rounded-2xl p-6
  hover:shadow-lg hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20
  hover:border-indigo-200 dark:hover:border-indigo-800
  transition-all duration-200
  cursor-pointer
">
  {/* Header row */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {/* App icon */}
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
          Netflix Standard
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">4 slots · 2 open</p>
      </div>
    </div>
    {/* Badge */}
    <span className="...">Active</span>
  </div>

  {/* Price */}
  <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
    ₹149
    <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-1">/month</span>
  </p>
</div>
```

### Stats / Number Card

```tsx
<div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
  <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
    ₹2,400
  </p>
  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Saved this year</p>
</div>
```

### Card Rules

- **`rounded-2xl`** — never less than `rounded-xl` for cards.
- **Border + hover shadow** — cards should lift on hover (`hover:shadow-md`).
- **`p-6` internal padding** — consistent across all cards.
- **No heavy drop shadows at rest** — shadows appear on hover only.

---

## 7. Form Inputs

### Text Input

```tsx
<div className="space-y-1.5">
  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
    Email address
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    className="
      w-full px-4 py-3 rounded-xl
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-700
      text-base text-gray-900 dark:text-white
      placeholder:text-gray-400 dark:placeholder:text-slate-600
      focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
      dark:focus:border-indigo-400
      transition-all duration-150
    "
  />
</div>
```

### Select / Dropdown

```tsx
<select className="
  w-full px-4 py-3 rounded-xl
  bg-white dark:bg-slate-900
  border border-slate-200 dark:border-slate-700
  text-base text-gray-900 dark:text-white
  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
  transition-all duration-150
  appearance-none cursor-pointer
">
```

### Input Rules

- **`rounded-xl`** — slightly less than cards (`rounded-2xl`) to create visual hierarchy.
- **Focus ring:** `ring-2 ring-indigo-500/30` — soft, not harsh.
- **Labels:** Always above the input, `font-semibold text-sm`.
- **Error state:** `border-red-400 ring-red-400/30 focus:border-red-500`.
- **Padding:** `px-4 py-3` minimum — touch-friendly 48px height.

---

## 8. Badges & Tags

### Status Badges

```tsx
{/* Active / Success */}
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  Active
</span>

{/* Pending / Warning */}
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
  Pending
</span>

{/* Rejected / Error */}
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/50">
  Rejected
</span>

{/* Neutral / Info */}
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
  Inactive
</span>

{/* PRO badge */}
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900">
  PRO
</span>
```

### Badge Rules

- **Always `rounded-full`** — badges are pill-shaped like buttons.
- **`text-xs font-semibold`** — never `font-normal` on badges.
- **Active status = green dot + "Active"** — the pulsing dot communicates live status.
- **Never use raw color names** like "blue" — use semantic names (success, warning, danger).

---

## 9. Animations & Motion

**Libraries installed:** `framer-motion@12` + `gsap@3`  
**Rule:** Use **Framer Motion** for component-level animations. Use **GSAP** only for complex scroll sequences (counters, timeline scrubs).

### Framer Motion Patterns

#### Fade In on Mount (most common)
```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
  {/* content */}
</motion.div>
```

#### Staggered List (cards appearing one by one)
```tsx
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

<motion.ul variants={container} initial="hidden" animate="show">
  {listings.map(l => (
    <motion.li key={l.id} variants={item}>
      <ListingCard listing={l} />
    </motion.li>
  ))}
</motion.ul>
```

#### Hover Card Lift
```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(79,70,229,0.10)" }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  <Card />
</motion.div>
```

#### Button Press
```tsx
<motion.button
  whileTap={{ scale: 0.96 }}
  transition={{ duration: 0.1 }}
>
  Join for free
</motion.button>
```

#### Page Transition (layout)
```tsx
<motion.main
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: "easeOut" }}
>
  {children}
</motion.main>
```

#### Scroll-triggered Reveal (Viewport)
```tsx
<motion.section
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
>
  {/* section content */}
</motion.section>
```

#### Number Counter (GSAP)
```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function StatCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      { val: 0 },
      {
        val: value,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
        onUpdate() {
          el.textContent = prefix + Math.round(this.targets()[0].val).toLocaleString() + suffix;
        },
      }
    );
  }, [value, prefix, suffix]);

  return <span ref={ref}>0</span>;
}
```

### Animation Rules

- **Easing:** Always use `[0.22, 1, 0.36, 1]` (custom ease-out) for entrances — smooth deceleration.
- **Duration:** Never exceed `0.5s` for UI transitions. Keep it snappy.
- **`once: true` on whileInView** — elements don't re-animate on scroll back up.
- **No animation on text under 16px** — too subtle to see, causes jank.
- **Respect `prefers-reduced-motion`:**

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedCard() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.4 }}
    >
```

---

## 10. Dark Mode

LetsSplit uses a **class-based dark mode** (`html.dark`), already configured in `globals.css`.

### Dark Mode Mapping

| Light | Dark | Usage |
|-------|------|-------|
| `bg-white` | `dark:bg-slate-900` | Card surfaces |
| `bg-slate-50` | `dark:bg-slate-950` | Page background |
| `bg-slate-100` | `dark:bg-slate-800` | Hover, subtle |
| `text-gray-900` | `dark:text-white` | Primary text |
| `text-gray-500` | `dark:text-slate-400` | Muted text |
| `border-slate-200` | `dark:border-slate-800` | Card borders |
| `bg-gray-900 text-white` | `dark:bg-white dark:text-gray-900` | Dark CTA button |
| `bg-indigo-600` | `dark:bg-indigo-500` | Brand accent |

### Dark Mode Rule

Every component must be written with **both modes simultaneously**. No component is "we'll add dark mode later."

```tsx
{/* ✅ Correct */}
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-slate-200 dark:border-slate-800">

{/* ❌ Wrong — missing dark variants */}
<div className="bg-white text-gray-900">
```

---

## 11. CSS Variables Setup

Add these to `app/globals.css` inside `@layer base` for a centralized token system:

```css
@layer base {
  :root {
    --color-bg:           248 250 252;   /* slate-50  */
    --color-surface:      255 255 255;   /* white     */
    --color-surface-2:    241 245 249;   /* slate-100 */
    --color-text:         17  24  39;    /* gray-900  */
    --color-text-muted:   107 114 128;   /* gray-500  */
    --color-border:       226 232 240;   /* slate-200 */

    --color-primary:      79  70  229;   /* indigo-600 */
    --color-success:      16  185 129;   /* emerald-500 */
    --color-warning:      245 158 11;    /* amber-500  */
    --color-danger:       239  68  68;   /* red-500    */

    --radius-pill:        9999px;
    --radius-card:        1rem;          /* 16px = rounded-2xl */
    --radius-input:       0.75rem;       /* 12px = rounded-xl  */

    --nav-blur:           20px;
    --nav-bg-opacity:     0.80;

    --transition-fast:    150ms;
    --transition-base:    200ms;
    --transition-slow:    350ms;
  }

  html.dark {
    --color-bg:           2   6   23;    /* slate-950 */
    --color-surface:      15  23  42;    /* slate-900 */
    --color-surface-2:    30  41  59;    /* slate-800 */
    --color-text:         248 250 252;   /* slate-50  */
    --color-text-muted:   148 163 184;   /* slate-400 */
    --color-border:       30  41  59;    /* slate-800 */
    --color-primary:      99  102 241;   /* indigo-500 */
  }
}
```

---

## 12. Do's & Don'ts

### ✅ Do

- **Use pill shapes everywhere** — navbars, buttons, badges. It's our visual signature.
- **Negative letter-spacing on headings** — `tracking-tight` or `tracking-tighter` for display text.
- **Tight 1:1 line-height on large type** — `leading-none` on H1 and H2.
- **Animate on scroll with `whileInView`** — reveal content as user scrolls.
- **Use `transition-all duration-150`** on interactive elements for snappy hover responses.
- **Respect whitespace** — let elements breathe. Don't cram.
- **Use `backdrop-blur-xl`** for modals, navbars, overlays — adds depth without heavy shadows.
- **Gray-900 / White CTA on marketing pages** — indigo CTA for in-app actions.

### ❌ Don't

- **Don't use `rounded-md` on buttons** — always `rounded-full`.
- **Don't use pure `#000000` or `#ffffff`** — use `gray-900` and `slate-50` instead.
- **Don't mix too many accent colors** — max 2 on any single screen.
- **Don't animate everything** — motion should draw attention to important moments.
- **Don't use `font-black` (900)** — max is `font-bold` (700).
- **Don't center-align long body text** — center only headlines and short callouts.
- **Don't stack cards without breathing room** — always `gap-4` or `gap-6` minimum.
- **Don't skip dark mode variants** — every class needs its `dark:` counterpart.
- **Don't use heavy box-shadows at rest** — shadows are for hover/active states only.
- **Don't use animations over 500ms** — feels sluggish.

---

## Quick Reference — Tailwind Cheat Sheet

```
Navbar pill:     sticky top-3 | rounded-full | bg-white/80 | backdrop-blur-xl | border border-slate-200/60 | px-6 py-2
Button primary:  rounded-full | bg-gray-900 | text-white | px-6 py-3 | font-semibold | hover:bg-gray-700 | active:scale-[0.97]
Button ghost:    rounded-full | border border-gray-300 | px-6 py-3 | font-semibold | hover:bg-gray-50
Card:            bg-white | rounded-2xl | border border-slate-200 | p-6 | hover:shadow-md
Input:           rounded-xl | border border-slate-200 | px-4 py-3 | focus:ring-2 focus:ring-indigo-500/30
Badge active:    rounded-full | bg-emerald-50 | text-emerald-700 | text-xs font-semibold | px-2.5 py-1
Badge pending:   rounded-full | bg-amber-50   | text-amber-700   | text-xs font-semibold | px-2.5 py-1
Badge danger:    rounded-full | bg-red-50     | text-red-700     | text-xs font-semibold | px-2.5 py-1
H1 hero:         text-7xl | font-bold | tracking-tight | leading-none
H2 section:      text-5xl | font-bold | tracking-tight | leading-none
Body muted:      text-xl | text-gray-500 | font-normal
Transition:      transition-all duration-150 ease-out
Animate in:      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
```

---

*LetsSplit UI Standards v1.0 — Inspired by Mobbin's editorial minimalism.*  
*Stack: Next.js 16 · React 19 · Tailwind CSS v4 · Framer Motion 12 · GSAP 3 · Outfit (Google Fonts)*
