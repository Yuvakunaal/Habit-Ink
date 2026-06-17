import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Clock, BookOpen, ArrowUpRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toDateKey, useHabits } from "@/context/HabitContext";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useIsWide } from "@/hooks/useIsDesktop";

// ── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const day = d.getDate();
  const sfx = [11,12,13].includes(day % 100) ? "th" : day%10===1 ? "st" : day%10===2 ? "nd" : day%10===3 ? "rd" : "th";
  return `${months[d.getMonth()]} ${day}${sfx}`;
}

function fmtDOW(dateKey: string, full = false): string {
  const d = new Date(dateKey + "T12:00:00");
  const s = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
  return full ? s : s.slice(0, 3);
}

function fmtTime(raw: string): string {
  if (!raw) return "";
  const [h, m] = raw.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return raw;
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h >= 12 ? "PM" : "AM"}`;
}

function fmtMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${["January","February","March","April","May","June","July","August","September","October","November","December"][m-1]} ${y}`;
}

// ── Spine line — shared column width ────────────────────────────────────────
const SPINE_W = 36;

// ── Month chapter header ─────────────────────────────────────────────────────
function MonthDivider({ label, isFirst }: { label: string; isFirst: boolean }) {
  const colors = useColors();
  const font = useFont();
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ width: SPINE_W, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {!isFirst && (
          <div style={{ width: 2, height: 18, background: `linear-gradient(to bottom, ${colors.border}, ${colors.primary}66)` }} />
        )}
        <div style={{
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: colors.primary + "18",
          border: `2px solid ${colors.primary}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2, flexShrink: 0,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary + "bb" }} />
        </div>
        <div style={{ width: 2, flex: 1, backgroundColor: colors.border, minHeight: 12 }} />
      </div>
      <div style={{ flex: 1, paddingLeft: 14, paddingBottom: 10, paddingTop: isFirst ? 3 : 20, display: "flex", flexDirection: "row", alignItems: "center", gap: 14 }}>
        <span style={{ ...font.label, fontSize: font.size(11), color: colors.primary, letterSpacing: 1.5, textTransform: "uppercase" as const, whiteSpace: "nowrap" }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${colors.line}, transparent)` }} />
      </div>
    </div>
  );
}

// ── Journal entry card ───────────────────────────────────────────────────────
function EntryCard({
  dateKey, dayNumber, isToday,
}: {
  dateKey: string; dayNumber: number; isToday: boolean;
}) {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const { journals } = useHabits();
  const [expanded, setExpanded] = useState(isToday);

  const j = journals[dateKey];
  const hasContent = !!(j && (j.intention || j.notes || j.wins || j.challenges || j.wakeUpTime));

  // Node appearance
  const nodeFill = isToday ? colors.primary : hasContent ? colors.primary + "88" : colors.border;
  const nodeBorder = isToday ? colors.primary : hasContent ? colors.primary + "aa" : colors.border;
  const nodeSize = isToday ? 16 : 13;

  return (
    <div style={{ display: "flex", flexDirection: "row", marginBottom: 10 }}>
      {/* Spine */}
      <div style={{ width: SPINE_W, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2,
          backgroundColor: nodeFill,
          border: `2px solid ${nodeBorder}`,
          flexShrink: 0, zIndex: 2,
          boxShadow: isToday ? `0 0 0 5px ${colors.primary}18, 0 0 12px ${colors.primary}28` : undefined,
          marginTop: isToday ? 0 : 1,
        }} />
        <div style={{ width: 2, flex: 1, backgroundColor: colors.border, minHeight: 24 }} />
      </div>

      {/* Card body */}
      <div style={{
        flex: 1, marginLeft: 12,
        border: `1px solid ${isToday ? colors.primary + "35" : colors.border}`,
        borderRadius: 14, backgroundColor: colors.card, overflow: "hidden",
        boxShadow: isToday
          ? `0 4px 20px ${colors.primary}0e, 0 1px 3px rgba(0,0,0,0.04)`
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
      }}>
        {/* Today's gradient accent */}
        {isToday && (
          <div style={{ height: 2, background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}80)` }} />
        )}

        {/* Header button */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            width: "100%", display: "flex", flexDirection: "row", alignItems: "center",
            padding: "12px 14px", background: "none", border: "none", cursor: "pointer",
            textAlign: "left", gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Day + date row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ ...font.heading, fontSize: font.size(15), color: isToday ? colors.primary : colors.foreground, lineHeight: 1 }}>
                {fmtDOW(dateKey, true)}
              </span>
              <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground }}>
                {fmtDate(dateKey)}
              </span>
              {isToday && (
                <span style={{
                  ...font.label, fontSize: font.size(10), color: "#fff",
                  backgroundColor: colors.primary, paddingLeft: 7, paddingRight: 7,
                  paddingTop: 2, paddingBottom: 2, borderRadius: 20, letterSpacing: 0.3,
                }}>Today</span>
              )}
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ ...font.body, fontSize: font.size(11), color: colors.border }}>Day {dayNumber}</span>
              {j?.wakeUpTime && <>
                <span style={{ color: colors.border, fontSize: 9 }}>·</span>
                <span style={{ ...font.body, fontSize: font.size(11), color: colors.mutedForeground, display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={10} color={colors.mutedForeground} /> {fmtTime(j.wakeUpTime)}
                </span>
              </>}
              {j?.intention && <>
                <span style={{ color: colors.border, fontSize: 9 }}>·</span>
                <span style={{
                  ...font.body, fontSize: font.size(11), color: colors.primary, fontStyle: "italic",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220,
                }}>
                  ✦ {j.intention}
                </span>
              </>}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {!hasContent && (
              <span style={{ ...font.body, fontSize: font.size(10), color: colors.border, fontStyle: "italic" }}>empty</span>
            )}
            {/* Open in Today */}
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/?date=${dateKey}`); }}
              title="Open in Today"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: 8,
                backgroundColor: colors.primary + "12",
                border: `1px solid ${colors.primary}25`,
                cursor: "pointer",
              }}
            >
              <ArrowUpRight size={13} color={colors.primary} />
            </button>
            <div style={{ opacity: 0.55 }}>
              {expanded
                ? <ChevronUp size={14} color={colors.mutedForeground} />
                : <ChevronDown size={14} color={colors.mutedForeground} />}
            </div>
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${colors.border}`, padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 13 }}>
            {!hasContent && (
              <p style={{
                ...font.body, fontSize: font.size(13), color: colors.border,
                textAlign: "center", margin: "6px 0", fontStyle: "italic", lineHeight: 1.6,
              }}>
                Nothing written yet — open Today's screen to add a note or reflection.
              </p>
            )}

            {j?.intention && (
              <div style={{
                backgroundColor: colors.primary + "0a", borderRadius: 10,
                padding: "10px 14px", borderLeft: `3px solid ${colors.primary}`,
              }}>
                <span style={{ ...font.label, fontSize: font.size(10), color: colors.primary, letterSpacing: 1.2 }}>INTENTION</span>
                <p style={{ ...font.body, fontSize: font.size(14), color: colors.foreground, margin: "5px 0 0", lineHeight: 1.65, fontStyle: "italic" }}>
                  {j.intention}
                </p>
              </div>
            )}

            {j?.notes && (
              <div>
                <span style={{ ...font.label, fontSize: font.size(10), color: colors.mutedForeground, letterSpacing: 1.2 }}>NOTES</span>
                <p style={{ ...font.body, fontSize: font.size(14), color: colors.foreground, margin: "6px 0 0", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {j.notes}
                </p>
              </div>
            )}

            {(j?.wins || j?.challenges) && (
              <div style={{
                display: "grid",
                gridTemplateColumns: j.wins && j.challenges ? "1fr 1fr" : "1fr",
                gap: 10,
              }}>
                {j.wins && (
                  <div style={{ backgroundColor: colors.success + "0a", borderRadius: 10, padding: "10px 12px", border: `1px solid ${colors.success}22` }}>
                    <span style={{ ...font.label, fontSize: font.size(10), color: colors.success, letterSpacing: 1 }}>WINS</span>
                    <p style={{ ...font.body, fontSize: font.size(13), color: colors.foreground, margin: "5px 0 0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {j.wins}
                    </p>
                  </div>
                )}
                {j.challenges && (
                  <div style={{ backgroundColor: colors.accent + "0a", borderRadius: 10, padding: "10px 12px", border: `1px solid ${colors.accent}22` }}>
                    <span style={{ ...font.label, fontSize: font.size(10), color: colors.accent, letterSpacing: 1 }}>CHALLENGES</span>
                    <p style={{ ...font.body, fontSize: font.size(13), color: colors.foreground, margin: "5px 0 0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {j.challenges}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function JournalScreen() {
  const colors = useColors();
  const font = useFont();
  const isWide = useIsWide();
  const { journals, getDayNumber, appStartDate } = useHabits();

  const todayKey = toDateKey(new Date());

  // Memoized: only recomputed when appStartDate changes
  const { allDays, monthGroups } = useMemo(() => {
    const days: string[] = [];
    const startD = new Date(appStartDate + "T12:00:00");
    const cur = new Date();
    cur.setHours(12, 0, 0, 0);
    while (cur >= startD) {
      days.push(toDateKey(new Date(cur)));
      cur.setDate(cur.getDate() - 1);
    }

    const groups: { ym: string; days: string[] }[] = [];
    for (const day of days) {
      const ym = day.slice(0, 7);
      const last = groups[groups.length - 1];
      if (last && last.ym === ym) last.days.push(day);
      else groups.push({ ym, days: [day] });
    }

    return { allDays: days, monthGroups: groups };
  }, [appStartDate]);

  // Pagination: show newest 3 months by default, expand on demand
  const [monthsVisible, setMonthsVisible] = useState(3);
  const visibleGroups = monthGroups.slice(0, monthsVisible);
  const hiddenCount = monthGroups.length - monthsVisible;

  const totalEntries = allDays.filter(k => {
    const j = journals[k];
    return j && (j.intention || j.notes || j.wins || j.challenges || j.wakeUpTime);
  }).length;

  const originDay = allDays[allDays.length - 1];
  const originLabel = originDay
    ? `${fmtDOW(originDay, true)}, ${fmtDate(originDay)} · Day 1`
    : "";

  return (
    <div className="page-enter" style={{ flex: 1, backgroundColor: colors.background, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        paddingLeft: isWide ? 28 : 16, paddingRight: isWide ? 28 : 16,
        paddingTop: 18, paddingBottom: 14, borderBottom: `1px solid ${colors.line}`,
        flexShrink: 0, display: "flex", flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <span style={{ ...font.heading, fontSize: font.size(28), color: colors.primary, display: "block" }}>
            Journal
          </span>
          <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, display: "block", marginTop: 2 }}>
            {allDays.length === 0
              ? "Your daily reflections"
              : `${allDays.length} day${allDays.length !== 1 ? "s" : ""} · ${totalEntries} entr${totalEntries !== 1 ? "ies" : "y"} written`}
          </span>
        </div>
        {totalEntries === 0 && allDays.length > 0 && (
          <span style={{ ...font.body, fontSize: font.size(12), color: colors.mutedForeground, backgroundColor: colors.muted, padding: "6px 12px", borderRadius: 8, whiteSpace: "nowrap" }}>
            Write on Today ✦
          </span>
        )}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{
          maxWidth: isWide ? 680 : undefined,
          margin: isWide ? "0 auto" : undefined,
          padding: isWide ? "28px 28px 80px" : "16px 14px 80px",
        }}>
          {allDays.length === 0 ? (
            // Never used the app
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 64, gap: 16 }}>
              <BookOpen size={44} color={colors.border} strokeWidth={1.5} />
              <p style={{ ...font.heading, fontSize: font.size(22), color: colors.foreground, margin: 0 }}>Your journal awaits</p>
              <p style={{ ...font.body, fontSize: font.size(14), color: colors.mutedForeground, margin: 0, textAlign: "center", lineHeight: 1.65, maxWidth: 300 }}>
                Head to Today's screen to write your first intention, notes, or reflection.
              </p>
            </div>
          ) : (
            <>
              {/* Small top gap for the spine */}
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ width: SPINE_W, display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 2, height: 10, background: `linear-gradient(to bottom, transparent, ${colors.border})` }} />
                </div>
              </div>

              {/* Month groups — paginated */}
              {visibleGroups.map((group, gi) => (
                <React.Fragment key={group.ym}>
                  <MonthDivider label={fmtMonthLabel(group.ym)} isFirst={gi === 0} />

                  {group.days.map((dateKey) => {
                    const isToday = dateKey === todayKey;
                    const dayNum = getDayNumber(new Date(dateKey + "T12:00:00"));
                    return (
                      <EntryCard key={dateKey} dateKey={dateKey} dayNumber={dayNum} isToday={isToday} />
                    );
                  })}
                </React.Fragment>
              ))}

              {/* "Show earlier" button — shown when more months are hidden */}
              {hiddenCount > 0 && (
                <div style={{ display: "flex", flexDirection: "row", marginTop: 6 }}>
                  <div style={{ width: SPINE_W, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 2, flex: 1, background: `linear-gradient(to bottom, ${colors.border}, transparent)` }} />
                  </div>
                  <div style={{ flex: 1, paddingLeft: 14, paddingBottom: 20 }}>
                    <button
                      onClick={() => setMonthsVisible(v => v + 3)}
                      style={{
                        display: "flex", flexDirection: "row", alignItems: "center", gap: 7,
                        background: "none", border: `1px solid ${colors.border}`,
                        borderRadius: 10, padding: "8px 14px",
                        cursor: "pointer", color: colors.mutedForeground,
                      }}
                    >
                      <ChevronLeft size={13} color={colors.mutedForeground} />
                      <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground }}>
                        Show earlier ({hiddenCount} more month{hiddenCount !== 1 ? "s" : ""})
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Origin marker — only shown when all months are visible */}
              {hiddenCount === 0 && (
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                  <div style={{ width: SPINE_W, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 2, height: 10, backgroundColor: colors.border }} />
                    <div style={{
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: colors.border + "50",
                      border: `2px solid ${colors.border}`,
                    }} />
                  </div>
                  <span style={{ ...font.body, fontSize: font.size(11), color: colors.border, paddingLeft: 12 }}>
                    {originLabel}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
