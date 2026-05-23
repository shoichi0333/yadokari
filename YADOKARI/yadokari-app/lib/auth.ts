import { getSupabaseClient } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = "yadokari_user";

export function isSupabaseEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

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

export async function login(email: string, password: string): Promise<AuthUser | null> {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;

    return createAuthUser(data.user);
  }

  // Mock: any valid-looking email + 6+ char password succeeds
  if (!email.includes("@") || password.length < 6) return null;
  const user: AuthUser = {
    id: crypto.randomUUID(),
    email,
    name: email.split("@")[0],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthUser | null> {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/login?registered=1`
            : undefined,
      },
    });
    if (error || !data.user) return null;

    return createAuthUser(data.user);
  }

  if (!email.includes("@") || password.length < 6 || !name.trim()) return null;
  const user: AuthUser = {
    id: crypto.randomUUID(),
    email,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  if (isSupabaseEnabled()) {
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
