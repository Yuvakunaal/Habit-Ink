import { useContext } from "react";
import { useColorScheme } from "react-native";

import { SettingsContext } from "@/context/SettingsContext";
import colors from "@/constants/colors";

export function useColors() {
  const settings = useContext(SettingsContext);
  if (settings) {
    return settings.activeColors;
  }
  // Fallback if SettingsProvider is not yet mounted
  const scheme = useColorScheme();
  const palette =
    scheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius } as typeof colors.light & { radius: number; success: string; line: string; paper: string };
}
