type SmokeTarget = {
  path: string;
  label: string;
  expectContentType?: string;
  allowDegradedHealth?: boolean;
  expectSecurityHeaders?: boolean;
};

const baseUrl = (process.env.SMOKE_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const targets: SmokeTarget[] = [
  { path: "/", label: "Top page", expectContentType: "text/html", expectSecurityHeaders: true },
  { path: "/properties", label: "Property search", expectContentType: "text/html" },
  { path: "/check", label: "Checker", expectContentType: "text/html" },
  {
    path: `/report?address=${encodeURIComponent("東京都港区六本木")}`,
    label: "Report with address",
    expectContentType: "text/html",
  },
  {
    path: `/pricing?source=report&address=${encodeURIComponent("東京都港区六本木")}`,
    label: "Pricing from report",
    expectContentType: "text/html",
  },
  {
    path: `/contact?address=${encodeURIComponent("東京都港区六本木")}`,
    label: "Contact with address",
    expectContentType: "text/html",
  },
  { path: "/api/health", label: "Health API", expectContentType: "application/json", allowDegradedHealth: true },
  { path: "/opengraph-image", label: "OpenGraph image", expectContentType: "image/png" },
];

async function checkTarget(target: SmokeTarget) {
  const url = `${baseUrl}${target.path}`;
  const response = await fetch(url, { redirect: "manual" });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(`${target.label} returned ${response.status} for ${url}`);
  }

  if (target.expectContentType && !contentType.includes(target.expectContentType)) {
    throw new Error(`${target.label} returned unexpected content-type "${contentType}"`);
  }

  if (target.expectSecurityHeaders) {
    const requiredHeaders = [
      "x-content-type-options",
      "x-frame-options",
      "referrer-policy",
      "permissions-policy",
    ];
    const missing = requiredHeaders.filter((header) => !response.headers.has(header));
    if (missing.length > 0) {
      throw new Error(`${target.label} is missing security headers: ${missing.join(", ")}`);
    }
  }

  if (target.path === "/api/health") {
    const body = (await response.json()) as { ok?: boolean; status?: string };
    if (!body.ok) {
      throw new Error(`Health API returned ok=false`);
    }
    if (body.status !== "ok" && !(target.allowDegradedHealth && body.status === "degraded")) {
      throw new Error(`Health API returned unexpected status "${body.status}"`);
    }
    return `${target.label}: ${body.status}`;
  }

  return `${target.label}: OK`;
}

async function main() {
  console.log(`YADOKARI smoke test: ${baseUrl}`);
  console.log("==============================");

  const results: string[] = [];

  for (const target of targets) {
    results.push(await checkTarget(target));
  }

  for (const result of results) {
    console.log(result);
  }

  console.log("");
  console.log("Smoke test passed.");
}

void main();
