/**
 * 民泊届出住宅データ（政府オープンデータ由来）の型定義とローダー
 *
 * データは scraper/main.py が月次で生成する
 * public/data/minpaku_listings.json から読み込む
 */

export type MinpakuListingType = "JUUTAKU" | "TOKKU" | "RYOKAN";

export interface MinpakuListing {
  id: string;
  prefecture: string;
  address: string;
  permitNumber: string;
  permitDate: string;
  name: string;
  lat: number;
  lng: number;
  minpakuType: MinpakuListingType;
  sourceId: string;
}

export interface ListingsData {
  updatedAt: string;
  totalCount: number;
  listings: MinpakuListing[];
}

/** サーバーサイドでJSONを読み込む（Node.js環境のみ） */
export async function loadListings(): Promise<ListingsData> {
  // 本番: public/data/minpaku_listings.json を読み込む
  // 開発中はモックデータにフォールバック
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", "data", "minpaku_listings.json");
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as ListingsData;
  } catch {
    // JSONがまだ存在しない場合（初回）はモックを返す
    console.warn("minpaku_listings.json が見つかりません。モックデータを使用します。");
    return getMockListings();
  }
}

/** クライアントサイドでAPIから取得 */
export async function fetchListings(): Promise<ListingsData> {
  const res = await fetch("/data/minpaku_listings.json", {
    next: { revalidate: 60 * 60 * 24 }, // 24時間キャッシュ
  });
  if (!res.ok) return getMockListings();
  return res.json();
}

/** スクレイパー実行前の開発用モックデータ */
function getMockListings(): ListingsData {
  return {
    updatedAt: new Date().toISOString(),
    totalCount: 3,
    listings: [
      {
        id: "mock-001",
        prefecture: "静岡県",
        address: "静岡県静岡市葵区追手町9-6",
        permitNumber: "静岡県知事-000001",
        permitDate: "2024-04-01",
        name: "静岡サンプル民泊",
        lat: 34.9769,
        lng: 138.3831,
        minpakuType: "JUUTAKU",
        sourceId: "shizuoka",
      },
      {
        id: "mock-002",
        prefecture: "大阪府",
        address: "大阪府大阪市中央区難波3-7-18",
        permitNumber: "大阪府知事-000002",
        permitDate: "2024-05-15",
        name: "なんば民泊サンプル",
        lat: 34.6684,
        lng: 135.5023,
        minpakuType: "JUUTAKU",
        sourceId: "osaka_pref",
      },
      {
        id: "mock-003",
        prefecture: "福岡県",
        address: "福岡県福岡市博多区博多駅前3-1-5",
        permitNumber: "福岡県知事-000003",
        permitDate: "2024-03-10",
        name: "博多民泊サンプル",
        lat: 33.5904,
        lng: 130.4219,
        minpakuType: "JUUTAKU",
        sourceId: "fukuoka_pref",
      },
    ],
  };
}

/** フィルタリング */
export function filterListings(
  listings: MinpakuListing[],
  params: {
    prefecture?: string;
    keyword?: string;
    minpakuType?: string;
  }
): MinpakuListing[] {
  return listings.filter((l) => {
    if (params.prefecture && params.prefecture !== "ALL" && l.prefecture !== params.prefecture) return false;
    if (params.minpakuType && params.minpakuType !== "ALL" && l.minpakuType !== params.minpakuType) return false;
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      if (!l.address.toLowerCase().includes(kw) && !l.prefecture.toLowerCase().includes(kw) && !l.name.toLowerCase().includes(kw)) return false;
    }
    return true;
  });
}
