import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type AppSupabaseClient = SupabaseClient<Database>;

let browserClient: AppSupabaseClient | null | undefined;

export function cleanEnvValue(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function createSupabaseClient(): AppSupabaseClient | null {
  const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseClient(): AppSupabaseClient | null {
  if (browserClient !== undefined) {
    return browserClient;
  }

  browserClient = createSupabaseClient();
  return browserClient;
}

export function getSupabaseServerClient(): AppSupabaseClient | null {
  return createSupabaseClient();
}
