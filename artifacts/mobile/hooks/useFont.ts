import { useContext } from "react";
import { SettingsContext } from "@/context/SettingsContext";

const SIZE_SCALE: Record<string, number> = {
  small: 0.88,
  medium: 1.0,
  large: 1.15,
};

export interface FontTokens {
  heading: string;
  label: string;
  body: string;
  medium: string;
  size: (base: number) => number;
}

export function useFont(): FontTokens {
  const ctx = useContext(SettingsContext);
  const style = ctx?.fontStyle ?? "handwritten";
  const scale = SIZE_SCALE[ctx?.fontSize ?? "medium"] ?? 1;

  const heading =
    style === "handwritten" ? "Caveat_700Bold" : "Inter_700Bold";
  const label =
    style === "handwritten" ? "Caveat_700Bold" : "Inter_600SemiBold";
  const body =
    style === "handwritten" ? "Caveat_400Regular" : "Inter_400Regular";
  const medium =
    style === "handwritten" ? "Caveat_400Regular" : "Inter_500Medium";

  return {
    heading,
    label,
    body,
    medium,
    size: (base: number) => Math.round(base * scale),
  };
}
