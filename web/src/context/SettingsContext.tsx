import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { THEMES, ThemeMeta, ThemeName } from "@/constants/themes";

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
}

interface SettingsContextValue extends SettingsState {
  activeColors: ThemeMeta;
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
};

const STORAGE_KEY = "@habitjournal/settings";

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as Partial<SettingsState>;
        setSettings((prev) => ({ ...prev, ...saved }));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, loaded]);

  const setTheme = useCallback((theme: ThemeName) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setFontStyle = useCallback((fontStyle: FontStyle) => {
    setSettings((prev) => ({ ...prev, fontStyle }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  }, []);

  const setUserName = useCallback((userName: string) => {
    setSettings((prev) => ({ ...prev, userName }));
  }, []);

  const setUserEmoji = useCallback((userEmoji: string) => {
    setSettings((prev) => ({ ...prev, userEmoji }));
  }, []);

  const setUserAbout = useCallback((userAbout: string) => {
    setSettings((prev) => ({ ...prev, userAbout }));
  }, []);

  const setWeightKg = useCallback((weightKg: string) => {
    setSettings((prev) => ({ ...prev, weightKg }));
  }, []);

  const setHeightCm = useCallback((heightCm: string) => {
    setSettings((prev) => ({ ...prev, heightCm }));
  }, []);

  const setCustomQuoteText = useCallback((customQuoteText: string) => {
    setSettings((prev) => ({ ...prev, customQuoteText }));
  }, []);

  const setCustomQuoteAuthor = useCallback((customQuoteAuthor: string) => {
    setSettings((prev) => ({ ...prev, customQuoteAuthor }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULTS);
  }, []);

  const activeColors = THEMES[settings.theme];

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        activeColors,
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
