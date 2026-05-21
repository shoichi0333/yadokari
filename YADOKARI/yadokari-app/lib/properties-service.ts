import { prisma } from "@/lib/prisma";
import {
  getPropertyById as mockGetById,
  searchProperties as mockSearch,
  type Property,
} from "@/lib/data/properties";
import { getMinpakuBadgeType, getMinpakuInfo, type MinpakuType } from "@/lib/minpaku";
import { isPropertyMarketplaceEnabled } from "@/lib/property-marketplace";

export interface SearchParams {
  prefecture?: string;
  city?: string;
  minRent?: number;
  maxRent?: number;
  layout?: string;
  minpakuType?: MinpakuType | "ALL" | string;
  keyword?: string;
  tags?: string[];
}

type DbPropertyRow = {
  id: string;
  title: string;
  address: string;
  prefecture: string;
  city: string;
  nearestStation: string | null;
  minutesToStation: number | null;
  lat: number;
  lng: number;
  rent: number;
  layout: string | null;
  areaSqm: number | null;
  ageYears: number | null;
  floor: number | null;
  buildingFloors: number | null;
  zoning: string | null;
  isTokkuArea: boolean;
  minpakuType: string | null;
  maxDays: number | null;
  images: string[];
  features: string[];
  description: string | null;
  sourceUrl: string | null;
};

type PropertyWhereInput = {
  isActive: boolean;
  prefecture?: { equals: string };
  city?: { contains: string };
  layout?: { equals: string };
  minpakuType?: { equals: string };
  rent?: { gte?: number; lte?: number };
  OR?: Array<
    | { title: { contains: string } }
    | { address: { contains: string } }
    | { city: { contains: string } }
    | { nearestStation: { contains: string } }
  >;
};

function hasValue(value: string | undefined): value is string {
  return Boolean(value && value !== "ALL");
}

export function dbToProperty(row: DbPropertyRow): Property {
  const zoning = row.zoning ?? "";
  const info = getMinpakuInfo(zoning, row.isTokkuArea);
  const minpakuType = row.minpakuType
    ? (row.minpakuType as MinpakuType)
    : getMinpakuBadgeType(info);

  return {
    id: row.id,
    title: row.title,
    address: row.address,
    prefecture: row.prefecture,
    city: row.city,
    nearestStation: row.nearestStation ?? "",
    minutesToStation: row.minutesToStation ?? 0,
    lat: row.lat,
    lng: row.lng,
    rent: row.rent,
    layout: row.layout ?? "",
    areaSqm: row.areaSqm ?? 0,
    ageYears: row.ageYears ?? 0,
    floor: row.floor ?? 0,
    buildingFloors: row.buildingFloors ?? 0,
    zoning,
    isTokkuArea: row.isTokkuArea,
    minpakuType,
    minpakuNote: info.note,
    maxDays: info.maxDays,
    images: row.images,
    features: row.features,
    tags: mockGetById(row.id)?.tags ?? [],
    description: row.description ?? "",
    sourceUrl: row.sourceUrl ?? undefined,
  };
}

export function isDatabaseAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function buildWhere(params: SearchParams): PropertyWhereInput {
  const where: PropertyWhereInput = {
    isActive: true,
  };

  if (hasValue(params.prefecture)) {
    where.prefecture = { equals: params.prefecture };
  }

  if (hasValue(params.city)) {
    where.city = { contains: params.city };
  }

  if (hasValue(params.layout)) {
    where.layout = { equals: params.layout };
  }

  if (hasValue(params.minpakuType)) {
    where.minpakuType = { equals: params.minpakuType };
  }

  if (params.minRent !== undefined || params.maxRent !== undefined) {
    where.rent = {
      ...(params.minRent !== undefined ? { gte: params.minRent } : {}),
      ...(params.maxRent !== undefined ? { lte: params.maxRent } : {}),
    };
  }

  const keyword = params.keyword?.trim();
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { address: { contains: keyword } },
      { city: { contains: keyword } },
      { nearestStation: { contains: keyword } },
    ];
  }

  return where;
}

export async function getProperties(params: SearchParams = {}): Promise<Property[]> {
  if (!isDatabaseAvailable()) {
    if (process.env.NODE_ENV === "production" || !isPropertyMarketplaceEnabled()) {
      return [];
    }

    return mockSearch({
      ...params,
      minpakuType: params.minpakuType as MinpakuType | "ALL" | undefined,
    });
  }

  const rows: DbPropertyRow[] = await prisma.property.findMany({
    where: buildWhere(params),
    orderBy: { createdAt: "desc" },
  });

  const properties = rows.map((row) => dbToProperty(row));

  const tags = params.tags;
  if (tags?.length) {
    return properties.filter((property) =>
      tags.every((tag) => property.tags.includes(tag))
    );
  }

  return properties;
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  if (!isDatabaseAvailable()) {
    if (process.env.NODE_ENV === "production" || !isPropertyMarketplaceEnabled()) {
      return undefined;
    }

    return mockGetById(id);
  }

  const row = await prisma.property.findUnique({
    where: { id },
  });

  return row ? dbToProperty(row) : undefined;
}
