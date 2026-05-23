import fs from "node:fs";
import path from "node:path";

type EnvCheck = {
  key: string;
  required: boolean;
  description: string;
};

const envChecks: EnvCheck[] = [
  {
    key: "NEXT_PUBLIC_SITE_URL",
    required: true,
    description: "Canonical site URL used for metadata, sitemap, and callbacks.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: false,
    description: "Supabase URL. Required when real auth/database is enabled.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: false,
    description: "Supabase anonymous key. Required when real auth/database is enabled.",
  },
  {
    key: "DATABASE_URL",
    required: false,
    description: "PostgreSQL connection string for Prisma-backed production data.",
  },
  {
    key: "DIRECT_URL",
    required: false,
    description: "Direct (non-pooled) PostgreSQL connection for Prisma migrations.",
  },
  {
    key: "STRIPE_SECRET_KEY",
    required: false,
    description: "Stripe secret key for paid checkout.",
  },
  {
    key: "STRIPE_STANDARD_PRICE_ID",
    required: false,
    description: "Stripe price id for the standard plan.",
  },
  {
    key: "STRIPE_PRO_PRICE_ID",
    required: false,
    description: "Stripe price id for the pro plan.",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    required: false,
    description: "Stripe webhook signing secret.",
  },
  {
    key: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    required: false,
    description: "Google Analytics 4 measurement id, such as G-XXXXXXXXXX.",
  },
  {
    key: "RESEND_API_KEY",
    required: false,
    description: "Resend API key for contact and lead emails.",
  },
  {
    key: "CONTACT_EMAIL",
    required: false,
    description: "Destination email for contact forms and lead notifications.",
  },
  {
    key: "NEXT_PUBLIC_PROPERTY_MARKETPLACE_ENABLED",
    required: false,
    description: "Set to true only after real property listings are reviewed for publication.",
  },
];

const projectRoot = process.cwd();
const enforceRequiredEnv =
  process.env.ENFORCE_DEPLOY_ENV === "true" || Boolean(process.env.VERCEL || process.env.CI);
const requiredFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/check/page.tsx",
  "app/report/page.tsx",
  "app/pricing/page.tsx",
  "app/api/health/route.ts",
  "public/data/minpaku_listings.json",
  "prisma/schema.prisma",
  "vercel.json",
];

function readLocalEnv() {
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=");
    }
  }
}

function hasValue(key: string) {
  const value = process.env[key];
  return Boolean(value && value.trim() && !value.includes("xxxxxxxx") && !value.includes("..."));
}

function checkListingData() {
  const filePath = path.join(projectRoot, "public", "data", "minpaku_listings.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as { totalCount?: unknown; listings?: unknown };
  const listings = Array.isArray(parsed.listings) ? parsed.listings : [];
  const totalCount = typeof parsed.totalCount === "number" ? parsed.totalCount : listings.length;

  return {
    totalCount,
    listingCount: listings.length,
  };
}

readLocalEnv();

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(projectRoot, file)));
const missingRequiredEnv = envChecks.filter((item) => item.required && !hasValue(item.key));
const optionalMissing = envChecks.filter((item) => !item.required && !hasValue(item.key));
const listingStats = checkListingData();
const checkoutReady =
  hasValue("STRIPE_SECRET_KEY") &&
  hasValue("STRIPE_STANDARD_PRICE_ID") &&
  hasValue("STRIPE_PRO_PRICE_ID") &&
  hasValue("STRIPE_WEBHOOK_SECRET");
const emailReady = hasValue("RESEND_API_KEY") && hasValue("CONTACT_EMAIL");
const databaseReady = hasValue("DATABASE_URL");
const supabaseReady = hasValue("NEXT_PUBLIC_SUPABASE_URL") && hasValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const analyticsReady = hasValue("NEXT_PUBLIC_GA_MEASUREMENT_ID");
const marketplaceEnabled = process.env.NEXT_PUBLIC_PROPERTY_MARKETPLACE_ENABLED === "true";

console.log("YADOKARI predeploy check");
console.log("=========================");
console.log(`Files: ${missingFiles.length === 0 ? "OK" : `Missing ${missingFiles.join(", ")}`}`);
console.log(`Listings: ${listingStats.totalCount.toLocaleString("ja-JP")} total / ${listingStats.listingCount.toLocaleString("ja-JP")} rows`);
console.log(`Site URL: ${hasValue("NEXT_PUBLIC_SITE_URL") ? process.env.NEXT_PUBLIC_SITE_URL : "MISSING"}`);
console.log(`Supabase: ${supabaseReady ? "configured" : "not configured"}`);
console.log(`Database: ${databaseReady ? "configured" : "not configured"}`);
console.log(`Stripe checkout: ${checkoutReady ? "configured" : "not configured"}`);
console.log(`Email delivery: ${emailReady ? "configured" : "fallback logging"}`);
console.log(`Analytics: ${analyticsReady ? "configured" : "not configured"}`);
console.log(`Property marketplace: ${marketplaceEnabled ? "enabled" : "gated"}`);

if (optionalMissing.length > 0) {
  console.log("");
  console.log("Optional environment still missing:");
  for (const item of optionalMissing) {
    console.log(`- ${item.key}: ${item.description}`);
  }
}

if ((enforceRequiredEnv && missingRequiredEnv.length > 0) || missingFiles.length > 0) {
  console.error("");
  console.error("Predeploy check failed.");
  if (!enforceRequiredEnv && missingRequiredEnv.length > 0) {
    console.error("Required production environment is missing, but local enforcement is disabled.");
  }
  process.exit(1);
}

console.log("");
if (missingRequiredEnv.length > 0) {
  console.log("Predeploy check passed locally with production environment warnings.");
  console.log("Set ENFORCE_DEPLOY_ENV=true to fail locally on missing production environment.");
} else {
  console.log("Predeploy check passed.");
}
