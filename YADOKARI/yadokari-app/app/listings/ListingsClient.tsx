"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ExternalLink, Filter, LayoutGrid, List, MapPin, Search } from "lucide-react";
import MinpakuBadge from "@/components/MinpakuBadge";
import type { ListingsData, MinpakuListing } from "@/lib/data/listings";
import { getAthomeRentSearchUrl, getSuumoRentSearchUrl } from "@/lib/propertyPortalLinks";

// Leafletはサーバーサイドレンダリング不可のため動的インポート
const ListingsMap = dynamic(() => import("./ListingsMap"), { ssr: false });

interface Props {
  data: ListingsData;
}

const TYPE_OPTIONS = [
  { value: "ALL", label: "すべて" },
  { value: "JUUTAKU", label: "住宅宿泊" },
  { value: "TOKKU", label: "特区民泊" },
  { value: "RYOKAN", label: "旅館業" },
];

function getListingAreaKeyword(listing: MinpakuListing) {
  const rest = listing.address.replace(listing.prefecture, "").trim();
  const match = rest.match(/^(.+?[市区町村])/);
  return match?.[1] ?? rest.slice(0, 12) ?? listing.address;
}

export default function ListingsClient({ data }: Props) {
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedPref, setSelectedPref] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<MinpakuListing | null>(null);

  const prefectures = useMemo(() => {
    const prefs = Array.from(new Set(data.listings.map((l) => l.prefecture))).sort();
    return ["ALL", ...prefs];
  }, [data.listings]);

  const filtered = useMemo(() => {
    return data.listings.filter((l) => {
      if (selectedPref !== "ALL" && l.prefecture !== selectedPref) return false;
      if (selectedType !== "ALL" && l.minpakuType !== selectedType) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (
          !l.address.toLowerCase().includes(kw) &&
          !l.name.toLowerCase().includes(kw) &&
          !l.prefecture.toLowerCase().includes(kw)
        )
          return false;
      }
      return true;
    });
  }, [data.listings, selectedPref, selectedType, keyword]);

  // 都道府県別件数
  const prefCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.listings.forEach((l) => {
      counts[l.prefecture] = (counts[l.prefecture] ?? 0) + 1;
    });
    return counts;
  }, [data.listings]);

  const typeCount = (type: string) =>
    type === "ALL" ? filtered.length : filtered.filter((l) => l.minpakuType === type).length;

  const updatedDate = new Date(data.updatedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={22} className="text-teal-600" />
                公式届出済み民泊施設一覧/マップ
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                公式に届出・許可・認定された民泊施設を確認し、周辺の賃貸物件探しへつなげます。
              </p>
            </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>データ更新: {updatedDate}</span>
            </div>
          </div>

          {/* 統計バナー */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <StatCard label="総届出件数" value={`${data.totalCount.toLocaleString()}件`} color="teal" />
            <StatCard label="対象都道府県" value={`${Object.keys(prefCounts).length}都道府県`} color="blue" />
            <StatCard
              label="住宅宿泊（届出）"
              value={`${data.listings.filter((l) => l.minpakuType === "JUUTAKU").length}件`}
              color="green"
            />
            <StatCard
              label="特区・旅館業"
              value={`${data.listings.filter((l) => l.minpakuType !== "JUUTAKU").length}件`}
              color="orange"
            />
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            ここに表示されるのは「すでに届出・許可・認定された施設」です。現在空いている民泊可物件ではありません。
            空き物件候補は「この周辺で賃貸を探す」または物件リンク集から確認してください。
          </div>
        </div>
      </div>

      {/* フィルター + ビュー切り替え */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter size={14} className="text-gray-400 hidden sm:block flex-shrink-0" />

          {/* キーワード */}
          <input
            type="text"
            placeholder="住所・施設名で絞り込み"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 w-full sm:w-48"
          />

          {/* 都道府県 */}
          <select
            value={selectedPref}
            onChange={(e) => setSelectedPref(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {prefectures.map((p) => (
              <option key={p} value={p}>
                {p === "ALL" ? "都道府県（全て）" : `${p}（${prefCounts[p] ?? 0}件）`}
              </option>
            ))}
          </select>

          {/* 民泊種別 */}
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedType(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedType === opt.value
                    ? "bg-teal-600 text-white border-teal-600"
                    : "border-gray-200 text-gray-600 hover:border-teal-400"
                }`}
              >
                {opt.label}（{typeCount(opt.value)}）
              </button>
            ))}
          </div>

          {/* ビュー切り替え */}
          <div className="ml-auto flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                view === "map" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <MapPin size={12} /> 地図
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                view === "list" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <List size={12} /> 一覧
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {view === "map" ? (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 地図 */}
            <div className="flex-1 min-h-0">
              <ListingsMap
                listings={filtered}
                selected={selected}
                onSelect={setSelected}
              />
            </div>

            {/* サイドパネル */}
            {selected && (
              <div className="lg:w-72 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm self-start">
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1"
                >
                  ✕ 閉じる
                </button>
                <MinpakuBadge type={selected.minpakuType} />
                <h3 className="font-bold text-gray-900 mt-2 mb-1">{selected.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{selected.address}</p>
                <div className="text-xs text-gray-400 space-y-1 border-t border-gray-50 pt-3">
                  <div className="flex justify-between">
                    <span>届出番号</span>
                    <span className="text-gray-600 font-mono">{selected.permitNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>届出日</span>
                    <span className="text-gray-600">{selected.permitDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>都道府県</span>
                    <span className="text-gray-600">{selected.prefecture}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-gray-50 pt-4">
                  <p className="text-xs font-bold text-gray-900">この周辺で賃貸を探す</p>
                  <a
                    href={getSuumoRentSearchUrl(selected.prefecture, getListingAreaKeyword(selected))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
                  >
                    SUUMOで探す
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href={getAthomeRentSearchUrl(selected.prefecture, getListingAreaKeyword(selected))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50"
                  >
                    アットホームで探す
                    <ExternalLink size={12} />
                  </a>
                  <Link
                    href={`/check?address=${encodeURIComponent(selected.address)}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    YADOKARIで周辺分析
                    <Search size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ListView listings={filtered} onSelect={(l) => { setSelected(l); setView("map"); }} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div className={`rounded-xl px-4 py-3 ${colorMap[color]}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-70 mt-0.5">{label}</div>
    </div>
  );
}

function ListView({
  listings,
  onSelect,
}: {
  listings: MinpakuListing[];
  onSelect: (l: MinpakuListing) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">{listings.length}件の届出住宅</p>
      {listings.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <LayoutGrid size={32} className="mx-auto mb-3 opacity-40" />
          条件に一致する届出住宅がありません
        </div>
      )}
      {listings.map((l) => (
        <button
          key={l.id}
          onClick={() => onSelect(l)}
          className="w-full text-left bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-teal-200 hover:shadow-sm transition-all flex items-start gap-3"
        >
          <MapPin size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-gray-900 text-sm truncate">{l.name}</span>
              <MinpakuBadge type={l.minpakuType} />
            </div>
            <p className="text-xs text-gray-500 truncate">{l.address}</p>
          </div>
          <div className="text-xs text-gray-400 flex-shrink-0 text-right">
            <div>{l.permitDate}</div>
            <div>{l.prefecture}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
