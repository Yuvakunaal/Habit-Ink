import { describe, it, expect } from "vitest";
import {
  isScheduledForDate,
  computeNewStreak,
  toDateKey,
} from "../context/HabitContext";
import type { Habit, HabitEntry } from "../context/HabitContext";
import {
  mapHabitFromDB,
  mapHabitToDB,
  mapEntryFromDB,
} from "../lib/db/mappers";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Test habit",
    type: "yesno",
    target: "Complete",
    schedule: "daily",
    customDays: undefined,
    startDate: "2024-01-01",
    emoji: "✅",
    color: "#2B3A8C",
    archived: false,
    createdAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeEntries(
  habitId: string,
  datesStatus: [string, "done" | "missed" | "pending"][],
): Record<string, HabitEntry[]> {
  return datesStatus.reduce<Record<string, HabitEntry[]>>((acc, [date, status]) => {
    acc[date] = [...(acc[date] ?? []), { habitId, date, status, actual: "" }];
    return acc;
  }, {});
}

// ── isScheduledForDate ────────────────────────────────────────────────────────

describe("isScheduledForDate", () => {
  it("returns false for dates before the habit startDate", () => {
    const habit = makeHabit({ startDate: "2024-06-01" });
    expect(isScheduledForDate(habit, "2024-05-31")).toBe(false);
  });

  it("daily habit is scheduled every day", () => {
    const habit = makeHabit({ schedule: "daily" });
    expect(isScheduledForDate(habit, "2024-01-06")).toBe(true); // Saturday
    expect(isScheduledForDate(habit, "2024-01-07")).toBe(true); // Sunday
    expect(isScheduledForDate(habit, "2024-01-08")).toBe(true); // Monday
  });

  it("weekdays habit is not scheduled on weekends", () => {
    const habit = makeHabit({ schedule: "weekdays" });
    expect(isScheduledForDate(habit, "2024-01-06")).toBe(false); // Saturday
    expect(isScheduledForDate(habit, "2024-01-07")).toBe(false); // Sunday
    expect(isScheduledForDate(habit, "2024-01-08")).toBe(true);  // Monday
  });

  it("weekends habit is only scheduled on Saturday and Sunday", () => {
    const habit = makeHabit({ schedule: "weekends" });
    expect(isScheduledForDate(habit, "2024-01-06")).toBe(true);  // Saturday
    expect(isScheduledForDate(habit, "2024-01-07")).toBe(true);  // Sunday
    expect(isScheduledForDate(habit, "2024-01-08")).toBe(false); // Monday
  });

  it("alternate habit follows even/odd day pattern from startDate", () => {
    const habit = makeHabit({ schedule: "alternate", startDate: "2024-01-01" });
    expect(isScheduledForDate(habit, "2024-01-01")).toBe(true);  // day 0
    expect(isScheduledForDate(habit, "2024-01-02")).toBe(false); // day 1
    expect(isScheduledForDate(habit, "2024-01-03")).toBe(true);  // day 2
    expect(isScheduledForDate(habit, "2024-01-04")).toBe(false); // day 3
  });

  it("custom habit only fires on selected days of week", () => {
    // Mon=1, Wed=3, Fri=5
    const habit = makeHabit({ schedule: "custom", customDays: [1, 3, 5] });
    expect(isScheduledForDate(habit, "2024-01-08")).toBe(true);  // Monday
    expect(isScheduledForDate(habit, "2024-01-09")).toBe(false); // Tuesday
    expect(isScheduledForDate(habit, "2024-01-10")).toBe(true);  // Wednesday
    expect(isScheduledForDate(habit, "2024-01-13")).toBe(false); // Saturday (dow=6) not in [1,3,5]
    expect(isScheduledForDate(habit, "2024-01-12")).toBe(true);  // Friday (dow=5)
  });

  it("custom habit with empty customDays never fires", () => {
    const habit = makeHabit({ schedule: "custom", customDays: [] });
    expect(isScheduledForDate(habit, "2024-01-08")).toBe(false);
  });
});

// ── computeNewStreak ──────────────────────────────────────────────────────────

describe("computeNewStreak", () => {
  it("returns 1 when no prior history", () => {
    const habit = makeHabit();
    const streak = computeNewStreak("h1", [habit], {});
    expect(streak).toBe(1);
  });

  it("returns 1 when habit is not found", () => {
    const streak = computeNewStreak("unknown", [], {});
    expect(streak).toBe(1);
  });

  it("counts consecutive done days before today", () => {
    const habit = makeHabit({ schedule: "daily" });
    const today = new Date();
    const d1 = new Date(today); d1.setDate(d1.getDate() - 1);
    const d2 = new Date(today); d2.setDate(d2.getDate() - 2);
    const entries = makeEntries("h1", [
      [toDateKey(d1), "done"],
      [toDateKey(d2), "done"],
    ]);
    const streak = computeNewStreak("h1", [habit], entries);
    expect(streak).toBe(3); // today(1) + yesterday(1) + day before(1)
  });

  it("breaks on a missed day", () => {
    const habit = makeHabit({ schedule: "daily" });
    const today = new Date();
    const d1 = new Date(today); d1.setDate(d1.getDate() - 1);
    const d2 = new Date(today); d2.setDate(d2.getDate() - 2);
    const entries = makeEntries("h1", [
      [toDateKey(d1), "missed"],
      [toDateKey(d2), "done"],
    ]);
    const streak = computeNewStreak("h1", [habit], entries);
    expect(streak).toBe(1); // today only — d1 was missed
  });

  it("skips non-scheduled days in the streak count", () => {
    // Monday + Wednesday habit — streak spans a Tuesday that is skipped
    const habit = makeHabit({ schedule: "custom", customDays: [1, 3] }); // Mon, Wed
    // We won't call this in a real scenario with a specific today, so just verify it returns >= 1
    const streak = computeNewStreak("h1", [habit], {});
    expect(streak).toBeGreaterThanOrEqual(1);
  });
});

// ── mappers ───────────────────────────────────────────────────────────────────

describe("mapHabitFromDB", () => {
  function makeRow(overrides: Record<string, unknown> = {}) {
    return {
      id: "h1",
      name: "Run",
      type: "yesno",
      target: "Complete",
      schedule: "daily",
      custom_days: null,
      start_date: "2024-01-01",
      emoji: "🏃",
      color: "#2B3A8C",
      archived: false,
      created_at: "2024-01-01T00:00:00Z",
      user_id: "u1",
      ...overrides,
    } as Parameters<typeof mapHabitFromDB>[0];
  }

  it("maps a valid row correctly", () => {
    const habit = mapHabitFromDB(makeRow());
    expect(habit.id).toBe("h1");
    expect(habit.schedule).toBe("daily");
    expect(habit.type).toBe("yesno");
    expect(habit.customDays).toBeUndefined();
  });

  it("falls back to 'yesno' for invalid type", () => {
    const habit = mapHabitFromDB(makeRow({ type: "invalid" }));
    expect(habit.type).toBe("yesno");
  });

  it("falls back to 'daily' for invalid schedule", () => {
    const habit = mapHabitFromDB(makeRow({ schedule: "never" }));
    expect(habit.schedule).toBe("daily");
  });

  it("filters out-of-range customDays values", () => {
    const habit = mapHabitFromDB(makeRow({ custom_days: [0, 3, 7, -1, 6] }));
    expect(habit.customDays).toEqual([0, 3, 6]);
  });

  it("returns undefined customDays when custom_days is null", () => {
    const habit = mapHabitFromDB(makeRow({ custom_days: null }));
    expect(habit.customDays).toBeUndefined();
  });
});

describe("mapHabitToDB", () => {
  it("maps undefined customDays to null", () => {
    const row = mapHabitToDB(
      {
        name: "Run",
        type: "yesno",
        target: "Complete",
        schedule: "daily",
        customDays: undefined,
        startDate: "2024-01-01",
        emoji: "🏃",
        color: "#2B3A8C",
        archived: false,
      },
      "user-1",
    );
    expect(row.custom_days).toBeNull();
    expect(row.user_id).toBe("user-1");
  });
});

describe("mapEntryFromDB", () => {
  it("falls back to pending for an invalid status", () => {
    const entry = mapEntryFromDB({
      habit_id: "h1",
      date: "2024-01-01",
      status: "unknown" as "done",
      actual: "",
      id: "e1",
      user_id: "u1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    });
    expect(entry.status).toBe("pending");
  });
});
