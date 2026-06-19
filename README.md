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
    <img src="https://img.shields.io/badge/version-4.1-8b5cf6?style=flat-square" alt="Version 4.1" />
  </p>
</div>

---

Most habit trackers are too gamified. Most journals are too freeform. **Habit Ink** is both — a structured daily tracker and a personal journal living in the same interface, built with a design philosophy that respects your attention and grows quieter the more you use it. And now with **Groups**: track habits and run challenges with friends in real time.

---

## Table of Contents

- [Features at a Glance](#features-at-a-glance)
- [Screens](#screens)
  - [Landing Page](#landing-page)
  - [Blog](#blog)
  - [Today — Daily Tracker](#today--daily-tracker)
  - [Habits](#habits)
  - [Calendar](#calendar)
  - [Progress](#progress)
  - [Journal](#journal)
  - [Profile](#profile)
  - [Settings](#settings)
  - [Groups](#groups)
  - [Group Detail](#group-detail)
  - [Join Group](#join-group)
  - [Privacy Policy](#privacy-policy)
  - [Terms of Service](#terms-of-service)
  - [404 — Not Found](#404--not-found)
- [Themes](#themes)
- [Responsive Design](#responsive-design)
- [Authentication](#authentication)
- [Data Storage](#data-storage)
- [SEO & PWA](#seo--pwa)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Features at a Glance

| | Feature | Detail |
|---|---|---|
| 🔐 | **Google Sign-In** | One-tap OAuth via Supabase from the landing page — session persists across tabs and reloads |
| ☁️ | **Cloud sync** | All habits, journals, groups, and settings saved to Supabase — accessible on any device |
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
| 📡 | **Offline banner** | Fixed top bar appears automatically when network is lost |
| 🛡️ | **Error boundary** | Full-page and compact per-screen error recovery UI |
| 📝 | **SEO Blog** | Six long-form articles targeting habit-tracking keywords, with per-post schema, canonical, and OG tags |
| 👥 | **Groups** | Create or join groups (up to 10 created per user) — invite friends via a shareable link and track habits together |
| 🏆 | **Group Challenges** | Up to 15 concurrent challenges per group — with join/check-in, per-member streaks, completion rates, and an emoji-reactions feed |
| 💬 | **Group Chat** | Realtime chat (up to 2,000 chars per message, 100-message sliding window) with optimistic send, date separators, keyword search, emoji reactions with reactor details, and a full categorised emoji picker |
| 💪 | **Nudges** | Send a motivational nudge to any group member who hasn't checked in today — they receive a live toast notification (suppressed if the group is muted) |
| 🎉 | **Cheers** | Tap a completed member's pulse avatar to send a 🔥 reaction to their latest feed entry — positive reinforcement, one tap |
| 🔍 | **Chat Search** | Filter the 100-message chat history by keyword inline — results narrow live, cleared automatically when leaving the Chat tab |
| 🎓 | **Onboarding** | Three-step first-login wizard: pick habit categories, choose from 18 curated habit templates across 6 categories, then pick a theme — all steps skippable |
| 📥 | **Data Export** | Download all habits and journal entries as a single UTF-8 CSV (Excel-ready, BOM-prefixed) from Settings — one row per day from app start to today |

---

## Screens

### Landing Page

The first thing unauthenticated visitors see — a fully scrollable marketing page with nine distinct sections and a Google sign-in modal.

**Hero** — full-viewport opening with a dot-grid background and a subtle paper-grain SVG texture. An animated three-line headline ("Track habits. / Journal daily. / Free, forever." — each word slides in sequentially with a gold SVG underline drawing on the final line), a floating 3D ink-pen SVG illustration, a live 7-day streak widget animated on load, and three inline trust signals (Lock icon · "100% private" / ShieldCheck icon · "No ads, ever" / CreditCard icon · "No credit card") sourced from Lucide React. A primary **"Start your first day →"** CTA sits below. A sticky header fades in after scrolling 75% of the viewport and mirrors the CTA.

**How It Works** — eyebrow label + keyword H2 ("Three steps to build better habits.") followed by three numbered steps: sign in with Google (🔑), set intentions and check habits (📝), and keep your streak alive (🔥), connected by a dashed line on desktop.

**Three Truths** — H2 heading "Daily habit tracker. Built-in journal. Real progress." introduces three hover-reveal cards for the app's core pillars (Track · Journal · Progress) with colour-invert animations on hover.

**Screens in Focus** — three alternating scroll-reveal rows, each pairing a headline and description with a pure-CSS mockup of the corresponding app screen (Today's habit table, the June 2026 calendar heatmap, the weekly progress chart).

**Better Together (Groups)** — full-width navy section (`#2B3A8C` background) with a dot-grid overlay and a central gold glow. Left side: a pure-CSS group mockup card showing a "🏋️ Fitness Club" header with an unread badge, a Today's Pulse row (4 member avatars, 3 green-ringed and 1 pending), a "🏆 7-Day Plank" challenge card with a 75% progress bar, and a two-message mini chat preview. Right side: eyebrow "BETTER TOGETHER" in gold, H2 "Track habits with your crew.", a two-column grid of six feature bullets (create groups, challenges, realtime chat, nudges & cheers, daily pulse, leaderboards), and a gold "✦ Start a group →" CTA button with hover lift/glow. Both sides animate in from opposite sides on scroll. The section uses `id="groups"` so the footer nav can deep-link to it.

**Streak Proof** — 30 animated dots fill in one by one (29 green, 1 missed) under the H2 "Build your longest habit streak yet." Copy reads: "29 out of 30 days. That's not failure. That's dedication."

**Quote Moment** — a full-width pull-quote with a giant decorative `"` backdrop, attributed to Aristotle: "We are what we repeatedly do. Excellence, then, is not an act but a habit."

**FAQ** — six question-and-answer cards in a two-column grid (single column on mobile), scroll-animated. Questions cover pricing, sign-up, combined habit+journal use, streak tracking, device support, and privacy. Content mirrors the FAQPage JSON-LD schema exactly so Google can serve rich results.

**Dark Close** — a high-contrast closing section (`#13183A` background, torn paper clip-path edge) with H2 "Start your habit streak today.", a ghost InkPen3D illustration, and the final gold CTA button. Copy line: "It takes 66 days to build a habit. Habit Ink will be there for every single one."

**Google Sign-In Modal** — clicking any CTA opens a frosted-glass centred modal with a spring entrance animation. The modal displays a diagonal fountain pen illustration at the top, a **"Continue with Google"** button (real 4-colour Google G SVG), three trust checkpoints (100% private · No ads · Free forever), and closes on Escape or backdrop click.

After completing Google OAuth the user lands directly on the Today screen. On first login, any data previously stored in browser localStorage is silently migrated to Supabase.

The footer navigation includes: Home · How It Works · Features · Groups · FAQ · Blog · Privacy · Terms.

---

### Blog

A fully public, SEO-optimised blog at `/blog` and `/blog/:slug` — no sign-in required. Built without any external markdown library; content is stored as TypeScript files and rendered by a zero-dependency `MarkdownRenderer` component.

**Blog List (`/blog`)** — sticky branded header (wordmark + "Start Free →" CTA), a hero section ("The Habit Ink Journal"), category filter pills (All / Habit Science / Challenges / Journaling / Morning Routines / Reviews), a featured post card (navy background, gold accents), and a post grid below. A closing navy CTA section invites readers to start tracking. Injects a `Blog` JSON-LD schema and updates the canonical URL on mount.

**Blog Post (`/blog/:slug`)** — breadcrumb (`Home › Blog › [Title]`), article header (category pill, H1, author, date, reading time), full article body rendered by `MarkdownRenderer` (supports h2/h3, bold, italic `_text_`, links, blockquotes with gold left border, unordered and ordered lists, horizontal rules), a mid-article CTA block ("Put this into practice with Habit Ink"), tag pills, a "Continue reading" section with up to 3 related posts, and a "← All articles" footer link.

On mount each post injects: updated `<title>`, `<meta name="description">`, canonical URL, `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, a `BlogPosting` JSON-LD schema, and a `BreadcrumbList` JSON-LD schema. All are restored on unmount.

**Six published articles:**

| Slug | Target Keyword | Est. Volume |
|---|---|---|
| `how-to-build-a-habit` | "how to build a habit" | 40,500 / mo |
| `66-day-habit-challenge` | "66 day habit challenge" | 2,200 / mo |
| `habit-journal-vs-tracker` | "habit journal app" | 2,400 / mo |
| `habit-streak-psychology` | "streak habit tracker" | 1,900 / mo |
| `morning-routine-habits` | "morning routine tracker" | 3,100 / mo |
| `free-habit-tracker-2026` | "free habit tracker" | 18,000 / mo |

All articles are 800–1,200 words, cite real behavioural research, and naturally include target keywords without stuffing.

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

Every day from when you started the app appears on a **vertical spine**, newest at the top, grouped by month with a divider header. Every day shows as a full entry card — today's card is highlighted and always open; every other card is collapsed by default but a single tap reveals all four sections: **Intention**, **Notes**, **Wins**, and **Challenges**. Wake-up time and the day number appear in each card header. Empty days show an "empty" label and a "Nothing written yet" message when expanded, keeping the timeline complete without hiding any day.

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

**Theme** · **Font Style** · **Text Size** · **Daily Quote** · **Export Data** · **Account** · **Reset**

Five themes, two fonts, three text sizes, and the option to pin your own quote to the Today screen. Every change is instant, global, and synced to the cloud.

The **Account** section shows your Google profile photo, full name, and email address. Clicking **Sign Out** opens a themed confirmation dialog (bottom sheet on mobile, centered modal on desktop) showing your account details before logging you out cleanly.

**Export Data** — a **"Download All Data (CSV)"** button in the Account section exports every habit and journal entry as a single UTF-8 CSV file (BOM-prefixed so Excel handles emojis correctly). Each row is one calendar day from your app start date to today; columns are: Date, Day #, Wake-up, Intention, Notes, Wins, Challenges, and one column per habit (showing the actual value logged, or "done" / "missed" / blank). The button transitions through idle → "Preparing export…" → "✓ Export downloaded" states, with a success toast on completion.

**Reset to Defaults** uses an **inline confirmation panel** that expands in place — no overlay, no browser dialog. It clearly states that only appearance settings (theme, font, quote) will be reset; your habit data and journal entries are untouched. Pressing nothing for 4 seconds auto-cancels the confirmation.

---

### Groups

Your social accountability layer, at `/groups`.

The Groups screen lists every group you belong to. Each card shows the group emoji, name, colour accent stripe, member count, active challenge count, the group motto (if set), and a row of coloured dots showing today's completion status across members — green for done, muted for not yet.

**Creating a group** — tap "New Group" to open a modal. Choose an emoji icon from 24 options, pick one of 8 accent colours, enter a name (up to 40 characters), and create. The group is immediately added to your list and an invite link modal opens automatically so you can share it right away.

**Limits** — each user can create up to 10 groups. Groups you join (but didn't create) don't count toward this limit.

**Invite link** — every group gets a unique 12-character alphanumeric invite code. The shareable URL (`/join/:code`) can be copied to clipboard from the invite modal and sent to anyone.

**Unread badge** — groups with unread chat messages show a red badge on the card and a count badge on the Groups tab icon in the navigation.

---

### Group Detail

The heart of the group experience, at `/groups/:id`. Five tabs let members, challenges, chat, and settings all live in the same view.

#### Feed tab

The social activity stream for the group.

**Today's Pulse** — a horizontal scrollable row of avatar circles, one per member. A green ring means they've completed today's habit check; a count badge shows how many challenge check-ins they've logged. Tapping any avatar either shows your own profile details or opens a **Nudge** confirmation for teammates who haven't checked in yet.

**Nudge** — a one-tap motivational push. A confirmation dialog (with the member's name and a "Send Nudge" button) prevents accidental sends. The recipient receives a live toast: `💪 [Your Name] is cheering you on!` (suppressed if they have the group muted). The nudge button is disabled while the send is in flight to prevent double-nudges.

**Cheer** — tapping the pulse avatar of a member who has already completed today opens a **Cheer** confirmation dialog instead of the nudge dialog. Confirming adds a 🔥 reaction to their most recent feed entry and shows a success toast — one-tap positive reinforcement for teammates who are on track.

**Activity feed** — a paginated timeline of challenge check-ins across the group. Each feed card shows the member's avatar, name, challenge emoji and name, check-in status, actual value logged (if any), in-challenge streak, and the date. Milestone check-ins are visually highlighted. Members can react with 🔥 ❤️ 💪 — reactions are tallied and toggled. A 👁 button beside the reaction chips fetches and displays the names of everyone who reacted. Scrolling down to the end reveals a **"Load more"** button (shows a spinner while the next page fetches) to page through older entries.

**Weekly Digest** — always shown, a pinned card at the top of the feed displays the last completed week's (Mon–Sun) group stats: total check-ins, top performer, most active member, and current group streak — regardless of what day of the week you open the app.

#### Challenges tab

Run shared challenges inside the group. Up to **15 concurrent challenges** per group.

Each challenge card shows its emoji, name, colour accent, date range, schedule, a `joined / total` participant count, how many members completed it today, and a progress bar through the challenge's total day span. Tapping a card expands it to show the full participant leaderboard — each participant's avatar, display name, today's completion status, in-challenge streak, overall completion rate, and actual value logged today (for number/decimal challenges).

**Joining and checking in** — non-joined challenges show a "Join" button. Joined challenges show "Log Today" (or a green checkmark if already logged). The log modal matches the habit types: Yes/No, Number, Decimal, Time, or Custom — with amount and unit fields for numeric types. Checking in triggers a live feed update visible to all group members.

**Creating / editing challenges** — admins (or all members, depending on the group's `challengeCreator` setting) can create challenges with: emoji, colour, name (up to 60 chars), habit type, target (amount up to 12 chars + unit up to 24 chars, or text target up to 60 chars), target direction (`≥ target` for steps/distance, `≤ target` for calories/screen time), schedule (Daily / Weekdays / Weekends / Custom days), and a date range with a visual day-count pill. Existing challenges can be edited; the creator or group admin can delete them (with a confirm dialog).

**Completed challenges** collapse into a "🏆 Completed Challenges" section. Expanding it loads the full participant list for every completed challenge — showing each member's avatar, completion rate, and top performer — so past efforts remain visible and celebrated.

#### Members tab

The full member roster with roles and actions.

Each member row shows their avatar emoji, display name, role badge (Admin / Member), join date, and timezone (if set). Admins see two action buttons next to each non-admin member: a **Promote to Admin** button (flag icon, opens a confirmation dialog that explains the new permissions) and a **Remove** button (guarded by a confirmation dialog). Promoted members immediately see the Admin badge and gain access to all admin controls.

The **Weekly Leaderboard** within the Members tab shows all members ranked by this week's completion rate — gold, silver, bronze medals for top 3 and `#N` rank beyond. The current user's row is highlighted. Groups with more than five members show the top 5 by default with a "Show all N members" toggle.

Tapping any member row opens an **enhanced profile modal** showing their avatar, display name, join date, streak, 30-day completion rate, this-week rate, and their About bio (if set). Challenge-by-challenge heatmaps appear below for shared challenges.

The current user's own row shows a **Mute** toggle for silencing group notifications (including nudge toasts), and a **Leave Group** option (guarded by a confirmation dialog). Group creators cannot leave their own group without deleting it first.

#### Chat tab

A realtime group chat channel, up to **2,000 characters** per message, capped at **100 messages** per group (a sliding window — the oldest message is deleted automatically when the 101st arrives, keeping storage lean).

Messages are displayed in a scrollable list, newest at the bottom, with auto-scroll to the latest on load and on new arrivals. **Date separators** ("Today", "Yesterday", or a short date) appear between messages from different days, matching standard chat apps. Each message shows the sender's avatar emoji, display name, timestamp, and message content. Own messages align right and show a **delete** button (×) on hover, guarded by a confirmation dialog.

**Optimistic send** — the message appears in the chat instantly before the Supabase write completes. If the write fails, the message is silently removed and the input is restored — no lost text. The send button is disabled while the send is in flight to prevent double-sends.

**Emoji reactions** — any message can receive reactions (🔥 ❤️ 😂 👍 💯). Tapping an existing reaction toggles your vote; tapping the reaction picker opens a five-emoji tray. A 👁 button beside the reaction chips fetches and displays the names of everyone who reacted.

**Search** — a magnifying-glass button in the composer row toggles a search bar above the message list. Typing filters the 100-message history live. A "No messages matching…" empty state appears when no results match. The search bar is cleared automatically when switching away from the Chat tab.

**Composer** — an auto-resizing textarea (expands up to 120 px as you type, resets to one line after send), a search toggle button, an emoji picker button, and a send button. The **full emoji picker** is a categorised keyboard (Smileys & People, Animals, Food, Activities, Travel, Objects, Symbols) with a keyword search field. Press Enter to send; Shift+Enter for a new line.

Entering the Chat tab marks the group as seen, clearing the unread badge.

**Realtime** — new messages append incrementally (no full reload); deletes remove the specific message from state; reaction updates are scoped to only the affected message — all via Supabase Realtime with no manual refresh needed.

#### Settings tab

Admin-only configuration panel (non-admins see a read-only view of group info).

Editable fields: **Name** (40 chars), **Emoji** (24 presets), **Colour** (8 options), **Description** (120 chars, with live counter), **Motto** (100 chars, with live counter), **Motto By** (40 chars, with live counter), **Welcome Message** (200 chars, with live counter), **Member Limit** (integer, 2–100, validated on save), and **Challenge Creator** (Any Member / Admin Only).

**Invite link** — shows the current invite URL with a copy button. A "Regenerate" button issues a new code (invalidating all previously shared links), guarded by a confirmation dialog.

**Danger zone** — admins can permanently **Delete Group** (removes all members, challenges, and messages). Non-admin members see a **Leave Group** option. Both are guarded by themed confirmation dialogs.

---

### Join Group

The public invite-link landing page at `/join/:code`. Works for both logged-in and logged-out users, and does not require `AuthGate`.

The page resolves the invite code from the URL and transitions through these states:

| State | What the user sees |
|---|---|
| `loading` | Spinner card while the code is looked up |
| `not_found` | Error card — "This invite link is invalid or has expired." |
| `rate_limited` | Error card — user exceeded 10 join attempts in the last hour |
| `unauthenticated` | Group preview is hidden; "Sign in with Google" button redirects back to this URL after auth |
| `ready_to_join` | Full group card (emoji, name, description, member count / limit); "Join Group" button; full indicator if the group is at capacity |
| `already_member` | Green "You're already in this group" banner; "Open Group" button navigates directly to the group detail |

On successful join, the group's **welcome message** (if set) is shown as a toast, and the user is navigated to the group detail screen.

**Rate limiting** — the `invite_code_attempts` table records every lookup per user. More than 10 attempts within a rolling 60-minute window blocks further lookups until the hour resets. Old attempt rows are pruned on each new request.

---

### Privacy Policy

A brand-styled public page at `/privacy` — accessible without signing in, linked from the landing page footer.

Nine sections cover exactly what is collected (Google profile basics + in-app content you write), how it is stored (Supabase Postgres with Row Level Security), third-party services (Google OAuth and Supabase only — no advertising trackers, no analytics), user rights (view, export, delete), cookies (session storage only), and contact details for data requests.

The page uses the same navy / gold / cream palette and Caveat headings as the rest of the app. A sticky header with a back-to-home link and a footer nav (Home · Blog · Privacy Policy · Terms of Service) keep it connected to the site. Four summary cards at the top (100% Private · No Ads Ever · Free Forever · You're in Control) give returning users a quick-scan overview without reading the full policy.

---

### Terms of Service

A brand-styled public page at `/terms` — accessible without signing in, linked from the landing page and privacy page footers.

Ten sections cover acceptance of terms, account responsibilities (Google sign-in required, 13+ age minimum), acceptable use (no abuse of Groups/Chat, no scraping), what the service provides, the free-forever policy (no paid tiers, no data monetisation), group and social feature rules, intellectual property, disclaimers and liability limits, termination / account deletion, and contact details.

The page shares the same navy / gold / cream palette and Caveat headings as Privacy Policy. A sticky header with a back-to-home link and a footer nav (Home · Blog · Privacy Policy · Terms of Service) keep it connected to the site. Four summary cards at the top (🆓 Free Forever · 📝 Your Content · 🤝 Be Respectful · ✉️ Easy to Leave) give returning users a quick-scan overview. A closing navy CTA block with a mailto link invites users to reach out with questions.

On mount the page updates `<title>` to "Terms of Service — Habit Ink", sets the canonical URL to `/terms`, and injects a `BreadcrumbList` JSON-LD schema (Home › Terms of Service) — all restored on unmount.

---

### 404 — Not Found

A full-page, theme-aware error screen shown to authenticated users who navigate to any URL that doesn't match a known route.

The page renders outside `AppLayout` — no sidebar, no tab bar — so it fills the entire viewport. It uses the active theme's colour tokens and font settings, adapting to all five themes automatically.

Design: large `404` in the heading font and primary colour; a habit-row mockup showing "📄 This page · ✗ Missed" with a red left accent stripe (identical to the real habit cards); seven animated streak dots (6 filled green, 1 broken red) that spring in one by one; copy "You wandered off the path. / This page doesn't exist — but your habits do."; a themed "↩ Back to Today" button; and a subtle dot-grid background. The whole composition fades and slides up on mount.

**Routing behaviour:**
- **Not logged in + unknown URL** → `AuthGate` immediately redirects to `/` (landing page). The 404 screen is never shown.
- **Logged in + unknown URL** → `AuthGate` intercepts before `AppLayout` mounts and renders `NotFoundScreen` directly as a full-page view.
- **Logged in + known URL** → normal app routing.

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
Six-tab bottom navigation bar (Today · Habits · Calendar · Progress · Journal · Groups). Touch-friendly tap targets throughout. Modals slide up as bottom sheets with a visible drag handle. Settings fills the full screen. The 15-week heatmap scrolls horizontally so cells stay legible. Stat grids collapse to 2 × 2.

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
- Signing out clears the session, returns to the Landing Page, and resets all in-memory state

**First-login migration** — if the browser has legacy localStorage data from before the Supabase backend was added, it is silently migrated to the database on first sign-in and the local keys are cleared. Migration is safe: if the database already has data for the user, the local keys are simply cleared and no overwrite happens.

**Public routes** — `/privacy`, `/terms`, `/blog`, `/blog/:slug`, and `/join/:code` render entirely outside `AuthGate`. They have no Supabase queries and work without a session. The `/join/:code` page prompts unauthenticated users to sign in with Google, then redirects them back to the same invite URL after auth.

---

## Data Storage

All application data is stored in **Supabase Postgres** and synced via **Supabase Realtime**. Authentication sessions are managed by Supabase Auth (stored in browser memory under `sb-*` keys).

### Database tables

#### Personal data

| Table | What's stored |
|---|---|
| `profiles` | Theme, font, text size, custom quote, display name, avatar emoji, about text, weight, height, habit order, sidebar state, app start date |
| `habits` | Name, type, target, schedule, custom days, emoji, colour, archived state |
| `habit_entries` | Status (done / missed / pending) and actual value per habit per day |
| `journals` | Wake-up time, intention, notes, wins, challenges per day |

#### Groups

| Table | What's stored |
|---|---|
| `groups` | Name, emoji, colour, description, motto, motto author, welcome message, member limit (2–100), challenge creator setting, invite code, created-by user |
| `group_members` | User ID, group ID, role (admin / member), joined-at, last-seen-at, muted flag |
| `group_challenges` | Name, emoji, colour, habit type, target (amount + unit or text), target direction (gte / lte), schedule, custom days, start date, end date, created-by user |
| `group_challenge_members` | Who has joined each challenge (group ID, challenge ID, user ID, joined-at) |
| `group_challenge_checkins` | Per-user per-date check-in records for each challenge (status, actual value) |
| `group_reactions` | Emoji reactions on feed entries (entry ID, user ID, emoji) |
| `group_messages` | Chat messages (content capped at 2,000 chars by a DB check constraint, group ID, user ID, created-at) |
| `group_message_reactions` | Emoji reactions on chat messages (message ID, user ID, emoji) |
| `group_nudges` | Peer nudge records (group ID, from user, to user, seen flag, created-at) |
| `invite_code_attempts` | Rate-limit log for invite link lookups (user ID, attempted-at); pruned automatically on each new request |

All tables use **Row Level Security (RLS)** — users can only read and write their own rows (or rows for groups they are a member of). A Postgres trigger creates a `profiles` row automatically when a new user signs up via Google.

### Sync strategy

| Operation | Strategy |
|---|---|
| Habit status / actual value | Immediate optimistic update → background upsert |
| Add / update / archive habit | Immediate optimistic update → background insert / update |
| Delete habit | Immediate UI removal → 5-second undo window → then DB delete |
| Journal fields | Immediate optimistic update → **800 ms debounce** per date before upsert |
| Settings (toggles, emoji, order) | Immediate update → background write |
| Settings (text inputs) | Immediate optimistic update → **800 ms debounce** before write |
| Group / challenge / member mutations | Immediate Supabase write → realtime channel propagates to all other members |
| Chat messages | Optimistic local append → Supabase insert → realtime INSERT confirms to all members; on failure: temp message removed + input restored |
| Initial load | Migration check → parallel fetch of all four personal tables → render |

### Realtime

Supabase Realtime subscriptions keep every open tab or window in sync with no manual refresh:

| Channel | Tables watched | Notes |
|---|---|---|
| Personal data | `habits`, `habit_entries`, `journals` | One channel, shared across all personal tables |
| Group sync (per group) | `groups`, `group_members`, `group_challenges`, `group_challenge_members`, `group_challenge_checkins`, `group_nudges` | Scoped to current group via `filter: group_id=eq.<id>` |
| Group chat (per group) | `group_messages` (INSERT + DELETE), `group_message_reactions` (all events) | Separate channel; messages append incrementally; reactions update the specific message in-place |

Both group channels are scoped to the current group ID and are torn down when leaving the group detail screen.

---

## SEO & PWA

Habit Ink is fully optimised for search engines and installable as a Progressive Web App.

### Search Engine Optimisation

| Signal | Implementation |
|---|---|
| Title & meta description | Keyword-rich, ≤ 60 / 155 characters, unique per page; blog posts update `<title>` and `<meta name="description">` dynamically on mount |
| Canonical URL | `<link rel="canonical">` updated per page — `/privacy`, `/blog`, and each `/blog/:slug` update and restore the canonical on mount/unmount |
| Robots directive | `index, follow, max-image-preview:large, max-snippet:-1` |
| Sitemap | `/sitemap.xml` — lists `/` (monthly, priority 1.0), `/blog` (weekly, priority 0.9), all 6 blog post URLs (monthly, priority 0.8), `/privacy` (yearly, priority 0.3), and `/terms` (yearly, priority 0.3) |
| robots.txt | Allows `/`, `/blog`, `/blog/`; disallows all authenticated app routes |
| Open Graph | Full `og:title`, `og:description`, `og:image` (1200×630 branded PNG), `og:url`, `og:type`, `og:locale`; blog posts update og:title, og:description, and og:url dynamically |
| Twitter / X Card | `summary_large_image` card; blog posts update `twitter:title` and `twitter:description` dynamically |
| JSON-LD structured data — homepage | `@graph` with four schemas: `WebSite` (with `SearchAction` / sitelinks search box), `SoftwareApplication` (`featureList`, `offers`, `operatingSystem: "Web Browser"`), `Organization` (with `sameAs` GitHub link), and `FAQPage` (six Q&As matching the visible FAQ section exactly) |
| JSON-LD structured data — `/privacy` | `BreadcrumbList` (Home › Privacy Policy) injected dynamically, removed on unmount |
| JSON-LD structured data — `/terms` | `BreadcrumbList` (Home › Terms of Service) injected dynamically, removed on unmount |
| JSON-LD structured data — `/blog` | `Blog` schema injected dynamically, removed on unmount |
| JSON-LD structured data — `/blog/:slug` | `BlogPosting` schema (headline, description, datePublished, author, publisher, keywords, articleSection) + `BreadcrumbList` (Home › Blog › [Title]) injected dynamically, removed on unmount |
| Heading hierarchy | H1 → H2 → H3 with no gaps; section eyebrows are `<p>` elements — each section has a keyword-rich `<h2>` below |
| Semantic HTML | `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>` landmarks throughout; blog posts use `<article>` and `<ol>` breadcrumb list |
| ARIA | `aria-label`, `aria-hidden`, `role="dialog"`, `role="img"`, `aria-current="page"` on breadcrumb throughout |
| Internal linking | Landing page footer: Home · How It Works · Features · Groups · FAQ · Blog · Privacy; Privacy and Blog pages link back to home; blog posts link to related posts and back to blog list |
| Referrer policy | `strict-origin-when-cross-origin` |
| Color scheme | `<meta name="color-scheme" content="light">` |

### PWA

| Feature | Detail |
|---|---|
| Web App Manifest | `name`, `short_name`, `description`, `categories`, `orientation`, `theme_color`, `background_color` |
| Icons | `favicon.png` (192×192, `any` + `maskable`), `logo.png` (512×512, `any` + `maskable`) — each purpose as a separate icon entry |
| Screenshot | `og-image.png` listed as a `wide` form-factor screenshot in the manifest |
| Apple | `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-touch-icon` |
| Fonts | Google Fonts loaded non-blocking via `media="print"` + `onload` trick with `<noscript>` fallback — zero render-blocking font requests |

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

**Six contexts power the whole app:**

**`AuthContext`** — authentication layer. Holds the Supabase session and the current user object. Exposes `signIn()` (triggers Google OAuth) and `signOut()`. `AuthGate` sits inside the outer `<Routes>` and handles six states: (1) auth loading → `AppSkeleton`; (2) no session at `/` → `LandingScreen`; (3) no session at any other path → `<Navigate to="/" replace />`; (4) session present but data not yet loaded → `AppSkeleton`; (5) session present + unknown route → `NotFoundScreen` rendered full-page without sidebar; (6) session present + known route → renders children (`AppLayout`). A `KNOWN_ROUTES` set (`/`, `/habits`, `/calendar`, `/progress`, `/journal`, `/profile`, `/settings`, `/groups` and all sub-paths) drives case 5.

**`HabitContext`** — core personal data layer. All habits, all entries, all journal records. On login: runs the optional one-time localStorage migration, then fetches all four tables in parallel. Mutations are optimistic — state updates instantly and a background Supabase write follows. Journal saves are debounced per date (800 ms) to batch rapid keystrokes into a single write. Supabase Realtime subscriptions on all three personal tables keep every open tab in sync. Exposes streak calculations, completion rates, date-aware schedule checks, and journal helpers.

**`SettingsContext`** — appearance and profile. Theme, font style, font size, custom quote, user name, avatar emoji, bio, body metrics, habit order, sidebar collapse state. Reads from the `profiles` table on login. Toggles and button taps write immediately; text inputs are debounced 800 ms. Also owns `habitOrder` and `sidebarCollapsed`, previously stored directly in localStorage by `TodayScreen` and `TabBar`.

**`ToastContext`** — non-blocking notification layer. Self-dismissing toasts used for milestone alerts, setting confirmations, undo-delete feedback, nudge notifications, and error reporting. Supports an optional `duration` override — the undo delete toast uses 5 000 ms; standard toasts auto-dismiss at 3 800 ms.

**`GroupContext`** — social data layer. All group CRUD (create, update settings, delete, regenerate invite code), membership management (join by code, leave, remove member, promote to admin, mute), challenge CRUD (create, update, delete), challenge participation (join, check in), feed pagination (`fetchFeedPage`, 20 per page), realtime chat (`fetchMessages`, `sendMessage`, `deleteMessage`), chat sliding-window cap (`trimChatMessages` — fires after every send, deletes the oldest message when count exceeds 100), emoji reactions on feed entries and messages, peer nudges (`sendNudge`, `markNudgeSeen`), `fetchPendingNudges` (shown as toasts on load), `fetchTodaysPulse`, `computeGroupStreak`, `computeGroupTrophies`, and `computeWeeklyDigest`. `refetchGroups` uses 6 batched queries regardless of group count — member IDs, challenges, and messages are fetched with `.in('group_id', groupIds)` and grouped client-side, eliminating N+1 query patterns. `computeWeeklyDigest` always computes the previous Mon–Sun week, no Monday-only guard. Mounted per-route — wrapped around `/groups/*` and `/join/:code` in `App.tsx`. Constants: `MAX_MESSAGE_LENGTH = 2000`, `MAX_CHAT_MESSAGES = 100`, `MAX_CHALLENGES_PER_GROUP = 15`, `MAX_GROUPS_CREATED_PER_USER = 10`, page size 20.

**`GroupUnreadContext`** — lightweight global unread counter. A single `totalUnread` integer updated by `GroupContext` whenever group lists are (re)fetched. Used by `TabBar` and `Sidebar` to render the red badge on the Groups navigation item without requiring the full `GroupContext` to be mounted at the top level.

**Routing** uses React Router DOM v6 with three `<Routes>` trees. The outermost tree (in `App.tsx`) registers five fully public routes before the wildcard: `/privacy` → `PrivacyScreen`, `/terms` → `TermsScreen`, `/blog` → `BlogListScreen`, `/blog/:slug` → `BlogPostScreen`, and `/join/:code` → `GroupProvider` wrapping `JoinGroupScreen`. All five render outside `AuthGate` and the app-level providers — no auth check, no personal Supabase queries. The wildcard `*` falls through to `AuthGate → AppLayout`. Inside `AppLayout` there are two further `<Routes>` trees — one for mobile (bottom-bar navigation) and one for desktop (sidebar navigation). Both include a nested route `<Route path="/groups" element={<GroupProvider><Outlet /></GroupProvider>}>` with index (`GroupsScreen`) and `:id` (`GroupDetailScreen`) children. The Today screen accepts an optional `?date=YYYY-MM-DD` query param so journal entries can deep-link to a specific day.

**Onboarding flow** — `OnboardingModal` is a three-step modal rendered by `TodayScreen` on first load. It fires when `dataLoaded` is true, the `habitink_onboarding_done` localStorage key is absent, and the user has zero active (non-archived) habits — i.e., a brand-new account. Step 1 lets users pick any of 6 focus categories (Health, Fitness, Learning, Mindfulness, Productivity, Sleep). Step 2 shows 18 curated habit templates filtered to the selected categories (or all 18 if none are chosen); each template includes emoji, name, tracking type, target, and schedule. Step 3 shows the five themes as swatch + label cards. The modal is skippable at any step. On finish, selected habits are added via `addHabit` and any theme change is applied via `setTheme`; the key is then written to localStorage so the modal never appears again.

**Blog content system** — six blog posts are stored as TypeScript files under `src/blog/posts/`. Each exports a `BlogPost` object (slug, title, description, date, readingTime, category, tags, excerpt, author, content, keywords). `src/blog/index.ts` exports `ALL_POSTS` (sorted newest-first), `getPostBySlug()`, `getRelatedPosts()`, and `ALL_CATEGORIES`. Content is written in a lightweight markdown dialect and rendered by `MarkdownRenderer` — a zero-dependency component that handles h1/h2/h3, `**bold**`, `_italic_`, `[link](url)`, `> blockquote`, unordered lists, ordered lists, and `---` horizontal rules entirely in React without `dangerouslySetInnerHTML`.

**Notable internals:**
- The 15-week heatmap uses a `ResizeObserver` with `useLayoutEffect` to compute cell size before the first paint — no layout flash.
- Drag-to-reorder on the Today screen uses native HTML5 drag events (desktop only). Touch devices see no grip handle and no `draggable` attribute, preventing scroll interference. The resulting order is saved to `profiles.habit_order` in the database.
- The confetti animation is a pure `<canvas>` implementation with no dependencies.
- `Modal` is fully responsive: a centred dialog on desktop, a bottom sheet on mobile — same component, different style based on the `useIsDesktop` hook. `ConfirmDialog` wraps `Modal` to provide reusable themed confirmation flows (sign-out, group delete, nudge, etc.) with an optional `disabled` prop for in-flight async actions.
- Day number is calculated by normalising both the start date and the target date to noon before diffing — so the number is always correct regardless of what time of day you open the app.
- Habit deletion uses a **two-tap inline confirm** (first tap expands a red warning panel inside the modal; second tap confirms), followed by a **5-second undo toast**. The Supabase delete is deferred until the undo window closes — clicking Undo simply cancels the pending timer.
- The `lib/debounce.ts` utility is a generic TypeScript debounce that preserves the full argument type signature, used by both `SettingsContext` and `HabitContext`.
- `lib/auth/migration.ts` runs once per user account — it checks the `habits` table row count first; if data already exists in the database it skips migration and just clears stale localStorage keys.
- `lib/dateUtils.ts` exports `toDateKeyInTimezone(tz)` — converts the current moment to a `YYYY-MM-DD` date key in the user's local timezone. Used by GroupContext and GroupDetailScreen when recording challenge check-ins so that members in different timezones get the correct "today" date.
- The Group Detail screen's realtime channel (`group_sync_<groupId>`) subscribes to eight tables simultaneously, with per-table `filter` clauses scoped to the current group, so only events for the open group fire. The channel is torn down and rebuilt whenever `groupId` changes.
- The chat realtime channel (`group_chat_<groupId>`) uses three separate event handlers: INSERT → hydrates the new message with the sender's profile and appends it to state (replacing the matching optimistic temp message by user+content), DELETE → removes by message ID, and `group_message_reactions` wildcard → re-fetches only the affected message's reactions using a `messagesRef` to avoid stale closure issues.
- Chat messages are capped at 100 per group via a sliding window. `trimChatMessages` is called (fire-and-forget) after every successful send; if the group has > 100 messages it deletes the oldest one. This keeps per-group storage bounded without any user-visible disruption.
- Invite code rate limiting is enforced client-side via the `invite_code_attempts` table — 10 attempts per rolling hour per user. Stale rows (older than 1 hour) are pruned on each new attempt to keep the table lean.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| [Vite](https://vitejs.dev) | 6 | Build tool and dev server |
| [React](https://react.dev) | 18 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [React Router DOM](https://reactrouter.com) | 6 | Client-side routing |
| [Supabase](https://supabase.com) | 2.108 | Google OAuth auth, Postgres database, Realtime subscriptions, Row Level Security |
| [Lucide React](https://lucide.dev) | 0.525 | Icon library (used in landing page trust signals and app UI) |
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
    │   ├── favicon.png            App icon (192×192, used for tab + PWA)
    │   ├── logo.png               Full logo (512×512, used in PWA manifest)
    │   ├── logo-no-bg.png         Transparent logo (used in README header)
    │   ├── og-image.png           OG / Twitter card image (1200×630 branded PNG)
    │   ├── robots.txt             Allows / and /blog; disallows all authenticated routes
    │   ├── sitemap.xml            XML sitemap: /, /blog, 6 blog posts, /privacy
    │   └── manifest.json          PWA web app manifest
    └── src/
        ├── __tests__/             Unit and integration test files
        ├── blog/
        │   ├── types.ts              BlogPost interface
        │   ├── index.ts              ALL_POSTS array · getPostBySlug · getRelatedPosts · ALL_CATEGORIES
        │   └── posts/
        │       ├── how-to-build-a-habit.ts
        │       ├── 66-day-habit-challenge.ts
        │       ├── habit-journal-vs-tracker.ts
        │       ├── habit-streak-psychology.ts
        │       ├── morning-routine-habits.ts
        │       └── free-habit-tracker-2026.ts
        ├── components/
        │   ├── AppSkeleton.tsx       Loading spinner shown while DB data loads
        │   ├── AuthGate.tsx          Auth + route guard: redirects unknown paths, renders NotFoundScreen for logged-in 404s
        │   ├── CompletionRing.tsx    Circular SVG progress indicator
        │   ├── ConfirmDialog.tsx     Reusable themed confirmation modal (supports disabled prop for in-flight actions)
        │   ├── Confetti.tsx          Canvas confetti animation
        │   ├── ErrorBoundary.tsx     React error boundary — full-page or compact (per-screen)
        │   ├── MarkdownRenderer.tsx  Zero-dependency markdown → React renderer (no dangerouslySetInnerHTML)
        │   ├── Modal.tsx             Dialog (desktop) / bottom sheet (mobile)
        │   ├── MonthHeatmap.tsx      15-week activity heatmap
        │   ├── OfflineBanner.tsx     Fixed top banner shown when navigator.onLine is false
        │   ├── OnboardingModal.tsx   3-step first-login wizard (categories → habit templates → theme picker)
        │   ├── TabBar.tsx            Mobile bottom nav (6 tabs, with Groups unread badge) + collapsible sidebar
        │   └── WeeklyChart.tsx       7-day completion bar chart
        ├── constants/
        │   └── themes.ts             Five complete colour palettes
        ├── context/
        │   ├── AuthContext.tsx        Session · user · signIn · signOut
        │   ├── GroupContext.tsx       Groups · challenges · chat · nudges · feed · trophies · Supabase sync · Realtime
        │   ├── GroupUnreadContext.tsx Global unread message counter for Groups nav badge
        │   ├── HabitContext.tsx       Habits · entries · journals · Supabase sync · Realtime
        │   ├── SettingsContext.tsx    Theme · font · profile · Supabase profiles sync
        │   └── ToastContext.tsx       Non-blocking toasts with optional duration override
        ├── hooks/
        │   ├── useColors.ts           Active theme colour tokens
        │   ├── useFont.ts             Active font family + size scale
        │   └── useIsDesktop.ts        Responsive breakpoint hooks (768 / 1024 px)
        ├── lib/
        │   ├── dateUtils.ts           toDateKeyInTimezone — timezone-aware YYYY-MM-DD key for challenge check-ins
        │   ├── debounce.ts            Generic typed debounce utility
        │   ├── env.ts                 Validates required env vars at startup; exports typed env object
        │   ├── exportData.ts          exportSingleCSV — builds and downloads a UTF-8 BOM CSV of all habits + journal data
        │   ├── logger.ts              Centralised logError / logWarn (swappable for Sentry)
        │   ├── supabase.ts            Typed Supabase client singleton
        │   ├── auth/
        │   │   └── migration.ts       One-time localStorage → Supabase migration
        │   └── db/
        │       ├── groupTypes.ts      TypeScript interfaces for all group-related DB entities
        │       ├── mappers.ts         camelCase ↔ snake_case row converters (personal + group tables)
        │       └── types.ts           TypeScript types matching the full DB schema
        ├── screens/
        │   ├── LandingScreen.tsx      Public landing page (9 sections + Google sign-in modal)
        │   ├── BlogListScreen.tsx     Public blog index (/blog) — featured post + category filter + post grid
        │   ├── BlogPostScreen.tsx     Public blog article (/blog/:slug) — full post with dynamic SEO meta
        │   ├── PrivacyScreen.tsx      Public privacy policy page (accessible without auth)
        │   ├── TermsScreen.tsx        Public terms of service page (/terms — accessible without auth)
        │   ├── NotFoundScreen.tsx     Full-page themed 404 (shown to logged-in users on unknown routes)
        │   ├── TodayScreen.tsx        Daily tracker + journal (renders OnboardingModal on first login)
        │   ├── HabitsScreen.tsx       Habit management
        │   ├── CalendarScreen.tsx     Monthly calendar
        │   ├── ProgressScreen.tsx     Stats · charts · insights
        │   ├── JournalScreen.tsx      Timeline journal
        │   ├── ProfileScreen.tsx      User profile
        │   ├── SettingsScreen.tsx     App settings
        │   ├── GroupsScreen.tsx       Groups list — create group, view all groups, invite modal (/groups)
        │   ├── GroupDetailScreen.tsx  Group detail — Feed · Challenges · Members · Chat · Settings tabs (/groups/:id)
        │   └── JoinGroupScreen.tsx    Public invite-link page — join flow with rate limiting (/join/:code)
        ├── App.tsx                    Root layout + routing (4 public routes + AuthGate wildcard)
        ├── main.tsx                   Entry point
        └── vite-env.d.ts              Vite environment type declarations
    └── vercel.json                Vercel deployment config — SPA rewrite rule + build settings
```

---

<div align="center">
  <p>
    © 2026 Habit Ink &nbsp;·&nbsp; Made by Kunaal
  </p>
  <p>
    <sub>Habit Ink — v4.1</sub>
  </p>
</div>
