import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { HabitProvider } from "@/context/HabitContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ToastProvider } from "@/context/ToastContext";
import { TabBar, Sidebar } from "@/components/TabBar";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";

import TodayScreen from "@/screens/TodayScreen";
import HabitsScreen from "@/screens/HabitsScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import ProgressScreen from "@/screens/ProgressScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import SettingsScreen from "@/screens/SettingsScreen";

function AppLayout() {
  const colors = useColors();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const isSettings = location.pathname === "/settings";

  useEffect(() => {
    document.body.style.backgroundColor = colors.background;
  }, [colors.background]);

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Today — Habit Journal",
      "/habits": "Habits — Habit Journal",
      "/calendar": "Calendar — Habit Journal",
      "/progress": "Progress — Habit Journal",
      "/profile": "Profile — Habit Journal",
      "/settings": "Settings — Habit Journal",
    };
    document.title = titles[location.pathname] ?? "Habit Journal";
  }, [location.pathname]);

  // Mobile: Settings is a full-page overlay (no sidebar)
  if (isSettings && !isDesktop) {
    return (
      <div style={{ height: "100%", backgroundColor: colors.background }}>
        <SettingsScreen />
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div style={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: colors.background }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Routes>
            <Route path="/" element={<TodayScreen />} />
            <Route path="/habits" element={<HabitsScreen />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: colors.background }}>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Routes>
          <Route path="/" element={<TodayScreen />} />
          <Route path="/habits" element={<HabitsScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <TabBar />
    </div>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <HabitProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </HabitProvider>
    </SettingsProvider>
  );
}
