import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function hasValue(value?: string) {
  return Boolean(value && value.trim() && !value.includes("xxxxxxxx") && !value.includes("..."));
}

async function getListingStats() {
  const filePath = path.join(process.cwd(), "public", "data", "minpaku_listings.json");
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as { totalCount?: unknown; listings?: unknown };
  const listings = Array.isArray(parsed.listings) ? parsed.listings : [];

  return {
    totalCount: typeof parsed.totalCount === "number" ? parsed.totalCount : listings.length,
    listingCount: listings.length,
  };
}

export async function GET() {
  try {
    const listingStats = await getListingStats();
    const checks = {
      siteUrl: hasValue(process.env.NEXT_PUBLIC_SITE_URL),
      supabase:
        hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      database: hasValue(process.env.DATABASE_URL),
      stripe:
        hasValue(process.env.STRIPE_SECRET_KEY) &&
        hasValue(process.env.STRIPE_STANDARD_PRICE_ID) &&
        hasValue(process.env.STRIPE_PRO_PRICE_ID) &&
        hasValue(process.env.STRIPE_WEBHOOK_SECRET),
      email: hasValue(process.env.RESEND_API_KEY) && hasValue(process.env.CONTACT_EMAIL),
      listings: listingStats.listingCount > 0,
    };

    const requiredOk = checks.listings;
    const recommendedOk = checks.siteUrl && checks.supabase && checks.database && checks.stripe && checks.email;

    return NextResponse.json(
      {
        ok: requiredOk,
        status: requiredOk && recommendedOk ? "ok" : requiredOk ? "degraded" : "error",
        checkedAt: new Date().toISOString(),
        checks,
        listingStats,
      },
      { status: requiredOk ? 200 : 503 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown health check error",
      },
      { status: 503 },
    );
  }
}
