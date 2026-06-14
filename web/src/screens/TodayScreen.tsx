import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Circle,
  Settings,
  Feather as FeatherIcon,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { EntryStatus, HabitType, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useSettings } from "@/context/SettingsContext";

const QUOTES = [
  { text: "Small steps every day lead to big changes.", author: "Anonymous" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Aristotle" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Progress, not perfection.", author: "Anonymous" },
  { text: "Good habits are worth being fanatical about.", author: "John Irving" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
];

function formatDisplayDate(date: Date): string {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const day = date.getDate();
  const suffix = [11, 12, 13].includes(day % 100)
    ? "th"
    : day % 10 === 1 ? "st"
    : day % 10 === 2 ? "nd"
    : day % 10 === 3 ? "rd"
    : "th";
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
}

function StatusBtn({ status, onPress }: { status: EntryStatus; onPress: () => void }) {
  const colors = useColors();
  const IconComp = status === "done" ? CheckCircle2 : status === "missed" ? XCircle : Circle;
  const color =
    status === "done" ? colors.success : status === "missed" ? colors.accent : colors.mutedForeground;

  return (
    <button
      onClick={onPress}
      style={{
        padding: 4,
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.1s",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <IconComp size={20} color={color} />
    </button>
  );
}

function CompletionBar({ done, total }: { done: number; total: number }) {
  const colors = useColors();
  const font = useFont();
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayPct(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  if (total === 0) return null;
  const barColor = pct === 100 ? colors.success : pct >= 60 ? colors.primary : colors.accent;
  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: colors.card }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ ...font.label, fontSize: font.size(13), color: colors.mutedForeground }}>Today's progress</span>
        <span style={{ ...font.heading, fontSize: font.size(16), color: barColor }}>{done}/{total} · {pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
        <div style={{ height: 6, borderRadius: 3, width: `${displayPct}%`, backgroundColor: barColor, transition: "width 0.65s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}

function toTimeValue(raw: string): string {
  if (!raw) return "";
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;
  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const period = (m[3] || "").toLowerCase();
  if (period === "pm" && h < 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  if (h > 23 || parseInt(min, 10) > 59) return "";
  return `${String(h).padStart(2, "0")}:${min}`;
}

function ActualCell({ initialValue, habitType, onSave }: {
  initialValue: string;
  habitType: HabitType;
  onSave: (v: string) => void;
}) {
  const colors = useColors();
  const font = useFont();
  const [value, setValue] = useState(initialValue);

  const baseStyle: React.CSSProperties = {
    ...font.body,
    fontSize: font.size(13),
    color: colors.foreground,
    padding: 4,
    width: "100%",
    textAlign: "center",
    background: "none",
    border: "none",
    outline: "none",
  };

  if (habitType === "number" || habitType === "decimal") {
    const allowDecimal = habitType === "decimal";
    return (
      <input
        autoFocus
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(value); return; }
          if (allowDecimal && e.key === ",") {
            e.preventDefault();
            if (!value.includes(".")) setValue((v) => v + ".");
            return;
          }
          const allow = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Home","End"];
          const allowedChars = allowDecimal ? /^[0-9.]$/ : /^[0-9]$/;
          if (!allow.includes(e.key) && !allowedChars.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
          }
          if (e.key === "." && value.includes(".")) e.preventDefault();
        }}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSave(value)}
        placeholder="0"
        style={baseStyle}
      />
    );
  }

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSave(value.trim())}
      onKeyDown={(e) => e.key === "Enter" && onSave(value.trim())}
      placeholder="—"
      style={baseStyle}
    />
  );
}


function AutoTextarea({
  value,
  onChange,
  placeholder,
  style,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.max(80, ref.current.scrollHeight) + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ overflow: "hidden", resize: "none", ...style }}
    />
  );
}

export default function TodayScreen() {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { theme } = useSettings();
  const {
    getHabitsForDate,
    getEntry,
    setEntryStatus,
    setEntryActual,
    updateJournal,
    journals,
    getDayNumber,
  } = useHabits();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const dateKey = toDateKey(currentDate);
  const habitsToday = getHabitsForDate(dateKey);
  const journal = journals[dateKey] ?? { date: dateKey, wakeUpTime: "", notes: "", wins: "", challenges: "" };
  const isToday = toDateKey(currentDate) === toDateKey(new Date());

  const doneCount = habitsToday.filter((h) => getEntry(h.id, dateKey)?.status === "done").length;
  const missedCount = habitsToday.filter((h) => getEntry(h.id, dateKey)?.status === "missed").length;

  const navigate2 = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    if (d <= new Date()) {
      setCurrentDate(d);
      setEditingId(null);
    }
  };

  const cycleStatus = useCallback(
    (habitId: string, current?: EntryStatus) => {
      const next: EntryStatus = current === "done" ? "missed" : current === "missed" ? "pending" : "done";
      setEntryStatus(habitId, dateKey, next);
    },
    [dateKey, setEntryStatus]
  );

  const todayDate = new Date();
  const quote = QUOTES[todayDate.getDate() % QUOTES.length];

  const textareaBase: React.CSSProperties = {
    ...font.body,
    fontSize: font.size(16),
    color: colors.foreground,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: 10,
    width: "100%",
    minHeight: 80,
    backgroundColor: colors.card,
    lineHeight: 1.5,
    outline: "none",
    display: "block",
  };

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: isDesktop ? 800 : undefined, margin: isDesktop ? "0 auto" : undefined, padding: isDesktop ? "20px 28px 40px" : "16px 16px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <button onClick={() => navigate2(-1)} style={{ padding: 8, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "none", border: "none" }}>
            <ChevronLeft size={22} color={colors.mutedForeground} />
          </button>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
            <span style={{ ...font.heading, fontSize: font.size(30), color: colors.primary }}>Daily Tracker</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => navigate2(1)}
              disabled={isToday}
              style={{ padding: 8, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: isToday ? "default" : "pointer", background: "none", border: "none", opacity: isToday ? 0 : 1 }}
            >
              <ChevronRight size={22} color={colors.mutedForeground} />
            </button>
            {!isDesktop && (
              <button onClick={() => navigate("/settings")} style={{ padding: 8, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "none", border: "none" }}>
                <Settings size={19} color={colors.mutedForeground} />
              </button>
            )}
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: colors.line, marginBottom: 12 }} />

        {/* Date + Day */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 8, gap: 4 }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <span style={{ ...font.label, fontSize: font.size(16), color: colors.primary }}>Date: </span>
            <span style={{ ...font.body, fontSize: font.size(16), color: colors.foreground }}>{formatDisplayDate(currentDate)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <span style={{ ...font.label, fontSize: font.size(16), color: colors.primary }}>Day: </span>
            <span style={{ ...font.body, fontSize: font.size(16), color: colors.foreground }}>Day {getDayNumber(currentDate)}</span>
          </div>
        </div>

        {/* Wake-up time */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 14px", marginBottom: 12, gap: 10 }}>
          <Clock size={15} color={colors.primary} style={{ flexShrink: 0 }} />
          <span style={{ ...font.label, fontSize: font.size(14), color: colors.primary, flexShrink: 0 }}>Wake-up</span>
          <input
            type="time"
            value={toTimeValue(journal.wakeUpTime)}
            onChange={(e) => updateJournal(dateKey, { wakeUpTime: e.target.value })}
            style={{
              ...font.body,
              fontSize: font.size(15),
              color: colors.foreground,
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              colorScheme: theme === "midnight" ? "dark" : "light",
              cursor: "pointer",
            } as React.CSSProperties}
          />
        </div>

        {/* Progress bar */}
        <CompletionBar done={doneCount} total={habitsToday.length} />

        {/* Habit table */}
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 10, backgroundColor: colors.card }}>
          {/* Table header */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "stretch", backgroundColor: colors.primary + "10", borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ flex: 4, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.primary, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 10px", display: "flex", alignItems: "center" }}>Habit</span>
            <div style={{ width: 1, backgroundColor: colors.border }} />
            <span style={{ flex: 2, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>Target</span>
            <div style={{ width: 1, backgroundColor: colors.border }} />
            <span style={{ width: 56, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>Done</span>
            <div style={{ width: 1, backgroundColor: colors.border }} />
            <span style={{ flex: 2.5, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>Actual</span>
          </div>

          {habitsToday.length === 0 ? (
            <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>📓</span>
              <span style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.5 }}>
                No habits scheduled for today.
              </span>
              <button
                onClick={() => navigate("/habits")}
                style={{
                  marginTop: 4,
                  display: "flex", flexDirection: "row", alignItems: "center", gap: 6,
                  paddingLeft: 18, paddingRight: 18, paddingTop: 10, paddingBottom: 10,
                  borderRadius: 22,
                  backgroundColor: colors.primary,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span style={{ ...font.label, fontSize: font.size(14), color: "#fff", fontWeight: 600 }}>Go to Habits</span>
                <span style={{ color: "#fff", fontSize: 14, lineHeight: 1 }}>→</span>
              </button>
            </div>
          ) : (
            habitsToday.map((habit, idx) => {
              const entry = getEntry(habit.id, dateKey);
              const isLast = idx === habitsToday.length - 1;
              const isEditing = editingId === habit.id;
              const isHovered = hoveredRow === habit.id;
              const statusColor =
                entry?.status === "done" ? colors.success
                : entry?.status === "missed" ? colors.accent
                : "transparent";
              return (
                <div
                  key={habit.id}
                  onMouseEnter={() => setHoveredRow(habit.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                    minHeight: 50,
                    borderBottom: isLast ? "none" : `1px solid ${colors.border}`,
                    borderLeft: `3px solid ${habit.color}`,
                    backgroundColor: isHovered ? colors.primary + "06" : "transparent",
                    transition: "background-color 0.12s ease",
                  }}
                >
                  {/* Habit name */}
                  <div style={{ flex: 4, padding: "10px 10px", display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{habit.emoji}</span>
                    <span style={{ ...font.body, fontSize: font.size(14), color: colors.foreground, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {habit.name}
                    </span>
                  </div>
                  <div style={{ width: 1, backgroundColor: colors.border }} />
                  {/* Target */}
                  <div style={{ flex: 2, padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                      {habit.target || "Yes"}
                    </span>
                  </div>
                  <div style={{ width: 1, backgroundColor: colors.border }} />
                  {/* Status */}
                  <div style={{ width: 56, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <StatusBtn status={entry?.status ?? "pending"} onPress={() => cycleStatus(habit.id, entry?.status)} />
                  </div>
                  <div style={{ width: 1, backgroundColor: colors.border }} />
                  {/* Actual */}
                  <div
                    style={{ flex: 2.5, padding: "10px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setEditingId(isEditing ? null : habit.id)}
                  >
                    {isEditing ? (
                      <ActualCell
                        habitType={habit.type}
                        initialValue={entry?.actual ?? ""}
                        onSave={(v) => { setEntryActual(habit.id, dateKey, v); setEditingId(null); }}
                      />
                    ) : (
                      <span style={{ ...font.body, fontSize: font.size(13), color: entry?.actual ? colors.foreground : colors.mutedForeground, textAlign: "center" }}>
                        {entry?.actual || "—"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary strip */}
        {habitsToday.length > 0 && (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", border: `1px solid ${colors.border}`, borderRadius: 10, marginBottom: 4, paddingTop: 10, paddingBottom: 10, backgroundColor: colors.card }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={15} color={colors.success} />
              <span style={{ ...font.label, fontSize: font.size(14), color: colors.success, marginLeft: 4 }}>{doneCount} done</span>
            </div>
            <div style={{ width: 1, height: 18, backgroundColor: colors.border }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <XCircle size={15} color={colors.accent} />
              <span style={{ ...font.label, fontSize: font.size(14), color: colors.accent, marginLeft: 4 }}>{missedCount} missed</span>
            </div>
            <div style={{ width: 1, height: 18, backgroundColor: colors.border }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Clock size={15} color={colors.mutedForeground} />
              <span style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, marginLeft: 4 }}>{habitsToday.length - doneCount - missedCount} left</span>
            </div>
          </div>
        )}

        <div style={{ height: 1, backgroundColor: colors.line, margin: "16px 0" }} />

        {/* Quote */}
        {isToday && (
          <div style={{ border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.primary}`, borderRadius: 10, padding: 14, marginBottom: 4 }}>
            <FeatherIcon size={14} color={colors.primary} style={{ marginBottom: 6 }} />
            <p style={{ ...font.body, fontSize: font.size(15), color: colors.foreground, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
              "{quote.text}"
            </p>
            <p style={{ ...font.label, fontSize: font.size(13), color: colors.primary, marginTop: 6, marginBottom: 0 }}>
              — {quote.author}
            </p>
          </div>
        )}

        {/* Notes */}
        <p style={{ ...font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6, marginTop: isToday ? 16 : 0 }}>Notes:</p>
        <AutoTextarea
          value={journal.notes}
          onChange={(e) => updateJournal(dateKey, { notes: e.target.value })}
          placeholder="Today's thoughts..."
          style={textareaBase}
        />

        <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", gap: isDesktop ? 12 : 0, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ ...font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6, marginTop: 0 }}>Wins & Reflections:</p>
            <AutoTextarea
              value={journal.wins}
              onChange={(e) => updateJournal(dateKey, { wins: e.target.value })}
              placeholder="What went well?"
              style={textareaBase}
            />
          </div>
          <div style={{ flex: 1, marginTop: isDesktop ? 0 : 8 }}>
            <p style={{ ...font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6, marginTop: 0 }}>Challenges:</p>
            <AutoTextarea
              value={journal.challenges}
              onChange={(e) => updateJournal(dateKey, { challenges: e.target.value })}
              placeholder="What was challenging?"
              style={textareaBase}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
