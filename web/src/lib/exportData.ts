import type { Habit, HabitEntry, DailyJournal } from "@/context/HabitContext";

// ── CSV helpers ───────────────────────────────────────────────────────────────

function cell(val: string | undefined | null): string {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildCSV(header: string[], rows: (string | undefined | null)[][]): string {
  const lines = [header, ...rows].map(r => r.map(cell).join(","));
  return "﻿" + lines.join("\r\n"); // UTF-8 BOM so Excel handles emojis
}

function triggerDownload(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function localDateKey(d = new Date()): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function allDatesBetween(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + "T12:00:00");
  const end = new Date(to   + "T12:00:00");
  while (cur <= end) {
    dates.push(localDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function exportSingleCSV(
  habits: Habit[],
  entries: Record<string, HabitEntry[]>,
  journals: Record<string, DailyJournal>,
  appStartDate: string,
): void {
  const today  = localDateKey();
  const dates  = allDatesBetween(appStartDate, today);
  const startMs = new Date(appStartDate + "T12:00:00").getTime();

  // Habits in creation order
  const sorted = [...habits].sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Header
  const header = [
    "Date",
    "Day #",
    "Wake-up",
    "Intention",
    "Notes",
    "Wins",
    "Challenges",
    ...sorted.map(h => `${h.emoji} ${h.name}`),
  ];

  // One row per date
  const rows = dates.map(dateKey => {
    const dayNum     = Math.round((new Date(dateKey + "T12:00:00").getTime() - startMs) / 86_400_000) + 1;
    const j          = journals[dateKey];
    const dayEntries = entries[dateKey] ?? [];

    const habitCells = sorted.map(h => {
      const entry = dayEntries.find(e => e.habitId === h.id);

      if (entry?.status === "done") {
        // For numeric habits, show the value they logged; otherwise "done"
        return (h.type !== "yesno" && entry.actual.trim()) ? entry.actual.trim() : "done";
      }

      if (entry?.status === "missed") return "missed";

      // Not logged / pending / not scheduled / habit didn't exist yet → blank
      return "";
    });

    return [
      dateKey,
      `Day ${dayNum}`,
      j?.wakeUpTime ?? "",
      j?.intention  ?? "",
      j?.notes      ?? "",
      j?.wins       ?? "",
      j?.challenges ?? "",
      ...habitCells,
    ];
  });

  const csv     = buildCSV(header, rows);
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(`habitink-export-${dateStr}.csv`, csv);
}
