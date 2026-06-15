import React, { useRef, useEffect, useState } from "react";
import { Check, Pencil } from "lucide-react";

import { useHabits } from "@/context/HabitContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useToast } from "@/context/ToastContext";

const AVATARS = [
  "😊","🧑","👩","🧔","👨","🧘","🏃","💪",
  "📚","🎯","🌱","✨","🦊","🐻","🦋","🌟",
  "🧠","🎨","🎵","☀️","🌙","🔥","⭐","🦁",
];

function AutoTextarea({
  value, onChange, placeholder, style,
}: {
  value: string;
  onChange: (v: string) => void;
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
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ overflow: "hidden", resize: "none", ...style }}
    />
  );
}

function cmToFtIn(cmStr: string): string {
  const cm = parseFloat(cmStr);
  if (!cm || isNaN(cm) || cm <= 0) return "";
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${ft} ft ${inches} in`;
}

export default function ProfileScreen() {
  const colors = useColors();
  const font = useFont();
  const isDesktop = useIsDesktop();
  const { showToast } = useToast();
  const { getDayNumber } = useHabits();
  const {
    userName, userEmoji, userAbout,
    weightKg, heightCm,
    setUserName, setUserEmoji, setUserAbout,
    setWeightKg, setHeightCm,
  } = useSettings();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [showAvatars, setShowAvatars] = useState(false);
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");

  const saveName = () => {
    const trimmed = nameInput.trim();
    setUserName(trimmed);
    setEditingName(false);
    if (trimmed) showToast("Name updated", "success");
  };

  const journalDay = getDayNumber();

  const weightDisplayValue = (() => {
    if (!weightKg) return "";
    if (weightUnit === "kg") return weightKg;
    const lbs = parseFloat(weightKg) * 2.20462;
    return isNaN(lbs) ? "" : lbs.toFixed(1);
  })();

  const handleWeightChange = (raw: string) => {
    if (!raw) { setWeightKg(""); return; }
    if (weightUnit === "kg") { setWeightKg(raw); return; }
    const kg = parseFloat(raw) / 2.20462;
    setWeightKg(isNaN(kg) ? "" : kg.toFixed(2));
  };

  const heightDisplayValue = (() => {
    if (!heightCm) return "";
    if (heightUnit === "cm") return heightCm;
    const ft = parseFloat(heightCm) / 30.48;
    return isNaN(ft) ? "" : ft.toFixed(1);
  })();

  const heightSecondary = (() => {
    if (!heightCm) return "";
    if (heightUnit === "cm") return cmToFtIn(heightCm);
    const cm = Math.round(parseFloat(heightCm));
    return isNaN(cm) ? "" : `${cm} cm`;
  })();

  const handleHeightChange = (raw: string) => {
    if (!raw) { setHeightCm(""); return; }
    if (heightUnit === "cm") { setHeightCm(raw); return; }
    const cm = parseFloat(raw) * 30.48;
    setHeightCm(isNaN(cm) ? "" : cm.toFixed(1));
  };

  const inputBase: React.CSSProperties = {
    ...font.body,
    fontSize: font.size(15),
    color: colors.foreground,
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: 10,
    padding: "10px 14px",
    outline: "none",
    display: "block",
    width: "100%",
  };

  const sectionLabel = (text: string): React.CSSProperties => ({
    ...font.label,
    fontSize: font.size(11),
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 10,
  });

  return (
    <div
      className="page-enter"
      style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Header */}
      <div style={{
        paddingLeft: isDesktop ? 28 : 20,
        paddingRight: isDesktop ? 28 : 20,
        paddingTop: 18, paddingBottom: 14,
        borderBottom: `1px solid ${colors.line}`,
        flexShrink: 0,
      }}>
        <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Profile</span>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{
          maxWidth: isDesktop ? 580 : undefined,
          margin: isDesktop ? "0 auto" : undefined,
          padding: isDesktop ? "32px 28px 60px" : "24px 16px 48px",
        }}>

          {/* ── Avatar + Name hero ── */}
          <div style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 24,
          }}>
            <div style={{ height: 5, backgroundColor: colors.primary }} />
            <div style={{
              padding: "28px 24px 24px",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              {/* Avatar button */}
              <button
                onClick={() => setShowAvatars(!showAvatars)}
                style={{
                  width: 92, height: 92, borderRadius: 46,
                  backgroundColor: colors.primary + "14",
                  border: `2.5px solid ${colors.primary}45`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, position: "relative", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 50 }}>{userEmoji}</span>
                <div style={{
                  position: "absolute", bottom: 1, right: 1,
                  backgroundColor: colors.primary, borderRadius: 13,
                  width: 26, height: 26,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${colors.card}`,
                }}>
                  <Pencil size={12} color="#fff" />
                </div>
              </button>

              {/* Emoji grid */}
              {showAvatars && (
                <div style={{ marginBottom: 18, maxWidth: 320, width: "100%" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7, marginBottom: 10 }}>
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setUserEmoji(a); setShowAvatars(false); showToast("Avatar updated", "success"); }}
                        style={{
                          width: 44, height: 44, borderRadius: 22,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: userEmoji === a ? colors.primary + "1a" : colors.muted,
                          border: `${userEmoji === a ? 2 : 1}px solid ${userEmoji === a ? colors.primary : colors.border}`,
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{a}</span>
                      </button>
                    ))}
                  </div>
                  {/* Custom emoji input */}
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.background, border: `1.5px solid ${colors.border}`, borderRadius: 10, padding: "8px 12px" }}>
                    <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, flexShrink: 0 }}>Custom:</span>
                    <input
                      value={customEmojiInput}
                      onChange={(e) => setCustomEmojiInput(e.target.value)}
                      placeholder="Paste any emoji…"
                      maxLength={4}
                      style={{ flex: 1, ...font.body, fontSize: font.size(18), color: colors.foreground, background: "none", border: "none", outline: "none", textAlign: "center" }}
                    />
                    <button
                      onClick={() => {
                        const em = [...customEmojiInput.trim()][0];
                        if (em) { setUserEmoji(em); setShowAvatars(false); setCustomEmojiInput(""); showToast("Avatar updated", "success"); }
                      }}
                      style={{ ...font.label, fontSize: font.size(12), color: colors.primaryForeground, backgroundColor: colors.primary, border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", flexShrink: 0 }}
                    >
                      Use
                    </button>
                  </div>
                </div>
              )}

              {/* Name */}
              {editingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    maxLength={40}
                    placeholder="Your name"
                    style={{
                      ...font.heading, fontSize: font.size(22), color: colors.foreground,
                      textAlign: "center", background: "none", border: "none",
                      borderBottom: `2px solid ${colors.primary}`, outline: "none",
                      minWidth: 160, paddingBottom: 3,
                    } as React.CSSProperties}
                  />
                  <button onClick={saveName} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Check size={18} color={colors.primary} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingName(true); setNameInput(userName); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "none", border: "none", cursor: "pointer", marginBottom: 5,
                  }}
                >
                  <span style={{ ...font.heading, fontSize: font.size(22), color: userName ? colors.foreground : colors.mutedForeground }}>
                    {userName || "Tap to add your name"}
                  </span>
                  <Pencil size={14} color={colors.mutedForeground} />
                </button>
              )}

              <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>
                Habit Ink · Day {journalDay}
              </span>
            </div>
          </div>

          {/* ── About ── */}
          <div style={{ marginBottom: 24 }}>
            <span style={sectionLabel("About")}>About</span>
            <AutoTextarea
              value={userAbout}
              onChange={setUserAbout}
              placeholder="What are you working towards? Goals, motivation, or a short intro…"
              style={{
                ...inputBase,
                lineHeight: 1.65,
                backgroundColor: colors.card,
              }}
            />
          </div>

          {/* ── Body Metrics ── */}
          <div>
            <span style={sectionLabel("Body Metrics")}>Body Metrics</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Weight */}
              <div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>Weight</label>
                  <div style={{ display: "flex", flexDirection: "row", backgroundColor: colors.muted, borderRadius: 8, padding: 2 }}>
                    {(["kg", "lbs"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setWeightUnit(u)}
                        style={{
                          ...font.label, fontSize: font.size(11),
                          color: weightUnit === u ? colors.primaryForeground : colors.mutedForeground,
                          backgroundColor: weightUnit === u ? colors.primary : "transparent",
                          border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >{u}</button>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    min="0"
                    step={weightUnit === "kg" ? "0.1" : "0.5"}
                    value={weightDisplayValue}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    placeholder="—"
                    style={{ ...inputBase, paddingRight: 44, backgroundColor: colors.card }}
                  />
                  <span style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    ...font.label, fontSize: font.size(12), color: colors.primary, pointerEvents: "none",
                  }}>
                    {weightUnit}
                  </span>
                </div>
              </div>

              {/* Height */}
              <div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>Height</label>
                  <div style={{ display: "flex", flexDirection: "row", backgroundColor: colors.muted, borderRadius: 8, padding: 2 }}>
                    {(["cm", "ft"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setHeightUnit(u)}
                        style={{
                          ...font.label, fontSize: font.size(11),
                          color: heightUnit === u ? colors.primaryForeground : colors.mutedForeground,
                          backgroundColor: heightUnit === u ? colors.primary : "transparent",
                          border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >{u}</button>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    min="0"
                    step={heightUnit === "cm" ? "1" : "0.1"}
                    value={heightDisplayValue}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="—"
                    style={{ ...inputBase, paddingRight: 44, backgroundColor: colors.card }}
                  />
                  <span style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    ...font.label, fontSize: font.size(12), color: colors.primary, pointerEvents: "none",
                  }}>
                    {heightUnit}
                  </span>
                </div>
                {heightSecondary && (
                  <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, display: "block", marginTop: 5 }}>
                    ≈ {heightSecondary}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
