import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { THEMES, ThemeMeta, ThemeName } from "@/constants/themes";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/db/types";
import { debounce } from "@/lib/debounce";
import { useAuth } from "@/context/AuthContext";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type FontStyle = "handwritten" | "clean";
export type FontSize = "small" | "medium" | "large";

interface SettingsState {
  theme: ThemeName;
  fontStyle: FontStyle;
  fontSize: FontSize;
  userName: string;
  userEmoji: string;
  userAbout: string;
  weightKg: string;
  heightCm: string;
  customQuoteText: string;
  customQuoteAuthor: string;
  // Moved from direct localStorage in TabBar + TodayScreen
  habitOrder: string[];
  sidebarCollapsed: boolean;
}

interface SettingsContextValue extends SettingsState {
  activeColors: ThemeMeta;
  settingsLoaded: boolean;
  setTheme: (t: ThemeName) => void;
  setFontStyle: (f: FontStyle) => void;
  setFontSize: (s: FontSize) => void;
  setUserName: (n: string) => void;
  setUserEmoji: (e: string) => void;
  setUserAbout: (a: string) => void;
  setWeightKg: (w: string) => void;
  setHeightCm: (h: string) => void;
  setCustomQuoteText: (t: string) => void;
  setCustomQuoteAuthor: (a: string) => void;
  setHabitOrder: (order: string[]) => void;
  setSidebarCollapsed: (v: boolean) => void;
  reset: () => void;
}

const DEFAULTS: SettingsState = {
  theme: "cream",
  fontStyle: "handwritten",
  fontSize: "medium",
  userName: "",
  userEmoji: "😊",
  userAbout: "",
  weightKg: "",
  heightCm: "",
  customQuoteText: "",
  customQuoteAuthor: "",
  habitOrder: [],
  sidebarCollapsed: false,
};

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // ── Load from Supabase when user logs in ─────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULTS);
      setSettingsLoaded(false);
      return;
    }

    setSettingsLoaded(false);

    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setSettings({
            theme: (data.theme as ThemeName) || DEFAULTS.theme,
            fontStyle: (data.font_style as FontStyle) || DEFAULTS.fontStyle,
            fontSize: (data.font_size as FontSize) || DEFAULTS.fontSize,
            userName: data.user_name ?? "",
            userEmoji: data.user_emoji ?? "😊",
            userAbout: data.user_about ?? "",
            weightKg: data.weight_kg ?? "",
            heightCm: data.height_cm ?? "",
            customQuoteText: data.custom_quote_text ?? "",
            customQuoteAuthor: data.custom_quote_author ?? "",
            habitOrder: data.habit_order ?? [],
            sidebarCollapsed: data.sidebar_collapsed ?? false,
          });
        } else if (error && error.code !== "PGRST116") {
          // PGRST116 = row not found (trigger hasn't fired yet on very first login)
          console.error("[Habit Ink] Failed to load settings:", error.message);
        }
        setSettingsLoaded(true);
      });
  }, [userId]);

  // ── DB write helpers ──────────────────────────────────────────────────────

  const updateImmediate = useCallback(
    (patch: ProfileUpdate) => {
      if (!userId) return;
      supabase
        .from("profiles")
        .update(patch)
        .eq("id", userId)
        .then(({ error }) => {
          if (error)
            console.error("[Habit Ink] Settings save error:", error.message);
        });
    },
    [userId],
  );

  // Single debounced writer — 800 ms for text inputs
  const updateDebounced = useMemo(
    () =>
      debounce((patch: ProfileUpdate, uid: string) => {
        supabase
          .from("profiles")
          .update(patch)
          .eq("id", uid)
          .then(({ error }) => {
            if (error)
              console.error(
                "[Habit Ink] Settings save error:",
                error.message,
              );
          });
      }, 800),
    [],
  );

  // ── Immediate setters (button taps) ──────────────────────────────────────

  const setTheme = useCallback(
    (theme: ThemeName) => {
      setSettings((p) => ({ ...p, theme }));
      updateImmediate({ theme });
    },
    [updateImmediate],
  );

  const setFontStyle = useCallback(
    (fontStyle: FontStyle) => {
      setSettings((p) => ({ ...p, fontStyle }));
      updateImmediate({ font_style: fontStyle });
    },
    [updateImmediate],
  );

  const setFontSize = useCallback(
    (fontSize: FontSize) => {
      setSettings((p) => ({ ...p, fontSize }));
      updateImmediate({ font_size: fontSize });
    },
    [updateImmediate],
  );

  const setUserEmoji = useCallback(
    (userEmoji: string) => {
      setSettings((p) => ({ ...p, userEmoji }));
      updateImmediate({ user_emoji: userEmoji });
    },
    [updateImmediate],
  );

  // Name saves on blur (fires once) — treat as immediate
  const setUserName = useCallback(
    (userName: string) => {
      setSettings((p) => ({ ...p, userName }));
      updateImmediate({ user_name: userName });
    },
    [updateImmediate],
  );

  const setHabitOrder = useCallback(
    (habitOrder: string[]) => {
      setSettings((p) => ({ ...p, habitOrder }));
      updateImmediate({ habit_order: habitOrder });
    },
    [updateImmediate],
  );

  const setSidebarCollapsed = useCallback(
    (sidebarCollapsed: boolean) => {
      setSettings((p) => ({ ...p, sidebarCollapsed }));
      updateImmediate({ sidebar_collapsed: sidebarCollapsed });
    },
    [updateImmediate],
  );

  // ── Debounced setters (text inputs) ──────────────────────────────────────

  const setUserAbout = useCallback(
    (userAbout: string) => {
      setSettings((p) => ({ ...p, userAbout }));
      if (userId) updateDebounced({ user_about: userAbout }, userId);
    },
    [updateDebounced, userId],
  );

  const setWeightKg = useCallback(
    (weightKg: string) => {
      setSettings((p) => ({ ...p, weightKg }));
      if (userId) updateDebounced({ weight_kg: weightKg }, userId);
    },
    [updateDebounced, userId],
  );

  const setHeightCm = useCallback(
    (heightCm: string) => {
      setSettings((p) => ({ ...p, heightCm }));
      if (userId) updateDebounced({ height_cm: heightCm }, userId);
    },
    [updateDebounced, userId],
  );

  const setCustomQuoteText = useCallback(
    (customQuoteText: string) => {
      setSettings((p) => ({ ...p, customQuoteText }));
      if (userId) updateDebounced({ custom_quote_text: customQuoteText }, userId);
    },
    [updateDebounced, userId],
  );

  const setCustomQuoteAuthor = useCallback(
    (customQuoteAuthor: string) => {
      setSettings((p) => ({ ...p, customQuoteAuthor }));
      if (userId)
        updateDebounced({ custom_quote_author: customQuoteAuthor }, userId);
    },
    [updateDebounced, userId],
  );

  // ── Reset (appearance only — does NOT touch habits/entries/journals) ──────

  const reset = useCallback(() => {
    setSettings((p) => ({
      ...p,
      theme: "cream",
      fontStyle: "handwritten",
      fontSize: "medium",
      customQuoteText: "",
      customQuoteAuthor: "",
    }));
    updateImmediate({
      theme: "cream",
      font_style: "handwritten",
      font_size: "medium",
      custom_quote_text: "",
      custom_quote_author: "",
    });
  }, [updateImmediate]);

  const activeColors = THEMES[settings.theme];

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        activeColors,
        settingsLoaded,
        setTheme,
        setFontStyle,
        setFontSize,
        setUserName,
        setUserEmoji,
        setUserAbout,
        setWeightKg,
        setHeightCm,
        setCustomQuoteText,
        setCustomQuoteAuthor,
        setHabitOrder,
        setSidebarCollapsed,
        reset,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
