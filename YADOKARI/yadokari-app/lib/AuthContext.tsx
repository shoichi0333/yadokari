"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { AuthUser, getUser, isSupabaseEnabled, logout as doLogout } from "@/lib/auth";
import { setCurrentPlan, normalizePlanId } from "@/lib/plan";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  refresh: async () => {},
  logout: async () => {},
});

function createAuthUser(user: {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: { name?: string };
}): AuthUser {
  const email = user.email ?? "";
  return {
    id: user.id,
    email,
    name: user.user_metadata?.name ?? email.split("@")[0],
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

async function syncPlanByEmail(email?: string | null): Promise<void> {
  if (!email) {
    setCurrentPlan("free");
    return;
  }

  try {
    const response = await fetch(`/api/user/plan?email=${encodeURIComponent(email)}`);
    const data = (await response.json()) as { plan?: string | null };
    setCurrentPlan(normalizePlanId(data.plan));
  } catch {
    setCurrentPlan("free");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    typeof window !== "undefined" && !isSupabaseEnabled() ? getUser() : null
  );
  const [loading, setLoading] = useState(() => isSupabaseEnabled());

  const refresh = useCallback(async () => {
    if (isSupabaseEnabled()) {
      const supabase = getSupabaseClient();
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      const nextUser = data.session?.user ? createAuthUser(data.session.user) : null;
      setUser(nextUser);
      await syncPlanByEmail(nextUser?.email);
      return;
    }

    const nextUser = getUser();
    setUser(nextUser);
    await syncPlanByEmail(nextUser?.email);
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      Promise.resolve().then(() => {
        setUser(null);
        setLoading(false);
      });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const nextUser = data.session?.user ? createAuthUser(data.session.user) : null;
      setUser(nextUser);
      void syncPlanByEmail(nextUser?.email);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ? createAuthUser(session.user) : null;
      setUser(nextUser);
      void syncPlanByEmail(nextUser?.email);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await doLogout();
    setUser(null);
    setCurrentPlan("free");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
