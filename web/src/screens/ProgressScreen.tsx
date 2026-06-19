import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompletionRing } from "@/components/CompletionRing";
import { MonthHeatmap } from "@/components/MonthHeatmap";
import { WeeklyChart } from "@/components/WeeklyChart";
import { isScheduledForDate, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsWide } from "@/hooks/useIsDesktop";


function StatCard({ label, value, color, icon, trend }: { label: string; value: string | number; color?: string; icon?: string; trend?: { diff: number } }) {
  const colors = useColors();
  const font = useFont();
  const trendColor = trend ? (trend.diff > 0 ? colors.success : trend.diff < 0 ? colors.accent : colors.mutedForeground) : undefined;
  return (
    <div style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, backgroundColor: colors.card }}>
      {icon && <span style={{ fontSize: 18, marginBottom: 4 }}>{icon}</span>}
      <span style={{ ...font.heading, fontSize: font.size(24), color: color ?? colors.primary }}>{value}</span>
      {trend && (
        <span style={{ ...font.label, fontSize: font.size(10), color: trendColor, backgroundColor: trendColor + "18", borderRadius: 8, paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2 }}>
          {trend.diff > 0 ? "▲" : trend.diff < 0 ? "▼" : "="} {Math.abs(trend.diff)}% vs last mo
        </span>
      )}
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
    <div style={{ display: "flex", flexDirection: "row", border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10, backgroundColor: colors.card }}>
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

function RefreshButton() {
  const colors = useColors();
  const { refetchAll } = useHabits();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    refetchAll();
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <button
      onClick={handleRefresh}
      title="Refresh progress"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: colors.primary + "12",
        border: `1px solid ${colors.primary}25`,
        cursor: "pointer", flexShrink: 0,
        animation: spinning ? "spin 0.4s linear" : undefined,
      }}
    >
      <RefreshCw size={14} color={colors.primary} />
    </button>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const font = useFont();
  const { habits, entries, getCompletionForDate } = useHabits();
  const isWide = useIsWide();
  const navigate = useNavigate();

  // All stat computation is memoized — only re-runs when habits or entries change
  const stats = useMemo(() => {
    const today = toDateKey(new Date());
    const { done: todayDone, total: todayTotal } = getCompletionForDate(today);

    let globalStreak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const { done, total } = getCompletionForDate(toDateKey(d));
      if (total === 0) continue;
      if (done > 0) globalStreak++;
      else break;
    }

    let totalScheduled = 0;
    let totalDone = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const { done, total } = getCompletionForDate(toDateKey(d));
      totalScheduled += total;
      totalDone += done;
    }
    const rate30 = totalScheduled === 0 ? 0 : Math.round((totalDone / totalScheduled) * 100);

    // Month-over-month comparison
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    let thisDone = 0, thisSched = 0, lastDone = 0, lastSched = 0;
    for (let i = 0; i < 62; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const { done, total } = getCompletionForDate(key);
      if (d >= thisMonthStart && d <= now) { thisDone += done; thisSched += total; }
      else if (d >= lastMonthStart && d <= lastMonthEnd) { lastDone += done; lastSched += total; }
    }
    const thisRate = thisSched === 0 ? null : Math.round((thisDone / thisSched) * 100);
    const lastRate = lastSched === 0 ? null : Math.round((lastDone / lastSched) * 100);
    const momDiff = thisRate !== null && lastRate !== null ? thisRate - lastRate : null;

    // All-time lifetime stats
    let bestStreakEver = 0;
    let curStreakRun = 0;
    let perfectDays = 0;
    let allTimeDoneTotal = 0;
    let allTimeSchedTotal = 0;
    for (let i = 0; i < 730; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const { done, total } = getCompletionForDate(key);
      if (total === 0) continue;
      allTimeDoneTotal += done; allTimeSchedTotal += total;
      if (done > 0) { curStreakRun++; if (curStreakRun > bestStreakEver) bestStreakEver = curStreakRun; }
      else curStreakRun = 0;
      if (done >= total) perfectDays++;
    }
    const allTimeRate = allTimeSchedTotal === 0 ? null : Math.round((allTimeDoneTotal / allTimeSchedTotal) * 100);
    const totalCheckIns = Object.values(entries).flat().filter((e) => e.status === "done").length;

    const habitStats = habits.map((habit) => {
      let streak = 0;
      let longestStreak = 0;
      let currentRun = 0;
      let done30 = 0;
      let sched30 = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
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

    // Day-of-week analysis
    const DOW_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dowData = Array.from({ length: 7 }, () => ({ done: 0, total: 0 }));
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const dow = d.getDay();
      const { done, total } = getCompletionForDate(key);
      if (total > 0) { dowData[dow].done += done; dowData[dow].total += total; }
    }
    const dowRates = dowData.map((s, i) => ({
      dow: i, rate: s.total === 0 ? -1 : Math.round((s.done / s.total) * 100),
    }));
    const bestDow = [...dowRates].filter((d) => d.rate >= 0).sort((a, b) => b.rate - a.rate)[0];

    let thisWeekDone = 0, thisWeekSched = 0, lastWeekDone = 0, lastWeekSched = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const { done, total } = getCompletionForDate(toDateKey(d));
      thisWeekDone += done; thisWeekSched += total;
    }
    for (let i = 7; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const { done, total } = getCompletionForDate(toDateKey(d));
      lastWeekDone += done; lastWeekSched += total;
    }
    const thisWeekRate = thisWeekSched === 0 ? null : Math.round((thisWeekDone / thisWeekSched) * 100);
    const lastWeekRate = lastWeekSched === 0 ? null : Math.round((lastWeekDone / lastWeekSched) * 100);

    const topHabitRow = [...habitStats].sort((a, b) => b.pct30 - a.pct30)[0];
    const insights: string[] = [];
    if (bestDow && bestDow.rate > 0) {
      insights.push(`You're most consistent on ${DOW_NAMES[bestDow.dow]}s — ${bestDow.rate}% completion average`);
    }
    if (topHabitRow && topHabitRow.pct30 > 0) {
      const streakText = topHabitRow.streak > 0 ? ` · ${topHabitRow.streak}-day streak` : "";
      insights.push(`${topHabitRow.habit.emoji} ${topHabitRow.habit.name} is your #1 habit (${topHabitRow.pct30}% rate${streakText})`);
    }
    if (totalCheckIns > 0) {
      insights.push(`You've logged ${totalCheckIns} total check-in${totalCheckIns !== 1 ? "s" : ""} — every one counts`);
    }
    if (thisWeekRate !== null && lastWeekRate !== null) {
      const weekDiff = thisWeekRate - lastWeekRate;
      if (weekDiff >= 0) {
        insights.push(`This week (${thisWeekRate}%) is tracking ahead of last week (${lastWeekRate}%) ↑`);
      } else {
        insights.push(`Last week was ${lastWeekRate}% — this week at ${thisWeekRate}% so far, keep going`);
      }
    }

    return {
      todayDone, todayTotal, globalStreak, rate30, momDiff,
      allTimeRate, totalCheckIns, bestStreakEver, perfectDays,
      habitStats, insights,
    };
  }, [habits, entries, getCompletionForDate]);

  const {
    todayDone, todayTotal, globalStreak, rate30, momDiff,
    allTimeRate, totalCheckIns, bestStreakEver, perfectDays,
    habitStats, insights,
  } = stats;

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

  const insightsSection = insights.length > 0 ? (
    <div style={{ marginTop: 16, border: `1px solid ${colors.border}`, borderRadius: 14, padding: "18px 20px", backgroundColor: colors.card }}>
      <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 14, textTransform: "uppercase" as const }}>
        💡 Insights
      </span>
      {insights.map((insight, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < insights.length - 1 ? 10 : 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 7, flexShrink: 0 }} />
          <span style={{ ...font.body, fontSize: font.size(13), color: colors.foreground, lineHeight: 1.5 }}>{insight}</span>
        </div>
      ))}
    </div>
  ) : null;

  if (habits.length === 0) {
    return (
      <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ paddingLeft: isWide ? 28 : 16, paddingRight: isWide ? 28 : 16, paddingTop: 18, paddingBottom: 14, borderBottom: `1px solid ${colors.line}`, flexShrink: 0, display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
          <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Progress</span>
        </div>
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <span style={{ fontSize: 52, marginBottom: 16 }}>📈</span>
          <p style={{ ...font.heading, fontSize: font.size(24), color: colors.foreground, margin: "0 0 8px", textAlign: "center" }}>
            Your progress story starts here
          </p>
          <p style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 320 }}>
            Once you add habits and start tracking, you'll see streaks, charts, and insights right here.
          </p>
          {/* Preview cards */}
          <div style={{ display: "flex", flexDirection: isWide ? "row" : "column", gap: 10, width: "100%", maxWidth: 420, marginBottom: 28 }}>
            {[
              { emoji: "🔥", label: "Daily streaks",      desc: "See how many days in a row you've kept going" },
              { emoji: "📊", label: "Weekly charts",      desc: "Visualise your completion rate over the past 7 days" },
              { emoji: "💡", label: "Smart insights",     desc: "Discover your best day of the week and top habit" },
            ].map((card, i) => (
              <div key={i} style={{
                flex: 1, padding: "14px 16px", borderRadius: 14,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.card,
                display: "flex", flexDirection: isWide ? "column" : "row",
                alignItems: isWide ? "center" : "flex-start",
                gap: 10,
              }}>
                <span style={{ fontSize: 24 }}>{card.emoji}</span>
                <div style={{ textAlign: isWide ? "center" : "left" }}>
                  <p style={{ ...font.label, fontSize: font.size(13), color: colors.foreground, margin: "0 0 2px" }}>{card.label}</p>
                  <p style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, margin: 0, lineHeight: 1.4 }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/habits")}
            style={{
              ...font.label, fontSize: font.size(15), fontWeight: 600,
              color: colors.primaryForeground, backgroundColor: colors.primary,
              border: "none", borderRadius: 12,
              padding: "13px 32px", cursor: "pointer",
            }}
          >
            Add your first habit →
          </button>
        </div>
      </div>
    );
  }

  const allTimeStatsRow = (
    <div style={{ display: "grid", gridTemplateColumns: isWide ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 8, marginBottom: 16 }}>
      <StatCard label="Total Check-ins" value={totalCheckIns} color={colors.success} icon="✅" />
      <StatCard label="Best Streak" value={`${bestStreakEver}d`} color={colors.primary} icon="🔥" />
      <StatCard label="Perfect Days" value={perfectDays} color="#F4C430" icon="⭐" />
      <StatCard label="All-time Rate" value={allTimeRate !== null ? `${allTimeRate}%` : "—"} icon="📈" />
    </div>
  );

  if (isWide) {
    return (
      <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 18, paddingBottom: 14, borderBottom: `1px solid ${colors.line}`, flexShrink: 0, display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
          <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Progress</span>
          <RefreshButton />
        </div>
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 28px 40px" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 16, marginBottom: 16 }}>
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
                  <StatCard label="30-Day Rate" value={`${rate30}%`} icon="📈" trend={momDiff !== null ? { diff: momDiff } : undefined} />
                  <StatCard label="Total Habits" value={habits.length} icon="📝" />
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 20, backgroundColor: colors.card }}>
                  <span style={{ ...font.label, fontSize: font.size(11), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 16, textTransform: "uppercase" as const }}>Last 7 Days</span>
                  <WeeklyChart />
                </div>
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 20, backgroundColor: colors.card, flex: 1 }}>
                  <span style={{ ...font.label, fontSize: font.size(11), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 16, textTransform: "uppercase" as const }}>15-Week Activity</span>
                  <MonthHeatmap />
                </div>
              </div>
            </div>
            {allTimeStatsRow}
            {habitBreakdown}
            {insightsSection}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 12, flexShrink: 0, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Progress</span>
        <RefreshButton />
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
          <StatCard label="30-Day Rate" value={`${rate30}%`} icon="📈" trend={momDiff !== null ? { diff: momDiff } : undefined} />
          <StatCard label="Total Habits" value={habits.length} icon="📝" />
        </div>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, marginBottom: 12, backgroundColor: colors.card }}>
          <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 14 }}>LAST 7 DAYS</span>
          <WeeklyChart />
        </div>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, marginBottom: 12, backgroundColor: colors.card, overflow: "hidden" }}>
          <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 14 }}>15-WEEK ACTIVITY</span>
          <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
            <div style={{ minWidth: 400 }}>
              <MonthHeatmap />
            </div>
          </div>
        </div>
        <span style={{ ...font.label, fontSize: font.size(11), color: colors.mutedForeground, letterSpacing: 1, display: "block", marginBottom: 8, textTransform: "uppercase" as const }}>
          All-Time Stats
        </span>
        {allTimeStatsRow}
        {habitBreakdown}
        {insightsSection}
      </div>
    </div>
  );
}
