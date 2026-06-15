import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

const STREAK_DOTS = [true, true, true, true, true, true, false];

export default function NotFoundScreen() {
  const colors = useColors();
  const font   = useFont();
  const navigate = useNavigate();
  const [in_, setIn] = useState(false);

  useEffect(() => {
    document.title = "404 — Page Not Found · Habit Ink";
    const t = setTimeout(() => setIn(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="main"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: "32px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        opacity: in_ ? 1 : 0,
        transform: in_ ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}
    >
      {/* Dot-grid background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
          opacity: 0.45,
        }}
      />

      {/* 404 */}
      <div
        style={{
          ...font.heading,
          fontSize: font.size(108),
          color: colors.primary,
          lineHeight: 1,
          letterSpacing: -3,
          marginBottom: 2,
          position: "relative",
        }}
      >
        404
      </div>

      {/* Eyebrow label */}
      <p
        style={{
          ...font.label,
          fontSize: font.size(11),
          color: colors.mutedForeground,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          margin: "0 0 24px",
        }}
      >
        Page not found
      </p>

      {/* Habit-row mock — "This page · missed" */}
      <div
        aria-hidden="true"
        style={{
          backgroundColor: colors.card,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 14,
          padding: "13px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          maxWidth: 290,
          width: "100%",
          boxShadow: `0 2px 14px ${colors.border}55`,
          position: "relative",
        }}
      >
        {/* Left red stripe like the habit card accent */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 4, borderRadius: "14px 0 0 14px",
          backgroundColor: colors.destructive,
        }} />
        <span style={{ fontSize: font.size(20), marginLeft: 8 }}>📄</span>
        <span style={{ flex: 1, textAlign: "left", ...font.label, fontSize: font.size(15), color: colors.text }}>
          This page
        </span>
        {/* Missed button */}
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          backgroundColor: `${colors.destructive}18`,
          border: `2px solid ${colors.destructive}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          ...font.heading,
          fontSize: font.size(15),
          color: colors.destructive,
          flexShrink: 0,
        }}>
          ✗
        </div>
      </div>

      {/* 7-day streak dots — 6 done, today broken */}
      <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 28 }}>
        {STREAK_DOTS.map((done, i) => (
          <div
            key={i}
            title={done ? "Done" : "Missed"}
            style={{
              width: 12, height: 12, borderRadius: "50%",
              backgroundColor: done ? colors.success : "transparent",
              border: `2.5px solid ${done ? colors.success : colors.destructive}`,
              transform: in_ ? "scale(1)" : "scale(0)",
              transition: `transform 0.3s cubic-bezier(.34,1.56,.64,1) ${80 + i * 45}ms`,
            }}
          />
        ))}
      </div>

      {/* Heading */}
      <h1
        style={{
          ...font.heading,
          fontSize: font.size(27),
          color: colors.text,
          margin: "0 0 10px",
          lineHeight: 1.2,
        }}
      >
        You wandered off the path.
      </h1>

      {/* Body */}
      <p
        style={{
          ...font.body,
          fontSize: font.size(14),
          color: colors.mutedForeground,
          margin: "0 0 32px",
          maxWidth: 268,
          lineHeight: 1.7,
        }}
      >
        This page doesn't exist — but your habits do.
        Head back and keep the streak alive.
      </p>

      {/* CTA */}
      <button
        onClick={() => navigate("/")}
        style={{
          ...font.label,
          fontSize: font.size(15),
          color: colors.primaryForeground,
          backgroundColor: colors.primary,
          border: "none",
          borderRadius: 12,
          padding: `${font.size(13)}px ${font.size(30)}px`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }}
      >
        ↩ Back to Today
      </button>

    </div>
  );
}
