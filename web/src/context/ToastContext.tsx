import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useColors } from "@/hooks/useColors";
import { useFont } from "@/hooks/useFont";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  action?: { label: string; onClick: () => void };
}

interface ToastCtx {
  showToast: (
    message: string,
    type?: ToastType,
    action?: { label: string; onClick: () => void },
    duration?: number,
  ) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const colors = useColors();
  const font = useFont();

  const typeColor =
    toast.type === "success"
      ? colors.success
      : toast.type === "error"
      ? "#C23B22"
      : colors.primary;

  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
      ? XCircle
      : Info;

  return (
    <div
      onClick={onDismiss}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${typeColor}`,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
        minWidth: 260,
        maxWidth: 340,
        animation: "toastIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "pointer",
      }}
    >
      <Icon size={16} color={typeColor} style={{ flexShrink: 0, marginTop: 2 }} />
      <span
        style={{
          ...font.body,
          fontSize: font.size(14),
          color: colors.foreground,
          flex: 1,
          lineHeight: 1.45,
        }}
      >
        {toast.message}
      </span>
      {toast.action && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.action!.onClick();
            onDismiss();
          }}
          style={{
            ...font.label,
            fontSize: font.size(12),
            color: typeColor,
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            paddingLeft: 6,
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "all" }}>
          <ToastBanner toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      action?: { label: string; onClick: () => void },
      duration = 3800,
    ) => {
      const id = Math.random().toString(36).slice(2, 10);
      setToasts((prev) => [...prev.slice(-3), { id, message, type, action }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}
