"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { AuthUser, getUser, isSupabaseEnabled, logout as doLogout } from "@/lib/auth";
import { getCurrentPlan, setCurrentPlan, normalizePlanId, type PlanId } from "@/lib/plan";

interface AuthContextValue {
  user: AuthUser | null;
  plan: PlanId;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  plan: "free",
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

async function syncPlanByEmail(email?: string | null): Promise<PlanId> {
  if (!email) {
    setCurrentPlan("free");
    return "free";
  }

  try {
    const response = await fetch(`/api/user/plan?email=${encodeURIComponent(email)}`);
    const data = (await response.json()) as { plan?: string | null };
    const nextPlan = normalizePlanId(data.plan);
    setCurrentPlan(nextPlan);
    return nextPlan;
  } catch {
    setCurrentPlan("free");
    return "free";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    typeof window !== "undefined" && !isSupabaseEnabled() ? getUser() : null
  );
  const [plan, setPlan] = useState<PlanId>(() => getCurrentPlan());
  const [loading, setLoading] = useState(() => isSupabaseEnabled());

  const refresh = useCallback(async () => {
    if (isSupabaseEnabled()) {
      const supabase = getSupabaseClient();
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      const nextUser = data.session?.user ? createAuthUser(data.session.user) : null;
      setUser(nextUser);
      setPlan(await syncPlanByEmail(nextUser?.email));
      return;
    }

    const nextUser = getUser();
    setUser(nextUser);
    setPlan(await syncPlanByEmail(nextUser?.email));
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

    supabase.auth.getSession().then(async ({ data }) => {
      const nextUser = data.session?.user ? createAuthUser(data.session.user) : null;
      setUser(nextUser);
      setPlan(await syncPlanByEmail(nextUser?.email));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ? createAuthUser(session.user) : null;
      setUser(nextUser);
      void syncPlanByEmail(nextUser?.email).then((nextPlan) => {
        setPlan(nextPlan);
        setLoading(false);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await doLogout();
    setUser(null);
    setCurrentPlan("free");
    setPlan("free");
  }, []);

  return (
    <AuthContext.Provider value={{ user, plan, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
