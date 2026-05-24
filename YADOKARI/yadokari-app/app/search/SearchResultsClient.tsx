"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, MapPin, TrendingUp, Users, Building2 } from "lucide-react";
import MinpakuBadge from "@/components/MinpakuBadge";
import {
  Area,
  AREAS,
  REGIONS,
  getAreasByRegion,
  getCompetitionDensity,
  MinpakuType,
} from "@/lib/data/areas";
import { getAthomeRentSearchUrl, getSuumoRentSearchUrl } from "@/lib/propertyPortalLinks";

type RegionFilter = "すべて" | (typeof REGIONS)[number];
type TypeFilter = "ALL" | MinpakuType;
type Density = ReturnType<typeof getCompetitionDensity>;
type SortOrder = "default" | "competition_asc" | "competition_desc";

const REGION_TABS: RegionFilter[] = [
  "すべて",
  "北海道",
  "東北",
  "東京",
  "関東",
  "中部",
  "近畿",
  "中国・四国",
  "九州",
  "沖縄",
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "JUUTAKU", label: "住宅宿泊" },
  { value: "TOKKU", label: "特区民泊" },
  { value: "RYOKAN", label: "旅館業" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "default", label: "デフォルト" },
  { value: "competition_asc", label: "競合少ない順▲" },
  { value: "competition_desc", label: "競合多い順▼" },
];

const DENSITY_LABELS: Record<Density, string> = {
  high: "競合多",
  medium: "競合中",
  low: "競合少",
  unknown: "データ収集中",
};

const DENSITY_CLASSES: Record<Density, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-green-200 bg-green-50 text-green-700",
  unknown: "border-gray-200 bg-gray-50 text-gray-600",
};

const INVESTMENT_INDICATORS: Partial<Record<Density, { label: string; className: string }>> = {
  low: { label: "穴場エリア", className: "bg-emerald-100 text-emerald-700" },
  medium: { label: "成長中", className: "bg-amber-100 text-amber-700" },
  high: { label: "激戦区", className: "bg-red-100 text-red-700" },
};

function parseRegion(value: string | null): RegionFilter {
  return value && REGION_TABS.includes(value as RegionFilter) ? (value as RegionFilter) : "すべて";
}

function parseType(value: string | null): TypeFilter {
  return TYPE_FILTERS.some((filter) => filter.value === value) ? (value as TypeFilter) : "ALL";
}

function getFilteredAreas(region: RegionFilter, type: TypeFilter): Area[] {
  const regionAreas = region === "すべて" ? AREAS : getAreasByRegion(region);

  if (type === "ALL") {
    return regionAreas;
  }

  return regionAreas.filter((area) => area.minpakuTypes.includes(type));
}

function AreaCard({
  area,
}: {
  area: Area;
}) {
  const density = getCompetitionDensity(area.competitionCount);
  const investmentIndicator = INVESTMENT_INDICATORS[density];
  const suumoUrl = getSuumoRentSearchUrl(area.prefecture, area.name);
  const athomeUrl = getAthomeRentSearchUrl(area.prefecture, area.name);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md">
      {area.tokkuArea && (
        <div className="bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-800">
          特区エリア 日数制限なし
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                {area.region}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} className="text-teal-600" />
                {area.prefecture}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-gray-950">{area.name}</h2>
            {investmentIndicator && (
              <span
                className={`mt-2 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${investmentIndicator.className}`}
              >
                {investmentIndicator.label}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {area.minpakuTypes.map((type) => (
            <MinpakuBadge key={type} type={type} size="sm" />
          ))}
          {area.tokkuArea && (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              TOKKU
            </span>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700">
            <Users size={15} />
            {area.competitionCount === 0 ? "データ収集中" : `競合 ${area.competitionCount}件`}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${DENSITY_CLASSES[density]}`}
          >
            <TrendingUp size={15} />
            {DENSITY_LABELS[density]}
          </span>
        </div>

        <p className="mb-5 flex-1 text-sm leading-6 text-gray-600">{area.description}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`/properties?prefecture=${encodeURIComponent(area.prefecture)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 sm:col-span-2"
          >
            <Building2 size={15} />
            YADOKARIで物件を探す
          </Link>
          <a
            href={suumoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            SUUMO
            <ExternalLink size={14} />
          </a>
          <a
            href={athomeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            アットホーム
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>(() =>
    parseRegion(searchParams.get("region")),
  );
  const [selectedType, setSelectedType] = useState<TypeFilter>(() =>
    parseType(searchParams.get("minpakuType")),
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  const filteredAreas = [...getFilteredAreas(selectedRegion, selectedType)].sort((a, b) => {
    if (sortOrder === "competition_asc") {
      return a.competitionCount - b.competitionCount;
    }

    if (sortOrder === "competition_desc") {
      return b.competitionCount - a.competitionCount;
    }

    return 0;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-normal text-gray-950 sm:text-4xl">
          エリアから民泊投資先を探す
        </h1>
        <p className="mt-3 text-base text-gray-600">
          政府データに基づく競合分析で、有望エリアを絞り込もう
        </p>
      </div>

      <section className="mb-6 space-y-4" aria-label="検索フィルター">
        <div className="flex flex-wrap gap-2">
          {REGION_TABS.map((region) => {
            const active = selectedRegion === region;

            return (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((filter) => {
              const active = selectedType === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedType(filter.value)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => {
              const active = sortOrder === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortOrder(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-teal-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{filteredAreas.length} エリアを表示中</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAreas.map((area) => (
          <AreaCard
            key={area.id}
            area={area}
          />
        ))}
      </div>
    </main>
  );
}
