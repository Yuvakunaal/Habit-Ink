import React, { useState, useEffect } from "react";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

interface CompletionRingProps {
  done: number;
  total: number;
  size?: number;
  label?: string;
}

const STROKE = 14;

export function CompletionRing({
  done,
  total,
  size = 160,
  label = "done today",
}: CompletionRingProps) {
  const colors = useColors();
  const font = useFont();

  const r = (size - STROKE * 2) / 2 - 4;
  const center = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : Math.min(1, done / total);
  const dashOffset = circumference - circumference * pct;

  const [animOffset, setAnimOffset] = useState(circumference);
  useEffect(() => {
    const t = setTimeout(() => setAnimOffset(dashOffset), 80);
    return () => clearTimeout(t);
  }, [dashOffset, circumference]);

  const ringColor =
    pct >= 1
      ? colors.success
      : pct >= 0.5
      ? colors.primary
      : pct > 0
      ? colors.secondary
      : colors.muted;

  return (
    <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke={colors.muted}
          strokeWidth={STROKE}
          fill="none"
        />
        {total > 0 && (
          <circle
            cx={center}
            cy={center}
            r={r}
            stroke={ringColor}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={animOffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${center}, ${center})`}
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        )}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        <span style={{ ...font.heading, fontSize: font.size(total === 0 ? 22 : 32), color: colors.primary, lineHeight: 1.2 }}>
          {total === 0 ? "—" : `${done}/${total}`}
        </span>
        <span style={{ ...font.body, fontSize: font.size(13), color: colors.mutedForeground, marginTop: 4 }}>
          {label}
        </span>
        {total > 0 && (
          <span style={{ ...font.heading, fontSize: font.size(16), color: ringColor, marginTop: 2 }}>
            {Math.round(pct * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}
