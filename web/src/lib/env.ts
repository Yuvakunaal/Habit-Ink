// Validates required environment variables at app startup.
// If any are missing the app renders a clear error instead of cryptic Supabase failures.

const REQUIRED = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
};

const missing = (Object.entries(REQUIRED) as [string, string | undefined][])
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;
                  background:#FAF8F3;padding:32px;text-align:center;font-family:system-ui,sans-serif;">
        <div style="font-size:48px;margin-bottom:16px">⚙️</div>
        <h1 style="font-size:24px;color:#2B3A8C;margin:0 0 10px">Configuration missing</h1>
        <p style="color:#888;max-width:400px;line-height:1.6;margin:0 0 20px">
          The following environment variables are required but not set:
        </p>
        <pre style="background:#fff4ee;border:1px solid #f0c8b0;border-radius:8px;padding:10px 16px;
                    color:#c04a1a;font-size:13px;margin:0 0 20px">${missing.join("\n")}</pre>
        <p style="color:#aaa;font-size:13px;margin:0">
          Create <code style="background:#f0f0f0;padding:2px 6px;border-radius:4px">web/.env.local</code>
          with these values and restart the dev server.
        </p>
      </div>`;
  }
  throw new Error(`[Habit Ink] Missing env vars: ${missing.join(", ")}`);
}

export const env = {
  supabaseUrl: REQUIRED.VITE_SUPABASE_URL!,
  supabaseAnonKey: REQUIRED.VITE_SUPABASE_ANON_KEY!,
  appUrl: (import.meta.env.VITE_APP_URL as string | undefined) ?? window.location.origin,
};
