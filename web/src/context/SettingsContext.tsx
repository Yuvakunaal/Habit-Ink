import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { logError } from "@/lib/logger";

import { THEMES, ThemeMeta, ThemeName } from "@/constants/themes";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/db/types";
import { debounce } from "@/lib/debounce";
import { mapProfileFromDB } from "@/lib/db/mappers";
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

const SYSTEM_THEME_KEY = "habitink_user_set_theme";

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
          const mapped = mapProfileFromDB(data);
          // Auto-apply system dark mode for users who haven't manually set a theme
          const userHasSetTheme = !!localStorage.getItem(SYSTEM_THEME_KEY);
          let resolvedTheme = mapped.theme;
          if (
            !userHasSetTheme &&
            mapped.theme === "cream" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ) {
            resolvedTheme = "midnight";
            supabase.from("profiles").update({ theme: "midnight" }).eq("id", userId!).then(() => {});
          }
          setSettings({
            theme: resolvedTheme,
            fontStyle: mapped.fontStyle,
            fontSize: mapped.fontSize,
            userName: mapped.userName,
            userEmoji: mapped.userEmoji,
            userAbout: mapped.userAbout,
            weightKg: mapped.weightKg,
            heightCm: mapped.heightCm,
            customQuoteText: mapped.customQuoteText,
            customQuoteAuthor: mapped.customQuoteAuthor,
            habitOrder: mapped.habitOrder,
            sidebarCollapsed: mapped.sidebarCollapsed,
          });
        } else if (error && error.code !== "PGRST116") {
          // PGRST116 = row not found (trigger hasn't fired yet on very first login)
          logError("Failed to load settings", error.message);
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
            logError("Settings save error", error.message);
        });
    },
    [userId],
  );

  // Batching debounce: accumulates all field changes within 800ms into one write.
  // This prevents the previous bug where typing in one field cancelled another field's save.
  const pendingPatchRef = useRef<ProfileUpdate>({});

  const flushDebounced = useMemo(
    () =>
      debounce((uid: string) => {
        const patch = { ...pendingPatchRef.current };
        pendingPatchRef.current = {};
        if (Object.keys(patch).length === 0) return;
        supabase
          .from("profiles")
          .update(patch)
          .eq("id", uid)
          .then(({ error }) => {
            if (error)
              logError("Settings save error", error.message);
          });
      }, 800),
    [],
  );

  const updateDebounced = useCallback(
    (patch: ProfileUpdate) => {
      if (!userId) return;
      Object.assign(pendingPatchRef.current, patch);
      flushDebounced(userId);
    },
    [flushDebounced, userId],
  );

  // ── Immediate setters (button taps / selects) ─────────────────────────────

  const setTheme = useCallback(
    (theme: ThemeName) => {
      localStorage.setItem(SYSTEM_THEME_KEY, "1");
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

  // Name saves on blur — treat as immediate
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
      updateDebounced({ user_about: userAbout });
    },
    [updateDebounced],
  );

  const setWeightKg = useCallback(
    (weightKg: string) => {
      setSettings((p) => ({ ...p, weightKg }));
      updateDebounced({ weight_kg: weightKg });
    },
    [updateDebounced],
  );

  const setHeightCm = useCallback(
    (heightCm: string) => {
      setSettings((p) => ({ ...p, heightCm }));
      updateDebounced({ height_cm: heightCm });
    },
    [updateDebounced],
  );

  const setCustomQuoteText = useCallback(
    (customQuoteText: string) => {
      setSettings((p) => ({ ...p, customQuoteText }));
      updateDebounced({ custom_quote_text: customQuoteText });
    },
    [updateDebounced],
  );

  const setCustomQuoteAuthor = useCallback(
    (customQuoteAuthor: string) => {
      setSettings((p) => ({ ...p, customQuoteAuthor }));
      updateDebounced({ custom_quote_author: customQuoteAuthor });
    },
    [updateDebounced],
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
