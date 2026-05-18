import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/lib/properties-service";
import type { SearchParams } from "@/lib/properties-service";

const MINPAKU_TYPES = ["ALL", "JUUTAKU", "TOKKU", "RYOKAN", "NG"] as const;

function getStringParam(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key)?.trim();
  return value ? value : undefined;
}

function getIntegerParam(searchParams: URLSearchParams, key: string): number | undefined {
  const value = searchParams.get(key);
  if (!value) return undefined;

  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getMinpakuTypeParam(searchParams: URLSearchParams): SearchParams["minpakuType"] {
  const value = getStringParam(searchParams, "minpakuType");
  if (!value) return undefined;

  return MINPAKU_TYPES.includes(value as (typeof MINPAKU_TYPES)[number])
    ? (value as SearchParams["minpakuType"])
    : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tags = searchParams.getAll("tags").map((tag) => tag.trim()).filter(Boolean);
    const query: SearchParams = {
      prefecture: getStringParam(searchParams, "prefecture"),
      city: getStringParam(searchParams, "city"),
      minRent: getIntegerParam(searchParams, "minRent"),
      maxRent: getIntegerParam(searchParams, "maxRent"),
      layout: getStringParam(searchParams, "layout"),
      minpakuType: getMinpakuTypeParam(searchParams),
      keyword: getStringParam(searchParams, "keyword"),
      tags: tags.length ? tags : undefined,
    };
    const properties = await getProperties(query);

    return NextResponse.json(properties);
  } catch {
    return NextResponse.json({ error: "物件一覧の取得に失敗しました" }, { status: 500 });
  }
}
