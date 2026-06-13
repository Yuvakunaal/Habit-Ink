import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Habit, HabitType, ScheduleType, toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const HABIT_TYPES: { key: HabitType; label: string }[] = [
  { key: "yesno", label: "Yes / No" },
  { key: "number", label: "Number" },
  { key: "time", label: "Time" },
  { key: "custom", label: "Custom" },
];

const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: "daily", label: "Every Day" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
  { key: "alternate", label: "Alternate Days" },
  { key: "custom", label: "Custom Days" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SCHEDULE_DESCRIPTIONS: Record<ScheduleType, string> = {
  daily: "Every day",
  weekdays: "Mon – Fri",
  weekends: "Sat – Sun",
  alternate: "Every other day",
  custom: "Custom days",
};

interface AddModalProps {
  visible: boolean;
  editing?: Habit;
  onClose: () => void;
}

function AddModal({ visible, editing, onClose }: AddModalProps) {
  const colors = useColors();
  const { addHabit, updateHabit } = useHabits();
  const today = toDateKey(new Date());

  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<HabitType>(editing?.type ?? "yesno");
  const [target, setTarget] = useState(editing?.target ?? "");
  const [schedule, setSchedule] = useState<ScheduleType>(editing?.schedule ?? "daily");
  const [customDays, setCustomDays] = useState<number[]>(editing?.customDays ?? [1, 3, 5]);

  const reset = () => {
    setName("");
    setType("yesno");
    setTarget("");
    setSchedule("daily");
    setCustomDays([1, 3, 5]);
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const habit = {
      name: trimmed,
      type,
      target: target.trim() || (type === "yesno" ? "Yes" : target.trim()),
      schedule,
      customDays: schedule === "custom" ? customDays : undefined,
      startDate: editing?.startDate ?? today,
    };
    if (editing) {
      updateHabit(editing.id, habit);
    } else {
      addHabit(habit);
    }
    reset();
    onClose();
  };

  const toggleDay = (d: number) => {
    setCustomDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const placeholder =
    type === "yesno"
      ? "e.g. Yes / No"
      : type === "number"
      ? "e.g. 10000 steps"
      : type === "time"
      ? "e.g. 2 hours"
      : "e.g. 30 pages";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.modalRoot, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.modalScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              {editing ? "Edit Habit" : "New Habit"}
            </Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={[styles.mRule, { backgroundColor: colors.line }]} />

          {/* Habit Name */}
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>
            Habit / Goal Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Type anything you want to track..."
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.fieldInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            autoFocus
            maxLength={80}
          />

          {/* Type */}
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>
            Tracking Type
          </Text>
          <View style={styles.chipRow}>
            {HABIT_TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setType(t.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      type === t.key ? colors.primary : colors.muted,
                    borderColor:
                      type === t.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        type === t.key
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Target */}
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>
            Target
          </Text>
          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.fieldInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />

          {/* Schedule */}
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>
            Schedule
          </Text>
          <View style={styles.chipRow}>
            {SCHEDULES.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setSchedule(s.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      schedule === s.key ? colors.primary : colors.muted,
                    borderColor:
                      schedule === s.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        schedule === s.key
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom day picker */}
          {schedule === "custom" && (
            <View style={styles.dayPicker}>
              {DAYS.map((d, i) => (
                <Pressable
                  key={d}
                  onPress={() => toggleDay(i)}
                  style={[
                    styles.dayBtn,
                    {
                      backgroundColor: customDays.includes(i)
                        ? colors.primary
                        : colors.muted,
                      borderColor: customDays.includes(i)
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: customDays.includes(i)
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Save */}
          <TouchableOpacity
            onPress={save}
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.5 }]}
            disabled={!name.trim()}
          >
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
              {editing ? "Save Changes" : "Add to Journal"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HabitsScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { habits, deleteHabit, getStreak, getCompletionRate } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();

  const topPad = insets.top;

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("Remove Habit", `Remove "${name}" from your journal?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteHabit(id);
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            borderBottomColor: colors.line,
          },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.primary, fontFamily: font.heading }]}>
          My Habits & Goals
        </Text>
        <Text style={[styles.screenSub, { color: colors.mutedForeground, fontFamily: font.body }]}>
          {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
        </Text>
        <View style={[styles.rule, { backgroundColor: colors.line }]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="book" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Start Your Journal
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Add any habit or goal you want to track.{"\n"}No templates. No rules. Just your goals.
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const streak = getStreak(habit.id);
            const rate = getCompletionRate(habit.id, 30);
            return (
              <Pressable
                key={habit.id}
                onLongPress={() => confirmDelete(habit.id, habit.name)}
                style={[
                  styles.habitCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.habitTop}>
                  <View style={styles.habitInfo}>
                    <Text
                      style={[styles.habitName, { color: colors.foreground }]}
                      numberOfLines={2}
                    >
                      {habit.name}
                    </Text>
                    <Text
                      style={[styles.habitMeta, { color: colors.mutedForeground }]}
                    >
                      {SCHEDULE_DESCRIPTIONS[habit.schedule]}
                      {habit.target ? `  ·  ${habit.target}` : ""}
                    </Text>
                  </View>
                  <View style={styles.habitRight}>
                    {streak > 0 && (
                      <View
                        style={[
                          styles.streakBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.streakNum,
                            { color: colors.primaryForeground },
                          ]}
                        >
                          {streak}
                        </Text>
                        <Text
                          style={[
                            styles.streakLabel,
                            { color: colors.primaryForeground },
                          ]}
                        >
                          day{streak !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => {
                        setEditing(habit);
                        setShowAdd(true);
                      }}
                      style={styles.editBtn}
                    >
                      <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                </View>
                <View style={[styles.rateBar, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.rateFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${rate}%` as any,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.rateText, { color: colors.mutedForeground }]}>
                  {rate}% completion this month
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => {
          setEditing(undefined);
          setShowAdd(true);
        }}
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom:
              Platform.OS === "web"
                ? 34 + 84 + 16
                : 100 + 8,
          },
        ]}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </Pressable>

      <AddModal
        visible={showAdd}
        editing={editing}
        onClose={() => {
          setShowAdd(false);
          setEditing(undefined);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  screenTitle: { fontFamily: "Caveat_700Bold", fontSize: 30, marginBottom: 2 },
  screenSub: { fontFamily: "Caveat_400Regular", fontSize: 16, marginBottom: 8 },
  rule: { height: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontFamily: "Caveat_700Bold", fontSize: 22 },
  emptyDesc: {
    fontFamily: "Caveat_400Regular",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
  },
  habitCard: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  habitTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  habitInfo: { flex: 1, marginRight: 8 },
  habitName: { fontFamily: "Caveat_700Bold", fontSize: 20, marginBottom: 2 },
  habitMeta: { fontFamily: "Caveat_400Regular", fontSize: 14 },
  habitRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakBadge: {
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    minWidth: 44,
  },
  streakNum: { fontFamily: "Caveat_700Bold", fontSize: 18, lineHeight: 20 },
  streakLabel: { fontFamily: "Caveat_400Regular", fontSize: 10 },
  editBtn: { padding: 4 },
  rateBar: { height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 4 },
  rateFill: { height: 4, borderRadius: 2 },
  rateText: { fontFamily: "Caveat_400Regular", fontSize: 12 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalRoot: { flex: 1 },
  modalScroll: { padding: 24, paddingBottom: 48 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontFamily: "Caveat_700Bold", fontSize: 28 },
  mRule: { height: 1, marginBottom: 20 },
  fieldLabel: {
    fontFamily: "Caveat_700Bold",
    fontSize: 18,
    marginBottom: 8,
    marginTop: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Caveat_400Regular",
    fontSize: 18,
    marginBottom: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontFamily: "Caveat_400Regular", fontSize: 15 },
  dayPicker: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  dayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontFamily: "Caveat_700Bold", fontSize: 13 },
  saveBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  saveBtnText: { fontFamily: "Caveat_700Bold", fontSize: 20 },
});
