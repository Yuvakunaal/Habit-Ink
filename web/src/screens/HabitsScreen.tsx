import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Check, X, CheckCircle, Hash, Slash, Clock, Edit3, Archive, ArchiveRestore, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import { Habit, HabitType, ScheduleType, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsWide } from "@/hooks/useIsDesktop";
import { useToast } from "@/context/ToastContext";
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
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}

function AddModal({ visible, editing, onClose, onDelete, onArchive, onUnarchive }: AddModalProps) {
  const colors = useColors();
  const font = useFont();
  const { addHabit, updateHabit } = useHabits();
  const today = toDateKey(new Date());

  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("yesno");
  const [target, setTarget] = useState("");
  const [numAmount, setNumAmount] = useState("");
  const [numUnit, setNumUnit] = useState("");
  const [schedule, setSchedule] = useState<ScheduleType>("daily");
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]);
  const [emoji, setEmoji] = useState("✅");
  const [color, setColor] = useState("#2B3A8C");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const deleteConfirmTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!visible) {
      setDeleteConfirming(false);
      setSaving(false);
      clearTimeout(deleteConfirmTimer.current);
      return;
    }
    setName(editing?.name ?? "");
    setSchedule(editing?.schedule ?? "daily");
    setCustomDays(editing?.customDays ?? [1, 3, 5]);
    setEmoji(editing?.emoji ?? "✅");
    setColor(editing?.color ?? "#2B3A8C");

    const editType = editing?.type ?? "yesno";
    const editTarget = editing?.target ?? "";
    setType(editType);

    if (editType === "number" || editType === "decimal") {
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

  const handleTypeChange = (t: HabitType) => {
    setType(t);
    setTarget("");
    setNumAmount("");
    setNumUnit("");
  };

  const noDaysSelected = schedule === "custom" && customDays.length === 0;
  const canSave = name.trim().length > 0 && !noDaysSelected;

  const save = () => {
    if (!canSave || saving) return;
    setSaving(true);
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

  const handleDeleteClick = () => {
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      deleteConfirmTimer.current = setTimeout(() => setDeleteConfirming(false), 4000);
    } else {
      clearTimeout(deleteConfirmTimer.current);
      onDelete?.(editing!.id);
      onClose();
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <style>{`
        @keyframes deleteConfirmIn {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
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
            aria-label="Habit name"
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

        {/* Target */}
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
                  const allowedChars = type === "decimal" ? /^[0-9.]$/ : /^[0-9]$/;
                  if (!allow.includes(e.key) && !allowedChars.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
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
          disabled={!canSave || saving}
          aria-busy={saving}
          style={{ backgroundColor: canSave ? color : colors.muted, borderRadius: 14, paddingTop: 16, paddingBottom: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: canSave ? 1 : 0.5, border: "none", cursor: canSave && !saving ? "pointer" : "default", marginTop: 6, transition: "opacity 0.15s" }}
        >
          {saving
            ? <span style={{ width: 18, height: 18, border: "2.5px solid #ffffff60", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />
            : editing ? <Check size={18} color={canSave ? "#fff" : colors.mutedForeground} /> : <Plus size={18} color={canSave ? "#fff" : colors.mutedForeground} />
          }
          <span style={{ ...font.label, fontSize: font.size(17), color: canSave ? "#fff" : colors.mutedForeground, fontWeight: 700 }}>
            {saving ? "Saving…" : editing ? "Save Changes" : "Add to Journal"}
          </span>
        </button>

        {/* Archive / Unarchive */}
        {editing && (
          editing.archived ? (
            <button
              onClick={() => { onUnarchive?.(editing.id); onClose(); }}
              style={{ marginTop: 10, width: "100%", paddingTop: 12, paddingBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: `1px solid ${colors.success}`, borderRadius: 12, cursor: "pointer" }}
            >
              <ArchiveRestore size={15} color={colors.success} />
              <span style={{ ...font.label, fontSize: font.size(15), color: colors.success }}>Restore Habit</span>
            </button>
          ) : (
            <button
              onClick={() => { onArchive?.(editing.id); onClose(); }}
              style={{ marginTop: 10, width: "100%", paddingTop: 12, paddingBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: `1px solid ${colors.primary}30`, borderRadius: 12, cursor: "pointer" }}
            >
              <Archive size={15} color={colors.mutedForeground} />
              <span style={{ ...font.label, fontSize: font.size(15), color: colors.mutedForeground }}>Archive Habit</span>
            </button>
          )
        )}

        {/* Permanent Delete — two-tap inline confirm */}
        {editing && onDelete && (
          <div style={{ marginTop: 10 }}>
            {!deleteConfirming ? (
              <button
                onClick={handleDeleteClick}
                style={{ width: "100%", paddingTop: 10, paddingBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}
              >
                <Trash2 size={13} color={colors.mutedForeground} />
                <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground }}>
                  Delete permanently
                </span>
              </button>
            ) : (
              <div
                style={{
                  backgroundColor: colors.destructive + "0d",
                  border: `1.5px solid ${colors.destructive}40`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  animation: "deleteConfirmIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Trash2 size={15} color={colors.destructive} />
                  <span style={{ ...font.body, fontSize: font.size(13), color: colors.destructive, lineHeight: 1.4 }}>
                    Delete <strong>"{editing.name}"</strong>? All tracked history will be lost.
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { clearTimeout(deleteConfirmTimer.current); setDeleteConfirming(false); }}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: colors.muted, border: `1px solid ${colors.border}`, ...font.body, fontSize: font.size(14), color: colors.foreground, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, backgroundColor: colors.destructive, border: "none", ...font.label, fontSize: font.size(14), fontWeight: 700, color: "#fff", cursor: "pointer" }}
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function HabitCard({ habit, onEdit, inGrid }: { habit: Habit; onEdit: () => void; inGrid?: boolean }) {
  const colors = useColors();
  const font = useFont();
  const { getStreak, getCompletionRate } = useHabits();
  const [hovered, setHovered] = useState(false);

  const streak = useMemo(() => getStreak(habit.id), [getStreak, habit.id]);
  const rate = useMemo(() => getCompletionRate(habit.id, 30), [getCompletionRate, habit.id]);
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
      onClick={onEdit}
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
    >
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ height: 4, backgroundColor: accentColor }} />
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: 14, gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: accentColor + "18", border: `1.5px solid ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 26 }}>{habit.emoji ?? "✅"}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0, lineHeight: 1.3 }}>
              {habit.name}
            </p>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, marginTop: 4 }}>
              <span style={{ ...font.body, fontSize: font.size(11), color: accentColor, fontWeight: 600, backgroundColor: accentColor + "18", borderRadius: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2 }}>
                {SCHEDULE_DESCRIPTIONS[habit.schedule]}
              </span>
              {habit.target ? (
                <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, backgroundColor: colors.muted, borderRadius: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2 }}>
                  {habit.target}
                </span>
              ) : null}
            </div>
            {(() => {
              const startD = new Date(habit.startDate + "T12:00:00");
              const age = Math.floor((Date.now() - startD.getTime()) / (1000 * 60 * 60 * 24));
              if (age < 1) return null;
              return (
                <p style={{ ...font.body, fontSize: font.size(10), color: colors.mutedForeground, margin: "0 0 5px 0", opacity: 0.75 }}>
                  {age === 1 ? "Started yesterday" : `Running for ${age} day${age !== 1 ? "s" : ""}`}
                </p>
              );
            })()}
            <div style={{ height: 5, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
              <div style={{ height: 5, borderRadius: 3, width: `${displayRate}%`, backgroundColor: displayRate >= 80 ? colors.success : displayRate >= 50 ? accentColor : colors.accent, transition: "width 0.6s ease-out" }} />
            </div>
            <p style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, marginTop: 4, marginBottom: 0 }}>
              {rate}% last 30 days
            </p>
          </div>
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
    </div>
  );
}

export default function HabitsScreen() {
  const colors = useColors();
  const font = useFont();
  const { habits, deleteHabit, updateHabit } = useHabits();
  const { showToast } = useToast();
  const isWide = useIsWide();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();
  const [showArchived, setShowArchived] = useState(false);

  // IDs visually removed but DB delete is pending undo window
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const pendingDeleteTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const handleDelete = (id: string) => {
    const habitName = habits.find((h) => h.id === id)?.name ?? "Habit";

    // Hide from UI immediately
    setPendingDeleteIds((prev) => [...prev, id]);

    // Schedule real DB delete after undo window
    const timer = setTimeout(() => {
      deleteHabit(id);
      setPendingDeleteIds((prev) => prev.filter((x) => x !== id));
      pendingDeleteTimers.current.delete(id);
    }, 5000);
    pendingDeleteTimers.current.set(id, timer);

    // Undo toast — visible for 5s
    showToast(
      `"${habitName}" deleted`,
      "info",
      {
        label: "Undo",
        onClick: () => {
          clearTimeout(pendingDeleteTimers.current.get(id));
          pendingDeleteTimers.current.delete(id);
          setPendingDeleteIds((prev) => prev.filter((x) => x !== id));
        },
      },
      5000,
    );
  };

  const activeHabits = habits.filter((h) => !h.archived && !pendingDeleteIds.includes(h.id));
  const archivedHabits = habits.filter((h) => h.archived && !pendingDeleteIds.includes(h.id));

  const openEdit = (habit: Habit) => { setEditing(habit); setShowAdd(true); };
  const closeModal = () => { setShowAdd(false); setEditing(undefined); };

  const handleArchive = (id: string) => updateHabit(id, { archived: true });
  const handleUnarchive = (id: string) => updateHabit(id, { archived: false });

  const emptyState = isWide ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, paddingBottom: 60, maxWidth: 620, margin: "0 auto" }}>
      <span style={{ fontSize: 56, marginBottom: 20 }}>📓</span>
      <p style={{ ...font.heading, fontSize: font.size(26), color: colors.foreground, marginBottom: 8, textAlign: "center" }}>
        Welcome to Habit Ink
      </p>
      <p style={{ ...font.body, fontSize: font.size(15), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.6, marginBottom: 36 }}>
        Track your habits and build routines that stick — one day at a time.
      </p>
      <div style={{ display: "flex", flexDirection: "row", gap: 16, width: "100%", marginBottom: 40 }}>
        {[
          { emoji: "➕", title: "Add a habit", desc: "Set a goal and pick a schedule" },
          { emoji: "✓", title: "Track daily", desc: "Mark done or missed each day" },
          { emoji: "📊", title: "See progress", desc: "Charts, streaks & insights" },
        ].map((step, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px", backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14, textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{step.emoji}</span>
            </div>
            <p style={{ ...font.label, fontSize: font.size(14), color: colors.foreground, marginBottom: 4 }}>{step.title}</p>
            <p style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, lineHeight: 1.5 }}>{step.desc}</p>
          </div>
        ))}
      </div>
      <button onClick={() => { setEditing(undefined); setShowAdd(true); }} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 28, paddingRight: 28, paddingTop: 14, paddingBottom: 14, borderRadius: 12, backgroundColor: colors.primary, border: "none", cursor: "pointer", boxShadow: `0 4px 12px ${colors.primary}40` }}>
        <Plus size={20} color={colors.primaryForeground} />
        <span style={{ ...font.label, fontSize: font.size(16), color: colors.primaryForeground }}>Add Your First Habit</span>
      </button>
    </div>
  ) : (
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
              {activeHabits.length === 0 ? "Add your first habit to get started" : `${activeHabits.length} habit${activeHabits.length === 1 ? "" : "s"} tracked · click to edit`}
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
              {activeHabits.length === 0 ? "Add your first habit" : `${activeHabits.length} habit${activeHabits.length === 1 ? "" : "s"} · click to edit`}
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
          {activeHabits.length === 0 && archivedHabits.length === 0 && pendingDeleteIds.length === 0 ? emptyState : (
            <>
              {/* Active habits */}
              <div style={isWide ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" } : {}}>
                {activeHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    inGrid={isWide}
                    onEdit={() => openEdit(habit)}
                  />
                ))}
              </div>

              {/* Archived section */}
              {archivedHabits.length > 0 && (
                <div style={{ marginTop: activeHabits.length > 0 ? 20 : 0 }}>
                  <button
                    onClick={() => setShowArchived(s => !s)}
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "6px 0", marginBottom: 10 }}
                  >
                    <Archive size={14} color={colors.mutedForeground} />
                    <span style={{ ...font.label, fontSize: font.size(13), color: colors.mutedForeground }}>Archived ({archivedHabits.length})</span>
                    {showArchived ? <ChevronUp size={14} color={colors.mutedForeground} /> : <ChevronDown size={14} color={colors.mutedForeground} />}
                  </button>
                  {showArchived && (
                    <div style={{ opacity: 0.65, ...(isWide ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } : {}) }}>
                      {archivedHabits.map(habit => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          inGrid={isWide}
                          onEdit={() => openEdit(habit)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddModal
        visible={showAdd}
        editing={editing}
        onClose={closeModal}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onUnarchive={handleUnarchive}
      />
    </div>
  );
}
