import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useHabits } from "@/context/HabitContext";
import { AppSkeleton } from "@/components/AppSkeleton";
import LandingScreen from "@/screens/LandingScreen";
import NotFoundScreen from "@/screens/NotFoundScreen";

const KNOWN_ROUTES = new Set([
  "/", "/habits", "/calendar", "/progress", "/journal", "/profile", "/settings",
]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { settingsLoaded } = useSettings();
  const { dataLoaded } = useHabits();
  const location = useLocation();

  // Still resolving the auth session
  if (authLoading) return <AppSkeleton />;

  // Not signed in → landing page at "/", redirect everything else to "/"
  if (!session) {
    if (location.pathname !== "/") return <Navigate to="/" replace />;
    return <LandingScreen />;
  }

  // Signed in but Supabase data hasn't arrived yet
  if (!settingsLoaded || !dataLoaded) return <AppSkeleton />;

  // Unknown route while logged in → full-page 404, no sidebar
  const isKnownRoute = KNOWN_ROUTES.has(location.pathname) || location.pathname.startsWith("/groups");
  if (!isKnownRoute) return <NotFoundScreen />;

  return <>{children}</>;
}
