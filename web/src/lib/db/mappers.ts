import type { Database } from "./types";
import type {
  Habit,
  HabitEntry,
  DailyJournal,
  HabitType,
  ScheduleType,
  EntryStatus,
} from "@/context/HabitContext";
import type { Group, GroupChallenge, GroupMember } from "./groupTypes";
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

// ── Runtime type guards (prevents silent corruption on unexpected DB values) ──

const VALID_HABIT_TYPES = new Set<string>(["yesno", "number", "decimal", "time", "custom"]);
const VALID_SCHEDULE_TYPES = new Set<string>(["daily", "weekdays", "weekends", "alternate", "custom"]);
const VALID_ENTRY_STATUSES = new Set<string>(["pending", "done", "missed"]);

// ── Habits ────────────────────────────────────────────────────────────────────

export function mapHabitFromDB(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    type: (VALID_HABIT_TYPES.has(row.type) ? row.type : "yesno") as HabitType,
    target: row.target,
    schedule: (VALID_SCHEDULE_TYPES.has(row.schedule) ? row.schedule : "daily") as ScheduleType,
    customDays: row.custom_days?.filter((d: number) => d >= 0 && d <= 6) ?? undefined,
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
    status: (VALID_ENTRY_STATUSES.has(row.status) ? row.status : "pending") as EntryStatus,
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

// ── Groups ────────────────────────────────────────────────────────────────────

export function mapGroupFromDB(row: Database["public"]["Tables"]["groups"]["Row"]): Group {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    description: row.description,
    motto: row.motto,
    mottoAuthor: row.motto_author,
    welcomeMessage: row.welcome_message,
    memberLimit: row.member_limit,
    challengeCreator: row.challenge_creator as 'any' | 'admin',
    createdBy: row.created_by,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapChallengeFromDB(row: Database["public"]["Tables"]["group_challenges"]["Row"]): GroupChallenge {
  return {
    id: row.id,
    groupId: row.group_id,
    createdBy: row.created_by,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    habitType: row.habit_type,
    target: row.target,
    targetComparison: row.target_comparison === 'lte' ? 'lte' : 'gte',
    schedule: row.schedule,
    customDays: row.custom_days ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  };
}

export function mapMemberFromDB(
  row: Database["public"]["Tables"]["group_members"]["Row"],
  profile: { user_name?: string; user_emoji?: string; avatar_url?: string; timezone?: string } | null,
): GroupMember {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    role: row.role as 'admin' | 'member',
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at,
    muted: row.muted,
    displayName: profile?.user_name || 'Member',
    avatarUrl: profile?.avatar_url ?? '',
    userEmoji: profile?.user_emoji ?? '😊',
    timezone: profile?.timezone,
  };
}
