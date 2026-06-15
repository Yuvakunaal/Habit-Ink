import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Circle,
  Settings, Feather as FeatherIcon, CheckCircle, Clock, Keyboard, GripVertical,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { EntryStatus, HabitType, isScheduledForDate, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { Confetti } from "@/components/Confetti";

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

const JOURNAL_PROMPTS = [
  { notes: "What's on your mind today?", wins: "What went really well?", challenges: "What held you back?" },
  { notes: "How did today unfold?", wins: "A small win worth celebrating?", challenges: "What drained your energy?" },
  { notes: "What were you thinking about most?", wins: "What are you proud of today?", challenges: "What felt hard?" },
  { notes: "Capture today in a few words…", wins: "What worked in your favour?", challenges: "What would you do differently?" },
  { notes: "How did you spend your attention today?", wins: "What made you smile?", challenges: "What needs work tomorrow?" },
  { notes: "What did today teach you?", wins: "A moment of progress…", challenges: "What surprised you?" },
  { notes: "What was the mood of today?", wins: "What are you grateful for?", challenges: "What felt unfinished?" },
];

const MILESTONES = [7, 14, 30, 60, 100, 200, 365];

function formatDisplayDate(date: Date): string {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const day = date.getDate();
  const suffix = [11,12,13].includes(day % 100) ? "th" : day%10===1 ? "st" : day%10===2 ? "nd" : day%10===3 ? "rd" : "th";
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
}

function StatusBtn({ status, onPress }: { status: EntryStatus; onPress: () => void }) {
  const colors = useColors();
  const IconComp = status === "done" ? CheckCircle2 : status === "missed" ? XCircle : Circle;
  const color = status === "done" ? colors.success : status === "missed" ? colors.accent : colors.mutedForeground;
  return (
    <button onClick={onPress} style={{ padding: 4, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.1s" }}
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
  useEffect(() => { const t = setTimeout(() => setDisplayPct(pct), 80); return () => clearTimeout(t); }, [pct]);
  if (total === 0) return null;
  const barColor = pct === 100 ? colors.success : pct >= 60 ? colors.primary : colors.accent;
  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: colors.card }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ ...font.label, fontSize: font.size(13), color: colors.mutedForeground }}>Today's progress</span>
        <span style={{ ...font.heading, fontSize: font.size(16), color: barColor }}>{done}/{total} · {pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
        <div style={{ height: 6, borderRadius: 3, width: `${displayPct}%`, backgroundColor: barColor, transition: "width 0.65s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function WeekStrip({ dateKey }: { dateKey: string }) {
  const colors = useColors();
  const font = useFont();
  const { getCompletionForDate } = useHabits();
  const DAY_LETTERS = ["Su","M","T","W","T","F","S"];
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = toDateKey(d);
    const { done, total } = getCompletionForDate(key);
    const isToday = key === dateKey;
    const pct = total === 0 ? -1 : done / total;
    return { key, pct, isToday, label: DAY_LETTERS[d.getDay()] };
  });
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 5, marginBottom: 12 }}>
      {days.map((day) => {
        const bg = day.pct < 0
          ? colors.muted + "60"
          : day.pct >= 1 ? colors.success
          : day.pct > 0 ? colors.primary + "55"
          : colors.accent + "35";
        const labelColor = day.isToday ? colors.primary : day.pct >= 1 ? "#fff" : colors.mutedForeground;
        return (
          <div key={day.key} style={{ flex: 1, paddingTop: 7, paddingBottom: 5, borderRadius: 9, backgroundColor: bg, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: day.isToday ? `2px solid ${colors.primary}` : "2px solid transparent", transition: "all 0.3s ease" }}>
            <span style={{ ...font.label, fontSize: font.size(10), color: labelColor, fontWeight: day.isToday ? 700 : 500 }}>{day.label}</span>
            {day.pct >= 0 && (
              <span style={{ fontSize: 8, color: day.pct >= 1 ? "#fff" : colors.mutedForeground, fontFamily: font.body.fontFamily }}>
                {day.pct >= 1 ? "✓" : day.pct > 0 ? `${Math.round(day.pct * 100)}%` : "✗"}
              </span>
            )}
          </div>
        );
      })}
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
  return `${String(h).padStart(2,"0")}:${min}`;
}

function ActualCell({ initialValue, habitType, onSave }: { initialValue: string; habitType: HabitType; onSave: (v: string) => void }) {
  const colors = useColors();
  const font = useFont();
  const [value, setValue] = useState(initialValue);
  const baseStyle: React.CSSProperties = { ...font.body, fontSize: font.size(13), color: colors.foreground, padding: 4, width: "100%", textAlign: "center", background: "none", border: "none", outline: "none" };
  if (habitType === "number" || habitType === "decimal") {
    const allowDecimal = habitType === "decimal";
    return (
      <input autoFocus type="text" inputMode={allowDecimal ? "decimal" : "numeric"} value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(value); return; }
          if (allowDecimal && e.key === ",") { e.preventDefault(); if (!value.includes(".")) setValue(v => v + "."); return; }
          const allow = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Home","End"];
          const allowedChars = allowDecimal ? /^[0-9.]$/ : /^[0-9]$/;
          if (!allow.includes(e.key) && !allowedChars.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
          if (e.key === "." && value.includes(".")) e.preventDefault();
        }}
        onChange={(e) => setValue(e.target.value)} onBlur={() => onSave(value)} placeholder="0" style={baseStyle} />
    );
  }
  return <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onBlur={() => onSave(value.trim())} onKeyDown={(e) => e.key === "Enter" && onSave(value.trim())} placeholder="—" style={baseStyle} />;
}

function AutoTextarea({ value, onChange, placeholder, style }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) { ref.current.style.height = "auto"; ref.current.style.height = Math.max(80, ref.current.scrollHeight) + "px"; }
  }, [value]);
  return <textarea ref={ref} value={value} onChange={onChange} placeholder={placeholder} style={{ overflow: "hidden", resize: "none", ...style }} />;
}

export default function TodayScreen() {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useIsDesktop();
  const { theme, customQuoteText, customQuoteAuthor } = useSettings();
  const { showToast } = useToast();
  const {
    getHabitsForDate, getEntry, setEntryStatus, setEntryActual,
    updateJournal, journals, getDayNumber, appStartDate, habits, entries,
  } = useHabits();

  const [currentDate, setCurrentDate] = useState(() => {
    const param = searchParams.get("date");
    if (param) {
      const d = new Date(param + "T12:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Clear the ?date= param from URL after it's been consumed
  useEffect(() => {
    if (searchParams.get("date")) setSearchParams({}, { replace: true });
  }, []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [focusedHabitIdx, setFocusedHabitIdx] = useState(-1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const confettiFiredRef = useRef<string | null>(null);

  // Persistent drag-to-reorder order (backed by Supabase via SettingsContext)
  const { habitOrder, setHabitOrder } = useSettings();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // Ref so drag handlers always see the latest order without stale closures
  const habitOrderRef = useRef(habitOrder);
  habitOrderRef.current = habitOrder;

  const dateKey = toDateKey(currentDate);
  const habitsToday = getHabitsForDate(dateKey).filter(h => !h.archived);

  // Apply saved order to today's scheduled habits
  const orderedHabits = [
    ...habitOrderRef.current
      .filter(id => habitsToday.some(h => h.id === id))
      .map(id => habitsToday.find(h => h.id === id)!),
    ...habitsToday.filter(h => !habitOrderRef.current.includes(h.id)),
  ].filter(Boolean) as typeof habitsToday;

  const journal = journals[dateKey] ?? { date: dateKey, wakeUpTime: "", intention: "", notes: "", wins: "", challenges: "" };
  const isToday = toDateKey(currentDate) === toDateKey(new Date());

  const doneCount = habitsToday.filter(h => getEntry(h.id, dateKey)?.status === "done").length;
  const missedCount = habitsToday.filter(h => getEntry(h.id, dateKey)?.status === "missed").length;

  const appStart = new Date(appStartDate + "T00:00:00");
  const atStart = toDateKey(currentDate) === appStartDate;

  const navigate2 = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    if (d <= new Date() && d >= appStart) { setCurrentDate(d); setEditingId(null); setFocusedHabitIdx(-1); }
  };

  const computeNewStreak = useCallback((habitId: string): number => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 1;
    let streak = 1;
    for (let i = 1; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      if (!isScheduledForDate(habit, key)) continue;
      const entry = (entries[key] ?? []).find(e => e.habitId === habitId);
      if (entry?.status === "done") streak++;
      else break;
    }
    return streak;
  }, [habits, entries]);

  const markHabit = useCallback((habitId: string, status: EntryStatus) => {
    if (status === "done") {
      const newStreak = computeNewStreak(habitId);
      if (MILESTONES.includes(newStreak)) {
        const name = habits.find(h => h.id === habitId)?.name ?? "habit";
        setTimeout(() => showToast(`🔥 ${newStreak}-day streak on "${name}"!`, "success"), 350);
      }
    }
    setEntryStatus(habitId, dateKey, status);
  }, [computeNewStreak, habits, showToast, setEntryStatus, dateKey]);

  const cycleStatus = useCallback((habitId: string, current?: EntryStatus) => {
    const next: EntryStatus = current === "done" ? "missed" : current === "missed" ? "pending" : "done";
    markHabit(habitId, next);
  }, [markHabit]);

  // Drag-to-reorder handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggingId || draggingId === overId) return;
    setDragOverId(overId);
    const order = habitOrderRef.current;
    // Build current full order for today's habits
    const allIds = [
      ...order.filter(id => habitsToday.some(h => h.id === id)),
      ...habitsToday.filter(h => !order.includes(h.id)).map(h => h.id),
    ];
    const fromIdx = allIds.indexOf(draggingId);
    const toIdx = allIds.indexOf(overId);
    if (fromIdx === -1 || toIdx === -1) return;
    const newOrder = [...allIds];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggingId);
    // Update ref immediately so next dragover sees the new order
    habitOrderRef.current = newOrder;
    setHabitOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  // Confetti: fire once when all done today
  const allDone = habitsToday.length > 0 && doneCount === habitsToday.length;
  useEffect(() => {
    if (allDone && isToday && confettiFiredRef.current !== dateKey) {
      confettiFiredRef.current = dateKey;
      setShowConfetti(true);
      setTimeout(() => showToast("🎉 All habits done! Amazing work!", "success"), 400);
    }
  }, [allDone, isToday, dateKey, showToast]);

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    if (!isDesktop) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "?") { setShowShortcuts(s => !s); return; }
      if (e.key === "Escape") { setShowShortcuts(false); setFocusedHabitIdx(-1); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setFocusedHabitIdx(i => Math.min(i + 1, orderedHabits.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setFocusedHabitIdx(i => Math.max(i - 1, 0)); return; }
      if (focusedHabitIdx >= 0 && focusedHabitIdx < orderedHabits.length) {
        const habit = orderedHabits[focusedHabitIdx];
        if (e.key.toLowerCase() === "d") { markHabit(habit.id, "done"); return; }
        if (e.key.toLowerCase() === "m") { markHabit(habit.id, "missed"); return; }
        if (e.key.toLowerCase() === "u") { markHabit(habit.id, "pending"); return; }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDesktop, orderedHabits, focusedHabitIdx, markHabit]);

  const todayDate = new Date();
  const prompt = JOURNAL_PROMPTS[todayDate.getDay()];
  const quote = customQuoteText.trim()
    ? { text: customQuoteText.trim(), author: customQuoteAuthor.trim() || "You" }
    : QUOTES[todayDate.getDate() % QUOTES.length];

  const textareaBase: React.CSSProperties = {
    ...font.body, fontSize: font.size(16), color: colors.foreground,
    border: `1px solid ${colors.border}`, borderRadius: 8, padding: 10,
    width: "100%", minHeight: 80, backgroundColor: colors.card,
    lineHeight: 1.5, outline: "none", display: "block",
  };

  const GRIP_W = 34;
  const DONE_W = 56;

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div onClick={() => setShowShortcuts(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: colors.card, borderRadius: 20, padding: "28px 32px", maxWidth: 360, width: "90%", border: `1px solid ${colors.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <p style={{ ...font.heading, fontSize: font.size(20), color: colors.primary, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Keyboard size={20} color={colors.primary} /> Keyboard Shortcuts
            </p>
            {[
              { key: "↑ / ↓", desc: "Navigate habit rows" },
              { key: "D", desc: "Mark focused habit Done" },
              { key: "M", desc: "Mark focused habit Missed" },
              { key: "U", desc: "Reset to Pending" },
              { key: "?", desc: "Toggle this overlay" },
              { key: "Esc", desc: "Dismiss / deselect" },
            ].map(({ key, desc }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ minWidth: 60, display: "flex", justifyContent: "center" }}>
                  <span style={{ ...font.label, fontSize: font.size(12), color: colors.primary, backgroundColor: colors.primary + "14", borderRadius: 8, padding: "5px 10px", border: `1px solid ${colors.primary}30` }}>{key}</span>
                </div>
                <span style={{ ...font.body, fontSize: font.size(14), color: colors.foreground }}>{desc}</span>
              </div>
            ))}
            <button onClick={() => setShowShortcuts(false)} style={{ marginTop: 8, width: "100%", padding: 10, borderRadius: 10, backgroundColor: colors.muted, border: "none", cursor: "pointer", ...font.body, fontSize: font.size(13), color: colors.mutedForeground }}>
              Press ? or Esc to close
            </button>
          </div>
        </div>
      )}

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: isDesktop ? 800 : undefined, margin: isDesktop ? "0 auto" : undefined, padding: isDesktop ? "20px 28px 40px" : "16px 16px 32px" }}>

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <button onClick={() => navigate2(-1)} disabled={atStart} style={{ padding: 8, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: atStart ? "default" : "pointer", background: "none", border: "none", opacity: atStart ? 0.25 : 1 }}>
              <ChevronLeft size={22} color={colors.mutedForeground} />
            </button>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
              <span style={{ ...font.heading, fontSize: font.size(30), color: colors.primary }}>Daily Tracker</span>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
              {isDesktop && (
                <button onClick={() => setShowShortcuts(s => !s)} title="Keyboard shortcuts (?)" style={{ padding: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "none", border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                  <span style={{ ...font.label, fontSize: font.size(12), color: colors.mutedForeground }}>?</span>
                </button>
              )}
              <button onClick={() => navigate2(1)} disabled={isToday} style={{ padding: 8, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: isToday ? "default" : "pointer", background: "none", border: "none", opacity: isToday ? 0 : 1 }}>
                <ChevronRight size={22} color={colors.mutedForeground} />
              </button>
              {!isDesktop && (
                <button onClick={() => navigate("/settings")} style={{ padding: 8, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "none", border: "none" }}>
                  <Settings size={19} color={colors.mutedForeground} />
                </button>
              )}
            </div>
          </div>

          {/* Back to Today pill */}
          {!isToday && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <button
                onClick={() => { setCurrentDate(new Date()); setEditingId(null); setFocusedHabitIdx(-1); }}
                style={{
                  display: "flex", flexDirection: "row", alignItems: "center", gap: 6,
                  paddingLeft: 16, paddingRight: 16, paddingTop: 7, paddingBottom: 7,
                  borderRadius: 20, border: `1.5px solid ${colors.primary}`,
                  backgroundColor: colors.primary + "12", cursor: "pointer",
                  animation: "pillIn 0.2s ease-out",
                }}
              >
                <span style={{ ...font.label, fontSize: font.size(13), color: colors.primary }}>↩ Back to Today</span>
              </button>
            </div>
          )}

          <div style={{ height: 1, backgroundColor: colors.line, marginBottom: 12 }} />

          {/* Intention */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: colors.primary + "09", border: `1px solid ${colors.primary}22`, borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>✦</span>
            <input
              type="text"
              value={journal.intention ?? ""}
              onChange={e => updateJournal(dateKey, { intention: e.target.value })}
              placeholder="Today's intention…"
              maxLength={120}
              style={{ flex: 1, background: "none", border: "none", outline: "none", ...font.body, fontSize: font.size(15), color: colors.foreground }}
            />
          </div>

          {/* Date + Day */}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 8, gap: 4 }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <span style={{ ...font.label, fontSize: font.size(16), color: colors.primary }}>Date: </span>
              <span style={{ ...font.body, fontSize: font.size(16), color: colors.foreground }}>{formatDisplayDate(currentDate)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <span style={{ ...font.label, fontSize: font.size(16), color: colors.primary }}>Day: </span>
              <span style={{ ...font.body, fontSize: font.size(16), color: colors.foreground }}>{getDayNumber(currentDate)}</span>
            </div>
          </div>

          <WeekStrip dateKey={dateKey} />

          {/* Wake-up time */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 14px", marginBottom: 12, gap: 10 }}>
            <Clock size={15} color={colors.primary} style={{ flexShrink: 0 }} />
            <span style={{ ...font.label, fontSize: font.size(14), color: colors.primary, flexShrink: 0 }}>Wake-up</span>
            <input type="time" value={toTimeValue(journal.wakeUpTime)} onChange={e => updateJournal(dateKey, { wakeUpTime: e.target.value })}
              style={{ ...font.body, fontSize: font.size(15), color: colors.foreground, flex: 1, background: "none", border: "none", outline: "none", colorScheme: theme === "midnight" ? "dark" : "light", cursor: "pointer" } as React.CSSProperties} />
          </div>

          {/* Progress bar */}
          <CompletionBar done={doneCount} total={habitsToday.length} />

          {/* Habit table */}
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 10, backgroundColor: colors.card }}>

            {/* Header row */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "stretch", backgroundColor: colors.primary + "10", borderBottom: `1px solid ${colors.border}` }}>
              {isDesktop && (
                <>
                  <div style={{ width: GRIP_W, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GripVertical size={11} color={colors.primary + "55"} />
                  </div>
                  <div style={{ width: 1, backgroundColor: colors.border }} />
                </>
              )}
              <span style={{ flex: 4, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.primary, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 10px", display: "flex", alignItems: "center" }}>Habit</span>
              <div style={{ width: 1, backgroundColor: colors.border }} />
              <span style={{ flex: 2, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>Target</span>
              <div style={{ width: 1, backgroundColor: colors.border }} />
              <span style={{ width: DONE_W, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>Done</span>
              <div style={{ width: 1, backgroundColor: colors.border }} />
              <span style={{ flex: 2.5, fontFamily: font.label.fontFamily, fontWeight: 600, fontSize: 11, color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase" as const, padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>Actual</span>
            </div>

            {orderedHabits.length === 0 ? (
              habits.filter(h => !h.archived).length === 0 ? (
                <div style={{ padding: "28px 20px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 48, marginBottom: 10 }}>📓</span>
                  <p style={{ ...font.heading, fontSize: font.size(22), color: colors.foreground, marginBottom: 6, textAlign: "center" }}>Welcome to Habit Ink</p>
                  <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.6, marginBottom: 22, maxWidth: 320 }}>
                    Track your habits and build routines that stick — one day at a time.
                  </p>
                  <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", gap: 10, width: "100%", marginBottom: 22 }}>
                    {[
                      { emoji: "➕", title: "Add a habit", desc: "Set a goal and pick a schedule" },
                      { emoji: "✓", title: "Track daily", desc: "Mark done or missed each day" },
                      { emoji: "📊", title: "See progress", desc: "Charts, streaks & insights" },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: isDesktop ? "column" : "row", alignItems: isDesktop ? "center" : "flex-start", padding: "13px 14px", backgroundColor: colors.background, border: `1px solid ${colors.border}`, borderRadius: 12, gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary + "18", border: `1.5px solid ${colors.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 18 }}>{s.emoji}</span>
                        </div>
                        <div style={{ textAlign: isDesktop ? "center" : "left" }}>
                          <p style={{ ...font.label, fontSize: font.size(13), color: colors.foreground, margin: "0 0 2px 0" }}>{s.title}</p>
                          <p style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate("/habits")} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 24, paddingRight: 24, paddingTop: 13, paddingBottom: 13, borderRadius: 12, backgroundColor: colors.primary, border: "none", cursor: "pointer", boxShadow: `0 4px 14px ${colors.primary}40` }}>
                    <span style={{ ...font.label, fontSize: font.size(15), color: "#fff" }}>Add Your First Habit →</span>
                  </button>
                </div>
              ) : (
                <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>📓</span>
                  <span style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.5 }}>No habits scheduled for today.</span>
                  <button onClick={() => navigate("/habits")} style={{ marginTop: 4, display: "flex", flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 18, paddingRight: 18, paddingTop: 10, paddingBottom: 10, borderRadius: 22, backgroundColor: colors.primary, border: "none", cursor: "pointer" }}>
                    <span style={{ ...font.label, fontSize: font.size(14), color: "#fff", fontWeight: 600 }}>Go to Habits</span>
                    <span style={{ color: "#fff", fontSize: 14, lineHeight: 1 }}>→</span>
                  </button>
                </div>
              )
            ) : (
              orderedHabits.map((habit, idx) => {
                const entry = getEntry(habit.id, dateKey);
                const isLast = idx === orderedHabits.length - 1;
                const isEditing = editingId === habit.id;
                const isHovered = hoveredRow === habit.id;
                const isFocused = focusedHabitIdx === idx;
                const isDragging = draggingId === habit.id;
                const isDragOver = dragOverId === habit.id && !isDragging;

                return (
                  <div
                    key={habit.id}
                    draggable={isDesktop}
                    onDragStart={(e) => handleDragStart(e, habit.id)}
                    onDragOver={(e) => handleDragOver(e, habit.id)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => e.preventDefault()}
                    onClick={() => isDesktop && setFocusedHabitIdx(idx)}
                    onMouseEnter={() => setHoveredRow(habit.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                      minHeight: 50,
                      borderBottom: isLast ? "none" : `1px solid ${colors.border}`,
                      borderLeft: `3px solid ${isFocused ? colors.primary : habit.color}`,
                      // Insertion line above drag-over row
                      boxShadow: isDragOver ? `inset 0 2px 0 0 ${colors.primary}` : undefined,
                      backgroundColor: isDragging
                        ? colors.muted
                        : isFocused ? colors.primary + "08"
                        : isHovered ? colors.primary + "06"
                        : "transparent",
                      opacity: isDragging ? 0.42 : 1,
                      transition: "background-color 0.12s ease, opacity 0.15s ease, box-shadow 0.1s ease",
                      cursor: "default",
                      userSelect: "none",
                    }}
                  >
                    {isDesktop && (
                      <div
                        style={{
                          width: GRIP_W,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isDragging ? "grabbing" : "grab",
                          borderRight: `1px solid ${colors.border}`,
                          color: colors.mutedForeground,
                          opacity: isHovered || isDragging ? 0.6 : 0.18,
                          transition: "opacity 0.18s ease",
                        }}
                      >
                        <GripVertical size={15} />
                      </div>
                    )}

                    {/* Habit name + emoji */}
                    <div style={{ flex: 4, padding: "10px 10px", display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 17, flexShrink: 0 }}>{habit.emoji}</span>
                      <span style={{ ...font.body, fontSize: font.size(14), color: colors.foreground, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{habit.name}</span>
                    </div>
                    <div style={{ width: 1, backgroundColor: colors.border }} />

                    {/* Target */}
                    <div style={{ flex: 2, padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{habit.target || "Yes"}</span>
                    </div>
                    <div style={{ width: 1, backgroundColor: colors.border }} />

                    {/* Status toggle */}
                    <div style={{ width: DONE_W, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <StatusBtn status={entry?.status ?? "pending"} onPress={() => cycleStatus(habit.id, entry?.status)} />
                    </div>
                    <div style={{ width: 1, backgroundColor: colors.border }} />

                    {/* Actual value */}
                    <div
                      style={{ flex: 2.5, padding: "10px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={(e) => { e.stopPropagation(); setEditingId(isEditing ? null : habit.id); }}
                    >
                      {isEditing ? (
                        <ActualCell habitType={habit.type} initialValue={entry?.actual ?? ""} onSave={(v) => { setEntryActual(habit.id, dateKey, v); setEditingId(null); }} />
                      ) : (
                        <span style={{ ...font.body, fontSize: font.size(13), color: entry?.actual ? colors.foreground : colors.mutedForeground, textAlign: "center" }}>{entry?.actual || "—"}</span>
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
              <p style={{ ...font.body, fontSize: font.size(15), color: colors.foreground, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>"{quote.text}"</p>
              <p style={{ ...font.label, fontSize: font.size(13), color: colors.primary, marginTop: 6, marginBottom: 0 }}>— {quote.author}</p>
            </div>
          )}

          {/* Journal */}
          <p style={{ ...font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6, marginTop: isToday ? 16 : 0 }}>Notes:</p>
          <AutoTextarea value={journal.notes} onChange={e => updateJournal(dateKey, { notes: e.target.value })} placeholder={prompt.notes} style={textareaBase} />

          <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", gap: isDesktop ? 12 : 0, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ ...font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6, marginTop: 0 }}>Wins & Reflections:</p>
              <AutoTextarea value={journal.wins} onChange={e => updateJournal(dateKey, { wins: e.target.value })} placeholder={prompt.wins} style={textareaBase} />
            </div>
            <div style={{ flex: 1, marginTop: isDesktop ? 0 : 8 }}>
              <p style={{ ...font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6, marginTop: 0 }}>Challenges:</p>
              <AutoTextarea value={journal.challenges} onChange={e => updateJournal(dateKey, { challenges: e.target.value })} placeholder={prompt.challenges} style={textareaBase} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
