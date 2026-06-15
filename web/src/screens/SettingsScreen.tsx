import React, { useEffect, useRef, useState } from "react";
import { X, Check, Feather, LogOut, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { THEMES, ThemeName } from "@/constants/themes";
import { FontSize, FontStyle, useSettings } from "@/context/SettingsContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
  const {
    theme, fontStyle, fontSize,
    customQuoteText, customQuoteAuthor,
    setTheme, setFontStyle, setFontSize,
    setCustomQuoteText, setCustomQuoteAuthor,
    reset,
  } = useSettings();
  const { showToast } = useToast();
  const { user, signOut } = useAuth();

  // ── Inline reset confirm ──────────────────────────────────────────────────
  const [resetConfirming, setResetConfirming] = useState(false);
  const resetConfirmTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-cancel the confirm state after 4s of inactivity
  useEffect(() => {
    if (resetConfirming) {
      resetConfirmTimer.current = setTimeout(() => setResetConfirming(false), 4000);
    }
    return () => clearTimeout(resetConfirmTimer.current);
  }, [resetConfirming]);

  // ── Sign-out modal ────────────────────────────────────────────────────────
  const [showSignOut, setShowSignOut] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  const handleResetClick = () => {
    if (!resetConfirming) {
      setResetConfirming(true);
    } else {
      clearTimeout(resetConfirmTimer.current);
      setResetConfirming(false);
      reset();
      showToast("Settings restored to defaults", "info");
    }
  };

  const handleSignOut = async () => {
    setShowSignOut(false);
    await signOut();
  };

  const googleName = (user?.user_metadata?.full_name as string) || "Your Account";
  const googleEmail = user?.email ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      <style>{`
        @keyframes resetConfirmIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

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

          {/* Custom Quote */}
          <Section title="Daily Quote">
            <p style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, margin: "0 0 12px" }}>
              Shown on Today's screen. Leave blank to use the built-in rotating quotes.
            </p>
            <input
              value={customQuoteText}
              onChange={e => setCustomQuoteText(e.target.value)}
              placeholder="Type your favourite quote…"
              maxLength={220}
              style={{ ...font.body, fontSize: font.size(15), color: colors.foreground, border: `1.5px solid ${colors.border}`, borderRadius: 10, padding: "11px 14px", backgroundColor: colors.card, width: "100%", outline: "none", display: "block", marginBottom: 10 }}
            />
            <input
              value={customQuoteAuthor}
              onChange={e => setCustomQuoteAuthor(e.target.value)}
              placeholder="Author (optional)"
              maxLength={60}
              style={{ ...font.body, fontSize: font.size(14), color: colors.foreground, border: `1.5px solid ${colors.border}`, borderRadius: 10, padding: "10px 14px", backgroundColor: colors.card, width: "100%", outline: "none", display: "block", marginBottom: customQuoteText.trim() ? 12 : 0 }}
            />
            {customQuoteText.trim() && (
              <div style={{ border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.primary}`, borderRadius: 10, padding: 14, backgroundColor: colors.card }}>
                <Feather size={13} color={colors.primary} style={{ marginBottom: 6, display: "block" }} />
                <p style={{ ...font.body, fontSize: font.size(14), color: colors.foreground, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>"{customQuoteText.trim()}"</p>
                <p style={{ ...font.label, fontSize: font.size(12), color: colors.primary, marginTop: 6, marginBottom: 0 }}>— {customQuoteAuthor.trim() || "You"}</p>
              </div>
            )}
            {customQuoteText.trim() && (
              <button
                onClick={() => { setCustomQuoteText(""); setCustomQuoteAuthor(""); }}
                style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
              >
                <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, textDecoration: "underline" }}>Clear custom quote</span>
              </button>
            )}
          </Section>

          <div style={{ height: 1, backgroundColor: colors.line }} />

          {/* About */}
          <Section title="About">
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 16, backgroundColor: colors.card, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ ...font.heading, fontSize: font.size(18), color: colors.foreground }}>Habit Ink</span>
              <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, lineHeight: 1.4, margin: 0 }}>
                A personal notebook for tracking your habits and goals — one day at a time.
              </p>
              <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground }}>Version 1.0</span>
            </div>
          </Section>

          {/* Account */}
          <Section title="Account">
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: colors.card }}>
              {/* User row */}
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${colors.border}` }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    referrerPolicy="no-referrer"
                    alt="avatar"
                    style={{ width: 38, height: 38, borderRadius: 19, objectFit: "cover", border: `1.5px solid ${colors.border}`, flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary + "18", border: `1.5px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }}>😊</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...font.label, fontSize: font.size(14), color: colors.foreground, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {googleName}
                  </p>
                  <p style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {googleEmail}
                  </p>
                </div>
              </div>

              {/* Sign out row */}
              <button
                onClick={() => setShowSignOut(true)}
                style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer" }}
              >
                <LogOut size={15} color={colors.destructive} />
                <span style={{ ...font.label, fontSize: font.size(15), color: colors.destructive }}>Sign Out</span>
              </button>
            </div>
          </Section>

          <div style={{ height: 1, backgroundColor: colors.line }} />

          {/* Reset to Defaults — inline confirm */}
          <div style={{ paddingTop: 20, paddingBottom: 4 }}>
            {!resetConfirming ? (
              <button
                onClick={handleResetClick}
                style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${colors.destructive}50`, borderRadius: 10, paddingTop: 14, paddingBottom: 14, width: "100%", background: "none", cursor: "pointer" }}
              >
                <RotateCcw size={15} color={colors.destructive} />
                <span style={{ ...font.label, fontSize: font.size(15), color: colors.destructive }}>Reset to Defaults</span>
              </button>
            ) : (
              <div
                style={{
                  backgroundColor: colors.destructive + "0d",
                  border: `1.5px solid ${colors.destructive}35`,
                  borderRadius: 12,
                  padding: "16px",
                  animation: "resetConfirmIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <p style={{ ...font.body, fontSize: font.size(13), color: colors.destructive, margin: "0 0 14px", lineHeight: 1.5, textAlign: "center" }}>
                  This will reset your <strong>theme</strong>, <strong>font</strong>, and <strong>quote</strong> back to defaults. Your habits and journal stay untouched.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => { clearTimeout(resetConfirmTimer.current); setResetConfirming(false); }}
                    style={{ flex: 1, padding: "11px 0", borderRadius: 10, backgroundColor: colors.muted, border: `1px solid ${colors.border}`, ...font.body, fontSize: font.size(14), color: colors.foreground, cursor: "pointer" }}
                  >
                    Keep current
                  </button>
                  <button
                    onClick={handleResetClick}
                    style={{ flex: 1, padding: "11px 0", borderRadius: 10, backgroundColor: colors.destructive, border: "none", ...font.label, fontSize: font.size(14), fontWeight: 700, color: "#fff", cursor: "pointer" }}
                  >
                    Yes, reset
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sign-out confirm dialog */}
      <ConfirmDialog
        visible={showSignOut}
        icon="👋"
        title={`Sign out, ${googleName.split(" ")[0]}?`}
        message="You'll be taken back to the login screen and will need to sign in with Google again."
        cancelLabel="Stay logged in"
        confirmLabel="Sign Out"
        destructive
        onCancel={() => setShowSignOut(false)}
        onConfirm={handleSignOut}
      >
        {/* User info card inside the dialog */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: colors.muted,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              referrerPolicy="no-referrer"
              alt="avatar"
              style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover", border: `1.5px solid ${colors.border}`, flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22 }}>😊</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <p style={{ ...font.label, fontSize: font.size(14), color: colors.foreground, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {googleName}
            </p>
            <p style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {googleEmail}
            </p>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
