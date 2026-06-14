import React, { useEffect, useState } from "react";
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

export default function CalendarScreen() {
  const colors = useColors();
  const font = useFont();
  const { habits, getCompletionForDate, getHabitsForDate } = useHabits();
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

  const getDotColor = (dateKey: string): string | null => {
    const { done, total } = getCompletionForDate(dateKey);
    if (total === 0) return null;
    if (done === total) return colors.success;
    if (done > 0) return colors.secondary;
    return colors.accent;
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
              <span style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground }}>
                {MONTHS[month]} {year}
              </span>
              <button onClick={nextMonth} style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
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
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`empty-${i}`} style={{ width: `${100/7}%`, aspectRatio: 1 }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = dk === todayKey;
                const isSelected = dk === selected;
                const isFuture = dk > todayKey;
                const bgTint = !isFuture && !isSelected ? (() => {
                  const { done, total } = getCompletionForDate(dk);
                  if (total === 0) return "none";
                  if (done === total) return colors.success + "22";
                  if (done > 0) return colors.secondary + "22";
                  return colors.accent + "15";
                })() : "none";
                return (
                  <button
                    key={dk}
                    onClick={() => setSelected(dk === selected ? null : dk)}
                    style={{
                      width: `${100/7}%`,
                      aspectRatio: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isSelected ? colors.primary : bgTint,
                      border: isToday && !isSelected ? `1.5px solid ${colors.primary}` : "none",
                      borderRadius: 18,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <span style={{ ...font.body, fontSize: font.size(14), color: isSelected ? colors.primaryForeground : isFuture ? colors.mutedForeground : colors.foreground }}>
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>

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
                  selectedHabits.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 14,
                        paddingBottom: 14,
                        borderBottom: `1px solid ${colors.line}`,
                      }}
                    >
                      <span style={{ ...font.body, fontSize: font.size(16), color: colors.foreground, flex: 1 }}>{h.name}</span>
                      <span style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, marginLeft: 8 }}>{h.target || "Yes"}</span>
                    </div>
                  ))
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
          <span style={{ ...font.heading, fontSize: font.size(22), color: colors.foreground }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
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
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: `${100/7}%`, aspectRatio: 1 }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dk === todayKey;
            const isSelected = dk === selected;
            const isFuture = dk > todayKey;
            const dot = isFuture ? null : getDotColor(dk);

            return (
              <button
                key={dk}
                onClick={() => setSelected(dk === selected ? null : dk)}
                style={{
                  width: `${100/7}%`,
                  aspectRatio: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isSelected ? colors.primary : "none",
                  border: isToday && !isSelected ? `1.5px solid ${colors.primary}` : "none",
                  borderRadius: 20,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span style={{ ...font.body, fontSize: font.size(17), color: isSelected ? colors.primaryForeground : isFuture ? colors.mutedForeground : colors.foreground }}>
                  {day}
                </span>
                {dot && !isSelected ? (
                  <div style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: dot, marginTop: 2 }} />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 12 }}>
          {[
            { color: colors.success, label: "All done" },
            { color: colors.secondary, label: "Partial" },
            { color: colors.accent, label: "Missed" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
              <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground }}>{item.label}</span>
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
              selectedHabits.map((h) => (
                <div key={h.id} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", paddingTop: 10, paddingBottom: 10, borderBottom: `1px solid ${colors.line}` }}>
                  <span style={{ ...font.body, fontSize: font.size(17), color: colors.foreground, flex: 1 }}>{h.name}</span>
                  <span style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground, marginLeft: 8 }}>{h.target || "Yes"}</span>
                </div>
              ))
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
