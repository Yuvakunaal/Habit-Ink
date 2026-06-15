import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useHabits } from "@/context/HabitContext";
import { AppSkeleton } from "@/components/AppSkeleton";
import LandingScreen from "@/screens/LandingScreen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { settingsLoaded } = useSettings();
  const { dataLoaded } = useHabits();

  // Still resolving the auth session
  if (authLoading) return <AppSkeleton />;

  // Not signed in → show landing page
  if (!session) return <LandingScreen />;

  // Signed in but Supabase data hasn't arrived yet
  if (!settingsLoaded || !dataLoaded) return <AppSkeleton />;

  return <>{children}</>;
}
