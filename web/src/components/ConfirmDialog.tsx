import React, { useEffect } from "react";
import { Modal } from "@/components/Modal";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

interface ConfirmDialogProps {
  visible: boolean;
  /** Large emoji shown in a tinted circle at the top */
  icon?: string;
  title: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Renders confirm button in destructive red */
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** Optional slot rendered between message and buttons (e.g. user info card) */
  children?: React.ReactNode;
}

export function ConfirmDialog({
  visible,
  icon,
  title,
  message,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  destructive = false,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const colors = useColors();
  const font = useFont();
  const accentColor = destructive ? colors.destructive : colors.primary;

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onCancel]);

  return (
    <Modal visible={visible} onClose={onCancel}>
      <div
        style={{
          padding: "32px 24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Icon bubble */}
        {icon && (
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: accentColor + "14",
              border: `1.5px solid ${accentColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              marginBottom: 18,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <p
          style={{
            ...font.heading,
            fontSize: font.size(21),
            color: colors.foreground,
            margin: "0 0 8px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </p>

        {/* Message */}
        {message && (
          <p
            style={{
              ...font.body,
              fontSize: font.size(14),
              color: colors.mutedForeground,
              lineHeight: 1.55,
              margin: "0 0 20px",
              maxWidth: 300,
            }}
          >
            {message}
          </p>
        )}

        {/* Custom slot */}
        {children && (
          <div style={{ width: "100%", marginBottom: 20 }}>{children}</div>
        )}

        {/* No message or children → spacer */}
        {!message && !children && <div style={{ height: 16 }} />}

        {/* Buttons — stacked, confirm first (thumb-friendly on mobile) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              ...font.label,
              fontSize: font.size(16),
              fontWeight: 700,
              backgroundColor: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: 13,
              padding: "15px 24px",
              cursor: "pointer",
              width: "100%",
              letterSpacing: 0.1,
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            style={{
              ...font.body,
              fontSize: font.size(15),
              backgroundColor: colors.muted,
              color: colors.foreground,
              border: `1px solid ${colors.border}`,
              borderRadius: 13,
              padding: "13px 24px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
