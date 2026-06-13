import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryStatus, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

function formatDisplayDate(date: Date): string {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const day = date.getDate();
  const suffix = [11, 12, 13].includes(day % 100)
    ? "th"
    : day % 10 === 1 ? "st"
    : day % 10 === 2 ? "nd"
    : day % 10 === 3 ? "rd"
    : "th";
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
}

function StatusBtn({ status, onPress }: { status: EntryStatus; onPress: () => void }) {
  const colors = useColors();
  const icon = status === "done" ? "check" : status === "missed" ? "x" : "minus";
  const color =
    status === "done" ? colors.success
    : status === "missed" ? colors.accent
    : colors.mutedForeground;
  return (
    <Pressable onPress={onPress} style={styles.statusBtn}>
      <Feather name={icon as any} size={18} color={color} />
    </Pressable>
  );
}

export default function TodayScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const {
    getHabitsForDate, getEntry, setEntryStatus, setEntryActual,
    updateJournal, journals, getDayNumber,
  } = useHabits();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);

  const dateKey = toDateKey(currentDate);
  const habitsToday = getHabitsForDate(dateKey);
  const journal = journals[dateKey] ?? { date: dateKey, wakeUpTime: "", notes: "", wins: "", challenges: "" };
  const isToday = toDateKey(currentDate) === toDateKey(new Date());

  const doneCount = habitsToday.filter((h) => getEntry(h.id, dateKey)?.status === "done").length;
  const missedCount = habitsToday.filter((h) => getEntry(h.id, dateKey)?.status === "missed").length;

  const navigate = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    if (d <= new Date()) { setCurrentDate(d); setEditingId(null); }
  };

  const cycleStatus = useCallback(
    (habitId: string, current?: EntryStatus) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next: EntryStatus =
        current === "done" ? "missed" : current === "missed" ? "pending" : "done";
      setEntryStatus(habitId, dateKey, next);
    },
    [dateKey, setEntryStatus]
  );

  const topPad = insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : 100;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header row */}
        <View style={styles.titleSection}>
          <Pressable onPress={() => navigate(-1)} style={styles.navBtn}>
            <Feather name="chevron-left" size={22} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.titleRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={{ fontFamily: font.heading, fontSize: font.size(30), color: colors.primary }}>
              Daily Tracker
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => navigate(1)} style={[styles.navBtn, { opacity: isToday ? 0 : 1 }]} disabled={isToday}>
              <Feather name="chevron-right" size={22} color={colors.mutedForeground} />
            </Pressable>
            <Pressable onPress={() => router.push("/settings")} style={styles.gearBtn}>
              <Feather name="settings" size={19} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
        <View style={[styles.rule, { backgroundColor: colors.line }]} />

        {/* Date + Day */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={{ fontFamily: font.label, fontSize: font.size(17), color: colors.primary }}>Date: </Text>
            <Text style={{ fontFamily: font.body, fontSize: font.size(17), color: colors.foreground, flexShrink: 1 }}>
              {formatDisplayDate(currentDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={{ fontFamily: font.label, fontSize: font.size(17), color: colors.primary }}>Day: </Text>
            <Text style={{ fontFamily: font.body, fontSize: font.size(17), color: colors.foreground }}>
              Day {getDayNumber()}
            </Text>
          </View>
        </View>

        {/* Wake-up time */}
        <View style={[styles.wakeRow, { borderBottomColor: colors.line }]}>
          <Text style={{ fontFamily: font.label, fontSize: font.size(17), color: colors.primary }}>
            Wake-up Time:{"  "}
          </Text>
          <TextInput
            value={journal.wakeUpTime}
            onChangeText={(t) => updateJournal(dateKey, { wakeUpTime: t })}
            placeholder="e.g. 6:30 AM"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.wakeInput, {
              fontFamily: font.body, fontSize: font.size(17),
              color: colors.foreground, borderBottomColor: colors.border,
            }]}
          />
        </View>

        {/* Habit table */}
        <View style={[styles.table, { borderColor: colors.border }]}>
          <View style={[styles.tableRow, { backgroundColor: colors.muted, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Text style={[styles.colHabit, { fontFamily: font.label, fontSize: font.size(13), color: colors.primary, textAlign: "center" }]}>
              Habit / Goal
            </Text>
            <View style={[styles.vRule, { backgroundColor: colors.border }]} />
            <Text style={[styles.colTarget, { fontFamily: font.label, fontSize: font.size(13), color: colors.primary, textAlign: "center" }]}>
              Target
            </Text>
            <View style={[styles.vRule, { backgroundColor: colors.border }]} />
            <Text style={[styles.colStatus, { fontFamily: font.label, fontSize: font.size(13), color: colors.primary, textAlign: "center" }]}>
              Status
            </Text>
            <View style={[styles.vRule, { backgroundColor: colors.border }]} />
            <Text style={[styles.colActual, { fontFamily: font.label, fontSize: font.size(13), color: colors.primary, textAlign: "center" }]}>
              Actual
            </Text>
          </View>

          {habitsToday.length === 0 ? (
            <View style={styles.emptyTable}>
              <Feather name="book-open" size={28} color={colors.mutedForeground} />
              <Text style={{ fontFamily: font.body, fontSize: font.size(17), color: colors.mutedForeground, textAlign: "center", lineHeight: 26 }}>
                No habits today.{"\n"}Head to Habits tab to add some.
              </Text>
            </View>
          ) : (
            habitsToday.map((habit, idx) => {
              const entry = getEntry(habit.id, dateKey);
              const isLast = idx === habitsToday.length - 1;
              const editing = editingId === habit.id;
              return (
                <View key={habit.id} style={[styles.tableRow, { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }]}>
                  <Text style={[styles.colHabit, { fontFamily: font.body, fontSize: font.size(14), color: colors.foreground }]} numberOfLines={2}>
                    {habit.name}
                  </Text>
                  <View style={[styles.vRule, { backgroundColor: colors.border }]} />
                  <Text style={[styles.colTarget, { fontFamily: font.body, fontSize: font.size(14), color: colors.mutedForeground }]} numberOfLines={2}>
                    {habit.target || "Yes"}
                  </Text>
                  <View style={[styles.vRule, { backgroundColor: colors.border }]} />
                  <View style={[styles.colStatus, styles.statusCenter]}>
                    <StatusBtn status={entry?.status ?? "pending"} onPress={() => cycleStatus(habit.id, entry?.status)} />
                  </View>
                  <View style={[styles.vRule, { backgroundColor: colors.border }]} />
                  <Pressable style={styles.colActual} onPress={() => setEditingId(editing ? null : habit.id)}>
                    {editing ? (
                      <TextInput
                        autoFocus
                        value={entry?.actual ?? ""}
                        onChangeText={(t) => setEntryActual(habit.id, dateKey, t)}
                        onBlur={() => setEditingId(null)}
                        placeholder="Actual..."
                        placeholderTextColor={colors.mutedForeground}
                        style={{ fontFamily: font.body, fontSize: font.size(14), color: colors.foreground, padding: 0, flex: 1 }}
                        multiline
                      />
                    ) : (
                      <Text style={{ fontFamily: font.body, fontSize: font.size(14), color: entry?.actual ? colors.foreground : colors.mutedForeground }} numberOfLines={2}>
                        {entry?.actual || "—"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* Summary strip */}
        {habitsToday.length > 0 && (
          <View style={[styles.summaryStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryItem}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={{ fontFamily: font.label, fontSize: font.size(15), color: colors.success, marginLeft: 4 }}>
                {doneCount} done
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Feather name="x-circle" size={16} color={colors.accent} />
              <Text style={{ fontFamily: font.label, fontSize: font.size(15), color: colors.accent, marginLeft: 4 }}>
                {missedCount} missed
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Feather name="clock" size={16} color={colors.mutedForeground} />
              <Text style={{ fontFamily: font.body, fontSize: font.size(15), color: colors.mutedForeground, marginLeft: 4 }}>
                {habitsToday.length - doneCount - missedCount} pending
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.rule, { backgroundColor: colors.line, marginVertical: 16 }]} />

        {/* Notes */}
        <Text style={{ fontFamily: font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6 }}>
          Notes:
        </Text>
        <TextInput
          value={journal.notes}
          onChangeText={(t) => updateJournal(dateKey, { notes: t })}
          placeholder="Today's thoughts..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.journal, {
            fontFamily: font.body, fontSize: font.size(16),
            color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card,
          }]}
        />

        <Text style={{ fontFamily: font.label, fontSize: font.size(20), color: colors.primary, marginBottom: 6, marginTop: 12 }}>
          Wins & Reflections:
        </Text>
        <TextInput
          value={journal.wins}
          onChangeText={(t) => updateJournal(dateKey, { wins: t })}
          placeholder="What went well?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.journal, {
            fontFamily: font.body, fontSize: font.size(16),
            color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card,
          }]}
        />
        <TextInput
          value={journal.challenges}
          onChangeText={(t) => updateJournal(dateKey, { challenges: t })}
          placeholder="What was challenging?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[styles.journal, {
            fontFamily: font.body, fontSize: font.size(16),
            color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, marginTop: 8,
          }]}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  titleSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  navBtn: { padding: 8, width: 36, alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  gearBtn: { padding: 8, width: 36, alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  rule: { height: 1, marginBottom: 12 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 8, gap: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  wakeRow: { flexDirection: "row", alignItems: "center", paddingBottom: 10, marginBottom: 16, borderBottomWidth: 1 },
  wakeInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 2 },
  table: { borderWidth: 1, borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  tableRow: { flexDirection: "row", alignItems: "stretch", minHeight: 40 },
  vRule: { width: 1 },
  colHabit: { flex: 4, paddingHorizontal: 6, paddingVertical: 8 },
  colTarget: { flex: 2.5, paddingHorizontal: 4, paddingVertical: 8 },
  colStatus: { width: 44, paddingVertical: 8 },
  statusCenter: { alignItems: "center", justifyContent: "center" },
  colActual: { flex: 3, paddingHorizontal: 6, paddingVertical: 8 },
  statusBtn: { padding: 4 },
  emptyTable: { padding: 28, alignItems: "center", gap: 10 },
  summaryStrip: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, marginBottom: 4, paddingVertical: 10 },
  summaryItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  summaryDivider: { width: 1, height: 20 },
  journal: { borderWidth: 1, borderRadius: 4, padding: 10, minHeight: 80, textAlignVertical: "top", lineHeight: 24 },
});
