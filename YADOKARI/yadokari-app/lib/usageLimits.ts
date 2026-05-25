import { getPlanLimits, type PlanId } from "@/lib/plan";

const CHECK_USAGE_KEY = "yadokari_check_usage";

type DailyUsage = {
  date: string;
  count: number;
};

export type CheckUsageSnapshot = {
  limit: number | null;
  used: number;
  remaining: number | null;
  isLimitReached: boolean;
  label: string;
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readDailyUsage(): DailyUsage {
  if (typeof window === "undefined") {
    return { date: getTodayKey(), count: 0 };
  }

  try {
    const raw = localStorage.getItem(CHECK_USAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as DailyUsage) : null;
    const today = getTodayKey();

    if (!parsed || parsed.date !== today || typeof parsed.count !== "number") {
      return { date: today, count: 0 };
    }

    return parsed;
  } catch {
    return { date: getTodayKey(), count: 0 };
  }
}

function writeDailyUsage(usage: DailyUsage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHECK_USAGE_KEY, JSON.stringify(usage));
}

export function getCheckUsageSnapshot(plan: PlanId): CheckUsageSnapshot {
  const limit = getPlanLimits(plan).checksPerDay;
  const usage = readDailyUsage();
  const remaining = limit === null ? null : Math.max(limit - usage.count, 0);

  return {
    limit,
    used: usage.count,
    remaining,
    isLimitReached: limit !== null && usage.count >= limit,
    label: limit === null ? "本日無制限" : `本日 ${usage.count}/${limit} 回`,
  };
}

export function canRunCheck(plan: PlanId) {
  return !getCheckUsageSnapshot(plan).isLimitReached;
}

export function recordCheckUsage(plan: PlanId): CheckUsageSnapshot {
  const limit = getPlanLimits(plan).checksPerDay;
  if (limit === null) return getCheckUsageSnapshot(plan);

  const usage = readDailyUsage();
  writeDailyUsage({ date: usage.date, count: usage.count + 1 });
  return getCheckUsageSnapshot(plan);
}

export function syncServerCheckUsage(
  plan: PlanId,
  snapshot?: Partial<CheckUsageSnapshot> | null
): CheckUsageSnapshot {
  if (!snapshot || typeof snapshot.used !== "number") {
    return getCheckUsageSnapshot(plan);
  }

  const limit = snapshot.limit === undefined ? getPlanLimits(plan).checksPerDay : snapshot.limit;
  if (limit !== null) {
    writeDailyUsage({ date: getTodayKey(), count: snapshot.used });
  }

  const remaining = limit === null ? null : Math.max(limit - snapshot.used, 0);

  return {
    limit,
    used: snapshot.used,
    remaining,
    isLimitReached: limit !== null && snapshot.used >= limit,
    label: limit === null ? "本日無制限" : `本日 ${snapshot.used}/${limit} 回`,
  };
}
