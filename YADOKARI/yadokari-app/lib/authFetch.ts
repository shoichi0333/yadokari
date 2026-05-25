import { isSupabaseEnabled } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

export async function getAuthFetchHeaders(): Promise<Record<string, string>> {
  if (!isSupabaseEnabled()) return {};

  const supabase = getSupabaseClient();
  if (!supabase) return {};

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
