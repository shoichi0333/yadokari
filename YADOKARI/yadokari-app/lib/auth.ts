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

function getRegisterErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "このメールアドレスはすでに登録されています。ログインしてください。";
  }

  if (normalized.includes("invalid email")) {
    return "メールアドレスの形式を確認してください。";
  }

  if (normalized.includes("password")) {
    return "パスワードは6文字以上で設定してください。";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "短時間に登録を試しすぎています。少し時間をおいてから再度お試しください。";
  }

  return "登録に失敗しました。入力内容を確認してください。";
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
    if (error) throw new Error(getRegisterErrorMessage(error.message));
    if (!data.user) return null;
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error("このメールアドレスはすでに登録されています。ログインしてください。");
    }

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
