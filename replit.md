# Habit Journal

A notebook-style habit & goal tracker mobile app with a handwritten journal aesthetic, customizable themes, and visualizations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (API server only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54 + Expo Router (tab + stack navigation)
- Storage: AsyncStorage (all data is local, no backend required)
- Fonts: Caveat (handwritten) + Inter (clean) via @expo-google-fonts
- Icons: @expo/vector-icons (Feather set)
- Haptics: expo-haptics
- SVG: react-native-svg (for CompletionRing)

## Where things live

```
artifacts/mobile/
  app/
    _layout.tsx              — root Stack (SettingsProvider + HabitProvider)
    settings.tsx             — Settings modal screen (gear icon on Today)
    (tabs)/
      _layout.tsx            — Tab bar (Today / Habits / Calendar / Progress / Groups)
      index.tsx              — Daily Tracker page
      habits.tsx             — Habit management + add/edit modal
      calendar.tsx           — Monthly calendar with completion dots
      progress.tsx           — Stats, CompletionRing, WeeklyChart, per-habit cards
      groups.tsx             — Accountability groups with invite codes
  components/
    CompletionRing.tsx       — SVG donut ring showing completion %
    WeeklyChart.tsx          — 7-day bar chart visualization
    ErrorBoundary.tsx
  context/
    HabitContext.tsx          — All habit state + entries + journals + groups (AsyncStorage)
    SettingsContext.tsx       — Theme, fontStyle, fontSize settings (AsyncStorage)
  constants/
    colors.ts                 — Default color tokens (fallback)
    themes.ts                 — 5 named themes: cream, midnight, forest, rose, slate
  hooks/
    useColors.ts              — Reads from SettingsContext → active theme colors
    useFont.ts                — Returns {heading, label, body, medium, size(n)} based on settings
```

## Architecture decisions

- **Frontend-only / no backend**: all data lives in AsyncStorage. The API server artifact is a scaffold that isn't used by the mobile app.
- **SettingsContext wraps HabitProvider** in `_layout.tsx` so `useColors()` resolves theme before any habit data loads.
- **useColors() reads from SettingsContext** — changing the theme updates all colors instantly across every screen without re-renders.
- **Font switching** uses `useFont()` hook which returns font-family strings; screens apply them as inline styles (not StyleSheet) so they can update dynamically.
- **Groups are fully local** — invite codes are random 6-char strings stored in AsyncStorage. No server-side sync.

## Product

- **Today** — handwritten-style daily tracker table (Habit/Target/Status/Actual), journal fields (notes, wins, challenges), date navigation
- **Habits** — create/edit/delete habits with any tracking type (yes-no, number, time, custom), flexible schedule (daily, weekdays, weekends, alternate, custom days)
- **Calendar** — monthly calendar with color-coded completion dots; tap any day to see scheduled habits
- **Progress** — SVG completion ring for today, 7-day bar chart, per-habit streak + 30-day stats + mini dot grid
- **Groups** — local accountability group challenges with invite codes
- **Settings** — 5 color themes, 2 font styles (Handwritten Caveat / Clean Inter), 3 text sizes

## User preferences

- Warm cream paper aesthetic (#F5F0E8), Caveat handwriting font for headings, ink blue (#2B3A8C) primary
- App should feel like a handwritten bullet journal, not a productivity dashboard
- No emojis in code unless explicitly part of the UI design

## Gotchas

- Font families must be in **inline styles** (not StyleSheet.create) to switch dynamically with useFont()
- `useColors()` safely falls back to static tokens if SettingsContext is not yet mounted
- SVG CompletionRing uses `transform={`rotate(-90, cx, cy)`}` string syntax — not `rotation` prop
- Progress/Calendar/Groups tabs can't be screenshotted via direct URL path — use tab navigation
