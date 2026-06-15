import type { Database } from "./types";
import type {
  Habit,
  HabitEntry,
  DailyJournal,
  HabitType,
  ScheduleType,
  EntryStatus,
} from "@/context/HabitContext";
import type { ThemeName } from "@/constants/themes";
import type { FontStyle, FontSize } from "@/context/SettingsContext";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type EntryRow = Database["public"]["Tables"]["habit_entries"]["Row"];
type JournalRow = Database["public"]["Tables"]["journals"]["Row"];

// ── Profile ──────────────────────────────────────────────────────────────────

export interface MappedProfile {
  theme: ThemeName;
  fontStyle: FontStyle;
  fontSize: FontSize;
  userName: string;
  userEmoji: string;
  userAbout: string;
  weightKg: string;
  heightCm: string;
  customQuoteText: string;
  customQuoteAuthor: string;
  habitOrder: string[];
  sidebarCollapsed: boolean;
  appStartDate: string;
}

export function mapProfileFromDB(row: ProfileRow): MappedProfile {
  return {
    theme: (row.theme as ThemeName) || "cream",
    fontStyle: (row.font_style as FontStyle) || "handwritten",
    fontSize: (row.font_size as FontSize) || "medium",
    userName: row.user_name ?? "",
    userEmoji: row.user_emoji ?? "😊",
    userAbout: row.user_about ?? "",
    weightKg: row.weight_kg ?? "",
    heightCm: row.height_cm ?? "",
    customQuoteText: row.custom_quote_text ?? "",
    customQuoteAuthor: row.custom_quote_author ?? "",
    habitOrder: row.habit_order ?? [],
    sidebarCollapsed: row.sidebar_collapsed ?? false,
    appStartDate: row.app_start_date,
  };
}

// ── Habits ────────────────────────────────────────────────────────────────────

export function mapHabitFromDB(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    type: row.type as HabitType,
    target: row.target,
    schedule: row.schedule as ScheduleType,
    customDays: row.custom_days ?? undefined,
    startDate: row.start_date,
    emoji: row.emoji,
    color: row.color,
    archived: row.archived,
    createdAt: row.created_at,
  };
}

export function mapHabitToDB(
  h: Omit<Habit, "id" | "createdAt">,
  userId: string,
) {
  return {
    user_id: userId,
    name: h.name,
    type: h.type,
    target: h.target,
    schedule: h.schedule,
    custom_days: h.customDays ?? null,
    start_date: h.startDate,
    emoji: h.emoji ?? "✅",
    color: h.color ?? "#2B3A8C",
    archived: h.archived ?? false,
  };
}

// ── Entries ───────────────────────────────────────────────────────────────────

export function mapEntryFromDB(row: EntryRow): HabitEntry {
  return {
    habitId: row.habit_id,
    date: row.date,
    status: row.status as EntryStatus,
    actual: row.actual,
  };
}

export function buildEntriesMap(
  rows: EntryRow[],
): Record<string, HabitEntry[]> {
  return rows.reduce<Record<string, HabitEntry[]>>((acc, row) => {
    const key = row.date;
    acc[key] = [...(acc[key] ?? []), mapEntryFromDB(row)];
    return acc;
  }, {});
}

// ── Journals ──────────────────────────────────────────────────────────────────

export function mapJournalFromDB(row: JournalRow): DailyJournal {
  return {
    date: row.date,
    wakeUpTime: row.wake_up_time,
    intention: row.intention,
    notes: row.notes,
    wins: row.wins,
    challenges: row.challenges,
  };
}

export function buildJournalsMap(
  rows: JournalRow[],
): Record<string, DailyJournal> {
  return rows.reduce<Record<string, DailyJournal>>((acc, row) => {
    acc[row.date] = mapJournalFromDB(row);
    return acc;
  }, {});
}
