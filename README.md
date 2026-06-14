<div align="center">
  <img src="web/public/logo-no-bg.png" alt="Habit Ink" width="88" height="88" />

  <h1>Habit Ink</h1>

  <p><em>A personal notebook for building routines that stick — one day at a time.</em></p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=react-router&logoColor=white" alt="React Router" />
    <img src="https://img.shields.io/badge/version-1.0-8b5cf6?style=flat-square" alt="Version 1.0" />
  </p>
</div>

---

Most habit trackers are too gamified. Most journals are too freeform. **Habit Ink** is both — a structured daily tracker and a personal journal living in the same interface, built with a design philosophy that respects your attention and grows quieter the more you use it.

---

## Table of Contents

- [Features at a Glance](#features-at-a-glance)
- [Screens](#screens)
  - [Today — Daily Tracker](#today--daily-tracker)
  - [Habits](#habits)
  - [Calendar](#calendar)
  - [Progress](#progress)
  - [Journal](#journal)
  - [Profile](#profile)
  - [Settings](#settings)
- [Themes](#themes)
- [Responsive Design](#responsive-design)
- [Data Storage](#data-storage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Project Structure](#project-structure)

---

## Features at a Glance

| | Feature | Detail |
|---|---|---|
| ✦ | **Daily intention** | One sentence to anchor your morning |
| 📊 | **Habit table** | Track done / missed / actual values inline |
| 🔥 | **Streak milestones** | Toast alerts at 7, 14, 30, 60, 100, 200, 365 days |
| 🎉 | **Confetti** | Fires when every habit is done for the day |
| 📅 | **Calendar heatmap** | Monthly grid with colour-coded completion |
| 🌡️ | **15-Week activity** | 105-day heatmap, horizontally scrollable on mobile |
| 📈 | **Auto insights** | Best day of week, top habit, week-over-week trend |
| 📓 | **Timeline journal** | Every day on a vertical spine, grouped by month |
| 🎨 | **5 themes** | Swap palettes instantly — no reload |
| 🖋️ | **2 font styles** | Handwritten (Caveat) or Clean (Inter) |
| ⌨️ | **Keyboard nav** | Full desktop shortcuts on the Today screen |

---

## Screens

### Today — Daily Tracker

The screen you open every morning.

Set a **daily intention** at the top — one sentence about what you want the day to mean. A **7-day week strip** below it shows your momentum in colour: green for done, muted for missed, outlined for today.

The **habit table** lists everything scheduled. Each row has a name + emoji, a target, a one-tap status toggle (pending → done → missed → pending), and an **actual value** cell — tap it to log what you really did. This matters: your target might be "run 3 km" but you actually ran 5.2 km. That nuance deserves to be recorded.

Log your **wake-up time** with a native time picker. Track how consistently you're getting up early.

When every habit is checked done, **confetti bursts** across the screen and a celebration toast appears. Streak milestones — 7, 14, 30, 60, 100, 200, 365 days — trigger their own toast mid-session.

Below the table, a **rotating daily quote** (or your custom one from Settings). Then the journal: **Notes**, **Wins & Reflections**, and **Challenges** — three auto-growing textareas, each with a rotating prompt that changes by day of the week.

On desktop, habits have a **grip handle** for drag-to-reorder. Your order is saved. Full keyboard shortcuts are available (see [Keyboard Shortcuts](#keyboard-shortcuts)).

---

### Habits

All your habits, managed in one place.

Each habit card shows its emoji, name, colour accent stripe, schedule and target badges, how many days it has been running, an **animated 30-day completion bar**, and a live streak counter. On wider screens, cards display in a two-column grid.

Tap any card to open the **add / edit modal** — a bottom sheet on mobile, a centred dialog on desktop:

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

A **monthly grid** colour-codes every past day: green for full completion, blue for partial, red for missed, outlined for today, muted for the future. Tap any day to see a **day detail** view — every scheduled habit, its status symbol (✓ / ✗ / ○), its target, and an animated completion progress bar.

When no day is selected, the right panel shows **Upcoming — Next 7 Days**: a quick scan of what's ahead with a tap-to-jump shortcut to any day.

Desktop shows the calendar and detail panel side by side. Mobile keeps the calendar at the top and renders the detail below it.

---

### Progress

Where data becomes insight.

**Today's ring** — a circular SVG progress indicator showing today's completion percentage, global streak, and 30-day rate at a glance.

**Last 7 Days** — a clean bar chart of daily completion, one bar per day.

**15-Week Activity** — a GitHub-style heatmap across 105 days. Cells are colour-graded from empty (faint) through partial to fully green. On mobile it scrolls horizontally at a comfortable cell size. On desktop it fills the container width responsively.

**All-Time Stats** — four lifetime numbers in a responsive grid: Total Check-ins, Best Streak, Perfect Days, and All-time Completion Rate.

**Habit Breakdown** — per-habit cards with colour streak badge, 30-day animated bar, done/scheduled counts, and three mini stats (current streak · best streak · 30-day rate).

**Insights** — auto-generated plain-English observations about your patterns: best day of week, top habit, lifetime check-in count, and this-week vs last-week comparison.

---

### Journal

A timeline of your inner life.

Every day from when you started the app appears on a **vertical spine**, newest at the top, grouped by month with a divider header. Days with content — intention, notes, wins, or challenges — expand into full cards. Days with nothing written collapse to a compact dot on the spine, keeping the timeline uncluttered.

Today's card is always open and highlighted. Every other card is collapsed by default but a single tap reveals all four sections: **Intention**, **Notes**, **Wins**, and **Challenges**. Wake-up time and the day number also appear in each card header.

The screen header shows a running count: how many days tracked and how many entries written.

---

### Profile

Your corner of the app.

Set a **display name** with inline editing, pick an **avatar emoji** from 24 options, write an **About** section — your goals, motivation, a short bio — and optionally log your **weight (kg)** and **height (cm)**. Height is automatically converted and shown in ft / in. Your current day number sits quietly below your name as a progress marker.

---

### Settings

Where the app becomes yours.

**Theme** · **Font Style** · **Text Size** · **Daily Quote** · **Reset**

Five themes, two fonts, three text sizes, and the option to pin your own quote to the Today screen. Every change is instant, global, and persisted. Reset to Defaults restores only appearance settings — your data is untouched.

---

## Themes

Five hand-crafted palettes. Every colour token — background, card, border, primary, success, accent, muted text — is specified per theme and applied globally.

| Theme | Character | Primary | Partial colour |
|---|---|---|---|
| **Classic Cream** | Warm journal, timeless | Navy blue | Gold / amber |
| **Midnight Journal** | Dark mode, moody | Warm gold | Soft blue |
| **Forest Notes** | Earthy, grounded | Deep forest green | Blue |
| **Rose Pages** | Soft, personal, warm | Rose red | Blue |
| **Slate Modern** | Clean, contemporary | Slate blue | Purple |

The **partial-completion colour** (shown on calendar dots and heatmap cells) is each theme's secondary token — chosen to complement rather than clash with the primary.

---

## Responsive Design

Three distinct layouts, no awkward in-between states.

**Mobile — under 768 px**
Six-tab bottom navigation bar. Touch-friendly tap targets throughout. Modals slide up as bottom sheets. Settings fills the full screen. The 15-week heatmap scrolls horizontally so cells stay legible. Stat grids collapse to 2 × 2.

**Tablet / Small Desktop — 768 – 1023 px**
Sidebar replaces the bottom bar. Single-column content with generous padding. Habit list becomes a two-column card grid.

**Wide Desktop — 1024 px +**
Full two-panel layouts. Calendar: grid left, detail right. Progress: ring + stats left, charts right. Sidebar collapses to a compact icon rail. Habit table gains a drag-to-reorder grip column. Keyboard shortcuts activate.

---

## Data Storage

All app data is persisted in **browser local storage** across seven keys:

| Key | What's stored |
|---|---|
| `@habitjournal/habits` | Habits (name, type, schedule, colour, archived state) |
| `@habitjournal/entries` | Status + actual values per habit per day |
| `@habitjournal/journals` | Intention, notes, wins, challenges, wake-up time per day |
| `@habitjournal/appstart` | The date you first opened the app |
| `@habitjournal/settings` | Theme, font, text size, custom quote, profile fields |
| `@habitink/habitOrder` | Drag-to-reorder sequence for the Today screen |
| `sidebar-collapsed` | Sidebar expansion state |

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

**Three contexts power the whole app:**

**`HabitContext`** — core data layer. All habits, all entries, all journal records. Reads from and writes to local storage on every change. Exposes streak calculations, completion rates, date-aware schedule checks, and journal helpers.

**`SettingsContext`** — appearance and profile. Theme, font style, font size, custom quote, user name, avatar, bio, body metrics. All persisted automatically.

**`ToastContext`** — non-blocking notification layer. Self-dismissing toasts used for milestone alerts, setting confirmations, and error feedback.

**Routing** uses React Router DOM v6 with two separate `<Routes>` trees — one for mobile (bottom-bar navigation), one for desktop (sidebar navigation). This keeps each layout clean with no conditional sprawl.

**Notable internals:**
- The 15-week heatmap uses a `ResizeObserver` with `useLayoutEffect` to compute cell size before the first paint — no layout flash.
- Drag-to-reorder on the Today screen uses native HTML5 drag events (desktop only). Touch devices see no grip handle and no `draggable` attribute, preventing scroll interference.
- The confetti animation is a pure `<canvas>` implementation with no dependencies.
- Modal is fully responsive: a centred dialog on desktop, a bottom sheet on mobile — same component, different style based on the `useIsDesktop` hook.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| [Vite](https://vitejs.dev) | 6 | Build tool and dev server |
| [React](https://react.dev) | 18 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [React Router DOM](https://reactrouter.com) | 6 | Client-side routing |
| [Lucide React](https://lucide.dev) | 0.525 | Icon library |
| [Caveat](https://fonts.google.com/specimen/Caveat) | — | Handwritten display font (Google Fonts) |
| [Inter](https://rsms.me/inter/) | — | Clean body font (Google Fonts) |
| Browser Local Storage | — | All data persistence |

Zero runtime dependencies beyond React, React Router, and Lucide. No Redux, no Zustand, no Tailwind, no component library.

---

## Roadmap

Habit Ink 1.0 is feature-complete. The next major milestone is a cloud backend:

- **Google OAuth sign-in** via Supabase Auth (PKCE flow)
- **Cloud sync** — PostgreSQL on Supabase, same data shape as current local storage
- **Cross-device access** — open on your phone, pick up on your laptop
- **Supabase Realtime** — live updates across open tabs
- **Row-level security** — your data is only ever visible to you
- **Offline-first** — local storage remains the source of truth; syncs on reconnect
- **Data export** — download your full history as JSON or CSV

---

## Project Structure

```
Journal-Tracker/
├── README.md
└── web/                      Vite + React application
    ├── public/
    │   ├── favicon.png
    │   ├── favicon.svg
    │   └── logo.png
    └── src/
        ├── components/
        │   ├── CompletionRing.tsx   Circular SVG progress indicator
        │   ├── Confetti.tsx         Canvas confetti animation
        │   ├── Modal.tsx            Dialog (desktop) / bottom sheet (mobile)
        │   ├── MonthHeatmap.tsx     15-week activity heatmap
        │   ├── TabBar.tsx           Mobile bottom nav + collapsible sidebar
        │   └── WeeklyChart.tsx      7-day completion bar chart
        ├── constants/
        │   └── themes.ts            Five complete colour palettes
        ├── context/
        │   ├── HabitContext.tsx     Habits · entries · journals · storage
        │   ├── SettingsContext.tsx  Theme · font · profile · storage
        │   └── ToastContext.tsx     Non-blocking toast notifications
        ├── hooks/
        │   ├── useColors.ts         Active theme colour tokens
        │   ├── useFont.ts           Active font family + size scale
        │   └── useIsDesktop.ts      Responsive breakpoint hooks (768 / 1024 px)
        ├── screens/
        │   ├── TodayScreen.tsx      Daily tracker + journal
        │   ├── HabitsScreen.tsx     Habit management
        │   ├── CalendarScreen.tsx   Monthly calendar
        │   ├── ProgressScreen.tsx   Stats · charts · insights
        │   ├── JournalScreen.tsx    Timeline journal
        │   ├── ProfileScreen.tsx    User profile
        │   └── SettingsScreen.tsx   App settings
        ├── App.tsx                  Root layout + routing
        └── main.tsx                 Entry point
```

---

<div align="center">
  <p>
    Built with care &nbsp;·&nbsp; Habit Ink
  </p>
  <p>
    <sub>Habit Ink — v1.0</sub>
  </p>
</div>
