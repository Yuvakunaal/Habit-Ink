import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { THEMES, ThemeName } from "@/constants/themes";
import { FontSize, FontStyle, useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const THEME_ORDER: ThemeName[] = ["cream", "midnight", "forest", "rose", "slate"];
const FONT_OPTIONS: { key: FontStyle; title: string; preview: string }[] = [
  { key: "handwritten", title: "Handwritten", preview: "Caveat_700Bold" },
  { key: "clean", title: "Clean", preview: "Inter_600SemiBold" },
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
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: font.heading, fontSize: font.size(13) }]}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { theme, fontStyle, fontSize, setTheme, setFontStyle, setFontSize, reset } = useSettings();

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  const handleReset = () => {
    Alert.alert("Reset Settings", "Restore all settings to default?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          reset();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.line }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.title, { color: colors.primary, fontFamily: font.heading, fontSize: font.size(28) }]}>
            Settings
          </Text>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={{ width: 38 }} />
      </View>
      <View style={[styles.divider, { backgroundColor: colors.line }]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 34 + 84 : 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme */}
        <Section title="Journal Theme">
          <View style={styles.themeGrid}>
            {THEME_ORDER.map((key) => {
              const t = THEMES[key];
              const selected = theme === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTheme(key);
                  }}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: t.card,
                      borderColor: selected ? t.primary : t.border,
                      borderWidth: selected ? 2 : 1,
                    },
                  ]}
                >
                  {/* Color swatches */}
                  <View style={styles.swatchRow}>
                    {t.swatches.map((s, i) => (
                      <View
                        key={i}
                        style={[
                          styles.swatch,
                          { backgroundColor: s, borderColor: t.border },
                        ]}
                      />
                    ))}
                  </View>
                  {/* Preview strip */}
                  <View style={[styles.previewStrip, { backgroundColor: t.background }]} />
                  <Text
                    style={[
                      styles.themeLabel,
                      {
                        color: selected ? t.primary : t.mutedForeground,
                        fontFamily: selected ? font.label : font.body,
                        fontSize: font.size(13),
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {t.label}
                  </Text>
                  {selected && (
                    <View style={[styles.checkBadge, { backgroundColor: t.primary }]}>
                      <Feather name="check" size={10} color={t.primaryForeground} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Section>

        <View style={[styles.divider, { backgroundColor: colors.line }]} />

        {/* Font Style */}
        <Section title="Font Style">
          <View style={styles.fontRow}>
            {FONT_OPTIONS.map((opt) => {
              const selected = fontStyle === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFontStyle(opt.key);
                  }}
                  style={[
                    styles.fontCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: selected ? 2 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: opt.preview,
                      fontSize: 36,
                      color: selected ? colors.primary : colors.mutedForeground,
                      lineHeight: 44,
                    }}
                  >
                    Aa
                  </Text>
                  <Text
                    style={{
                      fontFamily: opt.preview,
                      fontSize: font.size(15),
                      color: selected ? colors.foreground : colors.mutedForeground,
                      marginTop: 4,
                    }}
                  >
                    Daily Tracker
                  </Text>
                  <Text
                    style={{
                      fontFamily: font.body,
                      fontSize: font.size(12),
                      color: colors.mutedForeground,
                      marginTop: 4,
                    }}
                  >
                    {opt.title}
                  </Text>
                  {selected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                      <Feather name="check" size={10} color={colors.primaryForeground} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Section>

        <View style={[styles.divider, { backgroundColor: colors.line }]} />

        {/* Font Size */}
        <Section title="Text Size">
          <View style={styles.sizeRow}>
            {SIZE_OPTIONS.map((opt) => {
              const selected = fontSize === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFontSize(opt.key);
                  }}
                  style={[
                    styles.sizeBtn,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: font.heading,
                      fontSize: opt.size,
                      color: selected ? colors.primaryForeground : colors.foreground,
                      lineHeight: opt.size + 8,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: font.body,
                      fontSize: 11,
                      color: selected ? colors.primaryForeground : colors.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {opt.key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <View style={[styles.divider, { backgroundColor: colors.line }]} />

        {/* About */}
        <Section title="About">
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.aboutTitle, { color: colors.foreground, fontFamily: font.heading, fontSize: font.size(18) }]}>
              Habit Journal
            </Text>
            <Text style={[styles.aboutDesc, { color: colors.mutedForeground, fontFamily: font.body, fontSize: font.size(14) }]}>
              A personal notebook for tracking your habits and goals — one day at a time.
            </Text>
            <Text style={[styles.version, { color: colors.mutedForeground, fontFamily: font.body, fontSize: font.size(12) }]}>
              Version 1.0
            </Text>
          </View>
        </Section>

        {/* Reset */}
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.resetBtn, { borderColor: colors.destructive }]}
        >
          <Feather name="rotate-ccw" size={16} color={colors.destructive} />
          <Text style={[styles.resetText, { color: colors.destructive, fontFamily: font.label, fontSize: font.size(16) }]}>
            Reset to Defaults
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 6, width: 38 },
  titleRow: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: {},
  divider: { height: 1 },
  scroll: { paddingHorizontal: 16 },
  section: { paddingVertical: 20 },
  sectionTitle: { letterSpacing: 1, marginBottom: 14 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeCard: {
    width: "30%",
    borderRadius: 10,
    padding: 10,
    position: "relative",
    overflow: "hidden",
  },
  swatchRow: { flexDirection: "row", gap: 4, marginBottom: 6 },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 0.5 },
  previewStrip: { height: 4, borderRadius: 2, marginBottom: 8 },
  themeLabel: { textAlign: "center" },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  fontRow: { flexDirection: "row", gap: 12 },
  fontCard: {
    flex: 1,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    position: "relative",
  },
  sizeRow: { flexDirection: "row", gap: 12 },
  sizeBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  aboutCard: { borderWidth: 1, borderRadius: 10, padding: 16, gap: 6 },
  aboutTitle: {},
  aboutDesc: { lineHeight: 20 },
  version: {},
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 24,
  },
  resetText: {},
});
