import React from "react";
import { useAuth } from "@/context/AuthContext";
import LoginScreen from "@/screens/LoginScreen";
import { useColors } from "@/hooks/useColors";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const colors = useColors();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: colors.background,
        }}
      />
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
