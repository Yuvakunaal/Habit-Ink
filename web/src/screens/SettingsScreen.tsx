import React from "react";
import { X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { THEMES, ThemeName } from "@/constants/themes";
import { FontSize, FontStyle, useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsDesktop } from "@/hooks/useIsDesktop";

const THEME_ORDER: ThemeName[] = ["cream", "midnight", "forest", "rose", "slate"];

const FONT_OPTIONS: { key: FontStyle; title: string; previewStyle: React.CSSProperties }[] = [
  { key: "handwritten", title: "Handwritten", previewStyle: { fontFamily: '"Caveat", cursive', fontWeight: 700 } },
  { key: "clean", title: "Clean", previewStyle: { fontFamily: '"Inter", sans-serif', fontWeight: 600 } },
];

const SIZE_OPTIONS: { key: FontSize; label: string; size: number }[] = [
  { key: "small", label: "A", size: 16 },
  { key: "medium", label: "A", size: 20 },
  { key: "large", label: "A", size: 25 },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  const font = useFont();
  return (
    <div style={{ paddingTop: 20, paddingBottom: 20 }}>
      <p style={{ ...font.label, fontSize: font.size(13), color: colors.primary, letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" as const }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { theme, fontStyle, fontSize, setTheme, setFontStyle, setFontSize, reset } = useSettings();
  const { showToast } = useToast();

  const handleTheme = (key: ThemeName) => {
    if (key === theme) return;
    setTheme(key);
    showToast(`Theme: ${THEMES[key].label}`, "success");
  };

  const handleFontStyle = (key: FontStyle, title: string) => {
    if (key === fontStyle) return;
    setFontStyle(key);
    showToast(`Font: ${title}`, "success");
  };

  const handleFontSize = (key: FontSize) => {
    if (key === fontSize) return;
    setFontSize(key);
    showToast(`Text size: ${key.charAt(0).toUpperCase() + key.slice(1)}`, "success");
  };

  const handleReset = () => {
    if (window.confirm("Restore all settings to default?")) {
      reset();
      showToast("Settings restored to defaults", "info");
    }
  };

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      {isDesktop ? (
        <div style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 18, paddingBottom: 14, borderBottom: `1px solid ${colors.line}`, flexShrink: 0 }}>
          <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Settings</span>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 12, borderBottom: `1px solid ${colors.line}`, flexShrink: 0 }}>
            <button onClick={() => navigate(-1)} style={{ padding: 6, width: 38, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <X size={22} color={colors.mutedForeground} />
            </button>
            <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
              <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary }}>Settings</span>
              <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            </div>
            <div style={{ width: 38 }} />
          </div>
          <div style={{ height: 1, backgroundColor: colors.line }} />
        </>
      )}

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: isDesktop ? 680 : undefined, margin: isDesktop ? "0 auto" : undefined, padding: isDesktop ? "0 32px 40px" : "0 16px 32px" }}>
        {/* Theme */}
        <Section title="Journal Theme">
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {THEME_ORDER.map((key) => {
              const t = THEMES[key];
              const selected = theme === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTheme(key)}
                  style={{ width: "30%", borderRadius: 10, padding: 10, backgroundColor: t.card, border: `${selected ? 2 : 1}px solid ${selected ? t.primary : t.border}`, position: "relative", overflow: "hidden", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", flexDirection: "row", gap: 4, marginBottom: 6 }}>
                    {t.swatches.map((s, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: s, border: `0.5px solid ${t.border}` }} />
                    ))}
                  </div>
                  <div style={{ height: 4, borderRadius: 2, backgroundColor: t.background, marginBottom: 8 }} />
                  <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: selected ? 600 : 400, fontSize: font.size(13), color: selected ? t.primary : t.mutedForeground, textAlign: "center", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
                  {selected && (
                    <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: t.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={10} color={t.primaryForeground} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        <div style={{ height: 1, backgroundColor: colors.line }} />

        {/* Font Style */}
        <Section title="Font Style">
          <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
            {FONT_OPTIONS.map((opt) => {
              const selected = fontStyle === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleFontStyle(opt.key, opt.title)}
                  style={{ flex: 1, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: colors.card, border: `${selected ? 2 : 1}px solid ${selected ? colors.primary : colors.border}`, position: "relative", cursor: "pointer" }}
                >
                  <span style={{ ...opt.previewStyle, fontSize: 36, color: selected ? colors.primary : colors.mutedForeground, lineHeight: 1.2, display: "block" }}>Aa</span>
                  <span style={{ ...opt.previewStyle, fontSize: font.size(15), color: selected ? colors.foreground : colors.mutedForeground, marginTop: 4, display: "block" }}>Daily Tracker</span>
                  <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, marginTop: 4 }}>{opt.title}</span>
                  {selected && (
                    <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={10} color={colors.primaryForeground} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        <div style={{ height: 1, backgroundColor: colors.line }} />

        {/* Font Size */}
        <Section title="Text Size">
          <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
            {SIZE_OPTIONS.map((opt) => {
              const selected = fontSize === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleFontSize(opt.key)}
                  style={{ flex: 1, borderRadius: 10, paddingTop: 14, paddingBottom: 14, display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: selected ? colors.primary : colors.card, border: `1px solid ${selected ? colors.primary : colors.border}`, cursor: "pointer" }}
                >
                  <span style={{ ...font.heading, fontSize: opt.size, color: selected ? colors.primaryForeground : colors.foreground, lineHeight: 1.2 }}>{opt.label}</span>
                  <span style={{ ...font.body, fontSize: 11, color: selected ? colors.primaryForeground : colors.mutedForeground, marginTop: 2 }}>{opt.key}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <div style={{ height: 1, backgroundColor: colors.line }} />

        {/* About */}
        <Section title="About">
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 16, backgroundColor: colors.card, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground }}>Habit Journal</span>
            <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, lineHeight: 1.4, margin: 0 }}>
              A personal notebook for tracking your habits and goals — one day at a time.
            </p>
            <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>Version 1.0</span>
          </div>
        </Section>

        {/* Reset */}
        <button
          onClick={handleReset}
          style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${colors.destructive}`, borderRadius: 10, paddingTop: 14, paddingBottom: 14, width: "100%", background: "none", cursor: "pointer", marginBottom: 24 }}
        >
          <span style={{ ...font.label, fontSize: font.size(16), color: colors.destructive }}>⟳ Reset to Defaults</span>
        </button>
      </div>
      </div>
    </div>
  );
}
