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
    <img src="https://img.shields.io/badge/version-2.0-8b5cf6?style=flat-square" alt="Version 2.0" />
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
| ☁️ | **Cloud sync** | All habits, journals, and settings saved to Supabase — accessible on any device |
| 🔄 | **Realtime** | Cross-tab sync via Supabase Realtime — open two windows, changes appear in both |
| ↩ | **Undo delete** | Deleting a habit shows a 5-second undo toast — nothing is permanently gone until the window closes |
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

On first login, any data previously stored in browser localStorage is silently migrated to Supabase and the local keys are cleared — so existing users keep all their history.

---

### Today — Daily Tracker

The screen you open every morning.

Set a **daily intention** at the top — one sentence about what you want the day to mean. A **7-day week strip** below it shows your momentum in colour: green for done, muted for missed, outlined for today.

The **habit table** lists everything scheduled. Each row has a name + emoji, a target, a one-tap status toggle (pending → done → missed → pending), and an **actual value** cell — tap it to log what you really did. This matters: your target might be "run 3 km" but you actually ran 5.2 km. That nuance deserves to be recorded.

Log your **wake-up time** with a native time picker. Track how consistently you're getting up early.

When navigating to a past date a **"↩ Back to Today" pill** appears below the header — click it to snap back instantly.

When every habit is checked done, **confetti bursts** across the screen and a celebration toast appears. Streak milestones — 7, 14, 30, 60, 100, 200, 365 days — trigger their own toast mid-session.

Below the table, a **rotating daily quote** (or your custom one from Settings). Then the journal: **Notes**, **Wins & Reflections**, and **Challenges** — three auto-growing textareas, each with a rotating prompt that changes by day of the week. Journal edits are saved to the database automatically after a short pause in typing.

On desktop, habits have a **grip handle** for drag-to-reorder. Your order is saved to your profile in the cloud and syncs across devices.

**Day number** in the header shows how many days you have been using the app, calculated from your account start date, starting from Day 1 on the very first day.

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

**Archiving** keeps a habit's full history intact while removing it from the daily tracker. Archived habits live in a collapsible section and can be fully restored.

**Permanent deletion** uses a two-tap inline confirm inside the modal — the first tap reveals a red warning panel with the habit name; the second tap confirms. After confirmation the habit disappears immediately and a **5-second undo toast** appears. Clicking Undo restores the habit instantly — the database delete only fires after the undo window closes.

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

All profile changes sync to your Supabase account automatically — visible immediately on any device you sign into.

Your current day number sits quietly below your name as a progress marker.

---

### Settings

Where the app becomes yours.

**Theme** · **Font Style** · **Text Size** · **Daily Quote** · **Account** · **Reset**

Five themes, two fonts, three text sizes, and the option to pin your own quote to the Today screen. Every change is instant, global, and synced to the cloud.

The **Account** section shows your Google profile photo, full name, and email address. Clicking **Sign Out** opens a themed confirmation dialog (bottom sheet on mobile, centered modal on desktop) showing your account details before logging you out cleanly.

**Reset to Defaults** uses an **inline confirmation panel** that expands in place — no overlay, no browser dialog. It clearly states that only appearance settings (theme, font, quote) will be reset; your habit data and journal entries are untouched. Pressing nothing for 4 seconds auto-cancels the confirmation.

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
- Signing out clears the session, returns to the Login screen, and resets all in-memory state

**First-login migration** — if the browser has legacy localStorage data from before the Supabase backend was added, it is silently migrated to the database on first sign-in and the local keys are cleared. Migration is safe: if the database already has data for the user, the local keys are simply cleared and no overwrite happens.

---

## Data Storage

All application data is stored in **Supabase Postgres** and synced via **Supabase Realtime**. Authentication sessions are managed by Supabase Auth (stored in browser memory under `sb-*` keys).

### Database tables

| Table | What's stored |
|---|---|
| `profiles` | Theme, font, text size, custom quote, display name, avatar emoji, about text, weight, height, habit order, sidebar state, app start date |
| `habits` | Name, type, target, schedule, custom days, emoji, colour, archived state |
| `habit_entries` | Status (done / missed / pending) and actual value per habit per day |
| `journals` | Wake-up time, intention, notes, wins, challenges per day |

All tables use **Row Level Security (RLS)** — users can only read and write their own rows. A Postgres trigger creates a `profiles` row automatically when a new user signs up via Google.

### Sync strategy

| Operation | Strategy |
|---|---|
| Habit status / actual value | Immediate optimistic update → background upsert |
| Add / update / archive habit | Immediate optimistic update → background insert / update |
| Delete habit | Immediate UI removal → 5-second undo window → then DB delete |
| Journal fields | Immediate optimistic update → **800 ms debounce** per date before upsert |
| Settings (toggles, emoji, order) | Immediate update → background write |
| Settings (text inputs) | Immediate optimistic update → **800 ms debounce** before write |
| Initial load | Migration check → parallel fetch of all four tables → render |

### Realtime

Supabase Realtime subscriptions on `habits`, `habit_entries`, and `journals` keep every open tab or window in sync. Changes made in one tab appear in another without a refresh.

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

**`AuthContext`** — authentication layer. Holds the Supabase session and the current user object. Exposes `signIn()` (triggers Google OAuth) and `signOut()`. `AuthGate` wraps the entire app and renders the login screen when there is no active session, and an `AppSkeleton` loading spinner while settings and habit data are being fetched from the database.

**`HabitContext`** — core data layer. All habits, all entries, all journal records. On login: runs the optional one-time localStorage migration, then fetches all four tables in parallel. Mutations are optimistic — state updates instantly and a background Supabase write follows. Journal saves are debounced per date (800 ms) to batch rapid keystrokes into a single write. Supabase Realtime subscriptions on all three tables keep every open tab in sync. Exposes streak calculations, completion rates, date-aware schedule checks, and journal helpers.

**`SettingsContext`** — appearance and profile. Theme, font style, font size, custom quote, user name, avatar emoji, bio, body metrics, habit order, sidebar collapse state. Reads from the `profiles` table on login. Toggles and button taps write immediately; text inputs are debounced 800 ms. Also owns `habitOrder` and `sidebarCollapsed`, previously stored directly in localStorage by `TodayScreen` and `TabBar`.

**`ToastContext`** — non-blocking notification layer. Self-dismissing toasts used for milestone alerts, setting confirmations, undo-delete feedback, and error reporting. Supports an optional `duration` override — the undo delete toast uses 5 000 ms; standard toasts auto-dismiss at 3 800 ms.

**Routing** uses React Router DOM v6 with two separate `<Routes>` trees — one for mobile (bottom-bar navigation), one for desktop (sidebar navigation). The Today screen accepts an optional `?date=YYYY-MM-DD` query param so journal entries can deep-link to a specific day.

**Notable internals:**
- The 15-week heatmap uses a `ResizeObserver` with `useLayoutEffect` to compute cell size before the first paint — no layout flash.
- Drag-to-reorder on the Today screen uses native HTML5 drag events (desktop only). Touch devices see no grip handle and no `draggable` attribute, preventing scroll interference. The resulting order is saved to `profiles.habit_order` in the database.
- The confetti animation is a pure `<canvas>` implementation with no dependencies.
- `Modal` is fully responsive: a centred dialog on desktop, a bottom sheet on mobile — same component, different style based on the `useIsDesktop` hook. `ConfirmDialog` wraps `Modal` to provide reusable themed confirmation flows (sign-out, etc.).
- Day number is calculated by normalising both the start date and the target date to noon before diffing — so the number is always correct regardless of what time of day you open the app.
- Habit deletion uses a **two-tap inline confirm** (first tap expands a red warning panel inside the modal; second tap confirms), followed by a **5-second undo toast**. The Supabase delete is deferred until the undo window closes — clicking Undo simply cancels the pending timer.
- The `lib/debounce.ts` utility is a generic TypeScript debounce that preserves the full argument type signature, used by both `SettingsContext` and `HabitContext`.
- `lib/auth/migration.ts` runs once per user account — it checks the `habits` table row count first; if data already exists in the database it skips migration and just clears stale localStorage keys.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| [Vite](https://vitejs.dev) | 6 | Build tool and dev server |
| [React](https://react.dev) | 18 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [React Router DOM](https://reactrouter.com) | 6 | Client-side routing |
| [Supabase](https://supabase.com) | 2.108 | Google OAuth auth, Postgres database, Realtime subscriptions, Row Level Security |
| [Lucide React](https://lucide.dev) | 0.525 | Icon library |
| [Caveat](https://fonts.google.com/specimen/Caveat) | — | Handwritten display font (Google Fonts) |
| [Inter](https://rsms.me/inter/) | — | Clean body font (Google Fonts) |

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
        │   ├── AppSkeleton.tsx       Loading spinner shown while DB data loads
        │   ├── AuthGate.tsx          Blocks render until auth + data are ready
        │   ├── CompletionRing.tsx    Circular SVG progress indicator
        │   ├── ConfirmDialog.tsx     Reusable themed confirmation modal
        │   ├── Confetti.tsx          Canvas confetti animation
        │   ├── Modal.tsx             Dialog (desktop) / bottom sheet (mobile)
        │   ├── MonthHeatmap.tsx      15-week activity heatmap
        │   ├── TabBar.tsx            Mobile bottom nav + collapsible sidebar
        │   └── WeeklyChart.tsx       7-day completion bar chart
        ├── constants/
        │   └── themes.ts             Five complete colour palettes
        ├── context/
        │   ├── AuthContext.tsx        Session · user · signIn · signOut
        │   ├── HabitContext.tsx       Habits · entries · journals · Supabase sync · Realtime
        │   ├── SettingsContext.tsx    Theme · font · profile · Supabase profiles sync
        │   └── ToastContext.tsx       Non-blocking toasts with optional duration override
        ├── hooks/
        │   ├── useColors.ts           Active theme colour tokens
        │   ├── useFont.ts             Active font family + size scale
        │   └── useIsDesktop.ts        Responsive breakpoint hooks (768 / 1024 px)
        ├── lib/
        │   ├── debounce.ts            Generic typed debounce utility
        │   ├── supabase.ts            Typed Supabase client singleton
        │   ├── auth/
        │   │   └── migration.ts       One-time localStorage → Supabase migration
        │   └── db/
        │       ├── mappers.ts         camelCase ↔ snake_case row converters
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
        ├── App.tsx                    Root layout + routing + provider order
        ├── main.tsx                   Entry point
        └── vite-env.d.ts              Vite environment type declarations
```

---

<div align="center">
  <p>
    Built with care &nbsp;·&nbsp; Habit Ink
  </p>
  <p>
    <sub>Habit Ink — v2.0</sub>
  </p>
</div>
