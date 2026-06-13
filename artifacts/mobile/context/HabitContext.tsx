import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type HabitType = "yesno" | "number" | "time" | "custom";
export type ScheduleType =
  | "daily"
  | "weekdays"
  | "weekends"
  | "alternate"
  | "custom";
export type EntryStatus = "pending" | "done" | "missed";

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  target: string;
  schedule: ScheduleType;
  customDays?: number[];
  startDate: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface HabitEntry {
  habitId: string;
  date: string;
  status: EntryStatus;
  actual: string;
}

export interface DailyJournal {
  date: string;
  wakeUpTime: string;
  notes: string;
  wins: string;
  challenges: string;
}

export interface GroupMember {
  id: string;
  name: string;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  habitNames: string[];
  schedule: ScheduleType;
  startDate: string;
  endDate: string;
  members: GroupMember[];
  inviteCode: string;
  createdAt: string;
}

interface HabitContextType {
  habits: Habit[];
  entries: Record<string, HabitEntry[]>;
  journals: Record<string, DailyJournal>;
  groups: Group[];
  appStartDate: string;
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  setEntryStatus: (habitId: string, date: string, status: EntryStatus) => void;
  setEntryActual: (habitId: string, date: string, actual: string) => void;
  updateJournal: (date: string, update: Partial<DailyJournal>) => void;
  createGroup: (group: Omit<Group, "id" | "inviteCode" | "createdAt">) => Group;
  joinGroup: (inviteCode: string, memberName: string) => boolean;
  getHabitsForDate: (date: string) => Habit[];
  getEntry: (habitId: string, date: string) => HabitEntry | undefined;
  getStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
  getCompletionForDate: (date: string) => { done: number; total: number };
  getDayNumber: () => number;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isScheduledForDate(habit: Habit, dateKey: string): boolean {
  const date = new Date(dateKey + "T12:00:00");
  const dow = date.getDay();
  const habitStart = new Date(habit.startDate + "T12:00:00");
  if (date < habitStart) return false;
  switch (habit.schedule) {
    case "daily":
      return true;
    case "weekdays":
      return dow >= 1 && dow <= 5;
    case "weekends":
      return dow === 0 || dow === 6;
    case "alternate": {
      const diff = Math.round(
        (date.getTime() - habitStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff % 2 === 0;
    }
    case "custom":
      return (habit.customDays ?? []).includes(dow);
    default:
      return true;
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function randomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : null;

async function apiCall(
  path: string,
  method: string,
  body?: unknown
): Promise<void> {
  if (!API_BASE) return;
  try {
    await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Silently fail — local is source of truth
  }
}

const STORAGE_KEYS = {
  habits: "@habitjournal/habits",
  entries: "@habitjournal/entries",
  journals: "@habitjournal/journals",
  groups: "@habitjournal/groups",
  appStart: "@habitjournal/appstart",
};

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [appStartDate, setAppStartDate] = useState<string>(toDateKey(new Date()));
  const [loaded, setLoaded] = useState(false);

  // ─── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [h, e, j, g, s] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.habits),
        AsyncStorage.getItem(STORAGE_KEYS.entries),
        AsyncStorage.getItem(STORAGE_KEYS.journals),
        AsyncStorage.getItem(STORAGE_KEYS.groups),
        AsyncStorage.getItem(STORAGE_KEYS.appStart),
      ]);
      if (h) {
        const parsed = JSON.parse(h) as Habit[];
        setHabits(
          parsed.map((habit) => ({
            ...habit,
            emoji: habit.emoji ?? "✅",
            color: habit.color ?? "#2B3A8C",
          }))
        );
      }
      if (e) setEntries(JSON.parse(e));
      if (j) setJournals(JSON.parse(j));
      if (g) setGroups(JSON.parse(g));
      if (s) {
        setAppStartDate(s);
      } else {
        const today = toDateKey(new Date());
        setAppStartDate(today);
        AsyncStorage.setItem(STORAGE_KEYS.appStart, today);
      }
      setLoaded(true);
    })();
  }, []);

  // ─── Persist ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
  }, [habits, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
  }, [entries, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEYS.journals, JSON.stringify(journals));
  }, [journals, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups));
  }, [groups, loaded]);

  // ─── Habits ───────────────────────────────────────────────────────────────────
  const addHabit = useCallback(
    (habit: Omit<Habit, "id" | "createdAt">) => {
      const now = new Date().toISOString();
      const newHabit: Habit = {
        ...habit,
        id: uid(),
        emoji: habit.emoji ?? "✅",
        color: habit.color ?? "#2B3A8C",
        createdAt: now,
      };
      setHabits((prev) => [...prev, newHabit]);
      apiCall("/habits", "POST", {
        name: newHabit.name,
        type: newHabit.type,
        target: newHabit.target,
        schedule: newHabit.schedule,
        customDays: newHabit.customDays ? JSON.stringify(newHabit.customDays) : null,
        startDate: newHabit.startDate,
        emoji: newHabit.emoji,
        color: newHabit.color,
      });
    },
    []
  );

  const updateHabit = useCallback(
    (id: string, update: Partial<Habit>) => {
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...update } : h))
      );
      apiCall(`/habits/local-${id}`, "PUT", update);
    },
    []
  );

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setEntries((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].filter((e) => e.habitId !== id);
      }
      return next;
    });
  }, []);

  // ─── Entries ──────────────────────────────────────────────────────────────────
  const setEntryStatus = useCallback(
    (habitId: string, date: string, status: EntryStatus) => {
      setEntries((prev) => {
        const dayEntries = prev[date] ?? [];
        const idx = dayEntries.findIndex((e) => e.habitId === habitId);
        const updated =
          idx >= 0
            ? dayEntries.map((e, i) => (i === idx ? { ...e, status } : e))
            : [...dayEntries, { habitId, date, status, actual: "" }];
        return { ...prev, [date]: updated };
      });
    },
    []
  );

  const setEntryActual = useCallback(
    (habitId: string, date: string, actual: string) => {
      setEntries((prev) => {
        const dayEntries = prev[date] ?? [];
        const idx = dayEntries.findIndex((e) => e.habitId === habitId);
        const updated =
          idx >= 0
            ? dayEntries.map((e, i) => (i === idx ? { ...e, actual } : e))
            : [...dayEntries, { habitId, date, status: "pending" as const, actual }];
        return { ...prev, [date]: updated };
      });
    },
    []
  );

  // ─── Journal ──────────────────────────────────────────────────────────────────
  const updateJournal = useCallback(
    (date: string, update: Partial<DailyJournal>) => {
      setJournals((prev) => {
        const existing = prev[date] ?? {
          date,
          wakeUpTime: "",
          notes: "",
          wins: "",
          challenges: "",
        };
        return { ...prev, [date]: { ...existing, ...update } };
      });
    },
    []
  );

  // ─── Groups ───────────────────────────────────────────────────────────────────
  const createGroup = useCallback(
    (input: Omit<Group, "id" | "inviteCode" | "createdAt">): Group => {
      const group: Group = {
        ...input,
        id: uid(),
        inviteCode: randomCode(),
        createdAt: new Date().toISOString(),
      };
      setGroups((prev) => [...prev, group]);
      return group;
    },
    []
  );

  const joinGroup = useCallback(
    (inviteCode: string, memberName: string): boolean => {
      let found = false;
      setGroups((prev) =>
        prev.map((g) => {
          if (g.inviteCode.toUpperCase() !== inviteCode.toUpperCase()) return g;
          if (g.members.some((m) => m.name === memberName)) return g;
          found = true;
          return {
            ...g,
            members: [
              ...g.members,
              { id: uid(), name: memberName, joinedAt: new Date().toISOString() },
            ],
          };
        })
      );
      return found;
    },
    []
  );

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const getHabitsForDate = useCallback(
    (date: string): Habit[] =>
      habits.filter((h) => isScheduledForDate(h, date)),
    [habits]
  );

  const getEntry = useCallback(
    (habitId: string, date: string): HabitEntry | undefined =>
      (entries[date] ?? []).find((e) => e.habitId === habitId),
    [entries]
  );

  const getStreak = useCallback(
    (habitId: string): number => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        if (!isScheduledForDate(habit, key)) continue;
        const entry = (entries[key] ?? []).find((e) => e.habitId === habitId);
        if (entry?.status === "done") {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    },
    [habits, entries]
  );

  const getCompletionRate = useCallback(
    (habitId: string, days = 30): number => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;
      let done = 0;
      let scheduled = 0;
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        if (!isScheduledForDate(habit, key)) continue;
        scheduled++;
        const entry = (entries[key] ?? []).find((e) => e.habitId === habitId);
        if (entry?.status === "done") done++;
      }
      return scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
    },
    [habits, entries]
  );

  const getCompletionForDate = useCallback(
    (date: string): { done: number; total: number } => {
      const habitsForDate = habits.filter((h) => isScheduledForDate(h, date));
      const done = habitsForDate.filter(
        (h) =>
          (entries[date] ?? []).find((e) => e.habitId === h.id)?.status === "done"
      ).length;
      return { done, total: habitsForDate.length };
    },
    [habits, entries]
  );

  const getDayNumber = useCallback((): number => {
    const start = new Date(appStartDate + "T12:00:00");
    const now = new Date();
    return (
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }, [appStartDate]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        entries,
        journals,
        groups,
        appStartDate,
        addHabit,
        updateHabit,
        deleteHabit,
        setEntryStatus,
        setEntryActual,
        updateJournal,
        createGroup,
        joinGroup,
        getHabitsForDate,
        getEntry,
        getStreak,
        getCompletionRate,
        getCompletionForDate,
        getDayNumber,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits(): HabitContextType {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be inside HabitProvider");
  return ctx;
}
