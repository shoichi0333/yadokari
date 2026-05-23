import { readFileSync, existsSync } from "node:fs";

type EnvMap = Record<string, string>;

function loadEnvFile(path: string, env: EnvMap) {
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const index = line.indexOf("=");
    if (index < 1) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!env[key]) env[key] = value;
  }
}

function getProjectRef(env: EnvMap) {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";

  try {
    return new URL(url).hostname.split(".")[0] ?? "";
  } catch {
    return "";
  }
}

function requireEnv(env: EnvMap, key: string) {
  const value = env[key];
  if (!value) {
    throw new Error(`${key} is required. Set it in .env.smtp.local or the shell environment.`);
  }
  return value;
}

async function main() {
  const env: EnvMap = { ...process.env } as EnvMap;
  loadEnvFile(".env.local", env);
  loadEnvFile(".env.smtp.local", env);

  const projectRef = getProjectRef(env);
  if (!projectRef) {
    throw new Error("Supabase project ref could not be detected from SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL.");
  }

  const accessToken = requireEnv(env, "SUPABASE_ACCESS_TOKEN");
  const resendApiKey = env.RESEND_API_KEY;
  const senderEmail = env.SMTP_ADMIN_EMAIL || "noreply@yadokari-minpaku.jp";
  const senderName = env.SMTP_SENDER_NAME || "YADOKARI";
  const smtpPort = env.SMTP_PORT || "465";
  const siteUrl = env.SUPABASE_SITE_URL || env.NEXT_PUBLIC_SITE_URL || "https://yadokari-minpaku.jp";
  const redirectUrls =
    env.SUPABASE_REDIRECT_URLS ||
    [
      "https://yadokari-minpaku.jp",
      "https://yadokari-minpaku.jp/**",
      "https://yadokari-minpaku.jp/auth/login",
      "https://yadokari-minpaku.jp/auth/login?registered=1",
    ].join(",");

  const body: Record<string, string | number | boolean> = {
    site_url: siteUrl,
    uri_allow_list: redirectUrls,
    rate_limit_email_sent: Number(env.SUPABASE_RATE_LIMIT_EMAIL_SENT || "30"),
  };

  console.log(`Configuring Supabase Auth SMTP for project ${projectRef}`);
  console.log(`Site URL: ${body.site_url}`);
  console.log(`Redirect URLs: ${body.uri_allow_list}`);
  console.log(`Auth email rate limit: ${body.rate_limit_email_sent} per hour`);

  if (resendApiKey) {
    Object.assign(body, {
      external_email_enabled: true,
      mailer_secure_email_change_enabled: true,
      mailer_autoconfirm: false,
      smtp_admin_email: senderEmail,
      smtp_host: env.SMTP_HOST || "smtp.resend.com",
      smtp_port: smtpPort,
      smtp_user: env.SMTP_USER || "resend",
      smtp_pass: resendApiKey,
      smtp_sender_name: senderName,
    });
    console.log(`Sender: ${senderName} <${senderEmail}>`);
    console.log(`SMTP: ${body.smtp_host}:${body.smtp_port} as ${body.smtp_user}`);
  } else {
    console.log("RESEND_API_KEY is not set; updating Auth rate limit only.");
  }

  if (env.DRY_RUN === "true") {
    console.log("DRY_RUN=true, not updating Supabase.");
    return;
  }

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase auth config update failed (${response.status}): ${text}`);
  }

  console.log("Supabase Auth SMTP configured.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
