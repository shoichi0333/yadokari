"use client";

import { useEffect, useRef } from "react";
import type { MinpakuListing } from "@/lib/data/listings";

interface Props {
  listings: MinpakuListing[];
  selected: MinpakuListing | null;
  onSelect: (listing: MinpakuListing) => void;
}

const TYPE_COLORS: Record<string, string> = {
  JUUTAKU: "#0d9488", // teal
  TOKKU: "#2563eb",   // blue
  RYOKAN: "#ea580c",  // orange
};

export default function ListingsMap({ listings, selected, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      // 初期化（まだなければ）
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([36.2, 138.0], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current as ReturnType<typeof L.map>;

      // 既存マーカーをクリア
      markersRef.current.forEach((m) =>
        (m as ReturnType<typeof L.marker>).remove()
      );
      markersRef.current = [];

      // マーカーを追加
      listings.forEach((listing) => {
        if (!listing.lat || !listing.lng) return;

        const color = TYPE_COLORS[listing.minpakuType] ?? "#6b7280";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 12px;
            height: 12px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([listing.lat, listing.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:180px">
              <div style="font-weight:bold;font-size:13px;margin-bottom:4px">${listing.name}</div>
              <div style="font-size:11px;color:#6b7280;margin-bottom:4px">${listing.address}</div>
              <div style="font-size:11px">届出: ${listing.permitNumber}</div>
            </div>`,
            { maxWidth: 220 }
          )
          .on("click", () => onSelect(listing));

        markersRef.current.push(marker);
      });

      // フィット
      if (listings.length > 0) {
        const coords = listings
          .filter((l) => l.lat && l.lng)
          .map((l) => [l.lat, l.lng] as [number, number]);
        if (coords.length > 0) {
          map.fitBounds(L.latLngBounds(coords), { padding: [30, 30], maxZoom: 12 });
        }
      }
    });
  }, [listings, onSelect]);

  // 選択時にポップアップを開く
  useEffect(() => {
    if (!selected || !mapInstanceRef.current) return;
    import("leaflet").then(() => {
      const map = mapInstanceRef.current as { setView: (center: [number, number], zoom: number) => void };
      map.setView([selected.lat, selected.lng], 14);
    });
  }, [selected]);

  return (
    <>
      <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
        <LegendDot color="#0d9488" label="住宅宿泊" />
        <LegendDot color="#2563eb" label="特区民泊" />
        <LegendDot color="#ea580c" label="旅館業" />
      </div>
      <div
        ref={mapRef}
        style={{ height: "calc(100vh - 320px)", minHeight: "480px" }}
        className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      />
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        style={{ background: color }}
        className="inline-block w-3 h-3 rounded-full border-2 border-white shadow-sm"
      />
      {label}
    </span>
  );
}
