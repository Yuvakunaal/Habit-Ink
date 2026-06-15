import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/db/types";
import { mapHabitToDB } from "@/lib/db/mappers";
import type { Habit, HabitEntry, DailyJournal } from "@/context/HabitContext";

type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
type EntryInsert = Database["public"]["Tables"]["habit_entries"]["Insert"];
type JournalInsert = Database["public"]["Tables"]["journals"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const LS = {
  habits: "@habitjournal/habits",
  entries: "@habitjournal/entries",
  journals: "@habitjournal/journals",
  appStart: "@habitjournal/appstart",
  settings: "@habitjournal/settings",
  habitOrder: "@habitink/habitOrder",
  sidebarCollapsed: "sidebar-collapsed",
};

function clearLegacyStorage() {
  Object.values(LS).forEach((k) => localStorage.removeItem(k));
}

/**
 * On first login after the Supabase backend is added, any existing localStorage
 * data is migrated to the DB. Returns true if migration ran, false otherwise.
 * Never throws — on failure the localStorage data is left intact.
 */
export async function migrateLocalStorageToSupabase(
  userId: string,
): Promise<boolean> {
  const habitsRaw = localStorage.getItem(LS.habits);
  if (!habitsRaw) return false;

  let habits: Habit[] = [];
  try {
    habits = JSON.parse(habitsRaw) as Habit[];
  } catch {
    return false;
  }
  if (habits.length === 0) return false;

  // If the DB already has habits for this user, just clear localStorage and skip.
  const { count } = await supabase
    .from("habits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) > 0) {
    clearLegacyStorage();
    return false;
  }

  const entriesRaw = localStorage.getItem(LS.entries);
  const journalsRaw = localStorage.getItem(LS.journals);
  const settingsRaw = localStorage.getItem(LS.settings);
  const appStart = localStorage.getItem(LS.appStart);
  const habitOrderRaw = localStorage.getItem(LS.habitOrder);
  const sidebarCollapsed = localStorage.getItem(LS.sidebarCollapsed);

  const entriesMap: Record<string, HabitEntry[]> = entriesRaw
    ? JSON.parse(entriesRaw)
    : {};
  const journalsMap: Record<string, DailyJournal> = journalsRaw
    ? JSON.parse(journalsRaw)
    : {};
  const settings = settingsRaw ? JSON.parse(settingsRaw) : {};

  try {
    // 1. Habits — preserve original UUIDs so entries foreign keys still match
    if (habits.length > 0) {
      const habitRows: HabitInsert[] = habits.map((h) => ({
        ...mapHabitToDB(h, userId),
        id: h.id,
      }));
      const { error } = await supabase
        .from("habits")
        .upsert(habitRows, { onConflict: "id" });
      if (error) throw error;
    }

    // 2. Entries — flatten Record<date, HabitEntry[]> to individual rows
    const entryRows: EntryInsert[] = Object.values(entriesMap)
      .flat()
      .map((e) => ({
        user_id: userId,
        habit_id: e.habitId,
        date: e.date,
        status: e.status,
        actual: e.actual ?? "",
      }));
    if (entryRows.length > 0) {
      const { error } = await supabase
        .from("habit_entries")
        .upsert(entryRows, { onConflict: "habit_id,date" });
      if (error) throw error;
    }

    // 3. Journals
    const journalRows: JournalInsert[] = Object.values(journalsMap).map((j) => ({
      user_id: userId,
      date: j.date,
      wake_up_time: j.wakeUpTime ?? "",
      intention: j.intention ?? "",
      notes: j.notes ?? "",
      wins: j.wins ?? "",
      challenges: j.challenges ?? "",
    }));
    if (journalRows.length > 0) {
      const { error } = await supabase
        .from("journals")
        .upsert(journalRows, { onConflict: "user_id,date" });
      if (error) throw error;
    }

    // 4. Profile — settings + appStartDate + habitOrder + sidebarCollapsed
    const today = new Date().toISOString().slice(0, 10);
    const profilePatch: ProfileUpdate = {
      app_start_date: appStart ?? today,
      habit_order: habitOrderRaw ? JSON.parse(habitOrderRaw) : [],
      sidebar_collapsed: sidebarCollapsed === "true",
      theme: settings.theme ?? "cream",
      font_style: settings.fontStyle ?? "handwritten",
      font_size: settings.fontSize ?? "medium",
      user_name: settings.userName ?? "",
      user_emoji: settings.userEmoji ?? "😊",
      user_about: settings.userAbout ?? "",
      weight_kg: settings.weightKg ?? "",
      height_cm: settings.heightCm ?? "",
      custom_quote_text: settings.customQuoteText ?? "",
      custom_quote_author: settings.customQuoteAuthor ?? "",
    };
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", userId);
    if (profileError) throw profileError;

    clearLegacyStorage();
    console.info("[Habit Ink] Migrated local data to Supabase ✓");
    return true;
  } catch (err) {
    console.error("[Habit Ink] Migration failed — local data preserved:", err);
    return false;
  }
}
