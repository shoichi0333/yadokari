import { getCurrentPlan, getPlanLimits } from "@/lib/plan";

const HISTORY_KEY = "yadokari_check_history";

export type CheckHistoryEntry = {
  address: string;
  ward: string | null;
  prefecture?: string;
  juutaku: boolean;
  tokku: boolean;
  ryokan: boolean;
  checkedAt: string;
};

export function getCheckHistory(): CheckHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as CheckHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveCheckHistory(entry: CheckHistoryEntry) {
  if (typeof window === "undefined") return;
  const history = getCheckHistory().filter((h) => h.address !== entry.address);
  const limit = getPlanLimits(getCurrentPlan()).history;

  if (limit !== null && history.length >= limit) {
    return;
  }

  const updated = [entry, ...history].slice(0, limit ?? 200);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearCheckHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export async function syncCheckHistory(email: string, entry: CheckHistoryEntry): Promise<void> {
  try {
    await fetch("/api/check-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...entry }),
    });
  } catch {
    // Local history remains available when offline or DB is not configured.
  }
}
