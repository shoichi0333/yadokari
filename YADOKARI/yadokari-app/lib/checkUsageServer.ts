import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getPlanLimits, normalizePlanId, type PlanId } from "@/lib/plan";
import { isAdminEmail } from "@/lib/adminAuth";

type UsageScope = "USER" | "ANONYMOUS";

export type ServerCheckUsageSnapshot = {
  limit: number | null;
  used: number;
  remaining: number | null;
  isLimitReached: boolean;
  label: string;
};

export type CheckUsageDecision = {
  allowed: boolean;
  plan: PlanId;
  scope: UsageScope;
  snapshot: ServerCheckUsageSnapshot;
};

type MemoryUsage = {
  date: string;
  count: number;
};

const globalForUsage = globalThis as unknown as {
  yadokariCheckUsage?: Map<string, MemoryUsage>;
};

function getUsageMap() {
  if (!globalForUsage.yadokariCheckUsage) {
    globalForUsage.yadokariCheckUsage = new Map();
  }

  return globalForUsage.yadokariCheckUsage;
}

function getJapanDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getClientFingerprint(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "unknown-ip";
  const userAgent = request.headers.get("user-agent") ?? "unknown-ua";
  return createHash("sha256").update(`${ip}|${userAgent}`).digest("hex");
}

function createSnapshot(limit: number | null, used: number): ServerCheckUsageSnapshot {
  const remaining = limit === null ? null : Math.max(limit - used, 0);
  return {
    limit,
    used,
    remaining,
    isLimitReached: limit !== null && used >= limit,
    label: limit === null ? "本日無制限" : `本日 ${used}/${limit} 回`,
  };
}

async function resolveRequester(request: NextRequest): Promise<{
  plan: PlanId;
  scope: UsageScope;
  identifier: string;
}> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (token) {
    const supabase = getSupabaseServerClient();
    const { data } = (await supabase?.auth.getUser(token)) ?? { data: { user: null } };
    const authUser = data.user;

    if (authUser?.email) {
      if (isAdminEmail(authUser.email)) {
        return { plan: "pro" as PlanId, scope: "USER", identifier: authUser.id };
      }

      let plan: PlanId = "free";

      if (process.env.DATABASE_URL) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: authUser.email },
            select: { plan: true },
          });
          plan = normalizePlanId(user?.plan?.toLowerCase());
        } catch {
          plan = "free";
        }
      }

      return {
        plan,
        scope: "USER",
        identifier: authUser.id,
      };
    }
  }

  return {
    plan: "free",
    scope: "ANONYMOUS",
    identifier: getClientFingerprint(request),
  };
}

async function consumeFromDatabase(scope: UsageScope, identifier: string, date: string, limit: number) {
  try {
    return await prisma.$transaction(async (tx) => {
      const where = {
        scope_identifier_date: {
          scope,
          identifier,
          date,
        },
      };
      const existing = await tx.checkUsage.findUnique({ where });

      if (existing && existing.count >= limit) {
        return { used: existing.count, blocked: true };
      }

      const next = existing
        ? await tx.checkUsage.update({
            where,
            data: { count: { increment: 1 } },
          })
        : await tx.checkUsage.create({
            data: {
              scope,
              identifier,
              date,
              count: 1,
            },
          });

      return { used: next.count, blocked: false };
    });
  } catch {
    return null;
  }
}

function consumeFromMemory(scope: UsageScope, identifier: string, date: string, limit: number) {
  const map = getUsageMap();
  const key = `${scope}:${identifier}:${date}`;
  const current = map.get(key);
  const count = current?.date === date ? current.count : 0;

  if (count >= limit) {
    return { used: count, blocked: true };
  }

  const nextCount = count + 1;
  map.set(key, { date, count: nextCount });
  return { used: nextCount, blocked: false };
}

export async function consumeCheckUsage(request: NextRequest): Promise<CheckUsageDecision> {
  const requester = await resolveRequester(request);
  const limit = getPlanLimits(requester.plan).checksPerDay;

  if (limit === null) {
    return {
      ...requester,
      allowed: true,
      snapshot: createSnapshot(null, 0),
    };
  }

  const date = getJapanDateKey();
  let usage = process.env.DATABASE_URL
    ? await consumeFromDatabase(requester.scope, requester.identifier, date, limit)
    : null;

  if (usage === null) {
    usage = consumeFromMemory(requester.scope, requester.identifier, date, limit);
  }

  return {
    ...requester,
    allowed: !usage.blocked,
    snapshot: createSnapshot(limit, usage.used),
  };
}

export function getCheckUsageHeaders(decision: CheckUsageDecision): HeadersInit {
  const limit = decision.snapshot.limit;

  return {
    "X-YADOKARI-Plan": decision.plan,
    "X-RateLimit-Limit": limit === null ? "unlimited" : String(limit),
    "X-RateLimit-Remaining": decision.snapshot.remaining === null ? "unlimited" : String(decision.snapshot.remaining),
    "X-RateLimit-Used": String(decision.snapshot.used),
  };
}
