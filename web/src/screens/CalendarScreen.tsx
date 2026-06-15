import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { isScheduledForDate, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsWide } from "@/hooks/useIsDesktop";

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

function AnimatedBar({ pct, barColor }: { pct: number; barColor: string }) {
  const colors = useColors();
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDisplay(pct), 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ height: 6, flex: 1, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
      <div style={{ height: 6, borderRadius: 3, width: `${display}%`, backgroundColor: barColor, transition: "width 0.65s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </div>
  );
}

interface CalendarGridProps {
  year: number;
  month: number;
  firstDow: number;
  daysInMonth: number;
  todayKey: string;
  selected: string | null;
  showDots?: boolean;
  getCompletionForDate: (dk: string) => { done: number; total: number };
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  font: ReturnType<typeof import("@/hooks/useFont").useFont>;
  onSelect: (dk: string) => void;
}

const CalendarGrid = React.memo(function CalendarGrid({
  year, month, firstDow, daysInMonth, todayKey, selected,
  showDots, getCompletionForDate, colors, font, onSelect,
}: CalendarGridProps) {
  const cells = useMemo(() => {
    return Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isFuture = dk > todayKey;
      const { done, total } = isFuture ? { done: 0, total: 0 } : getCompletionForDate(dk);
      const dotColor = !isFuture && total > 0
        ? (done === total ? colors.success : done > 0 ? colors.secondary : colors.accent)
        : null;
      const bgTint = !isFuture
        ? (total === 0 ? "none" : done === total ? colors.success + "22" : done > 0 ? colors.secondary + "22" : colors.accent + "15")
        : "none";
      return { day, dk, isFuture, dotColor, bgTint };
    });
  }, [year, month, daysInMonth, todayKey, getCompletionForDate, colors]);

  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginBottom: showDots ? 12 : 16 }}>
      {Array.from({ length: firstDow }).map((_, i) => (
        <div key={`empty-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />
      ))}
      {cells.map(({ day, dk, isFuture, dotColor, bgTint }) => {
        const isToday = dk === todayKey;
        const isSelected = dk === selected;
        return (
          <button
            key={dk}
            onClick={() => onSelect(dk)}
            aria-label={`${day} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month]} ${year}`}
            aria-pressed={isSelected}
            style={{
              width: `${100 / 7}%`,
              aspectRatio: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: isSelected ? colors.primary : showDots ? "none" : bgTint,
              border: isToday && !isSelected ? `1.5px solid ${colors.primary}` : "none",
              borderRadius: showDots ? 20 : 18,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span style={{
              ...font.body,
              fontSize: font.size(showDots ? 17 : 14),
              color: isSelected ? colors.primaryForeground : isFuture ? colors.mutedForeground : colors.foreground,
            }}>
              {day}
            </span>
            {showDots && dotColor && !isSelected && (
              <div style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: dotColor, marginTop: 2 }} />
            )}
          </button>
        );
      })}
    </div>
  );
});

export default function CalendarScreen() {
  const colors = useColors();
  const font = useFont();
  const { habits, entries, getCompletionForDate, getHabitsForDate } = useHabits();
  const isWide = useIsWide();

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
  const atCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const nextMonth = () => {
    if (atCurrentMonth) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };
  const jumpToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelected(toDateKey(today));
  };

  const selectedHabits = selected ? getHabitsForDate(selected) : [];
  const selectedCompletion = selected ? getCompletionForDate(selected) : { done: 0, total: 0 };

  // Desktop legend items — use tints to match the calendar cell appearance
  const desktopLegendItems = [
    { bg: colors.success + "22", label: "All done" },
    { bg: colors.secondary + "22", label: "Partial" },
    { bg: colors.accent + "15", label: "Missed" },
  ];

  if (isWide) {
    return (
      <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 18, paddingBottom: 14, borderBottom: `1px solid ${colors.line}`, flexShrink: 0 }}>
          <p style={{ ...font.heading, fontSize: font.size(30), color: colors.primary, margin: 0 }}>Calendar</p>
        </div>

        {/* 2-panel body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden" }}>

          {/* Left panel: calendar grid */}
          <div
            className="hide-scrollbar"
            style={{
              width: 340,
              flexShrink: 0,
              overflowY: "auto",
              padding: "16px 20px 32px",
              borderRight: `1px solid ${colors.border}`,
            }}
          >
            {/* Month nav */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button onClick={prevMonth} style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
                <ChevronLeft size={20} color={colors.foreground} />
              </button>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <span style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground }}>
                  {MONTHS[month]} {year}
                </span>
                {!atCurrentMonth && (
                  <button
                    onClick={jumpToToday}
                    style={{
                      ...font.body, fontSize: font.size(11),
                      color: colors.primary,
                      backgroundColor: colors.primary + "12",
                      border: `1px solid ${colors.primary}28`,
                      borderRadius: 20, paddingLeft: 10, paddingRight: 10,
                      paddingTop: 3, paddingBottom: 3,
                      cursor: "pointer", lineHeight: 1.5,
                    }}
                  >
                    ← Today
                  </button>
                )}
              </div>
              <button onClick={nextMonth} disabled={atCurrentMonth} style={{ padding: 8, background: "none", border: "none", cursor: atCurrentMonth ? "default" : "pointer", opacity: atCurrentMonth ? 0.25 : 1 }}>
                <ChevronRight size={20} color={colors.foreground} />
              </button>
            </div>

            {/* Weekday headers */}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", marginBottom: 4 }}>
              {WEEKDAYS.map((d) => (
                <span key={d} style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground, width: `${100/7}%`, textAlign: "center", display: "block" }}>{d}</span>
              ))}
            </div>

            {/* Calendar grid */}
            <CalendarGrid
              year={year} month={month} firstDow={firstDow} daysInMonth={daysInMonth}
              todayKey={todayKey} selected={selected}
              getCompletionForDate={getCompletionForDate}
              colors={colors} font={font}
              onSelect={(dk) => setSelected(dk === selected ? null : dk)}
            />

            {/* Legend — use tinted rectangles to match the calendar cells */}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 14 }}>
              {desktopLegendItems.map((item) => (
                <div key={item.label} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, height: 14, borderRadius: 5, backgroundColor: item.bg, border: `1px solid ${colors.border}` }} />
                  <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: day detail or upcoming */}
          <div
            className="hide-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "28px 36px 32px",
            }}
          >
            {selected ? (
              <div>
                <p style={{ ...font.heading, fontSize: font.size(26), color: colors.primary, marginBottom: 6 }}>
                  {new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                {selectedCompletion.total > 0 && (
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <AnimatedBar
                      key={selected}
                      pct={Math.round((selectedCompletion.done / selectedCompletion.total) * 100)}
                      barColor={selectedCompletion.done === selectedCompletion.total ? colors.success : colors.primary}
                    />
                    <span style={{ ...font.label, fontSize: font.size(14), color: colors.mutedForeground, flexShrink: 0 }}>
                      {selectedCompletion.done}/{selectedCompletion.total}
                    </span>
                  </div>
                )}
                {selectedHabits.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 }}>
                    <span style={{ fontSize: 40 }}>📅</span>
                    <p style={{ ...font.body, fontSize: font.size(16), color: colors.mutedForeground, textAlign: "center" }}>
                      No habits scheduled for this day.
                    </p>
                  </div>
                ) : (
                  selectedHabits.map((h) => {
                    const entry = (entries[selected!] ?? []).find((e) => e.habitId === h.id);
                    const status = entry?.status ?? "pending";
                    const statusColor = status === "done" ? colors.success : status === "missed" ? colors.accent : colors.mutedForeground;
                    const statusSymbol = status === "done" ? "✓" : status === "missed" ? "✗" : "○";
                    return (
                      <div
                        key={h.id}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingTop: 12,
                          paddingBottom: 12,
                          borderBottom: `1px solid ${colors.line}`,
                        }}
                      >
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{h.emoji}</span>
                        <span style={{ ...font.body, fontSize: font.size(15), color: colors.foreground, flex: 1 }}>{h.name}</span>
                        {h.target && h.target !== "Complete" && (
                          <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground }}>{h.target}</span>
                        )}
                        <span style={{ ...font.label, fontSize: font.size(15), color: statusColor, flexShrink: 0 }}>{statusSymbol}</span>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div>
                <p style={{ ...font.label, fontSize: font.size(13), color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>
                  Upcoming — Next 7 Days
                </p>
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const dk = toDateKey(d);
                  const dayHabits = habits.filter((h) => isScheduledForDate(h, dk));
                  if (dayHabits.length === 0) return null;
                  return (
                    <button
                      key={dk}
                      onClick={() => { setYear(d.getFullYear()); setMonth(d.getMonth()); setSelected(dk); }}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 14,
                        paddingBottom: 14,
                        marginBottom: 10,
                        width: "100%",
                        backgroundColor: colors.card,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ ...font.heading, fontSize: font.size(17), color: colors.primary }}>
                        {i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      <span style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground }}>
                        {dayHabits.length} habit{dayHabits.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout (unchanged)
  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 16, paddingBottom: 12, borderBottom: `1px solid ${colors.line}`, flexShrink: 0 }}>
        <p style={{ ...font.heading, fontSize: font.size(30), color: colors.primary, marginBottom: 8, margin: 0 }}>Calendar</p>
        <div style={{ height: 1, backgroundColor: colors.line, marginTop: 8 }} />
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "12px 16px 32px" }}>
        {/* Month nav */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingLeft: 4, paddingRight: 4 }}>
          <button onClick={prevMonth} style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={22} color={colors.foreground} />
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <span style={{ ...font.heading, fontSize: font.size(22), color: colors.foreground }}>
              {MONTHS[month]} {year}
            </span>
            {!atCurrentMonth && (
              <button
                onClick={jumpToToday}
                style={{
                  ...font.body, fontSize: font.size(12),
                  color: colors.primary,
                  backgroundColor: colors.primary + "12",
                  border: `1px solid ${colors.primary}28`,
                  borderRadius: 20, paddingLeft: 12, paddingRight: 12,
                  paddingTop: 4, paddingBottom: 4,
                  cursor: "pointer", lineHeight: 1.5,
                }}
              >
                ← Today
              </button>
            )}
          </div>
          <button onClick={nextMonth} disabled={atCurrentMonth} style={{ padding: 8, background: "none", border: "none", cursor: atCurrentMonth ? "default" : "pointer", opacity: atCurrentMonth ? 0.25 : 1 }}>
            <ChevronRight size={22} color={colors.foreground} />
          </button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", marginBottom: 4 }}>
          {WEEKDAYS.map((d) => (
            <span key={d} style={{ ...font.label, fontSize: font.size(14), color: colors.mutedForeground, width: `${100/7}%`, textAlign: "center", display: "block" }}>{d}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <CalendarGrid
          year={year} month={month} firstDow={firstDow} daysInMonth={daysInMonth}
          todayKey={todayKey} selected={selected} showDots
          getCompletionForDate={getCompletionForDate}
          colors={colors} font={font}
          onSelect={(dk) => setSelected(dk === selected ? null : dk)}
        />

        {/* Legend — same tinted rectangles as desktop */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 12 }}>
          {[
            { bg: colors.success + "22", label: "All done" },
            { bg: colors.secondary + "22", label: "Partial" },
            { bg: colors.accent + "15", label: "Missed" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
              <div style={{ width: 18, height: 14, borderRadius: 5, backgroundColor: item.bg, border: `1px solid ${colors.border}` }} />
              <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, backgroundColor: colors.line, marginBottom: 16 }} />

        {/* Selected day detail */}
        {selected && (
          <div style={{ paddingBottom: 16 }}>
            <p style={{ ...font.heading, fontSize: font.size(22), color: colors.primary, marginBottom: 4 }}>
              {new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            {selectedCompletion.total > 0 && (
              <p style={{ ...font.body, fontSize: font.size(16), color: colors.mutedForeground, marginBottom: 12 }}>
                {selectedCompletion.done} / {selectedCompletion.total} completed
              </p>
            )}
            {selectedHabits.length === 0 ? (
              <p style={{ ...font.body, fontSize: font.size(16), color: colors.mutedForeground }}>No habits scheduled for this day.</p>
            ) : (
              selectedHabits.map((h) => {
                const entry = (entries[selected!] ?? []).find((e) => e.habitId === h.id);
                const status = entry?.status ?? "pending";
                const statusColor = status === "done" ? colors.success : status === "missed" ? colors.accent : colors.mutedForeground;
                const statusSymbol = status === "done" ? "✓" : status === "missed" ? "✗" : "○";
                return (
                  <div key={h.id} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10, paddingBottom: 10, borderBottom: `1px solid ${colors.line}` }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{h.emoji}</span>
                    <span style={{ ...font.body, fontSize: font.size(16), color: colors.foreground, flex: 1 }}>{h.name}</span>
                    <span style={{ ...font.label, fontSize: font.size(16), color: statusColor, flexShrink: 0 }}>{statusSymbol}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Upcoming habits */}
        {!selected && (
          <div style={{ paddingBottom: 16 }}>
            <p style={{ ...font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 10 }}>Upcoming (next 7 days)</p>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const dk = toDateKey(d);
              const dayHabits = habits.filter((h) => isScheduledForDate(h, dk));
              if (dayHabits.length === 0) return null;
              return (
                <button
                  key={dk}
                  onClick={() => { setYear(d.getFullYear()); setMonth(d.getMonth()); setSelected(dk); }}
                  style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", border: `1px solid ${colors.border}`, borderRadius: 6, paddingLeft: 14, paddingRight: 14, paddingTop: 12, paddingBottom: 12, marginBottom: 8, width: "100%", backgroundColor: colors.card, cursor: "pointer" }}
                >
                  <span style={{ ...font.heading, fontSize: font.size(18), color: colors.primary }}>
                    {i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground }}>
                    {dayHabits.length} habit{dayHabits.length !== 1 ? "s" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
