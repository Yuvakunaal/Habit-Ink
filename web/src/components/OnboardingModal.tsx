import React, { useState } from "react";
import { Check } from "lucide-react";
import { useHabits, toDateKey } from "@/context/HabitContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { THEMES, ThemeName } from "@/constants/themes";

export const ONBOARDING_KEY = "habitink_onboarding_done";

// ── Habit templates ──────────────────────────────────────────────────────────

interface Template {
  emoji: string;
  name: string;
  type: "yesno" | "number";
  target: string;
  schedule: "daily" | "weekdays";
  color: string;
  category: string;
}

const TEMPLATES: Template[] = [
  // Health
  { emoji: "💧", name: "Drink 8 glasses of water", type: "number", target: "8",     schedule: "daily",    color: "#1A6B6B", category: "Health" },
  { emoji: "🥗", name: "Eat a healthy meal",        type: "yesno",  target: "",      schedule: "daily",    color: "#1A6B3A", category: "Health" },
  { emoji: "💊", name: "Take vitamins",             type: "yesno",  target: "",      schedule: "daily",    color: "#3A7A8C", category: "Health" },
  // Fitness
  { emoji: "🏃", name: "Walk 10,000 steps",         type: "number", target: "10000", schedule: "daily",    color: "#2B3A8C", category: "Fitness" },
  { emoji: "🏋️", name: "Work out",                  type: "yesno",  target: "",      schedule: "daily",    color: "#8B2635", category: "Fitness" },
  { emoji: "🧘", name: "Stretch or yoga",           type: "yesno",  target: "",      schedule: "daily",    color: "#6B3A8C", category: "Fitness" },
  // Learning
  { emoji: "📚", name: "Read 20 pages",             type: "number", target: "20",    schedule: "daily",    color: "#2B3A8C", category: "Learning" },
  { emoji: "✍️", name: "Write something",           type: "yesno",  target: "",      schedule: "daily",    color: "#C9A84C", category: "Learning" },
  { emoji: "🧠", name: "Practice a skill",          type: "yesno",  target: "",      schedule: "weekdays", color: "#6B3A8C", category: "Learning" },
  // Mindfulness
  { emoji: "🧘", name: "Meditate",                  type: "yesno",  target: "",      schedule: "daily",    color: "#6B3A8C", category: "Mindfulness" },
  { emoji: "📓", name: "Write in journal",          type: "yesno",  target: "",      schedule: "daily",    color: "#C9A84C", category: "Mindfulness" },
  { emoji: "🌅", name: "Morning routine",           type: "yesno",  target: "",      schedule: "daily",    color: "#C04A1A", category: "Mindfulness" },
  // Productivity
  { emoji: "✅", name: "Complete top 3 tasks",      type: "yesno",  target: "",      schedule: "weekdays", color: "#2B3A8C", category: "Productivity" },
  { emoji: "📵", name: "No social media before 9am",type: "yesno",  target: "",      schedule: "daily",    color: "#8B2635", category: "Productivity" },
  { emoji: "☀️", name: "Wake up by 7am",            type: "yesno",  target: "",      schedule: "daily",    color: "#C9A84C", category: "Productivity" },
  // Sleep
  { emoji: "😴", name: "Sleep 8 hours",             type: "number", target: "8",     schedule: "daily",    color: "#6B3A8C", category: "Sleep" },
  { emoji: "🌙", name: "No screens after 10pm",     type: "yesno",  target: "",      schedule: "daily",    color: "#2B3A8C", category: "Sleep" },
  { emoji: "☕", name: "No caffeine after 3pm",     type: "yesno",  target: "",      schedule: "daily",    color: "#C04A1A", category: "Sleep" },
];

const CATEGORIES = [
  { name: "Health",       emoji: "❤️" },
  { name: "Fitness",      emoji: "💪" },
  { name: "Learning",     emoji: "📚" },
  { name: "Mindfulness",  emoji: "🧘" },
  { name: "Productivity", emoji: "⚡" },
  { name: "Sleep",        emoji: "😴" },
];

const THEME_ORDER: ThemeName[] = ["cream", "midnight", "forest", "rose", "slate"];

interface Props {
  onDismiss: () => void;
}

export default function OnboardingModal({ onDismiss }: Props) {
  const colors = useColors();
  const font = useFont();
  const { addHabit } = useHabits();
  const { theme: currentTheme, setTheme } = useSettings();

  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set());
  const [pickedTheme, setPickedTheme] = useState<ThemeName>(currentTheme);

  const visibleTemplates = selectedCategories.size === 0
    ? TEMPLATES
    : TEMPLATES.filter(t => selectedCategories.has(t.category));

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
    setSelectedHabits(new Set());
  };

  const toggleHabit = (idx: number) => {
    setSelectedHabits(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleFinish = () => {
    const today = toDateKey(new Date());
    visibleTemplates.forEach((t, idx) => {
      if (!selectedHabits.has(idx)) return;
      addHabit({
        name:       t.name,
        type:       t.type,
        target:     t.target,
        schedule:   t.schedule,
        customDays: undefined,
        startDate:  today,
        emoji:      t.emoji,
        color:      t.color,
        archived:   false,
      });
    });
    if (pickedTheme !== currentTheme) setTheme(pickedTheme);
    localStorage.setItem(ONBOARDING_KEY, "1");
    onDismiss();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    onDismiss();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        backgroundColor: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
          animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Top bar */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          {/* Step dots */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: s === step ? 24 : 8,
                height: 8, borderRadius: 4,
                backgroundColor: s === step ? colors.primary : colors.border,
                transition: "all 0.25s ease",
              }} />
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px" }}>

          {/* ── STEP 1: Categories ─────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <p style={{ ...font.heading, fontSize: font.size(26), color: colors.primary, margin: "0 0 6px", textAlign: "center" }}>
                Welcome to Habit Ink 🖊
              </p>
              <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.6, margin: "0 0 24px" }}>
                What do you want to work on? Pick the areas that matter to you.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {CATEGORIES.map(cat => {
                  const on = selectedCategories.has(cat.name);
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: `2px solid ${on ? colors.primary : colors.border}`,
                        backgroundColor: on ? colors.primary + "14" : colors.background,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.emoji}</span>
                      <span style={{ ...font.body, fontSize: font.size(15), color: on ? colors.primary : colors.foreground, fontWeight: on ? 600 : 400 }}>
                        {cat.name}
                      </span>
                      {on && (
                        <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check size={11} color={colors.primaryForeground} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, textAlign: "center", marginTop: 14 }}>
                Select any that interest you, or skip to choose your own habits.
              </p>
            </div>
          )}

          {/* ── STEP 2: Habit templates ────────────────────────────────── */}
          {step === 2 && (
            <div>
              <p style={{ ...font.heading, fontSize: font.size(24), color: colors.primary, margin: "0 0 6px", textAlign: "center" }}>
                Pick your first habits
              </p>
              <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.6, margin: "0 0 18px" }}>
                Select as many as you want. You can always add or remove habits later.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visibleTemplates.map((t, idx) => {
                  const on = selectedHabits.has(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleHabit(idx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: `2px solid ${on ? t.color : colors.border}`,
                        backgroundColor: on ? t.color + "14" : colors.background,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.color + "22", border: `1.5px solid ${t.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 18 }}>{t.emoji}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ ...font.body, fontSize: font.size(14), color: colors.foreground, margin: 0, fontWeight: on ? 600 : 400 }}>
                          {t.name}
                        </p>
                        <p style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, margin: 0 }}>
                          {t.type === "number" ? `Target: ${t.target}` : "Yes / No"} · {t.schedule === "daily" ? "Every day" : "Weekdays"}
                        </p>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                        backgroundColor: on ? t.color : "transparent",
                        border: `2px solid ${on ? t.color : colors.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}>
                        {on && <Check size={12} color="#fff" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedHabits.size > 0 && (
                <p style={{ ...font.body, fontSize: font.size(12), color: colors.primary, textAlign: "center", marginTop: 12, fontWeight: 600 }}>
                  {selectedHabits.size} habit{selectedHabits.size > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* ── STEP 3: Theme picker ───────────────────────────────────── */}
          {step === 3 && (
            <div>
              <p style={{ ...font.heading, fontSize: font.size(24), color: colors.primary, margin: "0 0 6px", textAlign: "center" }}>
                Pick your vibe ✨
              </p>
              <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, textAlign: "center", lineHeight: 1.6, margin: "0 0 20px" }}>
                Choose the look that feels most like you. You can change this anytime in Settings.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {THEME_ORDER.map(name => {
                  const t = THEMES[name];
                  const on = pickedTheme === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setPickedTheme(name)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: `2px solid ${on ? colors.primary : colors.border}`,
                        backgroundColor: on ? colors.primary + "10" : colors.background,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Color swatches */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {t.swatches.map((sw, i) => (
                          <div key={i} style={{
                            width: i === 0 ? 28 : 16,
                            height: 28,
                            borderRadius: 6,
                            backgroundColor: sw,
                            border: `1px solid rgba(0,0,0,0.08)`,
                            flexShrink: 0,
                          }} />
                        ))}
                      </div>
                      <span style={{ ...font.body, fontSize: font.size(15), color: colors.foreground, fontWeight: on ? 600 : 400, flex: 1 }}>
                        {t.label}
                      </span>
                      {on && (
                        <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check size={11} color={colors.primaryForeground} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: "16px 24px 20px",
          flexShrink: 0,
          borderTop: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <button
            onClick={handleSkip}
            style={{
              ...font.body, fontSize: font.size(14), color: colors.mutedForeground,
              background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
              textDecoration: "underline",
            }}
          >
            {step === 3 ? "Skip theme" : "Skip for now"}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  ...font.body, fontSize: font.size(14), color: colors.foreground,
                  backgroundColor: colors.muted, border: "none", borderRadius: 10,
                  padding: "11px 20px", cursor: "pointer",
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step < 3) setStep(s => s + 1);
                else handleFinish();
              }}
              style={{
                ...font.body, fontSize: font.size(15), fontWeight: 600,
                color: colors.primaryForeground,
                backgroundColor: colors.primary,
                border: "none", borderRadius: 10,
                padding: "11px 28px", cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {step === 3
                ? (selectedHabits.size > 0 ? `Add ${selectedHabits.size} habit${selectedHabits.size > 1 ? "s" : ""} →` : "Let's go →")
                : "Continue →"
              }
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}
