import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/db/types";
import { useAuth } from "@/context/AuthContext";
import { migrateLocalStorageToSupabase } from "@/lib/auth/migration";

type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];
type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
type EntryInsert = Database["public"]["Tables"]["habit_entries"]["Insert"];
type JournalInsert = Database["public"]["Tables"]["journals"]["Insert"];
import {
  mapHabitFromDB,
  mapHabitToDB,
  mapEntryFromDB,
  buildEntriesMap,
  buildJournalsMap,
} from "@/lib/db/mappers";

// ── Public types ──────────────────────────────────────────────────────────────

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
  dataLoaded: boolean;
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

// ── Utility functions (re-exported for use by other modules) ──────────────────

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
        (date.getTime() - habitStart.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diff % 2 === 0;
    }
    case "custom":
      return (habit.customDays ?? []).includes(dow);
    default:
      return true;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({});
  const [appStartDate, setAppStartDate] = useState(toDateKey(new Date()));
  const [dataLoaded, setDataLoaded] = useState(false);

  // Refs let debounce callbacks read latest state without stale closures
  const journalsRef = useRef(journals);
  const entriesRef = useRef(entries);
  useEffect(() => {
    journalsRef.current = journals;
  }, [journals]);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  // Per-date debounce timers for journal saves
  const journalTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // ── Load & migrate on login ───────────────────────────────────────────────

  useEffect(() => {
    if (!userId) {
      setHabits([]);
      setEntries({});
      setJournals({});
      setAppStartDate(toDateKey(new Date()));
      setDataLoaded(false);
      return;
    }

    setDataLoaded(false);

    (async () => {
      // One-time migration from localStorage (no-op if already migrated)
      await migrateLocalStorageToSupabase(userId);

      const [habitsRes, entriesRes, journalsRes, profileRes] = await Promise.all(
        [
          supabase
            .from("habits")
            .select("*")
            .eq("user_id", userId)
            .order("created_at"),
          supabase.from("habit_entries").select("*").eq("user_id", userId),
          supabase.from("journals").select("*").eq("user_id", userId),
          supabase
            .from("profiles")
            .select("app_start_date")
            .eq("id", userId)
            .single(),
        ],
      );

      if (habitsRes.data) setHabits(habitsRes.data.map(mapHabitFromDB));
      if (entriesRes.data) setEntries(buildEntriesMap(entriesRes.data));
      if (journalsRes.data) setJournals(buildJournalsMap(journalsRes.data));
      if (profileRes.data?.app_start_date)
        setAppStartDate(profileRes.data.app_start_date);

      setDataLoaded(true);
    })().catch((err) => {
      console.error("[Habit Ink] Data load failed:", err);
      setDataLoaded(true); // don't hang the UI
    });
  }, [userId]);

  // ── Realtime subscriptions ────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;

    const habitsChannel = supabase
      .channel(`habits_rt_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "habits",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const h = mapHabitFromDB(
              payload.new as Parameters<typeof mapHabitFromDB>[0],
            );
            setHabits((prev) =>
              prev.find((x) => x.id === h.id) ? prev : [...prev, h],
            );
          } else if (payload.eventType === "UPDATE") {
            const h = mapHabitFromDB(
              payload.new as Parameters<typeof mapHabitFromDB>[0],
            );
            setHabits((prev) => prev.map((x) => (x.id === h.id ? h : x)));
          } else if (payload.eventType === "DELETE") {
            const id = payload.old.id as string;
            setHabits((prev) => prev.filter((x) => x.id !== id));
          }
        },
      )
      .subscribe();

    const entriesChannel = supabase
      .channel(`entries_rt_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "habit_entries",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const entry = mapEntryFromDB(
              payload.new as Parameters<typeof mapEntryFromDB>[0],
            );
            setEntries((prev) => {
              const day = prev[entry.date] ?? [];
              const idx = day.findIndex((e) => e.habitId === entry.habitId);
              const next =
                idx >= 0
                  ? day.map((e, i) => (i === idx ? entry : e))
                  : [...day, entry];
              return { ...prev, [entry.date]: next };
            });
          } else if (payload.eventType === "DELETE") {
            // REPLICA IDENTITY DEFAULT: old only has PK (id). Re-fetch to stay in sync.
            supabase
              .from("habit_entries")
              .select("*")
              .eq("user_id", userId)
              .then(({ data }) => {
                if (data) setEntries(buildEntriesMap(data));
              });
          }
        },
      )
      .subscribe();

    const journalsChannel = supabase
      .channel(`journals_rt_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journals",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const row = payload.new as {
              date: string;
              wake_up_time: string;
              intention: string;
              notes: string;
              wins: string;
              challenges: string;
            };
            const j: DailyJournal = {
              date: row.date,
              wakeUpTime: row.wake_up_time,
              intention: row.intention,
              notes: row.notes,
              wins: row.wins,
              challenges: row.challenges,
            };
            setJournals((prev) => ({ ...prev, [j.date]: j }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(habitsChannel);
      supabase.removeChannel(entriesChannel);
      supabase.removeChannel(journalsChannel);
    };
  }, [userId]);

  // ── Habit mutations ───────────────────────────────────────────────────────

  const addHabit = useCallback(
    (habit: Omit<Habit, "id" | "createdAt">) => {
      if (!userId) return;
      const now = new Date().toISOString();
      const newHabit: Habit = {
        ...habit,
        id: crypto.randomUUID(),
        emoji: habit.emoji ?? "✅",
        color: habit.color ?? "#2B3A8C",
        createdAt: now,
      };
      // Optimistic
      setHabits((prev) => [...prev, newHabit]);
      // Background write
      const insertRow: HabitInsert = { ...mapHabitToDB(newHabit, userId), id: newHabit.id, created_at: now };
      supabase
        .from("habits")
        .insert(insertRow)
        .then(({ error }) => {
          if (error) console.error("[Habit Ink] addHabit error:", error.message);
        });
    },
    [userId],
  );

  const updateHabit = useCallback(
    (id: string, update: Partial<Habit>) => {
      if (!userId) return;
      // Optimistic
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...update } : h)));
      // Build DB patch (only the updated fields)
      const patch: HabitUpdate = {};
      if (update.name !== undefined) patch.name = update.name;
      if (update.type !== undefined) patch.type = update.type;
      if (update.target !== undefined) patch.target = update.target;
      if (update.schedule !== undefined) patch.schedule = update.schedule;
      if (update.customDays !== undefined) patch.custom_days = update.customDays;
      if (update.startDate !== undefined) patch.start_date = update.startDate;
      if (update.emoji !== undefined) patch.emoji = update.emoji;
      if (update.color !== undefined) patch.color = update.color;
      if (update.archived !== undefined) patch.archived = update.archived;
      if (Object.keys(patch).length === 0) return;
      supabase
        .from("habits")
        .update(patch)
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("[Habit Ink] updateHabit error:", error.message);
        });
    },
    [userId],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      if (!userId) return;
      // Optimistic
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setEntries((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = next[key].filter((e) => e.habitId !== id);
        }
        return next;
      });
      // Background delete (cascade removes entries in DB)
      supabase
        .from("habits")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("[Habit Ink] deleteHabit error:", error.message);
        });
    },
    [userId],
  );

  // ── Entry mutations ───────────────────────────────────────────────────────

  const upsertEntry = useCallback(
    (habitId: string, date: string, patch: Partial<HabitEntry>) => {
      if (!userId) return;
      const current = (entriesRef.current[date] ?? []).find(
        (e) => e.habitId === habitId,
      );
      const merged: HabitEntry = {
        habitId,
        date,
        status: current?.status ?? "pending",
        actual: current?.actual ?? "",
        ...patch,
      };
      const entryRow: EntryInsert = {
        user_id: userId,
        habit_id: merged.habitId,
        date: merged.date,
        status: merged.status,
        actual: merged.actual,
      };
      supabase
        .from("habit_entries")
        .upsert(entryRow, { onConflict: "habit_id,date" })
        .then(({ error }) => {
          if (error)
            console.error("[Habit Ink] upsertEntry error:", error.message);
        });
    },
    [userId],
  );

  const setEntryStatus = useCallback(
    (habitId: string, date: string, status: EntryStatus) => {
      // Optimistic
      setEntries((prev) => {
        const day = prev[date] ?? [];
        const idx = day.findIndex((e) => e.habitId === habitId);
        const updated =
          idx >= 0
            ? day.map((e, i) => (i === idx ? { ...e, status } : e))
            : [...day, { habitId, date, status, actual: "" }];
        return { ...prev, [date]: updated };
      });
      upsertEntry(habitId, date, { status });
    },
    [upsertEntry],
  );

  const setEntryActual = useCallback(
    (habitId: string, date: string, actual: string) => {
      // Optimistic
      setEntries((prev) => {
        const day = prev[date] ?? [];
        const idx = day.findIndex((e) => e.habitId === habitId);
        const updated =
          idx >= 0
            ? day.map((e, i) => (i === idx ? { ...e, actual } : e))
            : [...day, { habitId, date, status: "pending" as const, actual }];
        return { ...prev, [date]: updated };
      });
      upsertEntry(habitId, date, { actual });
    },
    [upsertEntry],
  );

  // ── Journal mutations (debounced per date) ────────────────────────────────

  const updateJournal = useCallback(
    (date: string, update: Partial<DailyJournal>) => {
      if (!userId) return;
      // Optimistic
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
      // Per-date debounce — 800ms
      const timers = journalTimers.current;
      const existing = timers.get(date);
      if (existing) clearTimeout(existing);
      timers.set(
        date,
        setTimeout(() => {
          timers.delete(date);
          const j = journalsRef.current[date];
          if (!j) return;
          const journalRow: JournalInsert = {
            user_id: userId,
            date: j.date,
            wake_up_time: j.wakeUpTime,
            intention: j.intention,
            notes: j.notes,
            wins: j.wins,
            challenges: j.challenges,
          };
          supabase
            .from("journals")
            .upsert(journalRow, { onConflict: "user_id,date" })
            .then(({ error }) => {
              if (error)
                console.error(
                  "[Habit Ink] journal save error:",
                  error.message,
                );
            });
        }, 800),
      );
    },
    [userId],
  );

  // ── Read-only derived helpers ─────────────────────────────────────────────

  const getHabitsForDate = useCallback(
    (date: string): Habit[] => habits.filter((h) => isScheduledForDate(h, date)),
    [habits],
  );

  const getEntry = useCallback(
    (habitId: string, date: string): HabitEntry | undefined =>
      (entries[date] ?? []).find((e) => e.habitId === habitId),
    [entries],
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
    [habits, entries],
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
    [habits, entries],
  );

  const getCompletionForDate = useCallback(
    (date: string): { done: number; total: number } => {
      const habitsForDate = habits.filter((h) => isScheduledForDate(h, date));
      const done = habitsForDate.filter(
        (h) =>
          (entries[date] ?? []).find((e) => e.habitId === h.id)?.status ===
          "done",
      ).length;
      return { done, total: habitsForDate.length };
    },
    [habits, entries],
  );

  const getDayNumber = useCallback(
    (date?: Date): number => {
      const start = new Date(appStartDate + "T12:00:00");
      const d = date ?? new Date();
      const target = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        12,
        0,
        0,
      );
      return (
        Math.floor(
          (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      );
    },
    [appStartDate],
  );

  return (
    <HabitContext.Provider
      value={{
        habits,
        entries,
        journals,
        appStartDate,
        dataLoaded,
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
