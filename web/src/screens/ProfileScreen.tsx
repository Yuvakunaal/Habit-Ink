import React, { useState } from "react";
import { Plus, Users, Share2, User, Check, X } from "lucide-react";

import { Group, ScheduleType, useHabits } from "@/context/HabitContext";
import { THEMES, ThemeName } from "@/constants/themes";
import { FontSize, FontStyle, useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { Modal } from "@/components/Modal";
import { useToast } from "@/context/ToastContext";

const AVATARS = ["😊","🧑","👩","🧔","👨","🧘","🏃","💪","📚","🎯","🌱","✨","🦊","🐻","🦋","🌟"];
const THEME_ORDER: ThemeName[] = ["cream", "midnight", "forest", "rose", "slate"];

const FONT_OPTIONS: { key: FontStyle; label: string; previewStyle: React.CSSProperties }[] = [
  { key: "handwritten", label: "Handwritten", previewStyle: { fontFamily: '"Caveat", cursive', fontWeight: 700 } },
  { key: "clean", label: "Clean", previewStyle: { fontFamily: '"Inter", sans-serif', fontWeight: 600 } },
];

const SIZE_OPTIONS: { key: FontSize; label: string; size: number }[] = [
  { key: "small", label: "Small", size: 14 },
  { key: "medium", label: "Medium", size: 17 },
  { key: "large", label: "Large", size: 21 },
];

const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: "daily", label: "Every Day" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
];

function SectionTitle({ label }: { label: string }) {
  const colors = useColors();
  const font = useFont();
  return (
    <p style={{ ...font.label, fontSize: font.size(11), color: colors.mutedForeground, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, marginTop: 4 }}>
      {label}
    </p>
  );
}

function CreateGroupModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const font = useFont();
  const { createGroup } = useHabits();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creator, setCreator] = useState("");
  const [habitInput, setHabitInput] = useState("");
  const [habitNames, setHabitNames] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleType>("daily");
  const [duration, setDuration] = useState("30");

  const addHabitName = () => {
    const t = habitInput.trim();
    if (t && !habitNames.includes(t)) { setHabitNames((p) => [...p, t]); setHabitInput(""); }
  };

  const save = () => {
    if (!name.trim() || !creator.trim()) return;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (parseInt(duration) || 30));
    const group = createGroup({
      name: name.trim(), description: desc.trim(), creatorName: creator.trim(),
      habitNames, schedule,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      members: [{ id: Date.now().toString(), name: creator.trim(), joinedAt: new Date().toISOString() }],
    });
    showToast(`Group created! Invite code: ${group.inviteCode}`, "success");
    setName(""); setDesc(""); setCreator(""); setHabitNames([]); setHabitInput(""); setDuration("30");
    onClose();
  };

  const inputBase: React.CSSProperties = {
    ...font.body,
    fontSize: font.size(16),
    color: colors.foreground,
    border: `1.5px solid ${colors.border}`,
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: colors.card,
    marginBottom: 16,
    width: "100%",
    outline: "none",
    display: "block",
  };

  const canSave = name.trim().length > 0 && creator.trim().length > 0;

  return (
    <Modal visible={visible} onClose={onClose}>
      <div style={{ padding: 20, paddingBottom: 48 }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ ...font.heading, fontSize: font.size(24), color: colors.primary }}>New Challenge</span>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <X size={18} color={colors.mutedForeground} />
          </button>
        </div>
        <div style={{ height: 1, backgroundColor: colors.line, marginBottom: 20 }} />

        <SectionTitle label="Challenge name" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 30-Day Reading Challenge" style={inputBase} />

        <SectionTitle label="Your name" />
        <input value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="How friends will see you" style={inputBase} />

        <SectionTitle label="Description (optional)" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's this challenge about?" rows={3} style={{ ...inputBase, minHeight: 70, resize: "none" }} />

        <SectionTitle label="Habits to track" />
        <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <input value={habitInput} onChange={(e) => setHabitInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHabitName()} placeholder="Add a habit..." style={{ ...inputBase, flex: 1, marginBottom: 0 }} />
          <button onClick={addHabitName} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <Plus size={20} color={colors.primaryForeground} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {habitNames.map((h, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: colors.muted, border: `1px solid ${colors.border}`, borderRadius: 8, paddingLeft: 10, paddingRight: 10, paddingTop: 6, paddingBottom: 6, gap: 6 }}>
              <span style={{ ...font.body, fontSize: font.size(14), color: colors.foreground }}>{h}</span>
              <button onClick={() => setHabitNames((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <X size={13} color={colors.mutedForeground} />
              </button>
            </div>
          ))}
        </div>

        <SectionTitle label="Schedule" />
        <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {SCHEDULES.map((s) => (
            <button key={s.key} onClick={() => setSchedule(s.key)} style={{ flex: 1, paddingTop: 10, paddingBottom: 10, borderRadius: 22, border: `1.5px solid ${schedule === s.key ? colors.primary : colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: schedule === s.key ? colors.primary : colors.card, cursor: "pointer" }}>
              <span style={{ ...font.body, fontSize: font.size(13), color: schedule === s.key ? "#fff" : colors.mutedForeground }}>{s.label}</span>
            </button>
          ))}
        </div>

        <SectionTitle label="Duration (days)" />
        <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" placeholder="30" style={inputBase} />

        <button onClick={save} disabled={!canSave} style={{ backgroundColor: canSave ? colors.primary : colors.muted, borderRadius: 14, paddingTop: 16, paddingBottom: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: canSave ? "pointer" : "default", opacity: canSave ? 1 : 0.55 }}>
          <span style={{ ...font.label, fontSize: font.size(17), color: canSave ? "#fff" : colors.mutedForeground, fontWeight: 700 }}>Create Challenge</span>
        </button>
      </div>
    </Modal>
  );
}

function JoinModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const font = useFont();
  const { joinGroup } = useHabits();
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const join = () => {
    const found = joinGroup(code.trim(), name.trim());
    if (found) showToast("Joined! You're now in this challenge.", "success");
    else showToast("No group found with that invite code.", "error");
    setCode(""); setName(""); onClose();
  };

  const canJoin = code.trim().length > 0 && name.trim().length > 0;
  const inputBase: React.CSSProperties = {
    ...font.body,
    fontSize: font.size(16),
    color: colors.foreground,
    border: `1.5px solid ${colors.border}`,
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: colors.card,
    marginBottom: 20,
    width: "100%",
    outline: "none",
    display: "block",
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ ...font.heading, fontSize: font.size(24), color: colors.primary }}>Join a Challenge</span>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <X size={18} color={colors.mutedForeground} />
          </button>
        </div>
        <div style={{ height: 1, backgroundColor: colors.line, marginBottom: 20 }} />
        <SectionTitle label="Invite code" />
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. AB12CD" style={inputBase} />
        <SectionTitle label="Your name" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="How the group will see you" style={inputBase} />
        <button onClick={join} disabled={!canJoin} style={{ backgroundColor: canJoin ? colors.primary : colors.muted, borderRadius: 14, paddingTop: 16, paddingBottom: 16, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: canJoin ? "pointer" : "default", opacity: canJoin ? 1 : 0.55 }}>
          <span style={{ ...font.label, fontSize: font.size(17), color: canJoin ? "#fff" : colors.mutedForeground, fontWeight: 700 }}>Join Group</span>
        </button>
      </div>
    </Modal>
  );
}

function GroupCard({ group }: { group: Group }) {
  const colors = useColors();
  const font = useFont();
  const [showCode, setShowCode] = useState(false);
  const start = new Date(group.startDate + "T12:00:00");
  const end = new Date(group.endDate + "T12:00:00");
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const total = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsed = total - daysLeft;
  const pct = Math.min(100, Math.round((elapsed / total) * 100));

  return (
    <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ height: 4, backgroundColor: colors.primary }} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground, flex: 1 }}>{group.name}</span>
          <span style={{ ...font.label, fontSize: font.size(12), color: colors.primary, fontWeight: 700, backgroundColor: colors.primary + "20", borderRadius: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 3, paddingBottom: 3 }}>{daysLeft}d left</span>
        </div>
        {group.description ? <p style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, marginBottom: 10 }}>{group.description}</p> : null}

        <div style={{ height: 5, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ height: 5, borderRadius: 3, backgroundColor: colors.primary, width: `${pct}%` }} />
        </div>
        <p style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, marginBottom: 10 }}>
          Day {elapsed} of {total} · {group.members.length} member{group.members.length !== 1 ? "s" : ""}
        </p>

        {group.habitNames.length > 0 && (
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {group.habitNames.slice(0, 4).map((h, i) => (
              <span key={i} style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, backgroundColor: colors.muted, borderRadius: 6, paddingLeft: 8, paddingRight: 8, paddingTop: 3, paddingBottom: 3 }}>· {h}</span>
            ))}
            {group.habitNames.length > 4 && <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, alignSelf: "center" }}>+{group.habitNames.length - 4} more</span>}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {group.members.map((m) => (
            <div key={m.id} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.muted, borderRadius: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}>
              <User size={11} color={colors.mutedForeground} />
              <span style={{ ...font.body, fontSize: font.size(12), color: colors.foreground }}>{m.name}</span>
              {m.name === group.creatorName && <span style={{ ...font.body, fontSize: font.size(10), color: colors.primary }}>★</span>}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowCode(!showCode)}
          style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, border: `1px solid ${colors.border}`, borderRadius: 8, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "none", cursor: "pointer" }}
        >
          <Share2 size={13} color={colors.primary} />
          <span style={{ ...font.label, fontSize: font.size(13), color: colors.primary }}>
            {showCode ? `Code: ${group.inviteCode}` : "Show invite code"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const font = useFont();
  const { groups } = useHabits();
  const { theme, fontStyle, fontSize, userName, userEmoji, setTheme, setFontStyle, setFontSize, setUserName, setUserEmoji, reset } = useSettings();

  const isDesktop = useIsDesktop();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [showAvatars, setShowAvatars] = useState(false);

  const saveName = () => { setUserName(nameInput.trim()); setEditingName(false); };

  const handleTheme = (key: ThemeName) => {
    if (key === theme) return;
    setTheme(key);
    showToast(`Theme: ${THEMES[key].label}`, "success");
  };

  const handleFontStyle = (key: FontStyle, label: string) => {
    if (key === fontStyle) return;
    setFontStyle(key);
    showToast(`Font: ${label}`, "success");
  };

  const handleFontSize = (key: FontSize, label: string) => {
    if (key === fontSize) return;
    setFontSize(key);
    showToast(`Text size: ${label}`, "success");
  };

  const handleReset = () => {
    if (window.confirm("Restore all settings to defaults?")) {
      reset();
      showToast("Settings restored to defaults", "info");
    }
  };

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ paddingTop: 12, paddingBottom: 14, paddingLeft: 20, paddingRight: 20, borderBottom: `1px solid ${colors.line}`, display: "flex", flexDirection: "row", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 44 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            <span style={{ ...font.heading, fontSize: font.size(26), color: colors.primary }}>Profile</span>
            <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
          </div>
          <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, marginTop: 2 }}>Personalize your journal</span>
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: isDesktop ? 840 : undefined, margin: isDesktop ? "0 auto" : undefined, padding: isDesktop ? "24px 32px 40px" : "20px 16px 32px" }}>
        {/* Profile Card */}
        <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ height: 5, backgroundColor: colors.primary }} />
          <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Avatar */}
            <button
              onClick={() => setShowAvatars(!showAvatars)}
              style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + "18", border: `2px solid ${colors.primary}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative", cursor: "pointer" }}
            >
              <span style={{ fontSize: 44 }}>{userEmoji}</span>
              <div style={{ position: "absolute", bottom: -2, right: -2, backgroundColor: colors.primary, borderRadius: 10, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: "#fff" }}>✏️</span>
              </div>
            </button>

            {showAvatars && (
              <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                {AVATARS.map((a) => (
                  <button key={a} onClick={() => { setUserEmoji(a); setShowAvatars(false); }} style={{ width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: userEmoji === a ? colors.primary + "20" : colors.muted, border: `${userEmoji === a ? 2 : 1}px solid ${userEmoji === a ? colors.primary : colors.border}`, cursor: "pointer" }}>
                    <span style={{ fontSize: 24 }}>{a}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Name */}
            {editingName ? (
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  placeholder="Your name"
                  style={{ ...font.heading, fontSize: font.size(20), color: colors.foreground, paddingBottom: 4, minWidth: 140, textAlign: "center", background: "none", border: "none", borderBottom: `2px solid ${colors.primary}`, outline: "none" } as React.CSSProperties}
                />
                <button onClick={saveName} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <Check size={18} color={colors.primary} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditingName(true); setNameInput(userName); }} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ ...font.heading, fontSize: font.size(22), color: userName ? colors.foreground : colors.mutedForeground }}>
                  {userName || "Tap to set your name"}
                </span>
                <span style={{ fontSize: 14 }}>✏️</span>
              </button>
            )}
            <p style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, marginTop: 4, marginBottom: 0 }}>Habit Journal · Since today</p>
          </div>
        </div>

        {/* Theme */}
        <SectionTitle label="Journal Theme" />
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {THEME_ORDER.map((key) => {
            const t = THEMES[key];
            const selected = theme === key;
            return (
              <button key={key} onClick={() => handleTheme(key)} style={{ width: "30%", borderRadius: 12, padding: 10, backgroundColor: t.card, border: `${selected ? 2.5 : 1}px solid ${selected ? t.primary : t.border}`, position: "relative", overflow: "hidden", cursor: "pointer" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: 4, marginBottom: 6 }}>
                  {t.swatches.map((s, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: s }} />)}
                </div>
                <div style={{ height: 4, borderRadius: 2, backgroundColor: t.background, marginBottom: 8 }} />
                <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: selected ? 600 : 400, fontSize: 12, color: selected ? t.primary : t.mutedForeground, textAlign: "center", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
                {selected && (
                  <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: t.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={10} color={t.primaryForeground} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Font Style */}
        <SectionTitle label="Font Style" />
        <div style={{ display: "flex", flexDirection: "row", gap: 12, marginBottom: 24 }}>
          {FONT_OPTIONS.map((opt) => {
            const selected = fontStyle === opt.key;
            return (
              <button key={opt.key} onClick={() => handleFontStyle(opt.key, opt.label)} style={{ flex: 1, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: colors.card, border: `${selected ? 2.5 : 1}px solid ${selected ? colors.primary : colors.border}`, position: "relative", cursor: "pointer" }}>
                <span style={{ ...opt.previewStyle, fontSize: 34, color: selected ? colors.primary : colors.mutedForeground, lineHeight: 1.2, display: "block" }}>Aa</span>
                <span style={{ ...font.body, fontSize: font.size(12), color: selected ? colors.foreground : colors.mutedForeground, marginTop: 4 }}>{opt.label}</span>
                {selected && (
                  <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={10} color={colors.primaryForeground} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Text Size */}
        <SectionTitle label="Text Size" />
        <div style={{ display: "flex", flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {SIZE_OPTIONS.map((opt) => {
            const selected = fontSize === opt.key;
            return (
              <button key={opt.key} onClick={() => handleFontSize(opt.key, opt.label)} style={{ flex: 1, borderRadius: 12, paddingTop: 14, paddingBottom: 14, display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: selected ? colors.primary : colors.card, border: `1px solid ${selected ? colors.primary : colors.border}`, cursor: "pointer" }}>
                <span style={{ ...font.heading, fontSize: opt.size, color: selected ? colors.primaryForeground : colors.foreground, lineHeight: 1.2 }}>A</span>
                <span style={{ ...font.body, fontSize: 11, color: selected ? colors.primaryForeground : colors.mutedForeground, marginTop: 2 }}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, backgroundColor: colors.line, marginBottom: 20 }} />

        {/* Groups */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <SectionTitle label="Accountability Groups" />
          <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setShowCreate(true)} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, paddingLeft: 12, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 20, backgroundColor: colors.primary, border: "none", cursor: "pointer" }}>
              <Plus size={14} color={colors.primaryForeground} />
              <span style={{ ...font.label, fontSize: font.size(13), color: colors.primaryForeground }}>Create</span>
            </button>
            <button onClick={() => setShowJoin(true)} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, paddingLeft: 12, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 20, backgroundColor: colors.muted, border: `1px solid ${colors.border}`, cursor: "pointer" }}>
              <Users size={14} color={colors.foreground} />
              <span style={{ ...font.label, fontSize: font.size(13), color: colors.foreground }}>Join</span>
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 32, paddingBottom: 32, paddingLeft: 16, paddingRight: 16, backgroundColor: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, marginBottom: 24, gap: 8 }}>
            <Users size={32} color={colors.mutedForeground} />
            <span style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground }}>No groups yet</span>
            <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.5, margin: 0 }}>
              Create a challenge or join one with an invite code to stay accountable with friends.
            </p>
          </div>
        ) : (
          groups.map((g) => <GroupCard key={g.id} group={g} />)
        )}

        {/* Reset */}
        <button onClick={handleReset} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${colors.destructive}`, borderRadius: 12, paddingTop: 13, paddingBottom: 13, width: "100%", background: "none", cursor: "pointer", marginTop: 8 }}>
          <span style={{ ...font.label, fontSize: font.size(15), color: colors.destructive }}>⟳ Reset to Defaults</span>
        </button>
      </div>
      </div>

      <CreateGroupModal visible={showCreate} onClose={() => setShowCreate(false)} />
      <JoinModal visible={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
}
