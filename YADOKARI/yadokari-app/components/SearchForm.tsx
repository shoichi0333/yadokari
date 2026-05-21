"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

const PREFECTURES = [
  "ALL",
  "北海道",
  "東京都",
  "神奈川県",
  "千葉県",
  "埼玉県",
  "愛知県",
  "京都府",
  "大阪府",
  "兵庫県",
  "福岡県",
  "沖縄県",
];

const LAYOUTS = ["ALL", "1K", "1DK", "1LDK", "2DK", "2LDK", "3LDK", "4LDK以上"];

interface SearchParams {
  keyword: string;
  prefecture: string;
  layout: string;
  minpakuType: string;
  maxRent: string;
  tags: string[];
}

interface Props {
  defaultValues?: Partial<SearchParams>;
  onSearch?: (params: SearchParams) => void;
  compact?: boolean;
}

const MINPAKU_TYPES = [
  { value: "ALL", label: "すべて" },
  { value: "JUUTAKU", label: "住宅宿泊（180日）" },
  { value: "TOKKU", label: "特区民泊（無制限）" },
  { value: "RYOKAN", label: "旅館業許可向け" },
];

const MAX_RENT_OPTIONS = [
  { value: "", label: "上限なし" },
  { value: "80000", label: "8万円以下" },
  { value: "100000", label: "10万円以下" },
  { value: "150000", label: "15万円以下" },
  { value: "200000", label: "20万円以下" },
  { value: "300000", label: "30万円以下" },
];

const SPECIAL_TAGS = ["ペット可", "駐車場付き", "大人数対応（6名+）", "Wi-Fi完備"];

export default function SearchForm({ defaultValues = {}, onSearch, compact = false }: Props) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [params, setParams] = useState<SearchParams>({
    keyword: defaultValues.keyword ?? "",
    prefecture: defaultValues.prefecture ?? "ALL",
    layout: defaultValues.layout ?? "ALL",
    minpakuType: defaultValues.minpakuType ?? "ALL",
    maxRent: defaultValues.maxRent ?? "",
    tags: defaultValues.tags ?? [],
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch(params);
        return;
      }
      const query = new URLSearchParams();
      if (params.keyword) query.set("keyword", params.keyword);
      if (params.prefecture !== "ALL") query.set("prefecture", params.prefecture);
      if (params.layout !== "ALL") query.set("layout", params.layout);
      if (params.minpakuType !== "ALL") query.set("minpakuType", params.minpakuType);
      if (params.maxRent) query.set("maxRent", params.maxRent);
      params.tags.forEach((tag) => query.append("tags", tag));
      router.push(`/properties?${query.toString()}`);
    },
    [params, onSearch, router]
  );

  const update = (key: keyof SearchParams, value: string | string[]) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${compact ? "p-3" : "p-4 sm:p-6"}`}>
        {/* メイン検索行 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="住所・エリア・駅名で検索"
              value={params.keyword}
              onChange={(e) => update("keyword", e.target.value)}
              className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <select
            value={params.prefecture}
            onChange={(e) => update("prefecture", e.target.value)}
            className="hidden sm:block px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[120px]"
          >
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>
                {pref === "ALL" ? "全都道府県" : pref}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">絞り込み</span>
          </button>

          <button
            type="submit"
            className={
              compact
                ? "bg-teal-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors whitespace-nowrap"
                : "bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 text-white px-5 sm:px-7 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-teal-500/30 hover:from-teal-400 hover:via-teal-500 hover:to-emerald-400 hover:shadow-teal-500/40 transition-all whitespace-nowrap"
            }
          >
            {compact ? "検索" : "今すぐ探す"}
          </button>
        </div>

        {/* 民泊タイプクイックフィルター */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {MINPAKU_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update("minpakuType", t.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                params.minpakuType === t.value
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 詳細フィルター */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">都道府県</label>
                <select
                  value={params.prefecture}
                  onChange={(e) => update("prefecture", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref === "ALL" ? "全都道府県" : pref}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">間取り</label>
                <select
                  value={params.layout}
                  onChange={(e) => update("layout", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {LAYOUTS.map((l) => (
                    <option key={l} value={l}>
                      {l === "ALL" ? "すべての間取り" : l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">賃料上限</label>
                <select
                  value={params.maxRent}
                  onChange={(e) => update("maxRent", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {MAX_RENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">特殊条件</div>
              <div className="flex gap-2 flex-wrap items-center">
                {SPECIAL_TAGS.map((tag) => {
                  const selected = params.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        update(
                          "tags",
                          selected ? params.tags.filter((value) => value !== tag) : [...params.tags, tag]
                        )
                      }
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {params.tags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => update("tags", [])}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    リセット
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
