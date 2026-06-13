import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
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

const HABIT_TYPES: { key: HabitType; label: string; icon: string }[] = [
  { key: "yesno", label: "Yes / No", icon: "check-circle" },
  { key: "number", label: "Number", icon: "hash" },
  { key: "time", label: "Time", icon: "clock" },
  { key: "custom", label: "Custom", icon: "edit" },
];

const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
  { key: "alternate", label: "Alternate" },
  { key: "custom", label: "Custom" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SCHEDULE_DESCRIPTIONS: Record<ScheduleType, string> = {
  daily: "Every day",
  weekdays: "Mon – Fri",
  weekends: "Sat & Sun",
  alternate: "Every other day",
  custom: "Custom days",
};

// ─── Add / Edit Modal ────────────────────────────────────────────────────────

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

  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("yesno");
  const [target, setTarget] = useState("");
  const [schedule, setSchedule] = useState<ScheduleType>("daily");
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]);
  const [emoji, setEmoji] = useState("✅");
  const [color, setColor] = useState("#2B3A8C");

  // KEY FIX: re-populate form every time modal opens or editing changes
  useEffect(() => {
    if (visible) {
      setName(editing?.name ?? "");
      setType(editing?.type ?? "yesno");
      setTarget(editing?.target ?? "");
      setSchedule(editing?.schedule ?? "daily");
      setCustomDays(editing?.customDays ?? [1, 3, 5]);
      setEmoji(editing?.emoji ?? "✅");
      setColor(editing?.color ?? "#2B3A8C");
    }
  }, [visible, editing]);

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const habit = {
      name: name.trim(),
      type,
      target: target.trim() || (type === "yesno" ? "Yes" : ""),
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
    onClose();
  };

  const toggleDay = (d: number) =>
    setCustomDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const targetPlaceholder =
    type === "yesno" ? "e.g. Yes / No" :
    type === "number" ? "e.g. 10 000 steps" :
    type === "time" ? "e.g. 2 hours" :
    "e.g. 30 pages";

  const bg = colors.background;
  const card = colors.card;
  const border = colors.border;
  const labelColor = colors.primary;
  const muted = colors.mutedForeground;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: bg }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: color + "25",
                borderWidth: 2, borderColor: color,
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </View>
              <View>
                <Text style={{ fontFamily: font.heading, fontSize: font.size(22), color: labelColor }}>
                  {editing ? "Edit Habit" : "New Habit"}
                </Text>
                <Text style={{ fontFamily: font.body, fontSize: font.size(13), color: muted, marginTop: 1 }}>
                  {editing ? "Update your tracking goal" : "Add to your journal"}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}
            >
              <Feather name="x" size={18} color={muted} />
            </Pressable>
          </View>

          <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 18 }} />

          {/* ── Emoji Picker ── */}
          <SectionLabel label="Choose an icon" font={font} color={labelColor} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={{
                  width: 46, height: 46, borderRadius: 12,
                  backgroundColor: emoji === e ? color + "20" : colors.muted,
                  borderWidth: emoji === e ? 2 : 1,
                  borderColor: emoji === e ? color : border,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          {/* ── Color Picker ── */}
          <SectionLabel label="Accent color" font={font} color={labelColor} />
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
            {HABIT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 38, height: 38, borderRadius: 19,
                  backgroundColor: c,
                  alignItems: "center", justifyContent: "center",
                  borderWidth: color === c ? 3 : 2,
                  borderColor: color === c ? colors.foreground : "transparent",
                  transform: [{ scale: color === c ? 1.12 : 1 }],
                }}
              >
                {color === c && <Feather name="check" size={16} color="#fff" />}
              </Pressable>
            ))}
          </View>

          {/* ── Habit Name ── */}
          <SectionLabel label="Habit name" font={font} color={labelColor} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What do you want to track?"
            placeholderTextColor={muted}
            style={{
              fontFamily: font.body, fontSize: font.size(16),
              color: colors.foreground,
              borderWidth: 1.5,
              borderColor: name.trim() ? color : border,
              borderRadius: 10,
              paddingHorizontal: 14, paddingVertical: 12,
              backgroundColor: card,
              marginBottom: 20,
            }}
            maxLength={80}
            autoCapitalize="sentences"
          />

          {/* ── Tracking Type ── */}
          <SectionLabel label="Tracking type" font={font} color={labelColor} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {HABIT_TYPES.map((t) => {
              const active = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 14, paddingVertical: 9,
                    borderRadius: 22, borderWidth: 1.5,
                    backgroundColor: active ? color : card,
                    borderColor: active ? color : border,
                  }}
                >
                  <Feather name={t.icon as any} size={13} color={active ? "#fff" : muted} />
                  <Text style={{
                    fontFamily: font.body, fontSize: font.size(13),
                    color: active ? "#fff" : muted,
                  }}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── Target ── */}
          <SectionLabel label="Target / Goal" font={font} color={labelColor} />
          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder={targetPlaceholder}
            placeholderTextColor={muted}
            style={{
              fontFamily: font.body, fontSize: font.size(16),
              color: colors.foreground,
              borderWidth: 1.5, borderColor: border,
              borderRadius: 10,
              paddingHorizontal: 14, paddingVertical: 12,
              backgroundColor: card,
              marginBottom: 20,
            }}
          />

          {/* ── Schedule ── */}
          <SectionLabel label="Schedule" font={font} color={labelColor} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: schedule === "custom" ? 12 : 22 }}>
            {SCHEDULES.map((s) => {
              const active = schedule === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setSchedule(s.key)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 9,
                    borderRadius: 22, borderWidth: 1.5,
                    backgroundColor: active ? color : card,
                    borderColor: active ? color : border,
                  }}
                >
                  <Text style={{
                    fontFamily: font.body, fontSize: font.size(13),
                    color: active ? "#fff" : muted,
                  }}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Custom day picker */}
          {schedule === "custom" && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 22 }}>
              {DAYS.map((d, i) => (
                <Pressable
                  key={DAY_FULL[i]}
                  onPress={() => toggleDay(i)}
                  style={{
                    flex: 1, aspectRatio: 1,
                    borderRadius: 8, alignItems: "center", justifyContent: "center",
                    backgroundColor: customDays.includes(i) ? color : colors.muted,
                    borderWidth: 1,
                    borderColor: customDays.includes(i) ? color : border,
                  }}
                >
                  <Text style={{
                    fontFamily: font.body, fontSize: font.size(12),
                    color: customDays.includes(i) ? "#fff" : muted,
                    fontWeight: "600",
                  }}>
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Save Button ── */}
          <TouchableOpacity
            onPress={save}
            activeOpacity={0.82}
            disabled={!canSave}
            style={{
              backgroundColor: canSave ? color : colors.muted,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 6,
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: canSave ? 1 : 0.55,
            }}
          >
            <Feather name={editing ? "check" : "plus"} size={18} color={canSave ? "#fff" : muted} />
            <Text style={{
              fontFamily: font.label, fontSize: font.size(17),
              color: canSave ? "#fff" : muted,
              fontWeight: "700",
            }}>
              {editing ? "Save Changes" : "Add to Journal"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Section label helper ────────────────────────────────────────────────────
function SectionLabel({ label, font, color }: { label: string; font: ReturnType<typeof useFont>; color: string }) {
  return (
    <Text style={{
      fontFamily: font.label,
      fontSize: font.size(12),
      color,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 10,
    }}>
      {label}
    </Text>
  );
}

// ─── Habit Card ──────────────────────────────────────────────────────────────
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
  const accentColor = habit.color ?? "#2B3A8C";

  return (
    <Pressable
      onLongPress={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onDelete();
      }}
      onPress={onEdit}
      style={({ pressed }) => [
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 6,
          elevation: 3,
          opacity: pressed ? 0.93 : 1,
        },
      ]}
    >
      {/* Top accent bar */}
      <View style={{ height: 4, backgroundColor: accentColor }} />

      <View style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 14 }}>
        {/* Emoji bubble */}
        <View style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: accentColor + "18",
          alignItems: "center", justifyContent: "center",
          borderWidth: 1.5, borderColor: accentColor + "40",
        }}>
          <Text style={{ fontSize: 26 }}>{habit.emoji ?? "✅"}</Text>
        </View>

        {/* Main content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: font.heading,
              fontSize: font.size(18),
              color: colors.foreground,
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {habit.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            {/* Schedule pill */}
            <View style={{
              backgroundColor: accentColor + "18",
              borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
            }}>
              <Text style={{
                fontFamily: font.body, fontSize: font.size(11),
                color: accentColor, fontWeight: "600",
              }}>
                {SCHEDULE_DESCRIPTIONS[habit.schedule]}
              </Text>
            </View>
            {/* Type pill */}
            {habit.target ? (
              <View style={{
                backgroundColor: colors.muted,
                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
              }}>
                <Text style={{
                  fontFamily: font.body, fontSize: font.size(11),
                  color: colors.mutedForeground,
                }}>
                  {habit.target}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Progress bar */}
          <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
            <View style={{
              height: 5, borderRadius: 3,
              width: `${rate}%`,
              backgroundColor:
                rate >= 80 ? colors.success :
                rate >= 50 ? accentColor :
                colors.accent,
            }} />
          </View>
          <Text style={{
            fontFamily: font.body, fontSize: font.size(11),
            color: colors.mutedForeground, marginTop: 4,
          }}>
            {rate}% last 30 days
          </Text>
        </View>

        {/* Right column: streak + edit */}
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{
            backgroundColor: streak > 0 ? accentColor + "20" : colors.muted,
            borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5,
            alignItems: "center",
          }}>
            <Text style={{ fontSize: 14 }}>🔥</Text>
            <Text style={{
              fontFamily: font.heading, fontSize: font.size(15),
              color: streak > 0 ? accentColor : colors.mutedForeground,
              marginTop: 1,
            }}>
              {streak}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={6}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: colors.muted,
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: colors.border,
            }}
          >
            <Feather name="edit-2" size={13} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HabitsScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { habits, deleteHabit, getStreak } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();

  const topPad = insets.top;
  const listPadBottom = Platform.OS === "web" ? 84 + 32 : insets.bottom + 80;

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("Remove Habit", `Remove "${name}" from your journal?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteHabit(id) },
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

  const sorted = [...habits].sort((a, b) => getStreak(b.id) - getStreak(a.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingTop: topPad + 12,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        flexDirection: "row",
        alignItems: "center",
      }}>
        {/* Left spacer to balance the button */}
        <View style={{ width: 44 }} />

        {/* Centred title */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            <Text style={{ fontFamily: font.heading, fontSize: font.size(26), color: colors.primary }}>
              My Habits
            </Text>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
          </View>
          <Text style={{
            fontFamily: font.body, fontSize: font.size(12),
            color: colors.mutedForeground, marginTop: 3,
          }}>
            {habits.length === 0
              ? "Add your first habit"
              : `${habits.length} habit${habits.length === 1 ? "" : "s"} · long-press to remove`}
          </Text>
        </View>

        {/* Add button top-right */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditing(undefined);
            setShowAdd(true);
          }}
          activeOpacity={0.8}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: "center", justifyContent: "center",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <Feather name="plus" size={22} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: listPadBottom }}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80, paddingHorizontal: 32 }}>
            <View style={{
              width: 90, height: 90, borderRadius: 45,
              backgroundColor: colors.muted,
              alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 44 }}>📓</Text>
            </View>
            <Text style={{
              fontFamily: font.heading, fontSize: font.size(22),
              color: colors.foreground, marginBottom: 10, textAlign: "center",
            }}>
              Your journal is empty
            </Text>
            <Text style={{
              fontFamily: font.body, fontSize: font.size(15),
              color: colors.mutedForeground, textAlign: "center", lineHeight: 24,
            }}>
              Start tracking your habits and goals — tap the + button above to add your first one.
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

      <AddModal visible={showAdd} editing={editing} onClose={closeModal} />
    </View>
  );
}
