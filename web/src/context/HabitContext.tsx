import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type HabitType = "yesno" | "number" | "decimal" | "time" | "custom";
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
  archived?: boolean;
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
  intention: string;
  notes: string;
  wins: string;
  challenges: string;
}

interface HabitContextType {
  habits: Habit[];
  entries: Record<string, HabitEntry[]>;
  journals: Record<string, DailyJournal>;
  appStartDate: string;
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  setEntryStatus: (habitId: string, date: string, status: EntryStatus) => void;
  setEntryActual: (habitId: string, date: string, actual: string) => void;
  updateJournal: (date: string, update: Partial<DailyJournal>) => void;
  getHabitsForDate: (date: string) => Habit[];
  getEntry: (habitId: string, date: string) => HabitEntry | undefined;
  getStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
  getCompletionForDate: (date: string) => { done: number; total: number };
  getDayNumber: (date?: Date) => number;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

const STORAGE_KEYS = {
  habits: "@habitjournal/habits",
  entries: "@habitjournal/entries",
  journals: "@habitjournal/journals",
  appStart: "@habitjournal/appstart",
};

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({});
  const [appStartDate, setAppStartDate] = useState<string>(toDateKey(new Date()));
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const h = localStorage.getItem(STORAGE_KEYS.habits);
    const e = localStorage.getItem(STORAGE_KEYS.entries);
    const j = localStorage.getItem(STORAGE_KEYS.journals);
    const s = localStorage.getItem(STORAGE_KEYS.appStart);

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
    if (s) {
      setAppStartDate(s);
    } else {
      const today = toDateKey(new Date());
      setAppStartDate(today);
      localStorage.setItem(STORAGE_KEYS.appStart, today);
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
  }, [habits, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
  }, [entries, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEYS.journals, JSON.stringify(journals));
  }, [journals, loaded]);

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
    },
    []
  );

  const updateHabit = useCallback(
    (id: string, update: Partial<Habit>) => {
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...update } : h))
      );
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

  const updateJournal = useCallback(
    (date: string, update: Partial<DailyJournal>) => {
      setJournals((prev) => {
        const existing = prev[date] ?? {
          date,
          wakeUpTime: "",
          intention: "",
          notes: "",
          wins: "",
          challenges: "",
        };
        return { ...prev, [date]: { ...existing, ...update } };
      });
    },
    []
  );

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

  const getDayNumber = useCallback((date?: Date): number => {
    const start = new Date(appStartDate + "T12:00:00");
    const target = date ?? new Date();
    return (
      Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }, [appStartDate]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        entries,
        journals,
        appStartDate,
        addHabit,
        updateHabit,
        deleteHabit,
        setEntryStatus,
        setEntryActual,
        updateJournal,
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
