// Centralised error/warn logger — swap the console calls for Sentry or similar in production.

export function logError(message: string, error?: unknown): void {
  const detail = error instanceof Error ? error.message : error;
  console.error(`[Habit Ink] ${message}`, detail ?? "");
}

export function logWarn(message: string, data?: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(`[Habit Ink] ${message}`, data ?? "");
  }
}
