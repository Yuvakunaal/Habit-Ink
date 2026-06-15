import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const colors = useColors();
  const font = useFont();

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#1a1a1a",
        color: "#fff",
        padding: "9px 16px",
        animation: "slideDown 0.2s ease-out",
      }}
    >
      <WifiOff size={14} color="#fff" />
      <span style={{ ...font.label, fontSize: font.size(13), color: "#fff" }}>
        You're offline — reconnect to save changes
      </span>
    </div>
  );
}
