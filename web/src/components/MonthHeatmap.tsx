import React from "react";
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
      });
    }

    const cols: Array<typeof flat> = [];
    for (let i = 0; i < flat.length; i += 7) {
      cols.push(flat.slice(i, i + 7));
    }
    return cols;
  };

  const grid = buildGrid();

  const getCellColor = (pct: number, hasData: boolean, isToday: boolean): string => {
    if (isToday && !hasData) return colors.muted;
    if (!hasData) return colors.muted + "40";
    if (pct === 0) return colors.accent + "60";
    if (pct < 0.5) return colors.secondary + "70";
    if (pct < 1) return colors.primary + "90";
    return colors.success;
  };

  return (
    <div>
      <div
        className="hide-scrollbar"
        style={{ overflowX: "auto", paddingBottom: 4 }}
      >
        <div style={{ display: "flex", flexDirection: "row", gap: GAP }}>
          {/* Day labels column */}
          <div style={{ display: "flex", flexDirection: "column", marginRight: 2 }}>
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                style={{ height: CELL + GAP, display: "flex", alignItems: "center", width: 10 }}
              >
                <span style={{ ...font.body, fontSize: 9, color: colors.mutedForeground }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Grid columns */}
          {grid.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week[di];
                return (
                  <div
                    key={di}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      backgroundColor: cell
                        ? getCellColor(cell.pct, cell.hasData, cell.isToday)
                        : "transparent",
                      border: cell?.isToday ? `1.5px solid ${colors.primary}` : "none",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 8, gap: 3 }}>
        <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, marginRight: 6 }}>Less</span>
        {[
          colors.muted + "40",
          colors.accent + "60",
          colors.secondary + "70",
          colors.primary + "90",
          colors.success,
        ].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c }} />
        ))}
        <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, marginLeft: 6 }}>More</span>
      </div>
    </div>
  );
}
