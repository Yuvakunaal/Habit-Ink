import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isScheduledForDate, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { habits, getCompletionForDate, getHabitsForDate } = useHabits();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(toDateKey(today));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);
  const todayKey = toDateKey(today);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const getDotColor = (dateKey: string): string | null => {
    const { done, total } = getCompletionForDate(dateKey);
    if (total === 0) return null;
    if (done === total) return colors.success;
    if (done > 0) return colors.secondary;
    return colors.accent;
  };

  const selectedHabits = selected ? getHabitsForDate(selected) : [];
  const selectedCompletion = selected ? getCompletionForDate(selected) : { done: 0, total: 0 };

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.line }]}>
        <Text style={[styles.screenTitle, { color: colors.primary, fontFamily: font.heading }]}>
          Calendar
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
        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={styles.navBtn}>
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.monthLabel, { color: colors.foreground }]}>
            {MONTHS[month]} {year}
          </Text>
          <Pressable onPress={nextMonth} style={styles.navBtn}>
            <Feather name="chevron-right" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={[styles.weekDay, { color: colors.mutedForeground }]}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {Array.from({ length: firstDow }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.cell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dk === todayKey;
            const isSelected = dk === selected;
            const isFuture = dk > todayKey;
            const dot = isFuture ? null : getDotColor(dk);

            return (
              <Pressable
                key={dk}
                style={[
                  styles.cell,
                  isSelected && {
                    backgroundColor: colors.primary,
                    borderRadius: 20,
                  },
                  isToday && !isSelected && {
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                    borderRadius: 20,
                  },
                ]}
                onPress={() => setSelected(dk === selected ? null : dk)}
              >
                <Text
                  style={[
                    styles.dayNum,
                    {
                      color: isSelected
                        ? colors.primaryForeground
                        : isFuture
                        ? colors.mutedForeground
                        : colors.foreground,
                    },
                  ]}
                >
                  {day}
                </Text>
                {dot && !isSelected ? (
                  <View style={[styles.dot, { backgroundColor: dot }]} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: colors.success, label: "All done" },
            { color: colors.secondary, label: "Partial" },
            { color: colors.accent, label: "Missed" },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.line }]} />

        {/* Selected day detail */}
        {selected && (
          <View style={styles.dayDetail}>
            <Text style={[styles.detailDate, { color: colors.primary }]}>
              {new Date(selected + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            {selectedCompletion.total > 0 && (
              <Text style={[styles.detailSummary, { color: colors.mutedForeground }]}>
                {selectedCompletion.done} / {selectedCompletion.total} completed
              </Text>
            )}

            {selectedHabits.length === 0 ? (
              <Text style={[styles.noHabits, { color: colors.mutedForeground }]}>
                No habits scheduled for this day.
              </Text>
            ) : (
              selectedHabits.map((h) => (
                <View
                  key={h.id}
                  style={[
                    styles.habitRow,
                    { borderBottomColor: colors.line },
                  ]}
                >
                  <Text style={[styles.habitName, { color: colors.foreground }]}>
                    {h.name}
                  </Text>
                  <Text style={[styles.habitTarget, { color: colors.mutedForeground }]}>
                    {h.target || "Yes"}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Upcoming habits */}
        {!selected && (
          <View style={styles.upcoming}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>
              Upcoming (next 7 days)
            </Text>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const dk = toDateKey(d);
              const dayHabits = habits.filter((h) =>
                isScheduledForDate(h, dk)
              );
              if (dayHabits.length === 0) return null;
              return (
                <Pressable
                  key={dk}
                  onPress={() => {
                    setYear(d.getFullYear());
                    setMonth(d.getMonth());
                    setSelected(dk);
                  }}
                  style={[
                    styles.upcomingRow,
                    { borderColor: colors.border, backgroundColor: colors.card },
                  ]}
                >
                  <Text style={[styles.upcomingDate, { color: colors.primary }]}>
                    {i === 0
                      ? "Today"
                      : i === 1
                      ? "Tomorrow"
                      : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </Text>
                  <Text style={[styles.upcomingCount, { color: colors.mutedForeground }]}>
                    {dayHabits.length} habit{dayHabits.length !== 1 ? "s" : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  screenTitle: { fontFamily: "Caveat_700Bold", fontSize: 30, marginBottom: 8 },
  rule: { height: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  navBtn: { padding: 8 },
  monthLabel: { fontFamily: "Caveat_700Bold", fontSize: 22 },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 4,
  },
  weekDay: { fontFamily: "Caveat_700Bold", fontSize: 14, width: 40, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: { fontFamily: "Caveat_400Regular", fontSize: 17 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Caveat_400Regular", fontSize: 13 },
  divider: { height: 1, marginBottom: 16 },
  dayDetail: { paddingBottom: 16 },
  detailDate: { fontFamily: "Caveat_700Bold", fontSize: 22, marginBottom: 4 },
  detailSummary: { fontFamily: "Caveat_400Regular", fontSize: 16, marginBottom: 12 },
  noHabits: { fontFamily: "Caveat_400Regular", fontSize: 16 },
  habitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  habitName: { fontFamily: "Caveat_400Regular", fontSize: 17, flex: 1 },
  habitTarget: { fontFamily: "Caveat_400Regular", fontSize: 15, marginLeft: 8 },
  upcoming: { paddingBottom: 16 },
  sectionLabel: { fontFamily: "Caveat_700Bold", fontSize: 20, marginBottom: 10 },
  upcomingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  upcomingDate: { fontFamily: "Caveat_700Bold", fontSize: 18 },
  upcomingCount: { fontFamily: "Caveat_400Regular", fontSize: 15 },
});
