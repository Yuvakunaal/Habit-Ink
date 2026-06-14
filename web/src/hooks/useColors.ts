import { useContext } from "react";
import { SettingsContext } from "@/context/SettingsContext";
import { THEMES } from "@/constants/themes";

export function useColors() {
  const settings = useContext(SettingsContext);
  return settings ? settings.activeColors : THEMES.cream;
}
