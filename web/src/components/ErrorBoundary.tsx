import React from "react";
import { logError } from "@/lib/logger";

interface Props {
  children: React.ReactNode;
  /** compact=true keeps sidebar/tabbar alive; only the screen content shows the error */
  compact?: boolean;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    logError("Render error", error);
    logError("Component stack", info.componentStack);
  }

  private reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.compact) {
      return (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          backgroundColor: "#FAF8F3", padding: "40px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
          <h2 style={{
            fontFamily: '"Caveat", cursive', fontSize: 26, fontWeight: 700,
            color: "#2B3A8C", margin: "0 0 10px",
          }}>
            This screen hit a problem
          </h2>
          <p style={{
            fontFamily: '"Inter", system-ui, sans-serif', fontSize: 14,
            color: "#888", lineHeight: 1.6, maxWidth: 300, margin: "0 0 24px",
          }}>
            Navigate to another tab, or try reloading this screen.
          </p>
          {import.meta.env.DEV && this.state.message && (
            <pre style={{
              fontFamily: "monospace", fontSize: 11, color: "#c04a1a",
              backgroundColor: "#fff4ee", border: "1px solid #f0c8b0",
              borderRadius: 8, padding: "8px 12px", maxWidth: 420, width: "100%",
              overflowX: "auto", textAlign: "left", margin: "0 0 20px",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {this.state.message}
            </pre>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={this.reset}
              style={{
                backgroundColor: "#2B3A8C", color: "#fff", border: "none",
                borderRadius: 10, cursor: "pointer",
                paddingLeft: 20, paddingRight: 20, paddingTop: 11, paddingBottom: 11,
                fontFamily: '"Caveat", cursive', fontSize: 16, fontWeight: 700,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "transparent", color: "#888",
                border: "1px solid #ddd", borderRadius: 10, cursor: "pointer",
                paddingLeft: 20, paddingRight: 20, paddingTop: 11, paddingBottom: 11,
                fontFamily: '"Inter", system-ui, sans-serif', fontSize: 13,
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        backgroundColor: "#FAF8F3", padding: "32px 24px", textAlign: "center",
      }}>
        <div style={{ fontSize: 56, marginBottom: 18, lineHeight: 1 }}>🌿</div>
        <h1 style={{
          fontFamily: '"Caveat", cursive', fontSize: 34, fontWeight: 700,
          color: "#2B3A8C", margin: "0 0 12px",
        }}>
          Something went wrong
        </h1>
        <p style={{
          fontFamily: '"Inter", system-ui, sans-serif', fontSize: 15,
          color: "#888", lineHeight: 1.65, maxWidth: 360, margin: "0 0 28px",
        }}>
          Habit Ink ran into an unexpected problem. Your data is safe — a quick refresh will bring everything back.
        </p>
        {import.meta.env.DEV && this.state.message && (
          <pre style={{
            fontFamily: "monospace", fontSize: 12, color: "#c04a1a",
            backgroundColor: "#fff4ee", border: "1px solid #f0c8b0",
            borderRadius: 10, padding: "10px 14px", maxWidth: 480, width: "100%",
            overflowX: "auto", textAlign: "left", margin: "0 0 24px",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {this.state.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#2B3A8C", color: "#fff", border: "none",
            borderRadius: 14, cursor: "pointer",
            paddingLeft: 32, paddingRight: 32, paddingTop: 15, paddingBottom: 15,
            fontFamily: '"Caveat", cursive', fontSize: 19, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(43,58,140,0.28)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Reload Habit Ink
        </button>
      </div>
    );
  }
}
