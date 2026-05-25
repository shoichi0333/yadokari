import { NextRequest, NextResponse } from "next/server";
import { consumeCheckUsage, getCheckUsageHeaders } from "@/lib/checkUsageServer";
import { findWardZoning, getEligibilityFromWard } from "@/lib/data/wardZoning";
import { getMinpakuBadgeType } from "@/lib/minpaku";
import { getSuumoRentSearchUrl } from "@/lib/propertyPortalLinks";
import fs from "fs";
import path from "path";

async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  normalizedTitle: string;
} | null> {
  try {
    const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      geometry: { coordinates: [number, number] };
      properties: { title?: string };
    }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const [lng, lat] = first.geometry.coordinates;
    const normalizedTitle = first.properties?.title ?? address;
    return { lat, lng, normalizedTitle };
  } catch {
    return null;
  }
}

function getCompetitionCount(prefecture: string, ward: string): number {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "minpaku_listings.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      listings: Array<{ address?: string }>;
    };
    const target = `${prefecture}${ward}`;
    return data.listings.filter((listing) => listing.address?.includes(target)).length;
  } catch {
    return 0;
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address || address.length < 3) {
    return NextResponse.json({ error: "住所を入力してください" }, { status: 400 });
  }

  const usage = await consumeCheckUsage(request);
  const usageHeaders = getCheckUsageHeaders(usage);

  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `無料チェックは本日${usage.snapshot.limit ?? 0}回までです。有料プランで継続できます。`,
        usage: usage.snapshot,
      },
      { status: 429, headers: usageHeaders }
    );
  }

  const geocoded = await geocodeAddress(address);
  if (!geocoded) {
    return NextResponse.json(
      {
        error: "住所が見つかりませんでした。もう少し詳しい住所で試してください。",
        usage: usage.snapshot,
      },
      { status: 404, headers: usageHeaders }
    );
  }

  const wardData = findWardZoning(geocoded.normalizedTitle);

  if (!wardData) {
    return NextResponse.json(
      {
        address: geocoded.normalizedTitle,
        lat: geocoded.lat,
        lng: geocoded.lng,
        ward: null,
        message:
          "対応エリア外です。現在、東京・大阪・京都・愛知・神奈川・兵庫・福岡・北海道・沖縄・奈良・長野・静岡・広島・千葉・宮城・埼玉・栃木・熊本・新潟に対応しています。",
        usage: usage.snapshot,
      },
      { headers: usageHeaders }
    );
  }

  const minpakuInfo = getEligibilityFromWard(wardData);
  const correctedInfo = {
    juutaku: minpakuInfo.juutaku,
    tokku: wardData.tokkuArea ? minpakuInfo.tokku : false,
    ryokan: minpakuInfo.ryokan,
  };
  const badgeType = getMinpakuBadgeType({ ...minpakuInfo, tokku: correctedInfo.tokku });
  const competitionCount = getCompetitionCount(wardData.prefecture, wardData.ward);

  return NextResponse.json(
    {
      address: geocoded.normalizedTitle,
      lat: geocoded.lat,
      lng: geocoded.lng,
      ward: wardData.ward,
      prefecture: wardData.prefecture,
      typicalZoning: wardData.typicalZoning,
      tokkuArea: wardData.tokkuArea,
      notes: wardData.notes,
      suumoUrl: getSuumoRentSearchUrl(wardData.prefecture, wardData.ward),
      minpakuInfo: correctedInfo,
      badgeType,
      competitionCount,
      confidence: "ward-level" as const,
      usage: usage.snapshot,
    },
    { headers: usageHeaders }
  );
}
