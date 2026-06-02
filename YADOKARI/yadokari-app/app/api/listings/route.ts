import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isPropertyMarketplaceEnabled } from "@/lib/property-marketplace";

type ListingPayload = {
  title?: unknown;
  prefecture?: unknown;
  city?: unknown;
  address?: unknown;
  rent?: unknown;
  layout?: unknown;
  areaSqm?: unknown;
  ageYears?: unknown;
  zoning?: unknown;
  isTokkuArea?: unknown;
  description?: unknown;
  features?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
};

const REQUIRED_FIELDS = ["title", "address", "prefecture", "city", "rent", "layout", "description", "contactEmail"] as const;

async function getAuthorizedListingUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) return null;

  const supabase = getSupabaseServerClient();
  const { data } = (await supabase?.auth.getUser(token)) ?? { data: { user: null } };
  const email = data.user?.email;
  if (!email || !process.env.DATABASE_URL) return null;

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, plan: true },
  });
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalString(value: unknown): string | undefined {
  const trimmed = toTrimmedString(value);
  return trimmed || undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || !value.trim()) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toTrimmedString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getMissingFields(payload: ListingPayload): string[] {
  return REQUIRED_FIELDS.filter((field) => {
    if (field === "rent") return toNumber(payload[field]) === undefined;
    return !toTrimmedString(payload[field]);
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthorizedListingUser(request);

    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    if (user.plan !== "PRO") {
      return NextResponse.json({ error: "物件掲載はプロプランで利用できます" }, { status: 403 });
    }

    const payload = (await request.json()) as ListingPayload;
    const missingFields = getMissingFields(payload);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `必須項目が不足しています: ${missingFields.join(", ")}` },
        { status: 400 },
      );
    }

    const listingData = {
      title: toTrimmedString(payload.title),
      prefecture: toTrimmedString(payload.prefecture),
      city: toTrimmedString(payload.city),
      address: toTrimmedString(payload.address),
      rent: toNumber(payload.rent) ?? 0,
      layout: toTrimmedString(payload.layout),
      areaSqm: toNumber(payload.areaSqm) ?? 0,
      ageYears: toNumber(payload.ageYears),
      zoning: toOptionalString(payload.zoning),
      isTokkuArea: Boolean(payload.isTokkuArea),
      description: toTrimmedString(payload.description),
      features: toStringArray(payload.features),
      images: [],
      contactEmail: toTrimmedString(payload.contactEmail),
      contactPhone: toOptionalString(payload.contactPhone),
    };

    const listing = await prisma.propertyListing.create({
      data: {
        ...listingData,
        userId: user.id,
        status: "PENDING",
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Failed to submit property listing:", error);
    return NextResponse.json({ error: "物件掲載申請の送信に失敗しました" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL || !isPropertyMarketplaceEnabled()) {
      return NextResponse.json([]);
    }

    const searchParams = request.nextUrl.searchParams;
    const prefecture = searchParams.get("prefecture")?.trim() || undefined;
    const layout = searchParams.get("layout")?.trim() || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20;

    const listings = await prisma.propertyListing.findMany({
      where: {
        status: "ACTIVE",
        ...(prefecture ? { prefecture: { equals: prefecture } } : {}),
        ...(layout ? { layout: { equals: layout } } : {}),
      },
      select: {
        id: true,
        title: true,
        prefecture: true,
        city: true,
        address: true,
        rent: true,
        layout: true,
        areaSqm: true,
        ageYears: true,
        zoning: true,
        isTokkuArea: true,
        features: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Failed to fetch property listings:", error);
    return NextResponse.json({ error: "物件一覧の取得に失敗しました" }, { status: 500 });
  }
}
