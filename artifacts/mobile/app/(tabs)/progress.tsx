import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isScheduledForDate, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";

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
    <View style={dotsStyles.row}>
      {dots.map((s, i) => (
        <View
          key={i}
          style={[
            dotsStyles.dot,
            {
              backgroundColor:
                s === "done"
                  ? colors.success
                  : s === "missed"
                  ? colors.accent
                  : s === "skip"
                  ? "transparent"
                  : colors.muted,
              borderWidth: s === "skip" ? 0 : 1,
              borderColor:
                s === "done"
                  ? colors.success
                  : s === "missed"
                  ? colors.accent
                  : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const dotsStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginTop: 4 },
  dot: { width: 18, height: 18, borderRadius: 9 },
});

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    habits,
    getStreak,
    getLongestStreak,
    getCompletionRate,
    getDayNumber,
    getCompletionForDate,
    getOverallStreak,
  } = useHabits();

  const todayKey = toDateKey(new Date());
  const todayCompletion = getCompletionForDate(todayKey);
  const overallStreak = getOverallStreak();
  const dayNumber = getDayNumber();
  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  const todayPct =
    todayCompletion.total === 0
      ? 0
      : Math.round((todayCompletion.done / todayCompletion.total) * 100);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 16, borderBottomColor: colors.line },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.primary }]}>
          Progress
        </Text>
        <Text style={[styles.screenSub, { color: colors.mutedForeground }]}>
          Day {dayNumber} of your journey
        </Text>
        <View style={[styles.rule, { backgroundColor: colors.line }]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.bigNum, { color: colors.primary }]}>
              {todayCompletion.done}/{todayCompletion.total}
            </Text>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              today
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.bigNum, { color: colors.primary }]}>
              {overallStreak}
            </Text>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              day streak
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.bigNum, { color: colors.primary }]}>
              {todayPct}%
            </Text>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              today
            </Text>
          </View>
        </View>

        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="trending-up" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add habits to start tracking your progress.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>
              Habit Breakdown
            </Text>
            {habits.map((habit) => {
              const streak = getStreak(habit.id);
              const longest = getLongestStreak(habit.id);
              const rate30 = getCompletionRate(habit.id, 30);
              const rate7 = getCompletionRate(habit.id, 7);

              return (
                <View
                  key={habit.id}
                  style={[
                    styles.habitCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.habitName, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>

                  {/* Last 7 days dots */}
                  <View style={styles.dotsRow}>
                    <Text
                      style={[styles.dotsLabel, { color: colors.mutedForeground }]}
                    >
                      Last 7 days:
                    </Text>
                    <Last7Dots habitId={habit.id} />
                  </View>

                  {/* Stats row */}
                  <View
                    style={[styles.statsBar, { borderTopColor: colors.line }]}
                  >
                    <View style={styles.statItem}>
                      <Text
                        style={[styles.statNum, { color: colors.primary }]}
                      >
                        {streak}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        streak
                      </Text>
                    </View>
                    <View
                      style={[styles.statDiv, { backgroundColor: colors.line }]}
                    />
                    <View style={styles.statItem}>
                      <Text
                        style={[styles.statNum, { color: colors.primary }]}
                      >
                        {longest}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        best
                      </Text>
                    </View>
                    <View
                      style={[styles.statDiv, { backgroundColor: colors.line }]}
                    />
                    <View style={styles.statItem}>
                      <Text
                        style={[styles.statNum, { color: colors.primary }]}
                      >
                        {rate7}%
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        7-day
                      </Text>
                    </View>
                    <View
                      style={[styles.statDiv, { backgroundColor: colors.line }]}
                    />
                    <View style={styles.statItem}>
                      <Text
                        style={[styles.statNum, { color: colors.primary }]}
                      >
                        {rate30}%
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        30-day
                      </Text>
                    </View>
                  </View>

                  {/* 30-day progress bar */}
                  <View
                    style={[styles.rateBar, { backgroundColor: colors.muted }]}
                  >
                    <View
                      style={[
                        styles.rateFill,
                        {
                          backgroundColor:
                            rate30 >= 80
                              ? colors.success
                              : rate30 >= 50
                              ? colors.secondary
                              : colors.accent,
                          width: `${rate30}%` as any,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  screenTitle: { fontFamily: "Caveat_700Bold", fontSize: 30, marginBottom: 2 },
  screenSub: { fontFamily: "Caveat_400Regular", fontSize: 16, marginBottom: 8 },
  rule: { height: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  bigNum: { fontFamily: "Caveat_700Bold", fontSize: 28 },
  cardLabel: { fontFamily: "Caveat_400Regular", fontSize: 13, marginTop: 2 },
  emptyState: { alignItems: "center", paddingTop: 48, gap: 12 },
  emptyText: {
    fontFamily: "Caveat_400Regular",
    fontSize: 17,
    textAlign: "center",
  },
  sectionLabel: {
    fontFamily: "Caveat_700Bold",
    fontSize: 22,
    marginBottom: 12,
  },
  habitCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  habitName: { fontFamily: "Caveat_700Bold", fontSize: 20, marginBottom: 8 },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  dotsLabel: { fontFamily: "Caveat_400Regular", fontSize: 13 },
  statsBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 10,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontFamily: "Caveat_700Bold", fontSize: 20 },
  statLabel: { fontFamily: "Caveat_400Regular", fontSize: 12 },
  statDiv: { width: 1, marginHorizontal: 4 },
  rateBar: { height: 5, borderRadius: 3, overflow: "hidden" },
  rateFill: { height: 5, borderRadius: 3 },
});
