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
  getLongestStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days: number) => number;
  getDayNumber: () => number;
  getCompletionForDate: (date: string) => { done: number; total: number };
  getOverallStreak: () => number;
}

const HabitContext = createContext<HabitContextType | null>(null);

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function genCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isScheduledForDate(habit: Habit, dateKey: string): boolean {
  const date = new Date(dateKey + "T12:00:00");
  const start = new Date(habit.startDate + "T12:00:00");
  if (date < start) return false;
  const dow = date.getDay();
  switch (habit.schedule) {
    case "daily":
      return true;
    case "weekdays":
      return dow >= 1 && dow <= 5;
    case "weekends":
      return dow === 0 || dow === 6;
    case "alternate": {
      const diff = Math.round(
        (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff % 2 === 0;
    }
    case "custom":
      return habit.customDays?.includes(dow) ?? false;
    default:
      return true;
  }
}

const KEYS = {
  habits: "@habitjournal/habits",
  entries: "@habitjournal/entries",
  journals: "@habitjournal/journals",
  groups: "@habitjournal/groups",
  startDate: "@habitjournal/appStartDate",
};

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [appStartDate, setAppStartDate] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [h, e, j, g, s] = await Promise.all([
          AsyncStorage.getItem(KEYS.habits),
          AsyncStorage.getItem(KEYS.entries),
          AsyncStorage.getItem(KEYS.journals),
          AsyncStorage.getItem(KEYS.groups),
          AsyncStorage.getItem(KEYS.startDate),
        ]);
        if (h) setHabits(JSON.parse(h));
        if (e) setEntries(JSON.parse(e));
        if (j) setJournals(JSON.parse(j));
        if (g) setGroups(JSON.parse(g));
        const today = toDateKey(new Date());
        if (s) {
          setAppStartDate(s);
        } else {
          setAppStartDate(today);
          await AsyncStorage.setItem(KEYS.startDate, today);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.habits, JSON.stringify(habits));
  }, [habits, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.entries, JSON.stringify(entries));
  }, [entries, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.journals, JSON.stringify(journals));
  }, [journals, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.groups, JSON.stringify(groups));
  }, [groups, loaded]);

  const addHabit = useCallback((h: Omit<Habit, "id" | "createdAt">) => {
    setHabits((prev) => [
      ...prev,
      { ...h, id: genId(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  const updateHabit = useCallback((id: string, update: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...update } : h))
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const setEntryStatus = useCallback(
    (habitId: string, date: string, status: EntryStatus) => {
      setEntries((prev) => {
        const day = prev[date] ?? [];
        const exists = day.find((e) => e.habitId === habitId);
        if (exists) {
          return {
            ...prev,
            [date]: day.map((e) =>
              e.habitId === habitId ? { ...e, status } : e
            ),
          };
        }
        return {
          ...prev,
          [date]: [...day, { habitId, date, status, actual: "" }],
        };
      });
    },
    []
  );

  const setEntryActual = useCallback(
    (habitId: string, date: string, actual: string) => {
      setEntries((prev) => {
        const day = prev[date] ?? [];
        const exists = day.find((e) => e.habitId === habitId);
        if (exists) {
          return {
            ...prev,
            [date]: day.map((e) =>
              e.habitId === habitId ? { ...e, actual } : e
            ),
          };
        }
        return {
          ...prev,
          [date]: [...day, { habitId, date, status: "pending" as EntryStatus, actual }],
        };
      });
    },
    []
  );

  const updateJournal = useCallback(
    (date: string, update: Partial<DailyJournal>) => {
      setJournals((prev) => ({
        ...prev,
        [date]: {
          date,
          wakeUpTime: "",
          notes: "",
          wins: "",
          challenges: "",
          ...prev[date],
          ...update,
        },
      }));
    },
    []
  );

  const createGroup = useCallback(
    (g: Omit<Group, "id" | "inviteCode" | "createdAt">): Group => {
      const group: Group = {
        ...g,
        id: genId(),
        inviteCode: genCode(),
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
          if (g.inviteCode === inviteCode.toUpperCase()) {
            found = true;
            if (g.members.some((m) => m.name === memberName)) return g;
            return {
              ...g,
              members: [
                ...g.members,
                {
                  id: genId(),
                  name: memberName,
                  joinedAt: new Date().toISOString(),
                },
              ],
            };
          }
          return g;
        })
      );
      return found;
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
      for (let i = 0; i <= 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        if (!isScheduledForDate(habit, key)) continue;
        const entry = (entries[key] ?? []).find((e) => e.habitId === habitId);
        if (!entry || entry.status === "pending") {
          if (i === 0) continue;
          break;
        }
        if (entry.status === "done") streak++;
        else break;
      }
      return streak;
    },
    [habits, entries]
  );

  const getLongestStreak = useCallback(
    (habitId: string): number => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;
      let longest = 0;
      let current = 0;
      const start = new Date(habit.startDate + "T12:00:00");
      const today = new Date();
      for (
        let d = new Date(start);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        const key = toDateKey(d);
        if (!isScheduledForDate(habit, key)) continue;
        const entry = (entries[key] ?? []).find((e) => e.habitId === habitId);
        if (entry?.status === "done") {
          current++;
          longest = Math.max(longest, current);
        } else if (entry?.status === "missed") {
          current = 0;
        }
      }
      return longest;
    },
    [habits, entries]
  );

  const getCompletionRate = useCallback(
    (habitId: string, days: number): number => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;
      let done = 0;
      let total = 0;
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        if (!isScheduledForDate(habit, key)) continue;
        total++;
        const entry = (entries[key] ?? []).find((e) => e.habitId === habitId);
        if (entry?.status === "done") done++;
      }
      return total === 0 ? 0 : Math.round((done / total) * 100);
    },
    [habits, entries]
  );

  const getDayNumber = useCallback((): number => {
    if (!appStartDate) return 1;
    const start = new Date(appStartDate + "T12:00:00");
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(1, diff + 1);
  }, [appStartDate]);

  const getCompletionForDate = useCallback(
    (date: string): { done: number; total: number } => {
      const scheduled = habits.filter((h) => isScheduledForDate(h, date));
      const day = entries[date] ?? [];
      const done = day.filter(
        (e) =>
          e.status === "done" && scheduled.some((h) => h.id === e.habitId)
      ).length;
      return { done, total: scheduled.length };
    },
    [habits, entries]
  );

  const getOverallStreak = useCallback((): number => {
    if (habits.length === 0) return 0;
    let streak = 0;
    for (let i = 1; i <= 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const scheduled = habits.filter((h) => isScheduledForDate(h, key));
      if (scheduled.length === 0) continue;
      const day = entries[key] ?? [];
      const done = day.filter(
        (e) =>
          e.status === "done" && scheduled.some((h) => h.id === e.habitId)
      ).length;
      if (done > 0) streak++;
      else break;
    }
    return streak;
  }, [habits, entries]);

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
        getLongestStreak,
        getCompletionRate,
        getDayNumber,
        getCompletionForDate,
        getOverallStreak,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be inside HabitProvider");
  return ctx;
}
