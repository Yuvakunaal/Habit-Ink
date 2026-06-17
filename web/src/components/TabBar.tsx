import React, { useMemo, useState } from "react";
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
  Users2,
} from "lucide-react";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";
import { useSettings } from "@/context/SettingsContext";
import { toDateKey, useHabits } from "@/context/HabitContext";
import { useAuth } from "@/context/AuthContext";
import { useGroupUnread } from "@/context/GroupUnreadContext";

// Desktop sidebar — all 7 tabs
const NAV_TABS = [
  { path: "/", label: "Today", Icon: BookOpen },
  { path: "/habits", label: "Habits", Icon: CheckSquare2 },
  { path: "/calendar", label: "Calendar", Icon: Calendar },
  { path: "/progress", label: "Progress", Icon: TrendingUp },
  { path: "/journal", label: "Journal", Icon: BookMarked },
  { path: "/groups", label: "Groups", Icon: Users2 },
  { path: "/profile", label: "Profile", Icon: User },
];

// Mobile TabBar — 6 tabs (Profile removed to avoid overcrowding)
const MOBILE_NAV_TABS = [
  { path: "/", label: "Today", Icon: BookOpen },
  { path: "/habits", label: "Habits", Icon: CheckSquare2 },
  { path: "/calendar", label: "Calendar", Icon: Calendar },
  { path: "/progress", label: "Progress", Icon: TrendingUp },
  { path: "/journal", label: "Journal", Icon: BookMarked },
  { path: "/groups", label: "Groups", Icon: Users2 },
];

const EW = 248;
const CW = 64;

function GoogleG({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function TabBar() {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnread } = useGroupUnread();

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
      {MOBILE_NAV_TABS.map(({ path, label, Icon }) => {
        const active = location.pathname === path || (path === '/groups' && location.pathname.startsWith('/groups'));
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
              position: "relative",
            }}
          >
            <Icon size={22} color={color} />
            <span style={{ ...font.body, fontSize: 11, color }}>{label}</span>
            {path === '/groups' && totalUnread > 0 && (
              <div style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: colors.destructive,
                position: 'absolute', top: 6, right: 'calc(50% - 14px)',
              }} />
            )}
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
  const { user } = useAuth();
  const { totalUnread } = useGroupUnread();

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const googleName = user?.user_metadata?.full_name as string | undefined;
  const googleEmail = user?.email as string | undefined;
  const displayName = userName || googleName || "Your Journal";

  const [hovered, setHovered] = useState<string | null>(null);
  const { sidebarCollapsed: collapsed, setSidebarCollapsed } = useSettings();

  const todayKey = toDateKey(new Date());
  const { done: todayDone, total: todayTotal } = getCompletionForDate(todayKey);

  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const { done, total } = getCompletionForDate(toDateKey(d));
      if (total === 0) continue;
      if (done > 0) s++;
      else break;
    }
    return s;
  }, [getCompletionForDate]);

  const toggle = () => {
    setSidebarCollapsed(!collapsed);
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
        {NAV_TABS.map(({ path, label, Icon }) => {
          const active = location.pathname === path || (path === '/groups' && location.pathname.startsWith('/groups'));
          const isHovered = hovered === path;
          const showUnreadDot = path === '/groups' && totalUnread > 0;
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
                position: "relative",
              }}
            >
              <Icon size={18} color={active ? colors.primary : colors.mutedForeground} />
              {collapsed && showUnreadDot && (
                <div style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: colors.destructive,
                  position: 'absolute', top: 6, right: 6,
                }} />
              )}
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
                  {showUnreadDot && (
                    <div style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: colors.destructive,
                      flexShrink: 0,
                    }} />
                  )}
                  {active && !showUnreadDot && (
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
            <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  style={{ width: 36, height: 36, borderRadius: 18, objectFit: "cover", border: `1.5px solid ${colors.primary}30` }}
                />
              ) : (
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
              )}
              {/* Google badge */}
              {avatarUrl && (
                <div style={{
                  position: "absolute", bottom: -2, right: -2,
                  width: 14, height: 14, borderRadius: 7,
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <GoogleG size={8} />
                </div>
              )}
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
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  style={{ width: 34, height: 34, borderRadius: 17, objectFit: "cover", border: `1.5px solid ${colors.primary}30`, display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: colors.primary + "18",
                    border: `1.5px solid ${colors.primary}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 17 }}>{userEmoji}</span>
                </div>
              )}
              {avatarUrl && (
                <div style={{
                  position: "absolute", bottom: -2, right: -2,
                  width: 14, height: 14, borderRadius: 7,
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <GoogleG size={8} />
                </div>
              )}
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
                {displayName}
              </p>
              {googleEmail && (
                <p style={{
                  ...font.body,
                  fontSize: 10,
                  color: colors.mutedForeground,
                  margin: "1px 0 0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  opacity: 0.75,
                }}>
                  {googleEmail}
                </p>
              )}
              <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: "2px 0 0", whiteSpace: "nowrap" }}>
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
