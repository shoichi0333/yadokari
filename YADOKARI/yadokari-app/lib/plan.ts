export type PlanId = "free" | "standard" | "pro";

export type PlanLimit = {
  checksPerDay: number | null;
  favorites: number | null;
  history: number | null;
  savedReports: number | null;
  listings: number;
  revenueSimulator: "basic" | "detailed";
  notifications: boolean;
  propertyAnalysis: boolean;
  mapAdvanced: boolean;
};

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "フリー",
  standard: "スタンダード",
  pro: "プロ",
};

export const PLAN_LIMITS: Record<Uppercase<PlanId>, PlanLimit> = {
  FREE: {
    checksPerDay: 3,
    favorites: 3,
    history: 3,
    savedReports: 0,
    listings: 0,
    revenueSimulator: "basic",
    notifications: false,
    propertyAnalysis: false,
    mapAdvanced: false,
  },
  STANDARD: {
    checksPerDay: 100,
    favorites: null,
    history: 50,
    savedReports: 50,
    listings: 0,
    revenueSimulator: "detailed",
    notifications: true,
    propertyAnalysis: true,
    mapAdvanced: true,
  },
  PRO: {
    checksPerDay: null,
    favorites: null,
    history: null,
    savedReports: null,
    listings: 5,
    revenueSimulator: "detailed",
    notifications: true,
    propertyAnalysis: true,
    mapAdvanced: true,
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
