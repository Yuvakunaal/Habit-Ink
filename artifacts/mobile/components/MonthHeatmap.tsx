import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const WEEKS = 15;
const DAYS_SHOWN = WEEKS * 7;
const CELL = 14;
const GAP = 3;
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function MonthHeatmap() {
  const colors = useColors();
  const font = useFont();
  const { getCompletionForDate } = useHabits();

  const today = new Date();

  const buildGrid = () => {
    const cells: Array<{
      key: string;
      pct: number;
      hasData: boolean;
      isToday: boolean;
      isFuture: boolean;
    } | null>[] = [];

    const startDow = (() => {
      const d = new Date(today);
      d.setDate(d.getDate() - (DAYS_SHOWN - 1));
      return d.getDay();
    })();

    const flat: Array<{
      key: string;
      pct: number;
      hasData: boolean;
      isToday: boolean;
      isFuture: boolean;
    } | null> = Array(startDow).fill(null);

    for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const { done, total } = getCompletionForDate(key);
      flat.push({
        key,
        pct: total === 0 ? 0 : done / total,
        hasData: total > 0,
        isToday: i === 0,
        isFuture: false,
      });
    }

    for (let i = 0; i < flat.length; i += 7) {
      cells.push(flat.slice(i, i + 7));
    }
    return cells;
  };

  const grid = buildGrid();

  const getCellColor = (
    pct: number,
    hasData: boolean,
    isToday: boolean
  ): string => {
    if (isToday && !hasData) return colors.muted;
    if (!hasData) return colors.muted + "40";
    if (pct === 0) return colors.accent + "60";
    if (pct < 0.5) return colors.secondary + "70";
    if (pct < 1) return colors.primary + "90";
    return colors.success;
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Day-of-week labels column */}
        <View style={styles.labelCol}>
          {DAY_LABELS.map((d, i) => (
            <View key={i} style={[styles.labelCell, { height: CELL + GAP }]}>
              <Text
                style={{
                  fontFamily: font.body,
                  fontSize: 9,
                  color: colors.mutedForeground,
                }}
              >
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Grid columns */}
        {grid.map((week, wi) => (
          <View key={wi} style={styles.weekCol}>
            {Array.from({ length: 7 }).map((_, di) => {
              const cell = week[di];
              return (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: cell
                        ? getCellColor(cell.pct, cell.hasData, cell.isToday)
                        : "transparent",
                      borderWidth: cell?.isToday ? 1.5 : 0,
                      borderColor: colors.primary,
                      borderRadius: 3,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text
          style={{
            fontFamily: font.body,
            fontSize: font.size(11),
            color: colors.mutedForeground,
            marginRight: 6,
          }}
        >
          Less
        </Text>
        {[
          colors.muted + "40",
          colors.accent + "60",
          colors.secondary + "70",
          colors.primary + "90",
          colors.success,
        ].map((c, i) => (
          <View
            key={i}
            style={[styles.legendCell, { backgroundColor: c, borderRadius: 2 }]}
          />
        ))}
        <Text
          style={{
            fontFamily: font.body,
            fontSize: font.size(11),
            color: colors.mutedForeground,
            marginLeft: 6,
          }}
        >
          More
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: "row",
    gap: GAP,
    paddingBottom: 4,
  },
  labelCol: {
    justifyContent: "flex-start",
    marginRight: 2,
  },
  labelCell: {
    justifyContent: "center",
    width: 10,
  },
  weekCol: {
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 3,
  },
  legendCell: {
    width: 12,
    height: 12,
  },
});
