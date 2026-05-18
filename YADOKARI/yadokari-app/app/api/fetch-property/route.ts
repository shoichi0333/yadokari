import { NextRequest, NextResponse } from "next/server";

export interface PropertyDetails {
  address: string | null;
  rent: string | null;
  layout: string | null;
  areaSqm: string | null;
  station: string | null;
  zoning: string | null;
  buildingYear: string | null;
  sourceUrl: string;
  siteName: string;
}

function matchesHost(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function detectSite(hostname: string): "suumo" | "athome" | "homes" | "unknown" {
  const normalized = hostname.toLowerCase();
  if (matchesHost(normalized, "suumo.jp")) return "suumo";
  if (matchesHost(normalized, "athome.co.jp")) return "athome";
  if (matchesHost(normalized, "homes.co.jp") || matchesHost(normalized, "lifull.com")) return "homes";
  return "unknown";
}

function extractText(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : null;
}

function parseSuumo(html: string): Omit<PropertyDetails, "sourceUrl" | "siteName"> {
  // 所在地
  const address =
    extractText(html, /所在地[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/) ??
    extractText(html, /住所[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  // 賃料
  const rent =
    extractText(html, /賃料[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/) ??
    extractText(html, /class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\//) ;

  // 間取り
  const layout = extractText(html, /間取り[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  // 専有面積
  const areaSqm =
    extractText(html, /専有面積[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/) ??
    extractText(html, /面積[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  // 交通
  const station = extractText(html, /交通[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  // 用途地域（記載がある物件のみ）
  const zoning = extractText(html, /用途地域[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  // 築年数
  const buildingYear =
    extractText(html, /築年月[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/) ??
    extractText(html, /築年数[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  return { address, rent, layout, areaSqm, station, zoning, buildingYear };
}

function parseAthome(html: string): Omit<PropertyDetails, "sourceUrl" | "siteName"> {
  const address =
    extractText(html, /所在地[\s\S]*?<[^>]+>([\s\S]*?)<\/[^>]+>/) ??
    extractText(html, /"address"[^>]*>([\s\S]*?)<\//);

  const rent =
    extractText(html, /賃料[\s\S]*?<[^>]+class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\//) ??
    extractText(html, /月額[\s\S]*?<[^>]+>([\s\S]*?)<\//);

  const layout = extractText(html, /間取り[\s\S]*?<[^>]+>([\s\S]*?)<\//);
  const areaSqm = extractText(html, /専有面積[\s\S]*?<[^>]+>([\s\S]*?)<\//);
  const station = extractText(html, /交通[\s\S]*?<[^>]+>([\s\S]*?)<\//);
  const zoning = extractText(html, /用途地域[\s\S]*?<[^>]+>([\s\S]*?)<\//);
  const buildingYear = extractText(html, /築年月[\s\S]*?<[^>]+>([\s\S]*?)<\//);

  return { address, rent, layout, areaSqm, station, zoning, buildingYear };
}

function parseHomes(html: string): Omit<PropertyDetails, "sourceUrl" | "siteName"> {
  const address =
    extractText(html, /所在地[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/) ??
    extractText(html, /住所[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  const rent = extractText(html, /賃料[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);
  const layout = extractText(html, /間取り[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);
  const areaSqm = extractText(html, /専有面積[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);
  const station = extractText(html, /交通[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);
  const zoning = extractText(html, /用途地域[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);
  const buildingYear = extractText(html, /築年月[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/);

  return { address, rent, layout, areaSqm, station, zoning, buildingYear };
}

// 文字列を読みやすくクリーンアップ
function cleanText(text: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim() || null;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url")?.trim();

  if (!rawUrl) {
    return NextResponse.json({ error: "URLを入力してください" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "有効なURLを入力してください" }, { status: 400 });
  }

  if (targetUrl.protocol !== "https:") {
    return NextResponse.json({ error: "httpsの物件URLを入力してください" }, { status: 400 });
  }

  const site = detectSite(targetUrl.hostname);
  if (site === "unknown") {
    return NextResponse.json(
      { error: "SUUMO・アットホーム・LIFULLのURLに対応しています" },
      { status: 400 }
    );
  }

  let html: string;
  try {
    const res = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "ja,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `物件ページの取得に失敗しました (HTTP ${res.status})` },
        { status: 502 }
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: "物件ページにアクセスできませんでした。URLを確認してください。" },
      { status: 502 }
    );
  }

  const siteNames: Record<string, string> = {
    suumo: "SUUMO",
    athome: "アットホーム",
    homes: "LIFULL HOME'S",
  };

  let parsed: Omit<PropertyDetails, "sourceUrl" | "siteName">;
  if (site === "suumo") {
    parsed = parseSuumo(html);
  } else if (site === "athome") {
    parsed = parseAthome(html);
  } else {
    parsed = parseHomes(html);
  }

  const details: PropertyDetails = {
    address: cleanText(parsed.address),
    rent: cleanText(parsed.rent),
    layout: cleanText(parsed.layout),
    areaSqm: cleanText(parsed.areaSqm),
    station: cleanText(parsed.station),
    zoning: cleanText(parsed.zoning),
    buildingYear: cleanText(parsed.buildingYear),
    sourceUrl: targetUrl.toString(),
    siteName: siteNames[site] ?? site,
  };

  if (!details.address) {
    return NextResponse.json(
      {
        error: "住所を読み取れませんでした。物件詳細ページのURLを入力してください。",
        partialDetails: details,
      },
      { status: 422 }
    );
  }

  return NextResponse.json(details);
}
