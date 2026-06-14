import React, { useState, useEffect } from "react";
import { toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const BAR_MAX_H = 70;

export function WeeklyChart() {
  const colors = useColors();
  const font = useFont();
  const { getCompletionForDate } = useHabits();

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

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
      <div style={{ paddingTop: 16, paddingBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground }}>
          No data yet — start tracking to see your week.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
      {days.map((day) => {
        const barH = day.total === 0 ? 4 : Math.max(4, day.pct * BAR_MAX_H);
        const barColor =
          day.pct >= 1
            ? colors.success
            : day.isToday
            ? colors.primary
            : colors.secondary;

        return (
          <div key={day.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", height: BAR_MAX_H, position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {/* track */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: day.total > 0 ? BAR_MAX_H : 4,
                  backgroundColor: colors.muted,
                  borderRadius: 6,
                }}
              />
              {/* fill */}
              {day.pct > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: animated ? barH : 0,
                    backgroundColor: barColor,
                    borderRadius: 6,
                    transition: "height 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              )}
              {/* today dot */}
              {day.isToday && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </div>
            {day.total > 0 && (
              <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, marginTop: 2, textAlign: "center" }}>
                {day.done}/{day.total}
              </span>
            )}
            <span
              style={{
                ...(day.isToday ? font.label : font.body),
                fontSize: font.size(12),
                color: day.isToday ? colors.primary : colors.mutedForeground,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
