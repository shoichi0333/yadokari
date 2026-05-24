import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cleanEnvValue } from "@/lib/supabase";
import { isAllowedAppUrl } from "@/lib/config";

function getRegisterErrorMessage(message: string, status?: number, code?: string): string {
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

  if (
    status === 429 ||
    code === "over_email_send_rate_limit" ||
    normalized.includes("rate limit") ||
    normalized.includes("too many")
  ) {
    return "確認メールの送信上限に達しました。少し時間をおいてから再度お試しください。";
  }

  return `認証サービスからエラーが返りました: ${message}`;
}

export async function POST(request: Request) {
  const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "認証サービスに接続できませんでした。時間をおいて再度お試しください。" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const redirectTo = typeof body?.redirectTo === "string" ? body.redirectTo.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "お名前を入力してください。" }, { status: 400 });
  }

  if (!email.includes("@")) {
    return NextResponse.json({ error: "メールアドレスの形式を確認してください。" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "パスワードは6文字以上で設定してください。" }, { status: 400 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const emailRedirectTo =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? `${siteUrl}${redirectTo}`
      : redirectTo && isAllowedAppUrl(redirectTo)
        ? redirectTo
        : `${siteUrl}/auth/complete`;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: getRegisterErrorMessage(error.message, error.status, error.code) },
      { status: error.status || 400 }
    );
  }

  if (!data.user) {
    return NextResponse.json(
      { error: "登録を完了できませんでした。すでに登録済みの場合はログインしてください。" },
      { status: 400 }
    );
  }

  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return NextResponse.json(
      { error: "このメールアドレスはすでに登録されています。ログインしてください。" },
      { status: 409 }
    );
  }

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email ?? email,
      name,
      createdAt: data.user.created_at ?? new Date().toISOString(),
    },
    requiresEmailConfirmation: !data.session,
  });
}
