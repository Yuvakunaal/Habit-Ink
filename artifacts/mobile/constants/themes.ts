export type ThemeName = "cream" | "midnight" | "forest" | "rose" | "slate";

export interface ThemeColors {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  success: string;
  line: string;
  paper: string;
  radius: number;
}

export interface ThemeMeta extends ThemeColors {
  label: string;
  swatches: string[];
}

export const THEMES: Record<ThemeName, ThemeMeta> = {
  cream: {
    label: "Classic Cream",
    swatches: ["#F5F0E8", "#2B3A8C", "#1A6B3A"],
    text: "#1A1612",
    tint: "#2B3A8C",
    background: "#F5F0E8",
    foreground: "#1A1612",
    card: "#FDFAF3",
    cardForeground: "#1A1612",
    primary: "#2B3A8C",
    primaryForeground: "#FFFFFF",
    secondary: "#8B6914",
    secondaryForeground: "#FFFFFF",
    muted: "#EAE4D6",
    mutedForeground: "#7A6B55",
    accent: "#8B2635",
    accentForeground: "#FFFFFF",
    destructive: "#8B2635",
    destructiveForeground: "#FFFFFF",
    border: "#C8BAA0",
    input: "#EDE5D5",
    success: "#1A6B3A",
    line: "#D4C9B0",
    paper: "#F5F0E8",
    radius: 4,
  },
  midnight: {
    label: "Midnight Journal",
    swatches: ["#1C1C2E", "#C9A84C", "#4A9F6A"],
    text: "#E8E4DC",
    tint: "#C9A84C",
    background: "#1C1C2E",
    foreground: "#E8E4DC",
    card: "#252538",
    cardForeground: "#E8E4DC",
    primary: "#C9A84C",
    primaryForeground: "#1C1C2E",
    secondary: "#8BA0C9",
    secondaryForeground: "#1C1C2E",
    muted: "#2E2E45",
    mutedForeground: "#8B8BA0",
    accent: "#E05555",
    accentForeground: "#FFFFFF",
    destructive: "#E05555",
    destructiveForeground: "#FFFFFF",
    border: "#3A3A55",
    input: "#2E2E45",
    success: "#4A9F6A",
    line: "#3A3A55",
    paper: "#1C1C2E",
    radius: 4,
  },
  forest: {
    label: "Forest Notes",
    swatches: ["#F0F4EE", "#2E5E2E", "#2E7D32"],
    text: "#1A2B1A",
    tint: "#2E5E2E",
    background: "#F0F4EE",
    foreground: "#1A2B1A",
    card: "#F8FCF6",
    cardForeground: "#1A2B1A",
    primary: "#2E5E2E",
    primaryForeground: "#FFFFFF",
    secondary: "#8B4513",
    secondaryForeground: "#FFFFFF",
    muted: "#DDE8D8",
    mutedForeground: "#5A7A5A",
    accent: "#8B4513",
    accentForeground: "#FFFFFF",
    destructive: "#C0392B",
    destructiveForeground: "#FFFFFF",
    border: "#B8CEB0",
    input: "#E5EDE0",
    success: "#2E7D32",
    line: "#C8DCC0",
    paper: "#F0F4EE",
    radius: 4,
  },
  rose: {
    label: "Rose Pages",
    swatches: ["#FDF0F0", "#8B2635", "#2E7D32"],
    text: "#2A1A1A",
    tint: "#8B2635",
    background: "#FDF0F0",
    foreground: "#2A1A1A",
    card: "#FFFAFA",
    cardForeground: "#2A1A1A",
    primary: "#8B2635",
    primaryForeground: "#FFFFFF",
    secondary: "#8B4513",
    secondaryForeground: "#FFFFFF",
    muted: "#F0D8D8",
    mutedForeground: "#8B6060",
    accent: "#C0392B",
    accentForeground: "#FFFFFF",
    destructive: "#C0392B",
    destructiveForeground: "#FFFFFF",
    border: "#E0B8B8",
    input: "#F5E0E0",
    success: "#2E7D32",
    line: "#E8C8C8",
    paper: "#FDF0F0",
    radius: 4,
  },
  slate: {
    label: "Slate Modern",
    swatches: ["#F0F2F5", "#3A5A8C", "#2E7D32"],
    text: "#1A1E26",
    tint: "#3A5A8C",
    background: "#F0F2F5",
    foreground: "#1A1E26",
    card: "#FAFBFC",
    cardForeground: "#1A1E26",
    primary: "#3A5A8C",
    primaryForeground: "#FFFFFF",
    secondary: "#6B5EA8",
    secondaryForeground: "#FFFFFF",
    muted: "#DDE2EA",
    mutedForeground: "#6B7280",
    accent: "#C0392B",
    accentForeground: "#FFFFFF",
    destructive: "#C0392B",
    destructiveForeground: "#FFFFFF",
    border: "#BCC4CC",
    input: "#E5E9EE",
    success: "#2E7D32",
    line: "#C8D0D8",
    paper: "#F0F2F5",
    radius: 4,
  },
};
