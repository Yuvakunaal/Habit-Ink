import React, { useCallback, useEffect } from "react";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, children }: ModalProps) {
  const colors = useColors();
  const isDesktop = useIsDesktop();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  if (isDesktop) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.15s ease-out",
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            width: "100%",
            maxWidth: 540,
            maxHeight: "88vh",
            overflowY: "auto",
            animation: "modalIn 0.2s ease-out",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            border: `1px solid ${colors.border}`,
          }}
          className="hide-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }

  // Mobile: slide-up bottom sheet
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "slideUp 0.3s ease-out",
          scrollbarWidth: "none",
        }}
        className="hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
        </div>
        {children}
      </div>
    </div>
  );
}
