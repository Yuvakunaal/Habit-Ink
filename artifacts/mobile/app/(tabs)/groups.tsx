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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Group, ScheduleType, useHabits } from "@/context/HabitContext";
import { THEMES, ThemeName } from "@/constants/themes";
import { FontSize, FontStyle, useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

// ─── Profile avatars ─────────────────────────────────────────────────────────
const AVATARS = ["😊","🧑","👩","🧔","👨","🧘","🏃","💪","📚","🎯","🌱","✨","🦊","🐻","🦋","🌟"];

// ─── Theme / font constants ───────────────────────────────────────────────────
const THEME_ORDER: ThemeName[] = ["cream", "midnight", "forest", "rose", "slate"];
const FONT_OPTIONS: { key: FontStyle; label: string; preview: string }[] = [
  { key: "handwritten", label: "Handwritten", preview: "Caveat_700Bold" },
  { key: "clean", label: "Clean", preview: "Inter_600SemiBold" },
];
const SIZE_OPTIONS: { key: FontSize; label: string; size: number }[] = [
  { key: "small", label: "Small", size: 14 },
  { key: "medium", label: "Medium", size: 17 },
  { key: "large", label: "Large", size: 21 },
];
const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: "daily", label: "Every Day" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
];

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  const colors = useColors();
  const font = useFont();
  return (
    <Text style={{
      fontFamily: font.label,
      fontSize: font.size(11),
      color: colors.mutedForeground,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 12,
      marginTop: 4,
    }}>
      {label}
    </Text>
  );
}

// ─── Group modals ─────────────────────────────────────────────────────────────
function CreateGroupModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const font = useFont();
  const { createGroup } = useHabits();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creator, setCreator] = useState("");
  const [habitInput, setHabitInput] = useState("");
  const [habitNames, setHabitNames] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleType>("daily");
  const [duration, setDuration] = useState("30");

  const addHabit = () => {
    const t = habitInput.trim();
    if (t && !habitNames.includes(t)) { setHabitNames((p) => [...p, t]); setHabitInput(""); }
  };

  const save = () => {
    if (!name.trim() || !creator.trim()) return;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (parseInt(duration) || 30));
    const group = createGroup({
      name: name.trim(), description: desc.trim(), creatorName: creator.trim(),
      habitNames, schedule,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      members: [{ id: Date.now().toString(), name: creator.trim(), joinedAt: new Date().toISOString() }],
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Group Created!", `Invite code: ${group.inviteCode}\n\nShare this with friends to join!`, [{ text: "Got it" }]);
    setName(""); setDesc(""); setCreator(""); setHabitNames([]); setHabitInput(""); setDuration("30");
    onClose();
  };

  const inputStyle = {
    fontFamily: font.body, fontSize: font.size(16), color: colors.foreground,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.card, marginBottom: 16,
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontFamily: font.heading, fontSize: font.size(24), color: colors.primary }}>New Challenge</Text>
            <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={{ height: 1, backgroundColor: colors.line, marginBottom: 20 }} />

          <SectionTitle label="Challenge name" />
          <TextInput value={name} onChangeText={setName} placeholder="e.g. 30-Day Reading Challenge" placeholderTextColor={colors.mutedForeground} style={inputStyle} />

          <SectionTitle label="Your name" />
          <TextInput value={creator} onChangeText={setCreator} placeholder="How friends will see you" placeholderTextColor={colors.mutedForeground} style={inputStyle} />

          <SectionTitle label="Description (optional)" />
          <TextInput value={desc} onChangeText={setDesc} placeholder="What's this challenge about?" placeholderTextColor={colors.mutedForeground} multiline style={[inputStyle, { minHeight: 70, textAlignVertical: "top" }]} />

          <SectionTitle label="Habits to track" />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
            <TextInput value={habitInput} onChangeText={setHabitInput} placeholder="Add a habit..." placeholderTextColor={colors.mutedForeground} onSubmitEditing={addHabit}
              style={[inputStyle, { flex: 1, marginBottom: 0 }]} />
            <Pressable onPress={addHabit} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
              <Feather name="plus" size={20} color={colors.primaryForeground} />
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {habitNames.map((h, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 6 }}>
                <Text style={{ fontFamily: font.body, fontSize: font.size(14), color: colors.foreground }}>{h}</Text>
                <Pressable onPress={() => setHabitNames((p) => p.filter((_, j) => j !== i))}>
                  <Feather name="x" size={13} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
          </View>

          <SectionTitle label="Schedule" />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {SCHEDULES.map((s) => (
              <Pressable key={s.key} onPress={() => setSchedule(s.key)} style={{ flex: 1, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5, alignItems: "center", backgroundColor: schedule === s.key ? colors.primary : colors.card, borderColor: schedule === s.key ? colors.primary : colors.border }}>
                <Text style={{ fontFamily: font.body, fontSize: font.size(13), color: schedule === s.key ? "#fff" : colors.mutedForeground }}>{s.label}</Text>
              </Pressable>
            ))}
          </View>

          <SectionTitle label="Duration (days)" />
          <TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="30" placeholderTextColor={colors.mutedForeground} style={inputStyle} />

          <TouchableOpacity onPress={save} disabled={!name.trim() || !creator.trim()}
            style={{ backgroundColor: name.trim() && creator.trim() ? colors.primary : colors.muted, borderRadius: 14, paddingVertical: 16, alignItems: "center", opacity: name.trim() && creator.trim() ? 1 : 0.55 }}>
            <Text style={{ fontFamily: font.label, fontSize: font.size(17), color: name.trim() && creator.trim() ? "#fff" : colors.mutedForeground, fontWeight: "700" }}>Create Challenge</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function JoinModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const font = useFont();
  const { joinGroup } = useHabits();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const join = () => {
    const found = joinGroup(code.trim(), name.trim());
    if (found) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Joined!", "You've joined the group challenge.");
    } else {
      Alert.alert("Not Found", "No group found with that invite code.");
    }
    setCode(""); setName(""); onClose();
  };

  const inputStyle = {
    fontFamily: font.body, fontSize: font.size(16), color: colors.foreground,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.card, marginBottom: 20,
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontFamily: font.heading, fontSize: font.size(24), color: colors.primary }}>Join a Challenge</Text>
            <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={{ height: 1, backgroundColor: colors.line, marginBottom: 20 }} />
          <SectionTitle label="Invite code" />
          <TextInput value={code} onChangeText={setCode} placeholder="e.g. AB12CD" autoCapitalize="characters" placeholderTextColor={colors.mutedForeground} style={inputStyle} />
          <SectionTitle label="Your name" />
          <TextInput value={name} onChangeText={setName} placeholder="How the group will see you" placeholderTextColor={colors.mutedForeground} style={inputStyle} />
          <TouchableOpacity onPress={join} disabled={!code.trim() || !name.trim()}
            style={{ backgroundColor: code.trim() && name.trim() ? colors.primary : colors.muted, borderRadius: 14, paddingVertical: 16, alignItems: "center", opacity: code.trim() && name.trim() ? 1 : 0.55 }}>
            <Text style={{ fontFamily: font.label, fontSize: font.size(17), color: code.trim() && name.trim() ? "#fff" : colors.mutedForeground, fontWeight: "700" }}>Join Group</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function GroupCard({ group }: { group: Group }) {
  const colors = useColors();
  const font = useFont();
  const [showCode, setShowCode] = useState(false);
  const start = new Date(group.startDate + "T12:00:00");
  const end = new Date(group.endDate + "T12:00:00");
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const total = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsed = total - daysLeft;
  const pct = Math.min(100, Math.round((elapsed / total) * 100));

  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
      <View style={{ height: 4, backgroundColor: colors.primary }} />
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <Text style={{ fontFamily: font.heading, fontSize: font.size(18), color: colors.foreground, flex: 1 }}>{group.name}</Text>
          <View style={{ backgroundColor: colors.primary + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: font.label, fontSize: font.size(12), color: colors.primary, fontWeight: "700" }}>{daysLeft}d left</Text>
          </View>
        </View>
        {group.description ? <Text style={{ fontFamily: font.body, fontSize: font.size(13), color: colors.mutedForeground, marginBottom: 10 }}>{group.description}</Text> : null}

        <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden", marginBottom: 4 }}>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.primary, width: `${pct}%` as any }} />
        </View>
        <Text style={{ fontFamily: font.body, fontSize: font.size(11), color: colors.mutedForeground, marginBottom: 10 }}>
          Day {elapsed} of {total} · {group.members.length} member{group.members.length !== 1 ? "s" : ""}
        </Text>

        {group.habitNames.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {group.habitNames.slice(0, 4).map((h, i) => (
              <View key={i} style={{ backgroundColor: colors.muted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontFamily: font.body, fontSize: font.size(11), color: colors.mutedForeground }}>· {h}</Text>
              </View>
            ))}
            {group.habitNames.length > 4 && <Text style={{ fontFamily: font.body, fontSize: font.size(11), color: colors.mutedForeground, alignSelf: "center" }}>+{group.habitNames.length - 4} more</Text>}
          </View>
        )}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {group.members.map((m) => (
            <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.muted, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Feather name="user" size={11} color={colors.mutedForeground} />
              <Text style={{ fontFamily: font.body, fontSize: font.size(12), color: colors.foreground }}>{m.name}</Text>
              {m.name === group.creatorName && <Text style={{ fontFamily: font.body, fontSize: font.size(10), color: colors.primary }}>★</Text>}
            </View>
          ))}
        </View>

        <Pressable onPress={() => setShowCode(!showCode)} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start" }}>
          <Feather name="share-2" size={13} color={colors.primary} />
          <Text style={{ fontFamily: font.label, fontSize: font.size(13), color: colors.primary }}>
            {showCode ? `Code: ${group.inviteCode}` : "Show invite code"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { groups } = useHabits();
  const {
    theme, fontStyle, fontSize,
    userName, userEmoji,
    setTheme, setFontStyle, setFontSize,
    setUserName, setUserEmoji,
    reset,
  } = useSettings();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [showAvatars, setShowAvatars] = useState(false);

  const topPad = insets.top;
  const scrollPadBottom = Platform.OS === "web" ? 84 + 32 : insets.bottom + 80;

  const saveName = () => {
    setUserName(nameInput.trim());
    setEditingName(false);
  };

  const handleReset = () => {
    Alert.alert("Reset Settings", "Restore all settings to defaults?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); reset(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingTop: topPad + 12, paddingBottom: 14, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: colors.line,
        flexDirection: "row", alignItems: "center",
      }}>
        <View style={{ width: 44 }} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            <Text style={{ fontFamily: font.heading, fontSize: font.size(26), color: colors.primary }}>Profile</Text>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
          </View>
          <Text style={{ fontFamily: font.body, fontSize: font.size(12), color: colors.mutedForeground, marginTop: 2 }}>
            Personalize your journal
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: scrollPadBottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Profile Card ── */}
        <View style={{
          backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
          borderRadius: 16, overflow: "hidden", marginBottom: 24,
        }}>
          <View style={{ height: 5, backgroundColor: colors.primary }} />
          <View style={{ padding: 20, alignItems: "center" }}>
            {/* Avatar */}
            <Pressable
              onPress={() => setShowAvatars(!showAvatars)}
              style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: colors.primary + "18",
                borderWidth: 2, borderColor: colors.primary + "40",
                alignItems: "center", justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 44 }}>{userEmoji}</Text>
              <View style={{
                position: "absolute", bottom: -2, right: -2,
                backgroundColor: colors.primary, borderRadius: 10,
                width: 20, height: 20, alignItems: "center", justifyContent: "center",
              }}>
                <Feather name="edit-2" size={10} color="#fff" />
              </View>
            </Pressable>

            {/* Avatar picker */}
            {showAvatars && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                {AVATARS.map((a) => (
                  <Pressable key={a} onPress={() => { setUserEmoji(a); setShowAvatars(false); Haptics.selectionAsync(); }}
                    style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: userEmoji === a ? colors.primary + "20" : colors.muted, borderWidth: userEmoji === a ? 2 : 1, borderColor: userEmoji === a ? colors.primary : colors.border }}>
                    <Text style={{ fontSize: 24 }}>{a}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Name */}
            {editingName ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextInput
                  autoFocus
                  value={nameInput}
                  onChangeText={setNameInput}
                  onBlur={saveName}
                  onSubmitEditing={saveName}
                  placeholder="Your name"
                  placeholderTextColor={colors.mutedForeground}
                  style={{
                    fontFamily: font.heading, fontSize: font.size(20), color: colors.foreground,
                    borderBottomWidth: 2, borderBottomColor: colors.primary,
                    paddingBottom: 4, minWidth: 140, textAlign: "center",
                  }}
                />
                <Pressable onPress={saveName}>
                  <Feather name="check" size={18} color={colors.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => { setEditingName(true); setNameInput(userName); }} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontFamily: font.heading, fontSize: font.size(22), color: userName ? colors.foreground : colors.mutedForeground }}>
                  {userName || "Tap to set your name"}
                </Text>
                <Feather name="edit-2" size={14} color={colors.mutedForeground} />
              </Pressable>
            )}
            <Text style={{ fontFamily: font.body, fontSize: font.size(12), color: colors.mutedForeground, marginTop: 4 }}>
              Habit Journal · Since today
            </Text>
          </View>
        </View>

        {/* ── Appearance ── */}
        <SectionTitle label="Journal Theme" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {THEME_ORDER.map((key) => {
            const t = THEMES[key];
            const selected = theme === key;
            return (
              <Pressable key={key} onPress={() => { Haptics.selectionAsync(); setTheme(key); }}
                style={{ width: "30%", borderRadius: 12, padding: 10, backgroundColor: t.card, borderWidth: selected ? 2.5 : 1, borderColor: selected ? t.primary : t.border, position: "relative", overflow: "hidden" }}>
                <View style={{ flexDirection: "row", gap: 4, marginBottom: 6 }}>
                  {t.swatches.map((s, i) => <View key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: s }} />)}
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: t.background, marginBottom: 8 }} />
                <Text style={{ fontFamily: selected ? "Inter_600SemiBold" : "Inter_400Regular", fontSize: 12, color: selected ? t.primary : t.mutedForeground, textAlign: "center" }} numberOfLines={1}>{t.label}</Text>
                {selected && (
                  <View style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" }}>
                    <Feather name="check" size={10} color={t.primaryForeground} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <SectionTitle label="Font Style" />
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          {FONT_OPTIONS.map((opt) => {
            const selected = fontStyle === opt.key;
            return (
              <Pressable key={opt.key} onPress={() => { Haptics.selectionAsync(); setFontStyle(opt.key); }}
                style={{ flex: 1, borderRadius: 12, padding: 16, alignItems: "center", backgroundColor: colors.card, borderWidth: selected ? 2.5 : 1, borderColor: selected ? colors.primary : colors.border, position: "relative" }}>
                <Text style={{ fontFamily: opt.preview, fontSize: 34, color: selected ? colors.primary : colors.mutedForeground, lineHeight: 42 }}>Aa</Text>
                <Text style={{ fontFamily: font.body, fontSize: font.size(12), color: selected ? colors.foreground : colors.mutedForeground, marginTop: 4 }}>{opt.label}</Text>
                {selected && (
                  <View style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                    <Feather name="check" size={10} color={colors.primaryForeground} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <SectionTitle label="Text Size" />
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {SIZE_OPTIONS.map((opt) => {
            const selected = fontSize === opt.key;
            return (
              <Pressable key={opt.key} onPress={() => { Haptics.selectionAsync(); setFontSize(opt.key); }}
                style={{ flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", backgroundColor: selected ? colors.primary : colors.card, borderWidth: 1, borderColor: selected ? colors.primary : colors.border }}>
                <Text style={{ fontFamily: font.heading, fontSize: opt.size, color: selected ? colors.primaryForeground : colors.foreground, lineHeight: opt.size + 8 }}>A</Text>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: selected ? colors.primaryForeground : colors.mutedForeground, marginTop: 2 }}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Groups ── */}
        <View style={{ height: 1, backgroundColor: colors.line, marginBottom: 20 }} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <SectionTitle label="Accountability Groups" />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <Pressable onPress={() => setShowCreate(true)} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.primary }}>
              <Feather name="plus" size={14} color={colors.primaryForeground} />
              <Text style={{ fontFamily: font.label, fontSize: font.size(13), color: colors.primaryForeground }}>Create</Text>
            </Pressable>
            <Pressable onPress={() => setShowJoin(true)} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }}>
              <Feather name="users" size={14} color={colors.foreground} />
              <Text style={{ fontFamily: font.label, fontSize: font.size(13), color: colors.foreground }}>Join</Text>
            </Pressable>
          </View>
        </View>

        {groups.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 32, paddingHorizontal: 16, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 24, gap: 8 }}>
            <Feather name="users" size={32} color={colors.mutedForeground} />
            <Text style={{ fontFamily: font.heading, fontSize: font.size(18), color: colors.foreground }}>No groups yet</Text>
            <Text style={{ fontFamily: font.body, fontSize: font.size(14), color: colors.mutedForeground, textAlign: "center", lineHeight: 22 }}>
              Create a challenge or join one with an invite code to stay accountable with friends.
            </Text>
          </View>
        ) : (
          groups.map((g) => <GroupCard key={g.id} group={g} />)
        )}

        {/* Reset */}
        <TouchableOpacity onPress={handleReset} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.destructive, borderRadius: 12, paddingVertical: 13, marginTop: 8 }}>
          <Feather name="rotate-ccw" size={15} color={colors.destructive} />
          <Text style={{ fontFamily: font.label, fontSize: font.size(15), color: colors.destructive }}>Reset to Defaults</Text>
        </TouchableOpacity>
      </ScrollView>

      <CreateGroupModal visible={showCreate} onClose={() => setShowCreate(false)} />
      <JoinModal visible={showJoin} onClose={() => setShowJoin(false)} />
    </View>
  );
}
