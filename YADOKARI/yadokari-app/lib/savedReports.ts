const SAVED_REPORTS_KEY = "yadokari_saved_reports";

export type SavedReport = {
  address: string;
  prefecture?: string;
  ward: string | null;
  recommendedType: string;
  score: number;
  monthlyRevenueMin: number | null;
  monthlyRevenueMax: number | null;
  createdAt: string;
};

export function getSavedReports(): SavedReport[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(SAVED_REPORTS_KEY) ?? "[]") as SavedReport[];
  } catch {
    return [];
  }
}

export function saveReport(report: SavedReport): SavedReport[] {
  if (typeof window === "undefined") return [];

  const reports = getSavedReports().filter((item) => item.address !== report.address);
  const updated = [report, ...reports].slice(0, 30);
  localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteSavedReport(address: string): SavedReport[] {
  if (typeof window === "undefined") return [];

  const updated = getSavedReports().filter((item) => item.address !== address);
  localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
  return updated;
}

export async function syncSavedReport(email: string, report: SavedReport): Promise<void> {
  try {
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...report }),
    });
  } catch {
    // Local storage remains the source of truth when offline or DB is not configured.
  }
}

export async function syncDeleteSavedReport(email: string, address: string): Promise<void> {
  try {
    const params = new URLSearchParams({ email, address });
    await fetch(`/api/reports?${params.toString()}`, { method: "DELETE" });
  } catch {
    // Deleting locally is enough in fallback mode.
  }
}
