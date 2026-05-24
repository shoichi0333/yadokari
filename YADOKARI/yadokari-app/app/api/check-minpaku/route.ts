import { NextRequest, NextResponse } from "next/server";
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
    // 住所に「{都道府県}{区名}」が含まれるものだけカウント（例：東京都港区）
    const target = `${prefecture}${ward}`;
    return data.listings.filter((l) => l.address?.includes(target)).length;
  } catch {
    return 0;
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address || address.length < 3) {
    return NextResponse.json({ error: "住所を入力してください" }, { status: 400 });
  }

  const geocoded = await geocodeAddress(address);
  if (!geocoded) {
    return NextResponse.json(
      { error: "住所が見つかりませんでした。もう少し詳しい住所で試してください。" },
      { status: 404 }
    );
  }

  const wardData = findWardZoning(geocoded.normalizedTitle);

  if (!wardData) {
    return NextResponse.json({
      address: geocoded.normalizedTitle,
      lat: geocoded.lat,
      lng: geocoded.lng,
      ward: null,
      message:
        "対応エリア外です。現在、東京都・大阪府・京都府・愛知県・神奈川県・兵庫県・福岡県・北海道・沖縄県・奈良県・長野県・静岡県・広島県・千葉県・宮城県・埼玉県・栃木県・熊本県・新潟県に対応しています。",
    });
  }

  const minpakuInfo = getEligibilityFromWard(wardData);
  // 特区フラグが false の場合は tokku を強制的に無効化
  // (商業地域は getMinpakuInfo 内で tokku="possible" と判定されるが、
  //  実際には国家戦略特区の地域指定が必要なため区単位で補正する)
  const correctedInfo = {
    juutaku: minpakuInfo.juutaku,
    tokku: wardData.tokkuArea ? minpakuInfo.tokku : false,
    ryokan: minpakuInfo.ryokan,
  };
  const badgeType = getMinpakuBadgeType({ ...minpakuInfo, tokku: correctedInfo.tokku });
  const competitionCount = getCompetitionCount(wardData.prefecture, wardData.ward);

  return NextResponse.json({
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
  });
}
