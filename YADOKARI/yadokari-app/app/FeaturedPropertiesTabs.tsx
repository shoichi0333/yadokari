"use client";

import { useMemo, useState } from "react";
import type { Property } from "@/lib/data/properties";
import PropertyCard from "@/components/PropertyCard";

type MinpakuTab = {
  label: string;
  value: FeaturedMinpakuType;
};

type FeaturedMinpakuType = Extract<Property["minpakuType"], "TOKKU" | "JUUTAKU" | "RYOKAN">;

const TABS: MinpakuTab[] = [
  { label: "特区民泊", value: "TOKKU" },
  { label: "住宅宿泊", value: "JUUTAKU" },
  { label: "旅館業許可", value: "RYOKAN" },
];

type FeaturedPropertiesTabsProps = {
  properties: Property[];
};

export default function FeaturedPropertiesTabs({ properties }: FeaturedPropertiesTabsProps) {
  const [activeType, setActiveType] = useState<FeaturedMinpakuType>("TOKKU");

  const propertiesByType = useMemo(
    () =>
      TABS.reduce<Record<FeaturedMinpakuType, Property[]>>(
        (acc, tab) => {
          acc[tab.value] = properties
            .filter((property) => property.minpakuType === tab.value)
            .slice(0, 6);
          return acc;
        },
        {
          TOKKU: [],
          JUUTAKU: [],
          RYOKAN: [],
        }
      ),
    [properties]
  );

  const activeProperties = propertiesByType[activeType];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        {TABS.map((tab) => {
          const isActive = tab.value === activeType;
          const count = propertiesByType[tab.value].length;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveType(tab.value)}
              className={`flex min-w-32 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                  : "border-gray-300 bg-white text-gray-500 hover:border-teal-300 hover:text-teal-700"
              }`}
              aria-pressed={isActive}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}件
              </span>
            </button>
          );
        })}
      </div>

      {activeProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm font-medium text-gray-500">
          該当する物件はありません
        </div>
      )}
    </div>
  );
}
