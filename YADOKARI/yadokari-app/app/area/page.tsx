import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { WARD_ZONING_MAP } from "@/lib/data/wardZoning";
import { getSiteUrl } from "@/lib/config";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "エリア別 民泊可否ガイド | YADOKARI",
  description: "全国の都道府県・区市別に民泊（住宅宿泊事業・特区民泊・旅館業）の可否を確認できます。東京・大阪・京都・愛知・神奈川・北海道・沖縄など25都道府県150区市以上に対応。",
  openGraph: {
    title: "エリア別 民泊可否ガイド | YADOKARI",
    description: "全国150区市以上の民泊可否を地域別に確認。住宅宿泊事業・特区民泊・旅館業の3種類を一覧で比較できます。",
    type: "website",
  },
};

type PrefectureArea = {
  prefecture: string;
  wardCount: number;
};

const prefectureAreas: PrefectureArea[] = Array.from(
  WARD_ZONING_MAP.reduce<Map<string, Set<string>>>((areasByPrefecture, area) => {
    const wards = areasByPrefecture.get(area.prefecture) ?? new Set<string>();
    wards.add(area.ward);
    areasByPrefecture.set(area.prefecture, wards);
    return areasByPrefecture;
  }, new Map<string, Set<string>>()),
  ([prefecture, wards]) => ({
    prefecture,
    wardCount: wards.size,
  }),
).sort((a, b) => a.prefecture.localeCompare(b.prefecture, "ja"));

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "エリア別民泊可否ガイド", item: `${siteUrl}/area` },
  ],
};

export default function AreaIndexPage() {
  return (
    <main className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            <MapPin size={13} />
            Area Guide
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            エリア別 民泊可否ガイド
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            全国の都道府県別に、民泊可否を確認できる対応エリアを一覧で確認できます。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prefectureAreas.map(({ prefecture, wardCount }) => (
            <Link
              key={prefecture}
              href={`/area/${encodeURIComponent(prefecture)}`}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-teal-700">
                    {prefecture}
                  </h2>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
                    <Building2 size={14} className="text-teal-600" />
                    <span>対応エリア {wardCount.toLocaleString("ja-JP")}区・市</span>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="mt-1 flex-shrink-0 text-gray-300 transition-colors group-hover:text-teal-600"
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                {prefecture}の民泊可否エリアを確認し、用途地域や特区民泊の状況を比較できます。
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">住所を入力してさらに詳しく調べる</h2>
              <p className="mt-2 text-sm text-teal-50">
                可否チェッカーで具体的な住所を入力すると、番地レベルの判定と収益試算が表示されます。
              </p>
            </div>
            <Link
              href="/check"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
            >
              <MapPin size={16} />
              可否チェッカーへ
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
