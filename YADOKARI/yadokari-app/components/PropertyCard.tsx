import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { MapPin, Train, Maximize2, Building2, Calendar } from "lucide-react";
import type { Property } from "@/lib/data/properties";
import MinpakuBadge from "./MinpakuBadge";
import FavoriteButton from "./FavoriteButton";

interface Props {
  property: Property;
  favoriteAction?: ReactNode;
  priority?: boolean;
}

export default function PropertyCard({ property: p, favoriteAction, priority = false }: Props) {
  return (
    <Link href={`/property/${p.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-teal-200 transition-all duration-200">
        {/* 画像 */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <Image
            src={p.images[0]}
            alt={p.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <MinpakuBadge type={p.minpakuType} size="sm" />
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {p.maxDays && (
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Calendar size={10} />
                年間{p.maxDays}日
              </div>
            )}
            <div className="bg-white/90 rounded-full p-1.5 shadow-sm">
              {favoriteAction ?? <FavoriteButton propertyId={p.id} size="sm" />}
            </div>
          </div>
        </div>

        {/* 情報 */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-teal-700 transition-colors line-clamp-1">
            {p.title}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <MapPin size={11} />
            <span className="truncate">{p.address}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Train size={11} />
              {p.nearestStation}駅 徒歩{p.minutesToStation}分
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Maximize2 size={11} />
              {p.areaSqm}㎡
            </span>
            <span className="flex items-center gap-1">
              <Building2 size={11} />
              築{p.ageYears}年
            </span>
            <span>{p.layout}</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold text-teal-700">
                {(p.rent / 10000).toFixed(p.rent % 10000 === 0 ? 0 : 1)}
              </span>
              <span className="text-sm text-teal-700">万円</span>
              <span className="text-xs text-gray-400">/月</span>
            </div>
            <span className="text-xs text-gray-400">{p.zoning}</span>
          </div>

          {p.tags && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
