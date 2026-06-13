import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

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

  const ringColor =
    pct >= 1
      ? colors.success
      : pct >= 0.5
      ? colors.primary
      : pct > 0
      ? colors.secondary
      : colors.muted;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={colors.muted}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        {total > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={ringColor}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${center}, ${center})`}
          />
        )}
      </Svg>
      {/* Center text */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontFamily: font.heading,
            fontSize: font.size(total === 0 ? 22 : 32),
            color: colors.primary,
            lineHeight: font.size(36),
          }}
        >
          {total === 0 ? "—" : `${done}/${total}`}
        </Text>
        <Text
          style={{
            fontFamily: font.body,
            fontSize: font.size(13),
            color: colors.mutedForeground,
          }}
        >
          {label}
        </Text>
        {total > 0 && (
          <Text
            style={{
              fontFamily: font.heading,
              fontSize: font.size(16),
              color: ringColor,
              marginTop: 2,
            }}
          >
            {Math.round(pct * 100)}%
          </Text>
        )}
      </View>
    </View>
  );
}
