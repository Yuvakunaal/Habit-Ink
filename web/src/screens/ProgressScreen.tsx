import React, { useEffect, useState } from "react";
import { CompletionRing } from "@/components/CompletionRing";
import { MonthHeatmap } from "@/components/MonthHeatmap";
import { WeeklyChart } from "@/components/WeeklyChart";
import { isScheduledForDate, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsWide } from "@/hooks/useIsDesktop";

function Last7Dots({ habitId }: { habitId: string }) {
  const colors = useColors();
  const { habits, entries } = useHabits();
  const habit = habits.find((h) => h.id === habitId);
  const dots = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = toDateKey(d);
    const scheduled = habit ? isScheduledForDate(habit, key) : false;
    if (!scheduled) return "skip";
    const entry = (entries[key] ?? []).find((e) => e.habitId === habitId);
    return entry?.status ?? "pending";
  });

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 4 }}>
      {dots.map((status, i) => {
        const bg =
          status === "skip" ? "transparent"
          : status === "done" ? colors.success
          : status === "missed" ? colors.accent
          : colors.muted;
        return (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: bg, border: status === "pending" ? `1px solid ${colors.border}` : "none" }} />
        );
      })}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color?: string; icon?: string }) {
  const colors = useColors();
  const font = useFont();
  return (
    <div style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, backgroundColor: colors.card }}>
      {icon && <span style={{ fontSize: 18, marginBottom: 4 }}>{icon}</span>}
      <span style={{ ...font.heading, fontSize: font.size(24), color: color ?? colors.primary }}>{value}</span>
      <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, textAlign: "center" }}>{label}</span>
    </div>
  );
}

interface BreakdownRowProps {
  habit: ReturnType<typeof useHabits>["habits"][number];
  streak: number;
  longestStreak: number;
  done30: number;
  sched30: number;
  pct30: number;
}

function HabitBreakdownRow({ habit, streak, longestStreak, done30, sched30, pct30 }: BreakdownRowProps) {
  const colors = useColors();
  const font = useFont();
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayPct(pct30), 120);
    return () => clearTimeout(t);
  }, [pct30]);

  const barColor = displayPct >= 80 ? colors.success : displayPct >= 50 ? habit.color : colors.accent;

  return (
    <div
      style={{ display: "flex", flexDirection: "row", border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10, backgroundColor: colors.card }}
    >
      <div style={{ width: 4, backgroundColor: habit.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 12, paddingRight: 12, paddingLeft: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, marginRight: 10 }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 20 }}>{habit.emoji}</span>
              <span style={{ ...font.label, fontSize: font.size(17), color: colors.foreground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{habit.name}</span>
            </div>
            <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground }}>
              {habit.target ? `Target: ${habit.target}` : habit.type}
            </span>
          </div>
          <div style={{ backgroundColor: streak > 0 ? habit.color + "20" : colors.muted, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, borderRadius: 12, flexShrink: 0 }}>
            <span style={{ ...font.heading, fontSize: font.size(15), color: streak > 0 ? habit.color : colors.mutedForeground }}>🔥 {streak}</span>
          </div>
        </div>
        <div style={{ paddingLeft: 12, paddingRight: 12 }}>
          <Last7Dots habitId={habit.id} />
        </div>
        <div style={{ marginTop: 10, paddingLeft: 12, paddingRight: 12 }}>
          <div style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
            <div style={{ height: 6, borderRadius: 3, width: `${displayPct}%`, backgroundColor: barColor, transition: "width 0.65s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>{done30}/{sched30} days (30d)</span>
            <span style={{ ...font.label, fontSize: font.size(12), color: pct30 >= 80 ? colors.success : colors.mutedForeground }}>{pct30}%</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 6, marginTop: 10, marginBottom: 12, paddingLeft: 12, paddingRight: 12 }}>
          {[
            { val: streak, lbl: "streak" },
            { val: longestStreak, lbl: "best" },
            { val: `${pct30}%`, lbl: "30d rate" },
          ].map(({ val, lbl }) => (
            <div key={lbl} style={{ flex: 1, borderRadius: 8, padding: 8, backgroundColor: colors.muted, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ ...font.heading, fontSize: font.size(16), color: habit.color }}>{val}</span>
              <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const font = useFont();
  const { habits, entries, getCompletionForDate } = useHabits();
  const isWide = useIsWide();

  const today = toDateKey(new Date());
  const { done: todayDone, total: todayTotal } = getCompletionForDate(today);

  let globalStreak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const { done, total } = getCompletionForDate(toDateKey(d));
    if (total === 0) continue;
    if (done > 0) globalStreak++;
    else break;
  }

  let totalScheduled = 0;
  let totalDone = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const { done, total } = getCompletionForDate(toDateKey(d));
    totalScheduled += total;
    totalDone += done;
  }
  const rate30 = totalScheduled === 0 ? 0 : Math.round((totalDone / totalScheduled) * 100);

  const habitStats = habits.map((habit) => {
    let streak = 0;
    let longestStreak = 0;
    let currentRun = 0;
    let done30 = 0;
    let sched30 = 0;

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      if (!isScheduledForDate(habit, key)) continue;
      sched30++;
      const entry = (entries[key] ?? []).find((e) => e.habitId === habit.id);
      const isDone = entry?.status === "done";
      if (isDone) done30++;
      if (isDone) {
        currentRun++;
        if (i === 0 || currentRun > 1) streak = currentRun;
      } else {
        if (currentRun > longestStreak) longestStreak = currentRun;
        currentRun = 0;
      }
    }
    longestStreak = Math.max(longestStreak, currentRun);
    const pct30 = sched30 === 0 ? 0 : Math.round((done30 / sched30) * 100);
    return { habit, streak, longestStreak, done30, sched30, pct30 };
  });

  const habitBreakdown = (
    <>
      <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 10, textTransform: "uppercase" as const }}>
        Habit Breakdown
      </span>
      {habitStats.map((row) => (
        <HabitBreakdownRow key={row.habit.id} {...row} />
      ))}
    </>
  );

  if (habits.length === 0) {
    return (
      <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ paddingLeft: isWide ? 28 : 16, paddingRight: isWide ? 28 : 16, paddingTop: 18, paddingBottom: 14, borderBottom: `1px solid ${colors.line}`, flexShrink: 0 }}>
          <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Progress</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <span style={{ fontSize: 48, marginBottom: 12 }}>📊</span>
          <p style={{ ...font.heading, fontSize: font.size(22), color: colors.foreground, marginTop: 4 }}>No habits yet</p>
          <p style={{ ...font.body, fontSize: font.size(16), color: colors.mutedForeground, textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>
            Add some habits to start tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  if (isWide) {
    return (
      <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 18, paddingBottom: 14, borderBottom: `1px solid ${colors.line}`, flexShrink: 0 }}>
          <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Progress</span>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 28px 40px" }}>

            {/* Top 2-column row */}
            <div style={{ display: "flex", flexDirection: "row", gap: 16, marginBottom: 16 }}>

              {/* Left col: Ring + Stat cards */}
              <div style={{ flex: "0 0 42%", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: colors.card, flex: 1 }}>
                  <span style={{ ...font.label, fontSize: font.size(11), color: colors.mutedForeground, letterSpacing: 1, marginBottom: 16, textTransform: "uppercase" as const }}>
                    Today's Completion
                  </span>
                  <CompletionRing done={todayDone} total={todayTotal} size={160} label="done today" />
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 20, width: "100%" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ ...font.heading, fontSize: font.size(24), color: colors.success }}>🔥 {globalStreak}</span>
                      <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>day streak</span>
                    </div>
                    <div style={{ width: 1, height: 40, backgroundColor: colors.border }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ ...font.heading, fontSize: font.size(24), color: colors.primary }}>{rate30}%</span>
                      <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>30-day rate</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                  <StatCard label="Today Done" value={`${todayDone}/${todayTotal}`} color={colors.success} icon="✅" />
                  <StatCard label="30-Day Rate" value={`${rate30}%`} icon="📈" />
                  <StatCard label="Total Habits" value={habits.length} icon="📝" />
                </div>
              </div>

              {/* Right col: Weekly chart + Heatmap */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 20, backgroundColor: colors.card }}>
                  <span style={{ ...font.label, fontSize: font.size(11), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 16, textTransform: "uppercase" as const }}>
                    Last 7 Days
                  </span>
                  <WeeklyChart />
                </div>
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 20, backgroundColor: colors.card, flex: 1 }}>
                  <span style={{ ...font.label, fontSize: font.size(11), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 16, textTransform: "uppercase" as const }}>
                    15-Week Activity
                  </span>
                  <MonthHeatmap />
                </div>
              </div>
            </div>

            {habitBreakdown}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout (unchanged)
  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 12, flexShrink: 0 }}>
        <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary, display: "block", textAlign: "center" }}>Progress</span>
      </div>
      <div style={{ height: 1, backgroundColor: colors.line }} />

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 32px" }}>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 12, backgroundColor: colors.card }}>
          <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, letterSpacing: 1, marginBottom: 14 }}>TODAY'S COMPLETION</span>
          <CompletionRing done={todayDone} total={todayTotal} size={160} label="done today" />
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 16, width: "100%" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ ...font.heading, fontSize: font.size(26), color: colors.success }}>🔥 {globalStreak}</span>
              <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>day streak</span>
            </div>
            <div style={{ width: 1, height: 40, backgroundColor: colors.border }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ ...font.heading, fontSize: font.size(26), color: colors.primary }}>{rate30}%</span>
              <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>30-day rate</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <StatCard label="Today Done" value={`${todayDone}/${todayTotal}`} color={colors.success} icon="✅" />
          <StatCard label="30-Day Rate" value={`${rate30}%`} icon="📈" />
          <StatCard label="Total Habits" value={habits.length} icon="📝" />
        </div>

        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, marginBottom: 12, backgroundColor: colors.card }}>
          <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 14 }}>LAST 7 DAYS</span>
          <WeeklyChart />
        </div>

        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, marginBottom: 12, backgroundColor: colors.card }}>
          <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 14 }}>15-WEEK ACTIVITY</span>
          <MonthHeatmap />
        </div>

        {habitBreakdown}
      </div>
    </div>
  );
}
