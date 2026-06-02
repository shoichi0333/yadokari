import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export type AdminAuthResult =
  | { ok: true; email: string }
  | { ok: false; response: NextResponse };

function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.CONTACT_EMAIL || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return parseAdminEmails().includes(email.toLowerCase());
}

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "ログインが必要です" }, { status: 401 }),
    };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json({ error: "認証サービスが未設定です" }, { status: 503 }),
    };
  }

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "認証情報を確認できませんでした" }, { status: 401 }),
    };
  }

  const adminEmails = parseAdminEmails();
  if (!adminEmails.includes(email)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "管理者権限がありません" }, { status: 403 }),
    };
  }

  return { ok: true, email };
}
