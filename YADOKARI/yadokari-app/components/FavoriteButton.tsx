"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { getFavoriteIds, isFavorite, toggleFavorite } from "@/lib/favorites";
import { getCurrentPlan, isFreePlan, PLAN_LIMITS } from "@/lib/plan";
import { useToast } from "@/lib/ToastContext";

interface Props {
  propertyId: string;
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function FavoriteButton({ propertyId, className = "", size = "md", showLabel = false }: Props) {
  const [liked, setLiked] = useState(() =>
    typeof window !== "undefined" ? isFavorite(propertyId) : false
  );
  const { toast } = useToast();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favoriteIds = getFavoriteIds();
    const alreadyLiked = favoriteIds.includes(propertyId);
    const currentPlan = getCurrentPlan();
    const freeFavoriteLimit = PLAN_LIMITS.FREE.favorites ?? 0;

    if (
      !alreadyLiked &&
      isFreePlan(currentPlan) &&
      favoriteIds.length >= freeFavoriteLimit
    ) {
      toast("お気に入りは3件まで。プランをアップグレード→", "info");
      router.push("/pricing");
      return;
    }

    const next = toggleFavorite(propertyId);
    setLiked(next);
    toast(next ? "お気に入りに追加しました" : "お気に入りを解除しました", next ? "success" : "info");
  };

  const iconSize = size === "sm" ? 14 : 17;

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 w-full border py-3 rounded-xl text-sm transition-colors ${
          liked
            ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        } ${className}`}
      >
        <Heart size={iconSize} className={liked ? "fill-rose-500" : ""} />
        <span>{liked ? "お気に入りを解除" : "お気に入りに追加"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={liked ? "お気に入りを解除" : "お気に入りに追加"}
      className={`transition-all ${
        liked ? "text-rose-500" : "text-gray-400 hover:text-rose-400"
      } ${className}`}
    >
      <Heart size={iconSize} className={liked ? "fill-rose-500" : ""} />
    </button>
  );
}
