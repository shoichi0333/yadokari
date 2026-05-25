import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import MapLoader from "./MapLoader";

export const metadata: Metadata = {
  title: "公式届出済み民泊施設マップ | YADOKARI",
  description: "全国の公式届出済み民泊施設を地図表示。実際に民泊運用されているエリアを把握し、周辺の賃貸物件探しへつなげられます。",
};

type RawListing = {
  id?: unknown;
  address?: unknown;
  lat?: unknown;
  lng?: unknown;
  name?: unknown;
  prefecture?: unknown;
  sourceId?: unknown;
};

type ListingsData = {
  updatedAt?: string;
  totalCount?: number;
  listings?: RawListing[];
};

type CompetitionListing = {
  id: string;
  address: string;
  lat: number;
  lng: number;
  name?: string;
  prefecture?: string;
  sourceId?: string;
};

type AreaStats = {
  sourceId: string;
  name: string;
  prefecture?: string;
  count: number;
};

type ListingsResult = {
  updatedAt?: string;
  listings: CompetitionListing[];
  areaStats: AreaStats[];
  error?: string;
};

const SOURCE_NAMES: Record<string, string> = {
  tokyo_minato_city: "東京都港区",
  kanagawa_pref: "神奈川県",
  osaka_pref: "大阪府",
  aichi_pref: "愛知県",
  nagano_pref: "長野県",
  shizuoka_pref: "静岡県",
};

function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function getAreaName(sourceId: string, listing: CompetitionListing) {
  if (SOURCE_NAMES[sourceId]) return SOURCE_NAMES[sourceId];
  if (sourceId.toLowerCase().includes("minato")) return "港区";
  if (sourceId.toLowerCase().includes("nakano")) return "中野区";
  return listing.prefecture ? `${listing.prefecture} ${sourceId}` : sourceId;
}

function loadListings(): ListingsResult {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "minpaku_listings.json"
  );

  let data: ListingsData;

  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf8")) as ListingsData;
  } catch (error) {
    console.error("[map] Failed to load minpaku_listings.json", error);

    return {
      listings: [],
      areaStats: [],
      error: "届出住宅データを読み込めませんでした。",
    };
  }

  const listings = Array.isArray(data.listings) ? data.listings : [];

  const filteredListings: CompetitionListing[] = listings
    .filter((listing) => isValidCoordinate(listing.lat, listing.lng))
    .map((listing) => ({
      id: typeof listing.id === "string" ? listing.id : crypto.randomUUID(),
      address: typeof listing.address === "string" ? listing.address : "",
      lat: listing.lat as number,
      lng: listing.lng as number,
      name: typeof listing.name === "string" ? listing.name : undefined,
      prefecture:
        typeof listing.prefecture === "string" ? listing.prefecture : undefined,
      sourceId: typeof listing.sourceId === "string" ? listing.sourceId : undefined,
    }));

  const statsMap = new Map<string, AreaStats>();
  filteredListings.forEach((listing) => {
    const sourceId = listing.sourceId ?? "unknown";
    const current = statsMap.get(sourceId);
    if (current) {
      current.count += 1;
      return;
    }

    statsMap.set(sourceId, {
      sourceId,
      name: getAreaName(sourceId, listing),
      prefecture: listing.prefecture,
      count: 1,
    });
  });

  return {
    updatedAt: data.updatedAt,
    listings: filteredListings,
    areaStats: Array.from(statsMap.values()).sort((a, b) => b.count - a.count),
  };
}

function formatUpdatedAt(updatedAt?: string) {
  if (!updatedAt) return "更新日不明";
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "更新日不明";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function MapPage() {
  const { updatedAt, listings, areaStats, error } = loadListings();

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 md:px-6">
        <span className="text-sm font-semibold text-gray-700">公式届出済み民泊施設マップ</span>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-teal-700">{listings.length.toLocaleString("ja-JP")}件</span>
          <span className="text-gray-300">/</span>
          <span>{formatUpdatedAt(updatedAt)}</span>
        </div>
      </div>
      {error ? (
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm">
            <p className="text-base font-bold text-gray-900">届出マップを表示できません</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {error} データ更新後に再度お試しください。
            </p>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-base font-bold text-gray-900">表示できる届出住宅データがありません</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              緯度経度付きの届出住宅データが追加されると、ここに届出マップが表示されます。
            </p>
          </div>
        </div>
      ) : (
        <MapLoader listings={listings} areaStats={areaStats} />
      )}
    </main>
  );
}
