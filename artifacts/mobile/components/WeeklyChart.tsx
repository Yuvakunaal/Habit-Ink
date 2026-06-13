import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const BAR_MAX_H = 70;

export function WeeklyChart() {
  const colors = useColors();
  const font = useFont();
  const { getCompletionForDate } = useHabits();

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = toDateKey(d);
    const { done, total } = getCompletionForDate(key);
    const pct = total === 0 ? 0 : done / total;
    const isToday = i === 6;
    return { key, done, total, pct, isToday, label: DAY_LABELS[d.getDay()] };
  });

  const hasAnyData = days.some((d) => d.total > 0);

  if (!hasAnyData) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontFamily: font.body, fontSize: font.size(14), color: colors.mutedForeground }}>
          No data yet — start tracking to see your week.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {days.map((day) => {
        const barH = day.total === 0 ? 4 : Math.max(4, day.pct * BAR_MAX_H);
        const barColor =
          day.pct >= 1
            ? colors.success
            : day.isToday
            ? colors.primary
            : colors.secondary;

        return (
          <View key={day.key} style={styles.col}>
            <View style={[styles.barWrap, { height: BAR_MAX_H }]}>
              {/* track */}
              <View
                style={[
                  styles.track,
                  {
                    height: day.total > 0 ? BAR_MAX_H : 4,
                    backgroundColor: colors.muted,
                    borderRadius: 6,
                  },
                ]}
              />
              {/* fill */}
              {day.pct > 0 && (
                <View
                  style={[
                    styles.fill,
                    {
                      height: barH,
                      backgroundColor: barColor,
                      borderRadius: 6,
                    },
                  ]}
                />
              )}
              {/* today marker dot */}
              {day.isToday && (
                <View
                  style={[
                    styles.todayDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
            {day.total > 0 && (
              <Text
                style={{
                  fontFamily: font.body,
                  fontSize: font.size(11),
                  color: colors.mutedForeground,
                  marginTop: 2,
                  textAlign: "center",
                }}
              >
                {day.done}/{day.total}
              </Text>
            )}
            <Text
              style={{
                fontFamily: day.isToday ? font.label : font.body,
                fontSize: font.size(12),
                color: day.isToday ? colors.primary : colors.mutedForeground,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  col: {
    flex: 1,
    alignItems: "center",
  },
  barWrap: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  track: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  fill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  todayDot: {
    position: "absolute",
    top: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  empty: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
