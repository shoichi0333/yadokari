export function cleanEnvValue(value?: string) {
  return value?.replace(/^\uFEFF/, "").trim();
}

export function getSiteUrl() {
  return (cleanEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/$/, "");
}

export function isAllowedAppUrl(value: string) {
  try {
    const target = new URL(value);
    const site = new URL(getSiteUrl());

    return target.origin === site.origin;
  } catch {
    return false;
  }
}

export function getExpectedStripePriceId(planType: "STANDARD" | "PRO") {
  const value =
    planType === "STANDARD"
      ? process.env.STRIPE_STANDARD_PRICE_ID ?? process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID ?? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  return cleanEnvValue(value);
}
