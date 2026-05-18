"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import SearchForm from "@/components/SearchForm";
import { searchProperties } from "@/lib/data/properties";
import type { MinpakuType } from "@/lib/minpaku";

type SortOrder = "default" | "rent_asc" | "rent_desc";

interface DefaultValues {
  keyword: string;
  prefecture: string;
  layout: string;
  minpakuType: string;
  maxRent: string;
  tags: string[];
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "default", label: "デフォルト" },
  { value: "rent_asc", label: "賃料安い順▲" },
  { value: "rent_desc", label: "賃料高い順▼" },
];

const DEFAULT_SEARCH_PARAMS: DefaultValues = {
  keyword: "",
  prefecture: "ALL",
  layout: "ALL",
  minpakuType: "ALL",
  maxRent: "",
  tags: [],
};

const MINPAKU_TYPE_LABELS: Record<string, string> = {
  JUUTAKU: "住宅宿泊対応",
  TOKKU: "特区民泊対応",
  RYOKAN: "旅館業許可対応",
};

export default function PropertiesClient({ defaultValues }: { defaultValues: DefaultValues }) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [searchParams, setSearchParams] = useState(defaultValues);

  const handleSearch = useCallback(
    (params: { keyword: string; prefecture: string; layout: string; minpakuType: string; maxRent: string; tags: string[] }) => {
      setSearchParams(params);
      const query = new URLSearchParams();
      if (params.keyword) query.set("keyword", params.keyword);
      if (params.prefecture !== "ALL") query.set("prefecture", params.prefecture);
      if (params.layout !== "ALL") query.set("layout", params.layout);
      if (params.minpakuType !== "ALL") query.set("minpakuType", params.minpakuType);
      if (params.maxRent) query.set("maxRent", params.maxRent);
      params.tags.forEach((tag) => query.append("tags", tag));
      router.push(`/properties?${query.toString()}`, { scroll: false });
    },
    [router],
  );

  const results = searchProperties({
    keyword: searchParams.keyword || undefined,
    prefecture: searchParams.prefecture !== "ALL" ? searchParams.prefecture : undefined,
    layout: searchParams.layout !== "ALL" ? searchParams.layout : undefined,
    minpakuType: (searchParams.minpakuType as MinpakuType | "ALL") || "ALL",
    maxRent: searchParams.maxRent ? Number(searchParams.maxRent) : undefined,
    tags: searchParams.tags.length > 0 ? searchParams.tags : undefined,
  });

  const sorted = [...results].sort((a, b) => {
    if (sortOrder === "rent_asc") return a.rent - b.rent;
    if (sortOrder === "rent_desc") return b.rent - a.rent;
    return 0;
  });

  const activeFilterCount = [
    searchParams.keyword.trim(),
    searchParams.prefecture !== "ALL",
    searchParams.layout !== "ALL",
    searchParams.minpakuType !== "ALL",
    searchParams.maxRent,
    searchParams.tags.length > 0,
  ].filter(Boolean).length;

  const activeFilterSummary = (() => {
    const parts: string[] = [];
    if (searchParams.keyword.trim()) {
      parts.push(`「${searchParams.keyword.trim()}」で検索`);
    }
    if (searchParams.prefecture !== "ALL" && searchParams.minpakuType === "ALL") {
      parts.push(`${searchParams.prefecture} の民泊物件`);
    }
    if (searchParams.layout !== "ALL") {
      parts.push(`${searchParams.layout}の物件`);
    }
    if (searchParams.minpakuType !== "ALL") {
      parts.push(`${MINPAKU_TYPE_LABELS[searchParams.minpakuType] ?? searchParams.minpakuType}物件`);
    }
    if (searchParams.maxRent) {
      parts.push(`賃料${Number(searchParams.maxRent).toLocaleString("ja-JP")}円以下`);
    }
    if (searchParams.tags.length > 0) {
      parts.push(`タグ${searchParams.tags.length}件`);
    }
    return parts.length > 0 ? parts.join("・") : "全国の民泊運営可能物件をキーワード・タグ・条件で絞り込み";
  })();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-normal text-gray-950 sm:text-4xl">
            民泊物件を探す
          </h1>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              フィルター{activeFilterCount}件
            </span>
          )}
        </div>
        <p className="mt-3 text-base text-gray-600">{activeFilterSummary}</p>
      </div>

      <div className="mb-6">
        <SearchForm defaultValues={searchParams} onSearch={handleSearch} compact />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-700">{sorted.length} 件を表示中</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => {
            const active = sortOrder === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortOrder(opt.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="py-20 text-center">
          <SlidersHorizontal size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-base font-semibold text-gray-500">条件に一致する物件が見つかりませんでした</p>
          <p className="mt-2 text-sm text-gray-400">絞り込み条件を変更してお試しください</p>
          <button
            type="button"
            onClick={() => handleSearch(DEFAULT_SEARCH_PARAMS)}
            className="mt-6 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            すべての物件を見る
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((property, index) => (
            <PropertyCard key={property.id} property={property} priority={index === 0} />
          ))}
        </div>
      )}
    </main>
  );
}
