import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";
import { logError } from "@/lib/logger";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (options?: { redirectTo?: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const avatarUrl = (session.user.user_metadata?.avatar_url as string) ?? '';
        const googleName = (session.user.user_metadata?.full_name as string) ?? (session.user.user_metadata?.name as string) ?? '';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        supabase.from('profiles').select('user_name').eq('id', session.user.id).single().then(({ data }) => {
          const update: { id: string; avatar_url: string; timezone: string; user_name?: string } = {
            id: session.user.id, avatar_url: avatarUrl, timezone: tz,
          };
          // Backfill the display name from Google on first sign-in, but never clobber a name the user set themselves
          if (!data?.user_name && googleName) update.user_name = googleName;
          return supabase.from('profiles').upsert(update, { onConflict: 'id', ignoreDuplicates: false });
        }).then(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (options?: { redirectTo?: string }) => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: options?.redirectTo ?? env.appUrl },
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logError("signOut failed — clearing local session", err);
      // Clear local state so the user is signed out in the UI even if the network call failed
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
