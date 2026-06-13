import AsyncStorage from "@react-native-async-storage/async-storage";
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
}

interface SettingsContextValue extends SettingsState {
  activeColors: ThemeMeta;
  setTheme: (t: ThemeName) => void;
  setFontStyle: (f: FontStyle) => void;
  setFontSize: (s: FontSize) => void;
  reset: () => void;
}

const DEFAULTS: SettingsState = {
  theme: "cream",
  fontStyle: "handwritten",
  fontSize: "medium",
};

const STORAGE_KEY = "@habitjournal/settings";

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<SettingsState>;
          setSettings((prev) => ({ ...prev, ...saved }));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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
