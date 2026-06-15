import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { HabitProvider } from "@/context/HabitContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { TabBar, Sidebar } from "@/components/TabBar";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";

import TodayScreen from "@/screens/TodayScreen";
import HabitsScreen from "@/screens/HabitsScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import ProgressScreen from "@/screens/ProgressScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import JournalScreen from "@/screens/JournalScreen";

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
      "/": "Today — Habit Ink",
      "/habits": "Habits — Habit Ink",
      "/calendar": "Calendar — Habit Ink",
      "/progress": "Progress — Habit Ink",
      "/journal": "Journal — Habit Ink",
      "/profile": "Profile — Habit Ink",
      "/settings": "Settings — Habit Ink",
    };
    document.title = titles[location.pathname] ?? "Habit Ink";
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
            <Route path="/journal" element={<JournalScreen />} />
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
          <Route path="/journal" element={<JournalScreen />} />
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
    <AuthProvider>
      <SettingsProvider>
        <HabitProvider>
          <ToastProvider>
            <AuthGate>
              <AppLayout />
            </AuthGate>
          </ToastProvider>
        </HabitProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
