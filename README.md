<div align="center">
  <img src="web/public/logo-no-bg.png" alt="Habit Ink" width="88" height="88" />

  <h1>Habit Ink</h1>

  <p><em>A personal notebook for building routines that stick — one day at a time.</em></p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Supabase-2-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=react-router&logoColor=white" alt="React Router" />
    <img src="https://img.shields.io/badge/version-1.1-8b5cf6?style=flat-square" alt="Version 1.1" />
  </p>
</div>

---

Most habit trackers are too gamified. Most journals are too freeform. **Habit Ink** is both — a structured daily tracker and a personal journal living in the same interface, built with a design philosophy that respects your attention and grows quieter the more you use it.

---

## Table of Contents

- [Features at a Glance](#features-at-a-glance)
- [Screens](#screens)
  - [Login](#login)
  - [Today — Daily Tracker](#today--daily-tracker)
  - [Habits](#habits)
  - [Calendar](#calendar)
  - [Progress](#progress)
  - [Journal](#journal)
  - [Profile](#profile)
  - [Settings](#settings)
- [Themes](#themes)
- [Responsive Design](#responsive-design)
- [Authentication](#authentication)
- [Data Storage](#data-storage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Features at a Glance

| | Feature | Detail |
|---|---|---|
| 🔐 | **Google Sign-In** | One-tap OAuth via Supabase — session persists across tabs and reloads |
| ✦ | **Daily intention** | One sentence to anchor your morning |
| 📊 | **Habit table** | Track done / missed / actual values inline |
| 🔥 | **Streak milestones** | Toast alerts at 7, 14, 30, 60, 100, 200, 365 days |
| 🎉 | **Confetti** | Fires when every habit is done for the day |
| ↩ | **Back to Today** | Pill appears when browsing past dates — one tap returns you to today |
| 📅 | **Calendar heatmap** | Monthly grid with colour-coded completion |
| 🌡️ | **15-Week activity** | 105-day heatmap, horizontally scrollable on mobile |
| 📈 | **Auto insights** | Best day of week, top habit, week-over-week trend |
| 📓 | **Timeline journal** | Every day on a vertical spine, grouped by month, with jump-to-today links |
| 🎨 | **5 themes** | Swap palettes instantly — no reload |
| 🖋️ | **2 font styles** | Handwritten (Caveat) or Clean (Inter) |
| ⌨️ | **Keyboard nav** | Full desktop shortcuts on the Today screen |

---

## Screens

### Login

The first screen you see before signing in.

A centred layout with the Habit Ink logo, title, and a single **"Continue with Google"** button. Clicking it launches a Google OAuth flow via Supabase. After completing the flow in the browser you are redirected back to the app, signed in, and brought straight to Today's screen. The session is persisted — no re-login on refresh or next visit.

---

### Today — Daily Tracker

The screen you open every morning.

Set a **daily intention** at the top — one sentence about what you want the day to mean. A **7-day week strip** below it shows your momentum in colour: green for done, muted for missed, outlined for today.

The **habit table** lists everything scheduled. Each row has a name + emoji, a target, a one-tap status toggle (pending → done → missed → pending), and an **actual value** cell — tap it to log what you really did. This matters: your target might be "run 3 km" but you actually ran 5.2 km. That nuance deserves to be recorded.

Log your **wake-up time** with a native time picker. Track how consistently you're getting up early.

When navigating to a past date a **"↩ Back to Today" pill** appears below the header — click it to snap back instantly.

When every habit is checked done, **confetti bursts** across the screen and a celebration toast appears. Streak milestones — 7, 14, 30, 60, 100, 200, 365 days — trigger their own toast mid-session.

Below the table, a **rotating daily quote** (or your custom one from Settings). Then the journal: **Notes**, **Wins & Reflections**, and **Challenges** — three auto-growing textareas, each with a rotating prompt that changes by day of the week.

On desktop, habits have a **grip handle** for drag-to-reorder. Your order is saved. Full keyboard shortcuts are available (see [Keyboard Shortcuts](#keyboard-shortcuts)).

**Day number** in the header shows how many consecutive days you have been using the app, calculated from your sign-up date forward, starting from Day 1 on the very first day.

---

### Habits

All your habits, managed in one place.

Each habit card shows its emoji, name, colour accent stripe, schedule and target badges, how many days it has been running, an **animated 30-day completion bar**, and a live streak counter. On wider screens, cards display in a two-column grid.

Tap any card to open the **add / edit modal** — a bottom sheet on mobile (with a drag handle at the top), a centred dialog on desktop:

- **Icon** — choose from 24 emojis
- **Colour** — 8 accent colours to make each habit visually distinct
- **Name** — up to 80 characters, with live character countdown
- **Tracking type** — Yes/No · Number · Decimal · Time · Custom
- **Target / goal** — number types split into amount + unit (e.g. `10 000` + `steps`)
- **Schedule** — Daily · Weekdays · Weekends · Alternate · Custom (pick specific days)

**Archiving** keeps a habit's full history intact while removing it from the daily tracker. Archived habits live in a collapsible section and can be fully restored. Permanent deletion requires explicit confirmation.

---

### Calendar

The full picture of a month.

A **monthly grid** colour-codes every past day: green for full completion, blue for partial, red for missed, outlined for today, muted for the future. The legend uses the same tinted rectangles on both mobile and desktop. Tap any day to see a **day detail** view — every scheduled habit, its status symbol (✓ / ✗ / ○), its target, and an animated completion progress bar.

When no day is selected, the right panel shows **Upcoming — Next 7 Days**: a quick scan of what's ahead with a tap-to-jump shortcut to any day.

Desktop shows the calendar and detail panel side by side. Mobile keeps the calendar at the top and renders the detail below it.

---

### Progress

Where data becomes insight.

**Today's ring** — a circular SVG progress indicator showing today's completion percentage, global streak, and 30-day rate at a glance.

**Last 7 Days** — a clean bar chart of daily completion, one bar per day, with day labels Su–Sa.

**15-Week Activity** — a GitHub-style heatmap across 105 days. Cells are colour-graded from empty (faint) through partial to fully green. On mobile it scrolls horizontally at a comfortable cell size. On desktop it fills the container width responsively.

**All-Time Stats** — four lifetime numbers in a responsive grid: Total Check-ins, Best Streak, Perfect Days, and All-time Completion Rate.

**Habit Breakdown** — per-habit cards with colour streak badge, 30-day animated bar, done/scheduled counts, and three mini stats (current streak · best streak · 30-day rate).

**Insights** — auto-generated plain-English observations about your patterns: best day of week, top habit, lifetime check-in count, and this-week vs last-week comparison.

---

### Journal

A timeline of your inner life.

Every day from when you started the app appears on a **vertical spine**, newest at the top, grouped by month with a divider header. Days with content — intention, notes, wins, or challenges — expand into full cards. Days with nothing written collapse to a compact dot on the spine, keeping the timeline uncluttered.

Today's card is always open and highlighted. Every other card is collapsed by default but a single tap reveals all four sections: **Intention**, **Notes**, **Wins**, and **Challenges**. Wake-up time and the day number also appear in each card header.

Each entry card has an **↗ button** that opens that exact date in the Today screen — so you can view or edit the habits and journal for that day without navigating manually.

The screen header shows a running count: how many days tracked and how many entries written.

---

### Profile

Your corner of the app.

Set a **display name** with inline editing, pick an **avatar emoji** from 24 presets, or type any emoji into the **custom emoji input** and tap Use. Write an **About** section — your goals, motivation, a short bio.

Log your **weight** with a **kg / lbs toggle** and your **height** with a **cm / ft toggle**. Both units convert live: entering in one unit immediately shows the equivalent in the other below the field. Internally everything is stored in the base unit (kg, cm) so switching never loses precision.

Your current day number sits quietly below your name as a progress marker.

---

### Settings

Where the app becomes yours.

**Theme** · **Font Style** · **Text Size** · **Daily Quote** · **Account** · **Reset**

Five themes, two fonts, three text sizes, and the option to pin your own quote to the Today screen. Every change is instant, global, and persisted.

The **Account** section shows your Google profile photo, full name, and email address. A **Sign Out** button (with confirmation) lets you log out cleanly from any device.

Reset to Defaults restores only appearance settings — your habit data and journal are untouched.

---

## Themes

Five hand-crafted palettes. Every colour token — background, card, border, primary, success, accent, muted text — is specified per theme and applied globally.

| Theme | Character | Primary | Secondary / partial |
|---|---|---|---|
| **Classic Cream** | Warm journal, timeless | Navy blue `#2B3A8C` | Gold / amber |
| **Midnight Journal** | Dark mode, moody | Warm gold `#C9A84C` | Soft blue |
| **Forest Notes** | Earthy, grounded | Deep forest green `#2E5E2E` | Blue |
| **Rose Pages** | Soft, personal, warm | Rose red `#8B2635` | Blue |
| **Slate Modern** | Clean, contemporary | Slate blue `#3A5A8C` | Purple |

The **partial-completion colour** (shown on calendar cells and heatmap) is each theme's secondary token — chosen to complement rather than clash with the primary.

---

## Responsive Design

Three distinct layouts, no awkward in-between states.

**Mobile — under 768 px**
Six-tab bottom navigation bar. Touch-friendly tap targets throughout. Modals slide up as bottom sheets with a visible drag handle. Settings fills the full screen. The 15-week heatmap scrolls horizontally so cells stay legible. Stat grids collapse to 2 × 2.

**Tablet / Small Desktop — 768 – 1023 px**
Sidebar replaces the bottom bar. Single-column content with generous padding. Habit list becomes a two-column card grid.

**Wide Desktop — 1024 px +**
Full two-panel layouts. Calendar: grid left, detail right. Progress: ring + stats left, charts right. Sidebar collapses to a compact icon rail. Habit table gains a drag-to-reorder grip column. Keyboard shortcuts activate.

---

## Authentication

Habit Ink uses **Supabase Auth** with the Google OAuth provider.

- Clicking "Continue with Google" triggers a PKCE OAuth redirect
- After authorisation, Supabase returns a session and the user lands back at Today
- The session is stored automatically by Supabase and survives page reloads
- User metadata from Google (profile photo, full name, email) is displayed in the sidebar user card and in Settings → Account
- The sidebar shows the Google profile photo with a small Google `G` badge, the display name, and the account email
- Signing out clears the session and returns to the Login screen

---

## Data Storage

App data is persisted in **browser localStorage**. Authentication sessions are managed by **Supabase** (stored automatically in localStorage under `sb-*` keys).

| Key | What's stored |
|---|---|
| `@habitjournal/habits` | Habits (name, type, schedule, colour, archived state) |
| `@habitjournal/entries` | Status + actual values per habit per day |
| `@habitjournal/journals` | Intention, notes, wins, challenges, wake-up time per day |
| `@habitjournal/appstart` | The date you first opened the app |
| `@habitjournal/settings` | Theme, font, text size, custom quote, profile fields |
| `@habitink/habitOrder` | Drag-to-reorder sequence for the Today screen |
| `sidebar-collapsed` | Sidebar expansion state |
| `sb-*-auth-token` | Supabase session (managed automatically) |

---

## Keyboard Shortcuts

Available on the Today screen (desktop only). Press **?** at any time to open the overlay.

| Key | Action |
|---|---|
| `↑` / `↓` | Move focus between habit rows |
| `D` | Mark focused habit **Done** |
| `M` | Mark focused habit **Missed** |
| `U` | Reset focused habit to **Pending** |
| `?` | Toggle shortcuts overlay |
| `Esc` | Close overlay / deselect row |

---

## Architecture

No UI framework. No CSS library. Every component is hand-built with React and inline styles — which means the theme system works by swapping a plain object of colour tokens, not by toggling class names or CSS variables.

**Four contexts power the whole app:**

**`AuthContext`** — authentication layer. Holds the Supabase session and the current user object. Exposes `signIn()` (triggers Google OAuth) and `signOut()`. `AuthGate` wraps the entire app and renders the login screen when there is no active session.

**`HabitContext`** — core data layer. All habits, all entries, all journal records. Reads from and writes to localStorage on every change. Exposes streak calculations, completion rates, date-aware schedule checks, and journal helpers.

**`SettingsContext`** — appearance and profile. Theme, font style, font size, custom quote, user name, avatar, bio, body metrics. All persisted automatically.

**`ToastContext`** — non-blocking notification layer. Self-dismissing toasts used for milestone alerts, setting confirmations, and error feedback.

**Routing** uses React Router DOM v6 with two separate `<Routes>` trees — one for mobile (bottom-bar navigation), one for desktop (sidebar navigation). This keeps each layout clean with no conditional sprawl. The Today screen accepts an optional `?date=YYYY-MM-DD` query param so journal entries can deep-link to a specific day.

**Notable internals:**
- The 15-week heatmap uses a `ResizeObserver` with `useLayoutEffect` to compute cell size before the first paint — no layout flash.
- Drag-to-reorder on the Today screen uses native HTML5 drag events (desktop only). Touch devices see no grip handle and no `draggable` attribute, preventing scroll interference.
- The confetti animation is a pure `<canvas>` implementation with no dependencies.
- Modal is fully responsive: a centred dialog on desktop, a bottom sheet on mobile (with a pill drag handle) — same component, different style based on the `useIsDesktop` hook.
- Day number is calculated by normalising both the start date and the target date to noon before diffing — so the number is always correct regardless of what time of day you open the app.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| [Vite](https://vitejs.dev) | 6 | Build tool and dev server |
| [React](https://react.dev) | 18 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [React Router DOM](https://reactrouter.com) | 6 | Client-side routing |
| [Supabase](https://supabase.com) | 2 | Google OAuth authentication & session management |
| [Lucide React](https://lucide.dev) | 0.525 | Icon library |
| [Caveat](https://fonts.google.com/specimen/Caveat) | — | Handwritten display font (Google Fonts) |
| [Inter](https://rsms.me/inter/) | — | Clean body font (Google Fonts) |
| Browser Local Storage | — | All habit / journal / settings data |

Zero UI-framework dependencies beyond React, React Router, Supabase, and Lucide. No Redux, no Zustand, no Tailwind, no component library.

---

## Project Structure

```
Journal-Tracker/
├── README.md
└── web/                          Vite + React application
    ├── public/
    │   ├── favicon.png
    │   ├── favicon.svg
    │   └── logo.png
    └── src/
        ├── components/
        │   ├── AuthGate.tsx          Shows login screen if no session
        │   ├── CompletionRing.tsx    Circular SVG progress indicator
        │   ├── Confetti.tsx          Canvas confetti animation
        │   ├── Modal.tsx             Dialog (desktop) / bottom sheet (mobile)
        │   ├── MonthHeatmap.tsx      15-week activity heatmap
        │   ├── TabBar.tsx            Mobile bottom nav + collapsible sidebar
        │   └── WeeklyChart.tsx       7-day completion bar chart
        ├── constants/
        │   └── themes.ts             Five complete colour palettes
        ├── context/
        │   ├── AuthContext.tsx        Session · user · signIn · signOut
        │   ├── HabitContext.tsx       Habits · entries · journals · storage
        │   ├── SettingsContext.tsx    Theme · font · profile · storage
        │   └── ToastContext.tsx       Non-blocking toast notifications
        ├── hooks/
        │   ├── useColors.ts           Active theme colour tokens
        │   ├── useFont.ts             Active font family + size scale
        │   └── useIsDesktop.ts        Responsive breakpoint hooks (768 / 1024 px)
        ├── lib/
        │   ├── supabase.ts            Typed Supabase client singleton
        │   └── db/
        │       └── types.ts           TypeScript types matching the DB schema
        ├── screens/
        │   ├── LoginScreen.tsx        Google OAuth login page
        │   ├── TodayScreen.tsx        Daily tracker + journal
        │   ├── HabitsScreen.tsx       Habit management
        │   ├── CalendarScreen.tsx     Monthly calendar
        │   ├── ProgressScreen.tsx     Stats · charts · insights
        │   ├── JournalScreen.tsx      Timeline journal
        │   ├── ProfileScreen.tsx      User profile
        │   └── SettingsScreen.tsx     App settings
        ├── App.tsx                    Root layout + routing
        ├── main.tsx                   Entry point
        └── vite-env.d.ts              Vite environment type declarations
```

---

<div align="center">
  <p>
    Built with care &nbsp;·&nbsp; Habit Ink
  </p>
  <p>
    <sub>Habit Ink — v1.1</sub>
  </p>
</div>
