"use client";

import { useEffect, useRef } from "react";
import type { Property } from "@/lib/data/properties";

interface Props {
  properties: Property[];
}

const TYPE_COLORS: Record<string, string> = {
  JUUTAKU: "#0d9488",
  TOKKU: "#2563eb",
  RYOKAN: "#ea580c",
};

const TYPE_LABELS: Record<string, string> = {
  JUUTAKU: "住宅宿泊",
  TOKKU: "特区民泊",
  RYOKAN: "旅館業",
};

const rentFormatter = new Intl.NumberFormat("ja-JP");

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function SearchResultsMap({ properties }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([36.2, 138.0], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current as ReturnType<typeof L.map>;
      map.invalidateSize();

      markersRef.current.forEach((marker) =>
        (marker as ReturnType<typeof L.marker>).remove()
      );
      markersRef.current = [];

      const coords: [number, number][] = [];

      properties.forEach((property) => {
        if (!property.lat || !property.lng) return;

        const color = TYPE_COLORS[property.minpakuType] ?? "#6b7280";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 14px;
            height: 14px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.35);
            cursor: pointer;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const popupHtml = `
          <div style="min-width:190px">
            <div style="font-weight:bold;font-size:13px;line-height:1.4;margin-bottom:6px">${escapeHtml(property.title)}</div>
            <div style="font-size:12px;color:#0f766e;font-weight:bold;margin-bottom:4px">${rentFormatter.format(property.rent)}円 / 月</div>
            <div style="font-size:11px;color:#6b7280">${escapeHtml(TYPE_LABELS[property.minpakuType] ?? property.minpakuType)}</div>
          </div>
        `;

        const marker = L.marker([property.lat, property.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml, { maxWidth: 240 });

        markersRef.current.push(marker);
        coords.push([property.lat, property.lng]);
      });

      if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords), { padding: [30, 30], maxZoom: 12 });
      }
    });
  }, [properties]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) =>
        (marker as { remove: () => void }).remove()
      );
      (mapInstanceRef.current as { remove?: () => void } | null)?.remove?.();
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, []);

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
        className="w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
      />
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        style={{ background: color }}
        className="inline-block h-3 w-3 rounded-full border-2 border-white shadow-sm"
      />
      {label}
    </span>
  );
}
