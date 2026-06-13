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

import { Group, ScheduleType, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: "daily", label: "Every Day" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
];

function CreateGroupModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
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
    if (t && !habitNames.includes(t)) {
      setHabitNames((p) => [...p, t]);
      setHabitInput("");
    }
  };

  const save = () => {
    if (!name.trim() || !creator.trim()) return;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (parseInt(duration) || 30));
    const group = createGroup({
      name: name.trim(),
      description: desc.trim(),
      creatorName: creator.trim(),
      habitNames,
      schedule,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      members: [
        {
          id: Date.now().toString(),
          name: creator.trim(),
          joinedAt: new Date().toISOString(),
        },
      ],
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Group Created",
      `Invite code: ${group.inviteCode}\n\nShare this with friends to join!`,
      [{ text: "Got it" }]
    );
    setName(""); setDesc(""); setCreator(""); setHabitNames([]); setHabitInput(""); setDuration("30");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.modalRoot, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>New Challenge</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={[styles.mRule, { backgroundColor: colors.line }]} />

          <Text style={[styles.label, { color: colors.primary }]}>Challenge Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. 75-Day Fitness Challenge"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />

          <Text style={[styles.label, { color: colors.primary }]}>Your Name</Text>
          <TextInput value={creator} onChangeText={setCreator} placeholder="How friends will see you"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />

          <Text style={[styles.label, { color: colors.primary }]}>Description (optional)</Text>
          <TextInput value={desc} onChangeText={setDesc} placeholder="What's this challenge about?"
            placeholderTextColor={colors.mutedForeground} multiline
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, minHeight: 64 }]} />

          <Text style={[styles.label, { color: colors.primary }]}>Habits to Track</Text>
          <View style={styles.habitInputRow}>
            <TextInput value={habitInput} onChangeText={setHabitInput} placeholder="Add a habit..."
              placeholderTextColor={colors.mutedForeground} onSubmitEditing={addHabit}
              style={[styles.habitInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
            <Pressable onPress={addHabit} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={18} color={colors.primaryForeground} />
            </Pressable>
          </View>
          {habitNames.map((h, i) => (
            <View key={i} style={[styles.habitChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.habitChipText, { color: colors.foreground }]}>{h}</Text>
              <Pressable onPress={() => setHabitNames((p) => p.filter((_, j) => j !== i))}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}

          <Text style={[styles.label, { color: colors.primary }]}>Schedule</Text>
          <View style={styles.chipRow}>
            {SCHEDULES.map((s) => (
              <Pressable key={s.key} onPress={() => setSchedule(s.key)}
                style={[styles.chip, { backgroundColor: schedule === s.key ? colors.primary : colors.muted, borderColor: schedule === s.key ? colors.primary : colors.border }]}>
                <Text style={[styles.chipText, { color: schedule === s.key ? colors.primaryForeground : colors.mutedForeground }]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.primary }]}>Duration (days)</Text>
          <TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="30"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />

          <TouchableOpacity onPress={save}
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: name.trim() && creator.trim() ? 1 : 0.5 }]}
            disabled={!name.trim() || !creator.trim()}>
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Create Challenge</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function JoinModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
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
    setCode(""); setName("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.modalRoot, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalScroll}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>Join a Challenge</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={[styles.mRule, { backgroundColor: colors.line }]} />

          <Text style={[styles.label, { color: colors.primary }]}>Invite Code</Text>
          <TextInput value={code} onChangeText={setCode} placeholder="e.g. AB12CD" autoCapitalize="characters"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />

          <Text style={[styles.label, { color: colors.primary }]}>Your Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="How the group will see you"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />

          <TouchableOpacity onPress={join}
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: code.trim() && name.trim() ? 1 : 0.5 }]}
            disabled={!code.trim() || !name.trim()}>
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Join Group</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function GroupCard({ group }: { group: Group }) {
  const colors = useColors();
  const [showCode, setShowCode] = useState(false);
  const start = new Date(group.startDate + "T12:00:00");
  const end = new Date(group.endDate + "T12:00:00");
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const total = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.groupTop}>
        <Text style={[styles.groupName, { color: colors.foreground }]}>{group.name}</Text>
        <Text style={[styles.groupDays, { color: colors.primary }]}>{daysLeft}d left</Text>
      </View>
      {group.description ? (
        <Text style={[styles.groupDesc, { color: colors.mutedForeground }]}>{group.description}</Text>
      ) : null}

      <View style={[styles.groupRule, { backgroundColor: colors.line }]} />

      {/* Progress bar */}
      <View style={[styles.rateBar, { backgroundColor: colors.muted }]}>
        <View style={[styles.rateFill, { backgroundColor: colors.primary, width: `${total > 0 ? Math.min(100, Math.round(((total - daysLeft) / total) * 100)) : 0}%` as any }]} />
      </View>
      <Text style={[styles.groupMeta, { color: colors.mutedForeground }]}>
        Day {total - daysLeft} of {total}  ·  {group.members.length} member{group.members.length !== 1 ? "s" : ""}
      </Text>

      {/* Habits */}
      {group.habitNames.length > 0 && (
        <View style={styles.habitList}>
          {group.habitNames.slice(0, 3).map((h, i) => (
            <Text key={i} style={[styles.habitItem, { color: colors.mutedForeground }]}>• {h}</Text>
          ))}
          {group.habitNames.length > 3 && (
            <Text style={[styles.habitItem, { color: colors.mutedForeground }]}>
              +{group.habitNames.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Members */}
      <View style={[styles.groupRule, { backgroundColor: colors.line }]} />
      <Text style={[styles.membersLabel, { color: colors.primary }]}>Members</Text>
      {group.members.map((m) => (
        <View key={m.id} style={styles.memberRow}>
          <Feather name="user" size={14} color={colors.mutedForeground} />
          <Text style={[styles.memberName, { color: colors.foreground }]}>{m.name}</Text>
          {m.name === group.creatorName && (
            <Text style={[styles.creatorBadge, { color: colors.secondary }]}>(creator)</Text>
          )}
        </View>
      ))}

      {/* Invite code */}
      <Pressable onPress={() => setShowCode(!showCode)} style={[styles.codeBtn, { borderColor: colors.border }]}>
        <Feather name="share-2" size={14} color={colors.primary} />
        <Text style={[styles.codeBtnText, { color: colors.primary }]}>
          {showCode ? `Code: ${group.inviteCode}` : "Show invite code"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function GroupsScreen() {
  const colors = useColors();
  const font = useFont();
  const insets = useSafeAreaInsets();
  const { groups } = useHabits();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.line }]}>
        <Text style={[styles.screenTitle, { color: colors.primary, fontFamily: font.heading }]}>Accountability</Text>
        <Text style={[styles.screenSub, { color: colors.mutedForeground, fontFamily: font.body }]}>
          {groups.length} group challenge{groups.length !== 1 ? "s" : ""}
        </Text>
        <View style={[styles.actionRow]}>
          <Pressable onPress={() => setShowCreate(true)}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>Create</Text>
          </Pressable>
          <Pressable onPress={() => setShowJoin(true)}
            style={[styles.actionBtn, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }]}>
            <Feather name="users" size={16} color={colors.foreground} />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Join</Text>
          </Pressable>
        </View>
        <View style={[styles.rule, { backgroundColor: colors.line }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Groups Yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Create a challenge or join one with an invite code to stay accountable with friends.
            </Text>
          </View>
        ) : (
          groups.map((g) => <GroupCard key={g.id} group={g} />)
        )}
      </ScrollView>

      <CreateGroupModal visible={showCreate} onClose={() => setShowCreate(false)} />
      <JoinModal visible={showJoin} onClose={() => setShowJoin(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  screenTitle: { fontFamily: "Caveat_700Bold", fontSize: 30, marginBottom: 2 },
  screenSub: { fontFamily: "Caveat_400Regular", fontSize: 16, marginBottom: 10 },
  rule: { height: 1 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { fontFamily: "Caveat_700Bold", fontSize: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: "Caveat_700Bold", fontSize: 22 },
  emptyDesc: { fontFamily: "Caveat_400Regular", fontSize: 17, textAlign: "center", lineHeight: 26 },
  groupCard: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 14 },
  groupTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  groupName: { fontFamily: "Caveat_700Bold", fontSize: 20, flex: 1 },
  groupDays: { fontFamily: "Caveat_700Bold", fontSize: 18 },
  groupDesc: { fontFamily: "Caveat_400Regular", fontSize: 15, marginBottom: 10 },
  groupRule: { height: 1, marginVertical: 10 },
  rateBar: { height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  rateFill: { height: 5, borderRadius: 3 },
  groupMeta: { fontFamily: "Caveat_400Regular", fontSize: 13, marginBottom: 8 },
  habitList: { marginBottom: 4 },
  habitItem: { fontFamily: "Caveat_400Regular", fontSize: 14, marginBottom: 2 },
  membersLabel: { fontFamily: "Caveat_700Bold", fontSize: 16, marginBottom: 6 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  memberName: { fontFamily: "Caveat_400Regular", fontSize: 16 },
  creatorBadge: { fontFamily: "Caveat_400Regular", fontSize: 12 },
  codeBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10, alignSelf: "flex-start" },
  codeBtnText: { fontFamily: "Caveat_700Bold", fontSize: 15 },
  modalRoot: { flex: 1 },
  modalScroll: { padding: 24, paddingBottom: 48 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalTitle: { fontFamily: "Caveat_700Bold", fontSize: 28 },
  mRule: { height: 1, marginBottom: 20 },
  label: { fontFamily: "Caveat_700Bold", fontSize: 18, marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: "Caveat_400Regular", fontSize: 18, marginBottom: 16, textAlignVertical: "top" },
  habitInputRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  habitInput: { flex: 1, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: "Caveat_400Regular", fontSize: 18 },
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  habitChip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6 },
  habitChipText: { fontFamily: "Caveat_400Regular", fontSize: 16, flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontFamily: "Caveat_400Regular", fontSize: 15 },
  saveBtn: { borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  saveBtnText: { fontFamily: "Caveat_700Bold", fontSize: 20 },
});
