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

import {
  Habit,
  HabitType,
  ScheduleType,
  toDateKey,
  useHabits,
} from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const EMOJIS = [
  "💪","🏃","📚","💧","🥗","😴","🧘","🎯",
  "💰","✍️","🎨","🎵","🏋️","🌱","🧠","❤️",
  "☀️","🌙","🍎","📖","🛁","☕","✅","🎮",
];

const HABIT_COLORS = [
  "#2B3A8C","#1A6B3A","#8B2635","#C9A84C",
  "#6B3A8C","#1A6B6B","#C04A1A","#3A7A8C",
];

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
  { key: "alternate", label: "Alternate" },
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
  const font = useFont();
  const { addHabit, updateHabit } = useHabits();
  const today = toDateKey(new Date());

  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<HabitType>(editing?.type ?? "yesno");
  const [target, setTarget] = useState(editing?.target ?? "");
  const [schedule, setSchedule] = useState<ScheduleType>(editing?.schedule ?? "daily");
  const [customDays, setCustomDays] = useState<number[]>(editing?.customDays ?? [1, 3, 5]);
  const [emoji, setEmoji] = useState(editing?.emoji ?? "✅");
  const [color, setColor] = useState(editing?.color ?? "#2B3A8C");

  const reset = () => {
    setName("");
    setType("yesno");
    setTarget("");
    setSchedule("daily");
    setCustomDays([1, 3, 5]);
    setEmoji("✅");
    setColor("#2B3A8C");
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
      emoji,
      color,
    };
    if (editing) {
      updateHabit(editing.id, habit);
    } else {
      addHabit(habit);
    }
    reset();
    onClose();
  };

  const toggleDay = (d: number) =>
    setCustomDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const placeholder =
    type === "yesno"
      ? "e.g. Yes / No"
      : type === "number"
      ? "e.g. 10 000 steps"
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
            <View style={styles.modalTitleRow}>
              <View style={[styles.modalEmoji, { backgroundColor: color + "22", borderColor: color }]}>
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </View>
              <Text style={[styles.modalTitle, { color: colors.primary, fontFamily: font.heading, fontSize: font.size(24) }]}>
                {editing ? "Edit Habit" : "New Habit"}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={[styles.mRule, { backgroundColor: colors.line }]} />

          {/* Emoji picker */}
          <Text style={[styles.fieldLabel, { color: colors.primary, fontFamily: font.label, fontSize: font.size(14) }]}>
            Icon
          </Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[
                  styles.emojiCell,
                  {
                    backgroundColor: emoji === e ? color + "22" : colors.muted,
                    borderColor: emoji === e ? color : colors.border,
                    borderWidth: emoji === e ? 2 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          {/* Color picker */}
          <Text style={[styles.fieldLabel, { color: colors.primary, fontFamily: font.label, fontSize: font.size(14) }]}>
            Color
          </Text>
          <View style={styles.colorRow}>
            {HABIT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: c,
                    borderWidth: color === c ? 3 : 2,
                    borderColor: color === c ? colors.foreground : "transparent",
                    transform: [{ scale: color === c ? 1.15 : 1 }],
                  },
                ]}
              >
                {color === c && (
                  <Feather name="check" size={14} color="#fff" />
                )}
              </Pressable>
            ))}
          </View>

          {/* Habit Name */}
          <Text style={[styles.fieldLabel, { color: colors.primary, fontFamily: font.label, fontSize: font.size(14) }]}>
            Habit / Goal Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What do you want to track?"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.fieldInput,
              {
                fontFamily: font.body,
                fontSize: font.size(16),
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            maxLength={80}
          />

          {/* Type */}
          <Text style={[styles.fieldLabel, { color: colors.primary, fontFamily: font.label, fontSize: font.size(14) }]}>
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
                    backgroundColor: type === t.key ? color : colors.muted,
                    borderColor: type === t.key ? color : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      fontFamily: font.body,
                      fontSize: font.size(13),
                      color: type === t.key ? "#fff" : colors.mutedForeground,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Target */}
          <Text style={[styles.fieldLabel, { color: colors.primary, fontFamily: font.label, fontSize: font.size(14) }]}>
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
                fontFamily: font.body,
                fontSize: font.size(16),
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />

          {/* Schedule */}
          <Text style={[styles.fieldLabel, { color: colors.primary, fontFamily: font.label, fontSize: font.size(14) }]}>
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
                    backgroundColor: schedule === s.key ? color : colors.muted,
                    borderColor: schedule === s.key ? color : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      fontFamily: font.body,
                      fontSize: font.size(13),
                      color: schedule === s.key ? "#fff" : colors.mutedForeground,
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
                      backgroundColor: customDays.includes(i) ? color : colors.muted,
                      borderColor: customDays.includes(i) ? color : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        fontFamily: font.body,
                        fontSize: font.size(13),
                        color: customDays.includes(i) ? "#fff" : colors.mutedForeground,
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
            activeOpacity={0.8}
            style={[
              styles.saveBtn,
              { backgroundColor: color, opacity: name.trim() ? 1 : 0.5 },
            ]}
            disabled={!name.trim()}
          >
            <Text style={[styles.saveBtnText, { fontFamily: font.label, fontSize: font.size(17), color: "#fff" }]}>
              {editing ? "Save Changes" : "Add to Journal"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Habit Card ───────────────────────────────────────────────────────────────
function HabitCard({
  habit,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const font = useFont();
  const { getStreak, getCompletionRate } = useHabits();

  const streak = getStreak(habit.id);
  const rate = getCompletionRate(habit.id, 30);

  return (
    <Pressable
      onLongPress={onDelete}
      onPress={onEdit}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Left color bar */}
      <View style={[styles.cardBar, { backgroundColor: habit.color }]} />

      {/* Emoji */}
      <View style={[styles.cardEmoji, { backgroundColor: habit.color + "15" }]}>
        <Text style={{ fontSize: 26 }}>{habit.emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.cardBody}>
        <Text
          style={{
            fontFamily: font.label,
            fontSize: font.size(16),
            color: colors.foreground,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {habit.name}
        </Text>
        <Text
          style={{
            fontFamily: font.body,
            fontSize: font.size(13),
            color: colors.mutedForeground,
          }}
        >
          {SCHEDULE_DESCRIPTIONS[habit.schedule]} · {habit.target || habit.type}
        </Text>

        {/* Progress bar */}
        <View style={[styles.progTrack, { backgroundColor: colors.muted, marginTop: 8 }]}>
          <View
            style={[
              styles.progFill,
              {
                width: `${rate}%`,
                backgroundColor:
                  rate >= 80 ? colors.success : rate >= 50 ? habit.color : colors.accent,
              },
            ]}
          />
        </View>
        <Text style={{ fontFamily: font.body, fontSize: font.size(11), color: colors.mutedForeground, marginTop: 3 }}>
          {rate}% in last 30 days
        </Text>
      </View>

      {/* Right: streak + edit */}
      <View style={styles.cardRight}>
        <View style={[styles.streakBadge, { backgroundColor: streak > 0 ? habit.color + "22" : colors.muted }]}>
          <Text style={{ fontSize: 13 }}>🔥</Text>
          <Text
            style={{
              fontFamily: font.heading,
              fontSize: font.size(14),
              color: streak > 0 ? habit.color : colors.mutedForeground,
              marginLeft: 2,
            }}
          >
            {streak}
          </Text>
        </View>
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          style={[styles.editBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="edit-2" size={13} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HabitsScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { habits, deleteHabit, getStreak, getCompletionRate } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();

  const topPad = insets.top;
  const botPad = Platform.OS === "web" ? 34 + 84 : 100;

  const confirmDelete = (id: string, name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Remove Habit", `Remove "${name}" from your journal?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => deleteHabit(id),
      },
    ]);
  };

  const openEdit = (habit: Habit) => {
    setEditing(habit);
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditing(undefined);
  };

  // Sort: most streak first
  const sorted = [...habits].sort((a, b) => getStreak(b.id) - getStreak(a.id));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.line }]}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={{ fontFamily: font.heading, fontSize: font.size(28), color: colors.primary }}>
            My Habits
          </Text>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </View>
        <Text style={{ fontFamily: font.body, fontSize: font.size(13), color: colors.mutedForeground, textAlign: "center", marginTop: 4 }}>
          {habits.length === 0
            ? "Add your first habit below"
            : `${habits.length} habit${habits.length === 1 ? "" : "s"} · Long-press to remove`}
        </Text>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📓</Text>
            <Text style={{ fontFamily: font.heading, fontSize: font.size(22), color: colors.foreground, marginBottom: 8 }}>
              Your journal is empty
            </Text>
            <Text style={{ fontFamily: font.body, fontSize: font.size(16), color: colors.mutedForeground, textAlign: "center", lineHeight: 24 }}>
              Tap the button below to add{"\n"}your first habit or goal.
            </Text>
          </View>
        ) : (
          sorted.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() => openEdit(habit)}
              onDelete={() => confirmDelete(habit.id, habit.name)}
            />
          ))
        )}
      </ScrollView>

      {/* Add FAB */}
      <View style={[styles.fabWrap, { bottom: botPad - 60 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAdd(true);
          }}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={24} color={colors.primaryForeground} />
          <Text style={{ fontFamily: font.label, fontSize: font.size(16), color: colors.primaryForeground, marginLeft: 8 }}>
            Add Habit
          </Text>
        </TouchableOpacity>
      </View>

      <AddModal visible={showAdd} editing={editing} onClose={closeModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  scroll: { paddingHorizontal: 14, paddingTop: 14, gap: 10 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 32 },
  fabWrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  // Card
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBar: { width: 5 },
  cardEmoji: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, paddingVertical: 12, paddingRight: 4 },
  cardRight: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  progTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progFill: { height: 4, borderRadius: 2 },
  // Modal
  modalRoot: { flex: 1 },
  modalScroll: { padding: 20, paddingBottom: 40 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  modalEmoji: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  modalTitle: { fontWeight: "600" },
  mRule: { height: 1, marginBottom: 20 },
  fieldLabel: { marginBottom: 8, fontWeight: "600" },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  emojiCell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {},
  dayPicker: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  dayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayText: {},
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { fontWeight: "600" },
});
