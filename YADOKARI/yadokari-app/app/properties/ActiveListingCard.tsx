"use client";

import { Calendar, LayoutGrid } from "lucide-react";
import MinpakuBadge from "@/components/MinpakuBadge";
import { getMinpakuBadgeType, getMinpakuInfo } from "@/lib/minpaku";

export type PublicListing = {
  id: string;
  title: string;
  prefecture: string;
  city: string;
  address: string;
  rent: number;
  layout: string;
  areaSqm: number;
  ageYears: number | null;
  zoning: string | null;
  isTokkuArea: boolean;
  features: string[];
  description: string;
  createdAt: string;
};

export default function ActiveListingCard({
  listing,
  onContact,
}: {
  listing: PublicListing;
  onContact: (id: string) => void;
}) {
  const info = getMinpakuInfo(listing.zoning ?? "", listing.isTokkuArea);
  const minpakuType = getMinpakuBadgeType(info);

  return (
    <article className="flex flex-col rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-gray-950">{listing.title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {listing.prefecture}{listing.city}
          </p>
        </div>
        <MinpakuBadge type={minpakuType} size="sm" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
        <span className="font-bold text-gray-950">
          ¥{listing.rent.toLocaleString()}
          <span className="text-xs font-normal text-gray-500">/月</span>
        </span>
        <span className="flex items-center gap-1">
          <LayoutGrid size={13} className="text-gray-400" />
          {listing.layout}
        </span>
        {listing.areaSqm > 0 && <span>{listing.areaSqm}㎡</span>}
        {listing.ageYears !== null && listing.ageYears > 0 && (
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-gray-400" />
            築{listing.ageYears}年
          </span>
        )}
      </div>

      {listing.features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded-full border border-gray-100 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">{listing.description}</p>

      <button
        type="button"
        onClick={() => onContact(listing.id)}
        className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
      >
        問い合わせる
      </button>
    </article>
  );
}
