export type PlanId = "free" | "standard" | "pro";

export type PlanLimit = {
  favorites: number | null;
  listings: number;
  revenueSimulator: "basic" | "detailed";
  notifications: boolean;
};

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "フリー",
  standard: "スタンダード",
  pro: "プロ",
};

export const PLAN_LIMITS: Record<Uppercase<PlanId>, PlanLimit> = {
  FREE: {
    favorites: 3,
    listings: 0,
    revenueSimulator: "basic",
    notifications: false,
  },
  STANDARD: {
    favorites: null,
    listings: 0,
    revenueSimulator: "detailed",
    notifications: true,
  },
  PRO: {
    favorites: null,
    listings: 5,
    revenueSimulator: "detailed",
    notifications: true,
  },
};

const PLAN_STORAGE_KEY = "yadokari_plan";

export function normalizePlanId(plan?: string | null): PlanId {
  if (plan === "standard" || plan === "pro") {
    return plan;
  }

  return "free";
}

export function setCurrentPlan(plan: PlanId): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PLAN_STORAGE_KEY, plan);
  }
}

export function getCurrentPlan(): PlanId {
  if (typeof window === "undefined") return "free";

  try {
    return normalizePlanId(localStorage.getItem(PLAN_STORAGE_KEY));
  } catch {
    return "free";
  }
}

export function getPlanLimits(plan: PlanId): PlanLimit {
  return PLAN_LIMITS[plan.toUpperCase() as Uppercase<PlanId>];
}

export function isFreePlan(plan: PlanId): boolean {
  return plan === "free";
}

export function isProPlan(plan: PlanId): boolean {
  return plan === "pro";
}
