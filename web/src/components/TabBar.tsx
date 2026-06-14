import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  CheckSquare2,
  Calendar,
  TrendingUp,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookMarked,
} from "lucide-react";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useSettings } from "@/context/SettingsContext";
import { toDateKey, useHabits } from "@/context/HabitContext";

// Desktop sidebar nav (includes Journal)
const SIDEBAR_TABS = [
  { path: "/", label: "Today", Icon: BookOpen },
  { path: "/habits", label: "Habits", Icon: CheckSquare2 },
  { path: "/calendar", label: "Calendar", Icon: Calendar },
  { path: "/progress", label: "Progress", Icon: TrendingUp },
  { path: "/journal", label: "Journal", Icon: BookMarked },
  { path: "/profile", label: "Profile", Icon: User },
];

// Mobile bottom bar
const TABS = [
  { path: "/", label: "Today", Icon: BookOpen },
  { path: "/habits", label: "Habits", Icon: CheckSquare2 },
  { path: "/calendar", label: "Calendar", Icon: Calendar },
  { path: "/progress", label: "Progress", Icon: TrendingUp },
  { path: "/journal", label: "Journal", Icon: BookMarked },
  { path: "/profile", label: "Profile", Icon: User },
];

const EW = 248;
const CW = 64;

export function TabBar() {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: colors.card,
        borderTop: `1px solid ${colors.border}`,
        height: 64,
        flexShrink: 0,
      }}
    >
      {TABS.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        const color = active ? colors.primary : colors.mutedForeground;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 0",
            }}
          >
            <Icon size={22} color={color} />
            <span style={{ ...font.body, fontSize: 11, color }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, userEmoji } = useSettings();
  const { getCompletionForDate } = useHabits();

  const [hovered, setHovered] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem("sidebar-collapsed") === "true"
  );

  const todayKey = toDateKey(new Date());
  const { done: todayDone, total: todayTotal } = getCompletionForDate(todayKey);

  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const { done, total } = getCompletionForDate(toDateKey(d));
    if (total === 0) continue;
    if (done > 0) streak++;
    else break;
  }

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const w = collapsed ? CW : EW;
  const isSettingsActive = location.pathname === "/settings";

  return (
    <nav
      style={{
        width: w,
        flexShrink: 0,
        backgroundColor: colors.card,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "width 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: collapsed ? "20px 0 14px" : "24px 20px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 12,
          flexShrink: 0,
          transition: "padding 0.25s ease",
        }}
      >
        <img
          src="/favicon.png"
          alt="Habit Ink"
          style={{
            width: 38,
            height: 38,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
        {!collapsed && (
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <p
              style={{
                ...font.heading,
                fontSize: 18,
                color: colors.foreground,
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Habit Ink
            </p>
            <p
              style={{
                ...font.body,
                fontSize: 12,
                color: colors.mutedForeground,
                margin: "2px 0 0",
                whiteSpace: "nowrap",
              }}
            >
              Daily tracker
            </p>
          </div>
        )}
      </div>

      <div style={{ height: 1, backgroundColor: colors.line, marginBottom: 8, flexShrink: 0 }} />

      {/* Nav items */}
      <div style={{ flex: 1, padding: collapsed ? "6px 8px" : "6px 10px", overflow: "hidden" }}>
        {SIDEBAR_TABS.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          const isHovered = hovered === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              onMouseEnter={() => setHovered(path)}
              onMouseLeave={() => setHovered(null)}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: collapsed ? 0 : 10,
                width: "100%",
                paddingLeft: collapsed ? 0 : 12,
                paddingRight: collapsed ? 0 : 12,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 10,
                marginBottom: 2,
                backgroundColor: active
                  ? colors.primary + "18"
                  : isHovered
                  ? colors.muted
                  : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.12s ease",
              }}
            >
              <Icon size={18} color={active ? colors.primary : colors.mutedForeground} />
              {!collapsed && (
                <>
                  <span
                    style={{
                      ...(active ? font.label : font.body),
                      fontSize: 14,
                      color: active ? colors.primary : colors.foreground,
                      flex: 1,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {label}
                  </span>
                  {active && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.primary,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, backgroundColor: colors.line, flexShrink: 0 }} />

      {/* Bottom section */}
      <div style={{ padding: collapsed ? "10px 8px" : "10px 10px", flexShrink: 0 }}>
        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          onMouseEnter={() => setHovered("__settings")}
          onMouseLeave={() => setHovered(null)}
          title={collapsed ? "Settings" : undefined}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 10,
            width: "100%",
            paddingLeft: collapsed ? 0 : 12,
            paddingRight: collapsed ? 0 : 12,
            paddingTop: 9,
            paddingBottom: 9,
            borderRadius: 10,
            backgroundColor: isSettingsActive
              ? colors.primary + "18"
              : hovered === "__settings"
              ? colors.muted
              : "transparent",
            border: "none",
            cursor: "pointer",
            marginBottom: 8,
            transition: "background-color 0.12s ease",
          }}
        >
          <Settings
            size={17}
            color={isSettingsActive ? colors.primary : colors.mutedForeground}
          />
          {!collapsed && (
            <>
              <span
                style={{
                  ...(isSettingsActive ? font.label : font.body),
                  fontSize: 14,
                  color: isSettingsActive ? colors.primary : colors.foreground,
                  textAlign: "left",
                  flex: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Settings
              </span>
              {isSettingsActive && (
                <div
                  style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, flexShrink: 0 }}
                />
              )}
            </>
          )}
        </button>

        {/* User card */}
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 4, paddingBottom: 4 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primary + "18",
                border: `1.5px solid ${colors.primary}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 18 }}>{userEmoji}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.primary + "18",
                border: `1.5px solid ${colors.primary}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 17 }}>{userEmoji}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  ...font.label,
                  fontSize: 13,
                  color: colors.foreground,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {userName || "Your Journal"}
              </p>
              <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: 0, whiteSpace: "nowrap" }}>
                {todayTotal > 0
                  ? `${todayDone}/${todayTotal} today${streak > 0 ? ` · 🔥${streak}` : ""}`
                  : streak > 0
                  ? `🔥 ${streak} day streak`
                  : "Personal tracker"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div style={{ height: 1, backgroundColor: colors.line, flexShrink: 0 }} />
      <button
        onClick={toggle}
        onMouseEnter={() => setHovered("__toggle")}
        onMouseLeave={() => setHovered(null)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-end",
          padding: "7px 14px",
          background: hovered === "__toggle" ? colors.muted : "none",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background-color 0.12s ease",
        }}
      >
        {collapsed ? (
          <ChevronRight size={15} color={colors.mutedForeground} />
        ) : (
          <>
            <span
              style={{
                ...font.body,
                fontSize: 11,
                color: colors.mutedForeground,
                marginRight: 4,
                whiteSpace: "nowrap",
              }}
            >
              Collapse
            </span>
            <ChevronLeft size={15} color={colors.mutedForeground} />
          </>
        )}
      </button>
    </nav>
  );
}
