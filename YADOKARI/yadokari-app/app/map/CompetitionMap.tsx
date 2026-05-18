"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export type CompetitionListing = {
  id: string;
  address: string;
  lat: number;
  lng: number;
  name?: string;
  prefecture?: string;
  sourceId?: string;
};

export type AreaStats = {
  sourceId: string;
  name: string;
  count: number;
};

type Props = {
  listings: CompetitionListing[];
  areaStats: AreaStats[];
};

const SUUMO_LINKS: Record<string, string> = {
  港区: "https://suumo.jp/chintai/tokyo/sc_minato/",
  中野区: "https://suumo.jp/chintai/tokyo/sc_nakano/",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function CompetitionMap({ listings, areaStats }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const maxCount = Math.max(...areaStats.map((area) => area.count), 1);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current).setView([35.6762, 139.6503], 11);
      const canvas = L.canvas({ tolerance: 5 });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      listings.forEach((listing) => {
        const marker = L.circleMarker([listing.lat, listing.lng], {
          radius: 5,
          fillColor:
            listing.sourceId === "minato_202601" ? "#0d9488" : "#f59e0b",
          fillOpacity: 0.75,
          color: "#ffffff",
          weight: 1,
          renderer: canvas,
        }).addTo(map);

        marker.on("click", function (this: typeof marker) {
          this.bindPopup(
            `<div style="min-width:180px">
              <div style="font-weight:bold;font-size:13px;line-height:1.4;margin-bottom:6px">${escapeHtml(
                listing.name || "届出住宅"
              )}</div>
              <div style="font-size:12px;color:#4b5563;line-height:1.5;margin-bottom:4px">${escapeHtml(
                listing.address
              )}</div>
              <div style="font-size:11px;color:#6b7280">${escapeHtml(
                listing.prefecture || ""
              )}</div>
            </div>`,
            { maxWidth: 240 }
          ).openPopup();
        });

        markersRef.current.push(marker);
      });

      mapInstanceRef.current = map;
      setTimeout(() => { map.invalidateSize(); }, 100);
    });

    return () => {
      markersRef.current.forEach((marker) =>
        (marker as { remove: () => void }).remove()
      );
      markersRef.current = [];
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listings]);

  return (
    <div className="flex flex-1 flex-col md:h-[calc(100vh-64px)] md:flex-row">
        <div className="h-[55vh] flex-1 md:h-full">
          <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "300px" }} />
        </div>
        <aside className="max-h-[45vh] overflow-y-auto border-t border-gray-100 bg-white p-4 md:h-full md:max-h-none md:w-72 md:border-l md:border-t-0">
          <h2 className="mb-4 text-sm font-bold text-gray-900">
            エリア別 届出件数
          </h2>
          <div className="mb-5 space-y-2 rounded-xl border border-teal-100 bg-teal-50 p-3">
            <p className="text-xs font-semibold text-teal-800">このエリアで次のアクション</p>
            <Link
              href="/check"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
            >
              可否チェッカーで確認
            </Link>
            <Link
              href="/properties"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50"
            >
              物件を探す
            </Link>
          </div>

          <div className="space-y-4">
            {areaStats.map((area) => {
              const link = SUUMO_LINKS[area.name];
              return (
                <div key={area.sourceId} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {area.name}
                      </div>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-teal-700 hover:text-teal-800"
                        >
                          SUUMO
                        </a>
                      ) : null}
                    </div>
                    <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                      {area.count.toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{
                        width: `${Math.max(
                          (area.count / maxCount) * 100,
                          2
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
  );
}
