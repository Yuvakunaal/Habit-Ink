import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

function formatDisplayDate(date: Date): string {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const day = date.getDate();
  const suffix = [11, 12, 13].includes(day % 100)
    ? "th"
    : day % 10 === 1
    ? "st"
    : day % 10 === 2
    ? "nd"
    : day % 10 === 3
    ? "rd"
    : "th";
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
}

interface StatusBtnProps {
  status: EntryStatus;
  onPress: () => void;
}

function StatusBtn({ status, onPress }: StatusBtnProps) {
  const colors = useColors();
  const icon =
    status === "done" ? "check" : status === "missed" ? "x" : "minus";
  const color =
    status === "done"
      ? colors.success
      : status === "missed"
      ? colors.accent
      : colors.mutedForeground;
  return (
    <Pressable onPress={onPress} style={styles.statusBtn}>
      <Feather name={icon as any} size={18} color={color} />
    </Pressable>
  );
}

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    getHabitsForDate,
    getEntry,
    setEntryStatus,
    setEntryActual,
    updateJournal,
    journals,
    getDayNumber,
  } = useHabits();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);

  const dateKey = toDateKey(currentDate);
  const habitsToday = getHabitsForDate(dateKey);
  const journal = journals[dateKey] ?? {
    date: dateKey,
    wakeUpTime: "",
    notes: "",
    wins: "",
    challenges: "",
  };
  const isToday =
    toDateKey(currentDate) === toDateKey(new Date());

  const doneCount = habitsToday.filter(
    (h) => getEntry(h.id, dateKey)?.status === "done"
  ).length;
  const missedCount = habitsToday.filter(
    (h) => getEntry(h.id, dateKey)?.status === "missed"
  ).length;

  const navigate = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    if (d <= new Date()) {
      setCurrentDate(d);
      setEditingId(null);
    }
  };

  const cycleStatus = useCallback(
    (habitId: string, current?: EntryStatus) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next: EntryStatus =
        current === "done"
          ? "missed"
          : current === "missed"
          ? "pending"
          : "done";
      setEntryStatus(habitId, dateKey, next);
    },
    [dateKey, setEntryStatus]
  );

  const topPad =
    Platform.OS === "web" ? 67 + insets.top : insets.top;
  const botPad =
    Platform.OS === "web" ? 34 + 84 : 100;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: botPad },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Pressable onPress={() => navigate(-1)} style={styles.navBtn}>
            <Feather name="chevron-left" size={22} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.titleRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.titleText, { color: colors.primary }]}>
              Daily Tracker
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
          <Pressable
            onPress={() => navigate(1)}
            style={[styles.navBtn, { opacity: isToday ? 0 : 1 }]}
            disabled={isToday}
          >
            <Feather name="chevron-right" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <View style={[styles.rule, { backgroundColor: colors.line }]} />

        {/* Date + Day */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.primary }]}>Date: </Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>
              {formatDisplayDate(currentDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.primary }]}>Day: </Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>
              Day {getDayNumber()}
            </Text>
          </View>
        </View>

        {/* Wake-up Time */}
        <View style={[styles.wakeRow, { borderBottomColor: colors.line }]}>
          <Text style={[styles.metaLabel, { color: colors.primary }]}>
            Wake-up Time:{"  "}
          </Text>
          <TextInput
            value={journal.wakeUpTime}
            onChangeText={(t) => updateJournal(dateKey, { wakeUpTime: t })}
            placeholder="e.g. 6:30 AM"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.wakeInput,
              { color: colors.foreground, borderBottomColor: colors.border },
            ]}
          />
        </View>

        {/* Table */}
        <View style={[styles.table, { borderColor: colors.border }]}>
          {/* Header */}
          <View
            style={[
              styles.tableRow,
              {
                backgroundColor: colors.muted,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.colHabit,
                styles.thText,
                { color: colors.primary },
              ]}
            >
              Habit / Goal
            </Text>
            <View style={[styles.vRule, { backgroundColor: colors.border }]} />
            <Text
              style={[
                styles.colTarget,
                styles.thText,
                { color: colors.primary },
              ]}
            >
              Target
            </Text>
            <View style={[styles.vRule, { backgroundColor: colors.border }]} />
            <Text
              style={[
                styles.colStatus,
                styles.thText,
                { color: colors.primary },
              ]}
            >
              Status
            </Text>
            <View style={[styles.vRule, { backgroundColor: colors.border }]} />
            <Text
              style={[
                styles.colActual,
                styles.thText,
                { color: colors.primary },
              ]}
            >
              Actual
            </Text>
          </View>

          {habitsToday.length === 0 ? (
            <View style={styles.emptyTable}>
              <Feather
                name="book-open"
                size={28}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                No habits today.{"\n"}Head to Habits tab to add some.
              </Text>
            </View>
          ) : (
            habitsToday.map((habit, idx) => {
              const entry = getEntry(habit.id, dateKey);
              const isLast = idx === habitsToday.length - 1;
              const editing = editingId === habit.id;
              return (
                <View
                  key={habit.id}
                  style={[
                    styles.tableRow,
                    {
                      borderBottomWidth: isLast ? 0 : 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.colHabit,
                      styles.tdText,
                      { color: colors.foreground },
                    ]}
                    numberOfLines={2}
                  >
                    {habit.name}
                  </Text>
                  <View
                    style={[styles.vRule, { backgroundColor: colors.border }]}
                  />
                  <Text
                    style={[
                      styles.colTarget,
                      styles.tdText,
                      { color: colors.mutedForeground },
                    ]}
                    numberOfLines={2}
                  >
                    {habit.target || "Yes"}
                  </Text>
                  <View
                    style={[styles.vRule, { backgroundColor: colors.border }]}
                  />
                  <View style={[styles.colStatus, styles.statusCenter]}>
                    <StatusBtn
                      status={entry?.status ?? "pending"}
                      onPress={() =>
                        cycleStatus(habit.id, entry?.status)
                      }
                    />
                  </View>
                  <View
                    style={[styles.vRule, { backgroundColor: colors.border }]}
                  />
                  <Pressable
                    style={styles.colActual}
                    onPress={() =>
                      setEditingId(editing ? null : habit.id)
                    }
                  >
                    {editing ? (
                      <TextInput
                        autoFocus
                        value={entry?.actual ?? ""}
                        onChangeText={(t) =>
                          setEntryActual(habit.id, dateKey, t)
                        }
                        onBlur={() => setEditingId(null)}
                        placeholder="Actual..."
                        placeholderTextColor={colors.mutedForeground}
                        style={[
                          styles.actualInput,
                          { color: colors.foreground },
                        ]}
                        multiline
                      />
                    ) : (
                      <Text
                        style={[
                          styles.tdText,
                          {
                            color: entry?.actual
                              ? colors.foreground
                              : colors.mutedForeground,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {entry?.actual || "—"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* Summary */}
        {habitsToday.length > 0 && (
          <View style={styles.summaryBlock}>
            <View style={styles.summaryCol}>
              <Text
                style={[styles.sectionLabel, { color: colors.primary }]}
              >
                Summary:
              </Text>
              <Text
                style={[styles.summaryLine, { color: colors.foreground }]}
              >
                • Goals Achieved: {doneCount} / {habitsToday.length}
              </Text>
              <Text
                style={[styles.summaryLine, { color: colors.foreground }]}
              >
                • Goals Missed: {missedCount} / {habitsToday.length}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.rule, { backgroundColor: colors.line, marginVertical: 16 }]} />

        {/* Notes */}
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>
          Notes:
        </Text>
        <TextInput
          value={journal.notes}
          onChangeText={(t) => updateJournal(dateKey, { notes: t })}
          placeholder="Today's thoughts..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.journal,
            {
              color: colors.foreground,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
        />

        {/* Wins */}
        <Text
          style={[styles.sectionLabel, { color: colors.primary, marginTop: 12 }]}
        >
          Wins & Reflections:
        </Text>
        <TextInput
          value={journal.wins}
          onChangeText={(t) => updateJournal(dateKey, { wins: t })}
          placeholder="What went well?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.journal,
            {
              color: colors.foreground,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
        />

        <TextInput
          value={journal.challenges}
          onChangeText={(t) => updateJournal(dateKey, { challenges: t })}
          placeholder="What was challenging?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.journal,
            {
              color: colors.foreground,
              borderColor: colors.border,
              backgroundColor: colors.card,
              marginTop: 8,
            },
          ]}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navBtn: { padding: 8, width: 36, alignItems: "center" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  titleText: { fontFamily: "Caveat_700Bold", fontSize: 30 },
  rule: { height: 1, marginBottom: 12 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 4,
  },
  metaItem: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  metaLabel: { fontFamily: "Caveat_700Bold", fontSize: 17 },
  metaValue: { fontFamily: "Caveat_400Regular", fontSize: 17, flexShrink: 1 },
  wakeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  wakeInput: {
    flex: 1,
    fontFamily: "Caveat_400Regular",
    fontSize: 17,
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  table: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 40,
  },
  vRule: { width: 1 },
  colHabit: { flex: 4, paddingHorizontal: 6, paddingVertical: 8 },
  colTarget: { flex: 2.5, paddingHorizontal: 4, paddingVertical: 8 },
  colStatus: { width: 44, paddingVertical: 8 },
  statusCenter: { alignItems: "center", justifyContent: "center" },
  colActual: { flex: 3, paddingHorizontal: 6, paddingVertical: 8 },
  thText: { fontFamily: "Caveat_700Bold", fontSize: 13, textAlign: "center" },
  tdText: { fontFamily: "Caveat_400Regular", fontSize: 14 },
  statusBtn: { padding: 4 },
  actualInput: {
    fontFamily: "Caveat_400Regular",
    fontSize: 14,
    padding: 0,
    flex: 1,
  },
  emptyTable: { padding: 28, alignItems: "center", gap: 10 },
  emptyText: {
    fontFamily: "Caveat_400Regular",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
  },
  summaryBlock: { flexDirection: "row", marginBottom: 4 },
  summaryCol: { flex: 1 },
  sectionLabel: { fontFamily: "Caveat_700Bold", fontSize: 20, marginBottom: 6 },
  summaryLine: {
    fontFamily: "Caveat_400Regular",
    fontSize: 16,
    marginLeft: 4,
    marginBottom: 2,
  },
  journal: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily: "Caveat_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
});
