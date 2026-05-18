"use client";

import { useEffect, useRef } from "react";

interface CheckerMapProps {
  lat: number;
  lng: number;
  address: string;
}

export default function CheckerMap({ lat, lng, address }: CheckerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current).setView([lat, lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.circleMarker([lat, lng], {
        radius: 8,
        color: "#0f766e",
        fillColor: "#14b8a6",
        fillOpacity: 0.9,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(address)
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, address]);

  return <div ref={mapRef} className="h-48 w-full overflow-hidden rounded-xl" />;
}
