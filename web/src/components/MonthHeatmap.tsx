import React, { useRef, useState, useLayoutEffect } from "react";
import { toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const WEEKS = 15;
const DAYS_SHOWN = WEEKS * 7;
const GAP = 3;
const DAY_LABEL_W = 14;
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function MonthHeatmap() {
  const colors = useColors();
  const font = useFont();
  const { getCompletionForDate } = useHabits();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(10);

  // Compute before first paint so there's no initial overflow flash
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = (width: number) => {
      // WEEKS gaps total: 14 between week cols + 1 between day-label col and first week col
      const available = width - DAY_LABEL_W - 4 - WEEKS * GAP;
      const size = Math.max(10, Math.min(22, Math.floor(available / WEEKS)));
      setCellSize(size);
    };
    compute(el.offsetWidth);
    const ro = new ResizeObserver((entries) => compute(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const today = new Date();

  const buildGrid = () => {
    const startDay = new Date(today);
    startDay.setDate(startDay.getDate() - (DAYS_SHOWN - 1));
    const startDow = startDay.getDay();

    const flat: Array<{
      key: string; pct: number; hasData: boolean; isToday: boolean; date: Date;
    } | null> = Array(startDow).fill(null);

    for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const { done, total } = getCompletionForDate(key);
      flat.push({ key, pct: total === 0 ? 0 : done / total, hasData: total > 0, isToday: i === 0, date: new Date(d) });
    }

    const cols: Array<typeof flat> = [];
    for (let i = 0; i < flat.length; i += 7) cols.push(flat.slice(i, i + 7));
    return cols;
  };

  const grid = buildGrid();

  // Month labels: show label when a column contains the 1st–7th of a month
  const monthLabels: Array<{ colIdx: number; label: string }> = [];
  grid.forEach((week, wi) => {
    const first = week.find((c) => c !== null);
    if (first && first.date.getDate() <= 7) {
      monthLabels.push({ colIdx: wi, label: MONTH_ABBR[first.date.getMonth()] });
    }
  });

  const getCellColor = (pct: number, hasData: boolean, isToday: boolean): string => {
    if (isToday && !hasData) return colors.muted;
    if (!hasData) return colors.muted + "40";
    if (pct === 0) return colors.accent + "60";
    if (pct < 0.5) return colors.secondary + "70";
    if (pct < 1) return colors.primary + "90";
    return colors.success;
  };

  // Summary counts
  let perfect = 0, partial = 0, missed = 0;
  grid.forEach((week) =>
    week.forEach((cell) => {
      if (!cell || !cell.hasData) return;
      if (cell.pct >= 1) perfect++;
      else if (cell.pct > 0) partial++;
      else missed++;
    })
  );

  const colW = cellSize + GAP;

  return (
    <div ref={containerRef}>
      {/* Month label row */}
      <div style={{ display: "flex", flexDirection: "row", paddingLeft: DAY_LABEL_W + 4, marginBottom: 4, height: 14 }}>
        {grid.map((_, wi) => {
          const ml = monthLabels.find((m) => m.colIdx === wi);
          return (
            <div key={wi} style={{ width: colW, flexShrink: 0, overflow: "visible" }}>
              {ml && (
                <span style={{ ...font.body, fontSize: 9, color: colors.mutedForeground, whiteSpace: "nowrap" }}>
                  {ml.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: "flex", flexDirection: "row", gap: GAP }}>
        {/* Day-of-week labels */}
        <div style={{ display: "flex", flexDirection: "column", width: DAY_LABEL_W, flexShrink: 0, marginRight: 4 }}>
          {DAY_LABELS.map((d, i) => (
            <div key={i} style={{ height: cellSize + GAP, display: "flex", alignItems: "center" }}>
              <span style={{ ...font.body, fontSize: 9, color: colors.mutedForeground }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Week columns */}
        {grid.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            {Array.from({ length: 7 }).map((_, di) => {
              const cell = week[di];
              return (
                <div
                  key={di}
                  title={cell ? (cell.hasData ? `${cell.key} · ${Math.round(cell.pct * 100)}%` : cell.key) : undefined}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: Math.max(2, Math.round(cellSize / 4)),
                    backgroundColor: cell
                      ? getCellColor(cell.pct, cell.hasData, cell.isToday)
                      : "transparent",
                    border: cell?.isToday ? `1.5px solid ${colors.primary}` : "none",
                    cursor: cell ? "default" : undefined,
                    transition: "background-color 0.2s",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer: legend + mini-stats, wraps to two rows on narrow containers */}
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", rowGap: 6, columnGap: 8, marginTop: 10 }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 3 }}>
          <span style={{ ...font.body, fontSize: font.size(10), color: colors.mutedForeground, marginRight: 4 }}>Less</span>
          {[
            colors.muted + "40",
            colors.accent + "60",
            colors.secondary + "70",
            colors.primary + "90",
            colors.success,
          ].map((c, i) => (
            <div key={i} style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: c }} />
          ))}
          <span style={{ ...font.body, fontSize: font.size(10), color: colors.mutedForeground, marginLeft: 4 }}>More</span>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <span style={{ ...font.body, fontSize: font.size(10), color: colors.success }}>✓ {perfect} perfect</span>
          <span style={{ ...font.body, fontSize: font.size(10), color: colors.mutedForeground }}>~ {partial} partial</span>
          <span style={{ ...font.body, fontSize: font.size(10), color: colors.accent }}>✗ {missed} missed</span>
        </div>
      </div>
    </div>
  );
}
