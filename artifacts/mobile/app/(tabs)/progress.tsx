import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CompletionRing } from "@/components/CompletionRing";
import { MonthHeatmap } from "@/components/MonthHeatmap";
import { WeeklyChart } from "@/components/WeeklyChart";
import { isScheduledForDate, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

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
    <View style={{ flexDirection: "row", gap: 4 }}>
      {dots.map((status, i) => {
        const bg =
          status === "skip"
            ? "transparent"
            : status === "done"
            ? colors.success
            : status === "missed"
            ? colors.accent
            : colors.muted;
        const border = status === "skip" ? "transparent" : colors.border;
        return (
          <View
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: bg,
              borderWidth: status === "pending" ? 1 : 0,
              borderColor: border,
            }}
          />
        );
      })}
    </View>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
}) {
  const colors = useColors();
  const font = useFont();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {icon && (
        <Text style={{ fontSize: 18, marginBottom: 4 }}>{icon}</Text>
      )}
      <Text
        style={{
          fontFamily: font.heading,
          fontSize: font.size(24),
          color: color ?? colors.primary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: font.body,
          fontSize: font.size(12),
          color: colors.mutedForeground,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { habits, entries, getCompletionForDate } = useHabits();

  const topPad = insets.top;
  const today = toDateKey(new Date());
  const { done: todayDone, total: todayTotal } = getCompletionForDate(today);

  // Overall 7-day streak (any habit done)
  let globalStreak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const { done, total } = getCompletionForDate(key);
    if (total === 0) continue;
    if (done > 0) globalStreak++;
    else break;
  }

  // 30-day completion rate
  let totalScheduled = 0;
  let totalDone = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const { done, total } = getCompletionForDate(toDateKey(d));
    totalScheduled += total;
    totalDone += done;
  }
  const rate30 =
    totalScheduled === 0
      ? 0
      : Math.round((totalDone / totalScheduled) * 100);

  // Per-habit stats
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
    const pct30 =
      sched30 === 0 ? 0 : Math.round((done30 / sched30) * 100);
    return { habit, streak, longestStreak, done30, sched30, pct30 };
  });

  if (habits.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View style={styles.titleRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text
              style={{
                fontFamily: font.heading,
                fontSize: font.size(28),
                color: colors.primary,
              }}
            >
              Progress
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
        </View>
        <View style={[styles.rule, { backgroundColor: colors.line }]} />
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
          <Text
            style={{
              fontFamily: font.heading,
              fontSize: font.size(22),
              color: colors.foreground,
              marginTop: 4,
            }}
          >
            No habits yet
          </Text>
          <Text
            style={{
              fontFamily: font.body,
              fontSize: font.size(16),
              color: colors.mutedForeground,
              textAlign: "center",
              marginTop: 6,
              lineHeight: 24,
            }}
          >
            Add some habits to start{"\n"}tracking your progress.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text
            style={{
              fontFamily: font.heading,
              fontSize: font.size(28),
              color: colors.primary,
            }}
          >
            Progress
          </Text>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </View>
      </View>
      <View style={[styles.rule, { backgroundColor: colors.line }]} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: Platform.OS === "web" ? 84 + 32 : insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Completion Ring */}
        <View
          style={[
            styles.ringSection,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              fontFamily: font.label,
              fontSize: font.size(12),
              color: colors.mutedForeground,
              letterSpacing: 1,
              marginBottom: 14,
            }}
          >
            TODAY'S COMPLETION
          </Text>
          <CompletionRing
            done={todayDone}
            total={todayTotal}
            size={160}
            label="done today"
          />
          <View style={styles.ringStats}>
            <View style={styles.ringStat}>
              <Text
                style={{
                  fontFamily: font.heading,
                  fontSize: font.size(26),
                  color: colors.success,
                }}
              >
                🔥 {globalStreak}
              </Text>
              <Text
                style={{
                  fontFamily: font.body,
                  fontSize: font.size(12),
                  color: colors.mutedForeground,
                }}
              >
                day streak
              </Text>
            </View>
            <View
              style={[styles.ringStatDiv, { backgroundColor: colors.border }]}
            />
            <View style={styles.ringStat}>
              <Text
                style={{
                  fontFamily: font.heading,
                  fontSize: font.size(26),
                  color: colors.primary,
                }}
              >
                {rate30}%
              </Text>
              <Text
                style={{
                  fontFamily: font.body,
                  fontSize: font.size(12),
                  color: colors.mutedForeground,
                }}
              >
                30-day rate
              </Text>
            </View>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.statRow}>
          <StatCard
            label="Today Done"
            value={`${todayDone}/${todayTotal}`}
            color={colors.success}
            icon="✅"
          />
          <StatCard label="30-Day Rate" value={`${rate30}%`} icon="📈" />
          <StatCard label="Total Habits" value={habits.length} icon="📝" />
        </View>

        {/* Weekly chart */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              fontFamily: font.label,
              fontSize: font.size(12),
              color: colors.mutedForeground,
              letterSpacing: 1,
              marginBottom: 14,
            }}
          >
            LAST 7 DAYS
          </Text>
          <WeeklyChart />
        </View>

        {/* Activity heatmap */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              fontFamily: font.label,
              fontSize: font.size(12),
              color: colors.mutedForeground,
              letterSpacing: 1,
              marginBottom: 14,
            }}
          >
            15-WEEK ACTIVITY
          </Text>
          <MonthHeatmap />
        </View>

        {/* Per-habit breakdown */}
        <Text
          style={[
            styles.sectionHeading,
            {
              fontFamily: font.label,
              fontSize: font.size(12),
              color: colors.mutedForeground,
            },
          ]}
        >
          HABIT BREAKDOWN
        </Text>

        {habitStats.map(
          ({ habit, streak, longestStreak, done30, sched30, pct30 }) => (
            <View
              key={habit.id}
              style={[
                styles.habitCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Color bar */}
              <View
                style={[styles.habitCardBar, { backgroundColor: habit.color }]}
              />

              <View style={{ flex: 1 }}>
                <View style={styles.habitCardTop}>
                  <View style={styles.habitCardLeft}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <Text style={{ fontSize: 20 }}>{habit.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: font.label,
                          fontSize: font.size(17),
                          color: colors.foreground,
                        }}
                        numberOfLines={1}
                      >
                        {habit.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: font.size(13),
                        color: colors.mutedForeground,
                      }}
                    >
                      {habit.target ? `Target: ${habit.target}` : habit.type}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.streakBadge,
                      {
                        backgroundColor:
                          streak > 0 ? habit.color + "20" : colors.muted,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: font.heading,
                        fontSize: font.size(15),
                        color:
                          streak > 0 ? habit.color : colors.mutedForeground,
                      }}
                    >
                      🔥 {streak}
                    </Text>
                  </View>
                </View>

                <Last7Dots habitId={habit.id} />

                {/* Progress bar */}
                <View style={{ marginTop: 10 }}>
                  <View
                    style={[styles.progressTrack, { backgroundColor: colors.muted }]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${pct30}%`,
                          backgroundColor:
                            pct30 >= 80
                              ? colors.success
                              : pct30 >= 50
                              ? habit.color
                              : colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: font.size(12),
                        color: colors.mutedForeground,
                      }}
                    >
                      {done30}/{sched30} days (30d)
                    </Text>
                    <Text
                      style={{
                        fontFamily: font.label,
                        fontSize: font.size(12),
                        color:
                          pct30 >= 80 ? colors.success : colors.mutedForeground,
                      }}
                    >
                      {pct30}%
                    </Text>
                  </View>
                </View>

                <View style={styles.miniStats}>
                  <View
                    style={[styles.miniStat, { backgroundColor: colors.muted }]}
                  >
                    <Text
                      style={{
                        fontFamily: font.heading,
                        fontSize: font.size(16),
                        color: habit.color,
                      }}
                    >
                      {streak}
                    </Text>
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: font.size(11),
                        color: colors.mutedForeground,
                      }}
                    >
                      streak
                    </Text>
                  </View>
                  <View
                    style={[styles.miniStat, { backgroundColor: colors.muted }]}
                  >
                    <Text
                      style={{
                        fontFamily: font.heading,
                        fontSize: font.size(16),
                        color: habit.color,
                      }}
                    >
                      {longestStreak}
                    </Text>
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: font.size(11),
                        color: colors.mutedForeground,
                      }}
                    >
                      best
                    </Text>
                  </View>
                  <View
                    style={[styles.miniStat, { backgroundColor: colors.muted }]}
                  >
                    <Text
                      style={{
                        fontFamily: font.heading,
                        fontSize: font.size(16),
                        color: habit.color,
                      }}
                    >
                      {pct30}%
                    </Text>
                    <Text
                      style={{
                        fontFamily: font.body,
                        fontSize: font.size(11),
                        color: colors.mutedForeground,
                      }}
                    >
                      30d rate
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  rule: { height: 1 },
  scroll: { paddingHorizontal: 14, paddingTop: 14 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  ringSection: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  ringStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  ringStat: { flex: 1, alignItems: "center" },
  ringStatDiv: { width: 1, height: 40 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 2,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeading: { letterSpacing: 1, marginBottom: 10 },
  habitCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    padding: 0,
  },
  habitCardBar: { width: 4 },
  habitCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingTop: 12,
    paddingRight: 12,
    paddingLeft: 12,
  },
  habitCardLeft: { flex: 1, marginRight: 10 },
  streakBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginHorizontal: 12 },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 12,
  },
  miniStats: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  miniStat: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
});
