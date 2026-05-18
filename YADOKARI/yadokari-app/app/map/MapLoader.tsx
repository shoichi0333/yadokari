"use client";

import dynamic from "next/dynamic";
import type { CompetitionListing, AreaStats } from "./CompetitionMap";

const CompetitionMap = dynamic(() => import("./CompetitionMap"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
      地図を読み込んでいます...
    </div>
  ),
});

type Props = {
  listings: CompetitionListing[];
  areaStats: AreaStats[];
};

export default function MapLoader({ listings, areaStats }: Props) {
  return <CompetitionMap listings={listings} areaStats={areaStats} />;
}
