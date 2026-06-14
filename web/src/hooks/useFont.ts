import { useContext } from "react";
import { SettingsContext } from "@/context/SettingsContext";
import type React from "react";

const SIZE_SCALE: Record<string, number> = {
  small: 0.88,
  medium: 1.0,
  large: 1.15,
};

export interface FontVariant {
  fontFamily: string;
  fontWeight: number;
}

export interface FontTokens {
  heading: FontVariant;
  label: FontVariant;
  body: FontVariant;
  medium: FontVariant;
  size: (base: number) => number;
}

export function useFont(): FontTokens {
  const ctx = useContext(SettingsContext);
  const style = ctx?.fontStyle ?? "handwritten";
  const scale = SIZE_SCALE[ctx?.fontSize ?? "medium"] ?? 1;

  const isHandwritten = style === "handwritten";
  const family = isHandwritten ? '"Caveat", cursive' : '"Inter", sans-serif';

  return {
    heading: { fontFamily: family, fontWeight: 700 },
    label: { fontFamily: family, fontWeight: isHandwritten ? 700 : 600 },
    body: { fontFamily: family, fontWeight: 400 },
    medium: { fontFamily: family, fontWeight: isHandwritten ? 400 : 500 },
    size: (base: number) => Math.round(base * scale),
  };
}
