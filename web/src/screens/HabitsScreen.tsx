import React, { useEffect, useState } from "react";
import { Plus, Pencil, Check, X, CheckCircle, Hash, Slash, Clock, Edit3 } from "lucide-react";

import { Habit, HabitType, ScheduleType, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsWide } from "@/hooks/useIsDesktop";
import { Modal } from "@/components/Modal";

const EMOJIS = [
  "💪","🏃","📚","💧","🥗","😴","🧘","🎯",
  "💰","✍️","🎨","🎵","🏋️","🌱","🧠","❤️",
  "☀️","🌙","🍎","📖","🛁","☕","✅","🎮",
];

const HABIT_COLORS = [
  "#2B3A8C","#1A6B3A","#8B2635","#C9A84C",
  "#6B3A8C","#1A6B6B","#C04A1A","#3A7A8C",
];

const HABIT_TYPES: { key: HabitType; label: string; Icon: React.ElementType }[] = [
  { key: "yesno", label: "Yes / No", Icon: CheckCircle },
  { key: "number", label: "Number", Icon: Hash },
  { key: "decimal", label: "Decimal", Icon: Slash },
  { key: "time", label: "Time", Icon: Clock },
  { key: "custom", label: "Custom", Icon: Edit3 },
];

const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
  { key: "alternate", label: "Alternate" },
  { key: "custom", label: "Custom" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SCHEDULE_DESCRIPTIONS: Record<ScheduleType, string> = {
  daily: "Every day",
  weekdays: "Mon – Fri",
  weekends: "Sat & Sun",
  alternate: "Every other day",
  custom: "Custom days",
};

function SectionLabel({ label }: { label: string }) {
  const colors = useColors();
  const font = useFont();
  return (
    <p style={{ ...font.label, fontSize: font.size(12), color: colors.primary, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, marginTop: 0 }}>
      {label}
    </p>
  );
}

interface AddModalProps {
  visible: boolean;
  editing?: Habit;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

function AddModal({ visible, editing, onClose, onDelete }: AddModalProps) {
  const colors = useColors();
  const font = useFont();
  const { addHabit, updateHabit } = useHabits();
  const today = toDateKey(new Date());

  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("yesno");
  const [target, setTarget] = useState("");       // for time / custom types
  const [numAmount, setNumAmount] = useState(""); // number: the value part (e.g. "10000")
  const [numUnit, setNumUnit] = useState("");     // number: the unit part  (e.g. "steps")
  const [schedule, setSchedule] = useState<ScheduleType>("daily");
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]);
  const [emoji, setEmoji] = useState("✅");
  const [color, setColor] = useState("#2B3A8C");

  useEffect(() => {
    if (!visible) return;
    setName(editing?.name ?? "");
    setSchedule(editing?.schedule ?? "daily");
    setCustomDays(editing?.customDays ?? [1, 3, 5]);
    setEmoji(editing?.emoji ?? "✅");
    setColor(editing?.color ?? "#2B3A8C");

    const editType = editing?.type ?? "yesno";
    const editTarget = editing?.target ?? "";
    setType(editType);

    if (editType === "number" || editType === "decimal") {
      // Parse "10000 steps" or "7.5 km" → amount + unit
      const m = editTarget.match(/^([\d.]+)\s*(.*)$/);
      if (m) { setNumAmount(m[1]); setNumUnit(m[2].trim()); }
      else { setNumAmount(""); setNumUnit(editTarget); }
      setTarget("");
    } else if (editType === "yesno") {
      setTarget("");
      setNumAmount("");
      setNumUnit("");
    } else {
      setTarget(editTarget);
      setNumAmount("");
      setNumUnit("");
    }
  }, [visible, editing]);

  // When user switches type, clear stale target values
  const handleTypeChange = (t: HabitType) => {
    setType(t);
    setTarget("");
    setNumAmount("");
    setNumUnit("");
  };

  const noDaysSelected = schedule === "custom" && customDays.length === 0;
  const canSave = name.trim().length > 0 && !noDaysSelected;

  const save = () => {
    if (!canSave) return;
    let finalTarget = "";
    if (type === "yesno") {
      finalTarget = "Complete";
    } else if (type === "number" || type === "decimal") {
      const a = numAmount.trim();
      const u = numUnit.trim();
      finalTarget = a && u ? `${a} ${u}` : a || u;
    } else {
      finalTarget = target.trim();
    }
    const habit = {
      name: name.trim(),
      type,
      target: finalTarget,
      schedule,
      customDays: schedule === "custom" ? customDays : undefined,
      startDate: editing?.startDate ?? today,
      emoji,
      color,
    };
    if (editing) updateHabit(editing.id, habit);
    else addHabit(habit);
    onClose();
  };

  const toggleDay = (d: number) =>
    setCustomDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const inputBase: React.CSSProperties = {
    ...font.body,
    fontSize: font.size(16),
    color: colors.foreground,
    border: `1.5px solid ${colors.border}`,
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.card,
    width: "100%",
    outline: "none",
    display: "block",
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <div style={{ padding: 20, paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color + "25", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28 }}>{emoji}</span>
            </div>
            <div>
              <p style={{ ...font.heading, fontSize: font.size(22), color: colors.primary, margin: 0 }}>
                {editing ? "Edit Habit" : "New Habit"}
              </p>
              <p style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, marginTop: 1, marginBottom: 0 }}>
                {editing ? "Update your tracking goal" : "Add to your journal"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <X size={18} color={colors.mutedForeground} />
          </button>
        </div>

        <div style={{ height: 1, backgroundColor: colors.line, marginTop: 18, marginBottom: 18 }} />

        {/* Emoji Picker */}
        <SectionLabel label="Choose an icon" />
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setEmoji(e)} style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: emoji === e ? color + "20" : colors.muted, border: `${emoji === e ? 2 : 1}px solid ${emoji === e ? color : colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>{e}</span>
            </button>
          ))}
        </div>

        {/* Color Picker */}
        <SectionLabel label="Accent color" />
        <div style={{ display: "flex", flexDirection: "row", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          {HABIT_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c, display: "flex", alignItems: "center", justifyContent: "center", border: color === c ? `3px solid ${colors.foreground}` : "2px solid transparent", cursor: "pointer", transform: color === c ? "scale(1.12)" : "scale(1)", transition: "transform 0.1s" }}>
              {color === c && <Check size={16} color="#fff" />}
            </button>
          ))}
        </div>

        {/* Habit Name */}
        <SectionLabel label="Habit name" />
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={(e) => setName(e.target.value.trim())}
            placeholder="What do you want to track?"
            maxLength={80}
            style={{ ...inputBase, borderColor: name.trim() ? color : colors.border }}
          />
          {name.length > 60 && (
            <span style={{ ...font.body, fontSize: 11, color: name.length >= 75 ? colors.destructive : colors.mutedForeground, position: "absolute", right: 4, bottom: -17 }}>
              {80 - name.length} chars left
            </span>
          )}
        </div>

        {/* Tracking Type */}
        <SectionLabel label="Tracking type" />
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {HABIT_TYPES.map(({ key, label, Icon }) => {
            const active = type === key;
            return (
              <button key={key} onClick={() => handleTypeChange(key)} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 14, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 22, border: `1.5px solid ${active ? color : colors.border}`, backgroundColor: active ? color : colors.card, cursor: "pointer" }}>
                <Icon size={13} color={active ? "#fff" : colors.mutedForeground} />
                <span style={{ ...font.body, fontSize: font.size(13), color: active ? "#fff" : colors.mutedForeground }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Target — varies by type */}
        {type === "yesno" ? (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.muted, borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
            <Check size={14} color={colors.success} />
            <span style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground }}>Tracked as: <strong>Done</strong> or <strong>Missed</strong> each day</span>
          </div>
        ) : (type === "number" || type === "decimal") ? (
          <>
            <SectionLabel label="Target / Goal" />
            <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 20 }}>
              <input
                type="text"
                inputMode={type === "decimal" ? "decimal" : "numeric"}
                value={numAmount}
                onKeyDown={(e) => {
                  if (type === "decimal" && e.key === ",") {
                    e.preventDefault();
                    if (!numAmount.includes(".")) setNumAmount((v) => v + ".");
                    return;
                  }
                  const allow = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Enter","Home","End"];
                  const isDecimalAllowed = type === "decimal";
                  const allowedChars = isDecimalAllowed ? /^[0-9.]$/ : /^[0-9]$/;
                  if (!allow.includes(e.key) && !allowedChars.test(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                  if (e.key === "." && numAmount.includes(".")) e.preventDefault();
                }}
                onChange={(e) => setNumAmount(e.target.value)}
                placeholder={type === "decimal" ? "e.g. 7.5" : "e.g. 10000"}
                style={{ ...inputBase, flex: "0 0 110px" }}
              />
              <input
                value={numUnit}
                onChange={(e) => setNumUnit(e.target.value)}
                onBlur={(e) => setNumUnit(e.target.value.trim())}
                placeholder={type === "decimal" ? "Unit (km, hrs…)" : "Unit (steps, reps…)"}
                style={{ ...inputBase, flex: 1 }}
              />
            </div>
          </>
        ) : (
          <>
            <SectionLabel label="Target / Goal" />
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onBlur={(e) => setTarget(e.target.value.trim())}
              placeholder={type === "time" ? "e.g. 2 hours, 30 min" : "e.g. 30 pages, write 500 words"}
              style={{ ...inputBase, marginBottom: 20 }}
            />
          </>
        )}

        {/* Schedule */}
        <SectionLabel label="Schedule" />
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: schedule === "custom" ? 12 : 22 }}>
          {SCHEDULES.map((s) => {
            const active = schedule === s.key;
            return (
              <button key={s.key} onClick={() => setSchedule(s.key)} style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 9, paddingBottom: 9, borderRadius: 22, border: `1.5px solid ${active ? color : colors.border}`, backgroundColor: active ? color : colors.card, cursor: "pointer" }}>
                <span style={{ ...font.body, fontSize: font.size(13), color: active ? "#fff" : colors.mutedForeground }}>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom day picker */}
        {schedule === "custom" && (
          <>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: noDaysSelected ? 6 : 22 }}>
              {DAYS.map((d, i) => (
                <button key={DAY_FULL[i]} onClick={() => toggleDay(i)} style={{ flex: 1, aspectRatio: 1, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: customDays.includes(i) ? color : colors.muted, border: `${customDays.includes(i) ? 2 : 1}px solid ${customDays.includes(i) ? color : colors.border}`, cursor: "pointer" }}>
                  <span style={{ ...font.body, fontSize: font.size(12), color: customDays.includes(i) ? "#fff" : colors.mutedForeground, fontWeight: 600 }}>{d}</span>
                </button>
              ))}
            </div>
            {noDaysSelected && (
              <p style={{ ...font.body, fontSize: font.size(13), color: colors.destructive, marginBottom: 16 }}>
                Select at least one day to continue.
              </p>
            )}
          </>
        )}

        {/* Save */}
        <button
          onClick={save}
          disabled={!canSave}
          style={{ backgroundColor: canSave ? color : colors.muted, borderRadius: 14, paddingTop: 16, paddingBottom: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: canSave ? 1 : 0.5, border: "none", cursor: canSave ? "pointer" : "default", marginTop: 6 }}
        >
          {editing ? <Check size={18} color={canSave ? "#fff" : colors.mutedForeground} /> : <Plus size={18} color={canSave ? "#fff" : colors.mutedForeground} />}
          <span style={{ ...font.label, fontSize: font.size(17), color: canSave ? "#fff" : colors.mutedForeground, fontWeight: 700 }}>
            {editing ? "Save Changes" : "Add to Journal"}
          </span>
        </button>

        {/* Delete — only in edit mode */}
        {editing && onDelete && (
          <button
            onClick={() => {
              if (window.confirm(`Remove "${editing.name}" from your journal?`)) {
                onDelete(editing.id);
                onClose();
              }
            }}
            style={{ marginTop: 10, width: "100%", paddingTop: 12, paddingBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: `1px solid ${colors.destructive}`, borderRadius: 12, cursor: "pointer" }}
          >
            <span style={{ ...font.label, fontSize: font.size(15), color: colors.destructive }}>Remove Habit</span>
          </button>
        )}
      </div>
    </Modal>
  );
}

function HabitCard({ habit, onEdit, onDelete, inGrid }: { habit: Habit; onEdit: () => void; onDelete: () => void; inGrid?: boolean }) {
  const colors = useColors();
  const font = useFont();
  const { getStreak, getCompletionRate } = useHabits();
  const [hovered, setHovered] = useState(false);

  const streak = getStreak(habit.id);
  const rate = getCompletionRate(habit.id, 30);
  const accentColor = habit.color ?? "#2B3A8C";

  const [displayRate, setDisplayRate] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDisplayRate(rate), 120);
    return () => clearTimeout(t);
  }, [rate]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        marginBottom: inGrid ? 0 : 12,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 2px 6px rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        cursor: "pointer",
      }}
      onClick={onEdit}
    >
      <div style={{ height: 4, backgroundColor: accentColor }} />
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: 14, gap: 14 }}>
        {/* Emoji bubble */}
        <div style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: accentColor + "18", border: `1.5px solid ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 26 }}>{habit.emoji ?? "✅"}</span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0, lineHeight: 1.3 }}>
            {habit.name}
          </p>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, marginTop: 4 }}>
            <span style={{ ...font.body, fontSize: font.size(11), color: accentColor, fontWeight: 600, backgroundColor: accentColor + "18", borderRadius: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2 }}>
              {SCHEDULE_DESCRIPTIONS[habit.schedule]}
            </span>
            {habit.target ? (
              <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, backgroundColor: colors.muted, borderRadius: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2 }}>
                {habit.target}
              </span>
            ) : null}
          </div>
          <div style={{ height: 5, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
            <div style={{ height: 5, borderRadius: 3, width: `${displayRate}%`, backgroundColor: displayRate >= 80 ? colors.success : displayRate >= 50 ? accentColor : colors.accent, transition: "width 0.6s ease-out" }} />
          </div>
          <p style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, marginTop: 4, marginBottom: 0 }}>
            {rate}% last 30 days
          </p>
        </div>

        {/* Streak + edit */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ backgroundColor: streak > 0 ? accentColor + "20" : colors.muted, borderRadius: 12, paddingLeft: 8, paddingRight: 8, paddingTop: 5, paddingBottom: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ ...font.heading, fontSize: font.size(15), color: streak > 0 ? accentColor : colors.mutedForeground, marginTop: 1 }}>{streak}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.muted, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}`, cursor: "pointer" }}
          >
            <Pencil size={13} color={colors.mutedForeground} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HabitsScreen() {
  const colors = useColors();
  const font = useFont();
  const { habits, deleteHabit, getStreak } = useHabits();
  const isWide = useIsWide();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Remove "${name}" from your journal?`)) {
      deleteHabit(id);
    }
  };

  const openEdit = (habit: Habit) => { setEditing(habit); setShowAdd(true); };
  const closeModal = () => { setShowAdd(false); setEditing(undefined); };

  const sorted = [...habits].sort((a, b) => getStreak(b.id) - getStreak(a.id));

  const emptyState = isWide ? (
    /* Desktop guided onboarding */
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 60,
      paddingBottom: 60,
      maxWidth: 620,
      margin: "0 auto",
    }}>
      <span style={{ fontSize: 56, marginBottom: 20 }}>📓</span>
      <p style={{ ...font.heading, fontSize: font.size(26), color: colors.foreground, marginBottom: 8, textAlign: "center" }}>
        Welcome to Habit Journal
      </p>
      <p style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.6, marginBottom: 36 }}>
        Track your habits and build routines that stick — one day at a time.
      </p>

      {/* 3 steps */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, width: "100%", marginBottom: 40 }}>
        {[
          { num: "1", emoji: "➕", title: "Add a habit", desc: "Set a goal and pick a schedule" },
          { num: "2", emoji: "✓", title: "Track daily", desc: "Mark done or missed each day" },
          { num: "3", emoji: "📊", title: "See progress", desc: "Charts, streaks & insights" },
        ].map((step, i) => (
          <div key={i} style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 16px",
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            textAlign: "center",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{step.emoji}</span>
            </div>
            <p style={{ ...font.label, fontSize: font.size(14), color: colors.foreground, marginBottom: 4 }}>{step.title}</p>
            <p style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, lineHeight: 1.5 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setEditing(undefined); setShowAdd(true); }}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingLeft: 28,
          paddingRight: 28,
          paddingTop: 14,
          paddingBottom: 14,
          borderRadius: 12,
          backgroundColor: colors.primary,
          border: "none",
          cursor: "pointer",
          boxShadow: `0 4px 12px ${colors.primary}40`,
        }}
      >
        <Plus size={20} color={colors.primaryForeground} />
        <span style={{ ...font.label, fontSize: font.size(16), color: colors.primaryForeground }}>Add Your First Habit</span>
      </button>
    </div>
  ) : (
    /* Mobile empty state — unchanged */
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, paddingBottom: 80, paddingLeft: 32, paddingRight: 32 }}>
      <div style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.muted, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 44 }}>📓</span>
      </div>
      <p style={{ ...font.heading, fontSize: font.size(22), color: colors.foreground, marginBottom: 10, textAlign: "center" }}>Your journal is empty</p>
      <p style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.6 }}>
        Start tracking your habits and goals — tap the + button above to add your first one.
      </p>
    </div>
  );

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      {isWide ? (
        <div style={{ paddingTop: 16, paddingBottom: 14, paddingLeft: 28, paddingRight: 28, borderBottom: `1px solid ${colors.line}`, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary, display: "block" }}>My Habits</span>
            <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, marginTop: 2, display: "block" }}>
              {habits.length === 0 ? "Add your first habit to get started" : `${habits.length} habit${habits.length === 1 ? "" : "s"} tracked · click any card to edit`}
            </span>
          </div>
          <button
            onClick={() => { setEditing(undefined); setShowAdd(true); }}
            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 18, paddingRight: 18, paddingTop: 10, paddingBottom: 10, borderRadius: 10, backgroundColor: colors.primary, border: "none", cursor: "pointer", boxShadow: `0 2px 8px ${colors.primary}40` }}
          >
            <Plus size={18} color={colors.primaryForeground} />
            <span style={{ ...font.label, fontSize: font.size(14), color: colors.primaryForeground }}>Add Habit</span>
          </button>
        </div>
      ) : (
        <div style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, borderBottom: `1px solid ${colors.line}`, display: "flex", flexDirection: "row", alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 44 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
              <span style={{ ...font.heading, fontSize: font.size(26), color: colors.primary }}>My Habits</span>
              <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            </div>
            <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, marginTop: 3 }}>
              {habits.length === 0 ? "Add your first habit" : `${habits.length} habit${habits.length === 1 ? "" : "s"} · click to edit`}
            </span>
          </div>
          <button
            onClick={() => { setEditing(undefined); setShowAdd(true); }}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 6px ${colors.primary}4D`, border: "none", cursor: "pointer" }}
          >
            <Plus size={22} color={colors.primaryForeground} />
          </button>
        </div>
      )}

      {/* List */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: isWide ? 1080 : undefined, margin: isWide ? "0 auto" : undefined, padding: isWide ? "16px 28px 32px" : "16px 16px 32px" }}>
          {habits.length === 0 ? emptyState : (
            <div style={isWide ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" } : {}}>
              {sorted.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  inGrid={isWide}
                  onEdit={() => openEdit(habit)}
                  onDelete={() => confirmDelete(habit.id, habit.name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddModal visible={showAdd} editing={editing} onClose={closeModal} onDelete={deleteHabit} />
    </div>
  );
}
