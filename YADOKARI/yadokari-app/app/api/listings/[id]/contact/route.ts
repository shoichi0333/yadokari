import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isPropertyMarketplaceEnabled } from "@/lib/property-marketplace";

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const supabase = getSupabaseServerClient();
  const { data } = (await supabase?.auth.getUser(token)) ?? { data: { user: null } };
  const email = data.user?.email;
  if (!email || !process.env.DATABASE_URL) return null;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isPropertyMarketplaceEnabled()) {
      return NextResponse.json({ error: "物件掲載は準備中です" }, { status: 404 });
    }

    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.propertyListing.findUnique({
      where: { id, status: "ACTIVE" },
      select: { contactEmail: true, contactPhone: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "物件が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({
      contactEmail: listing.contactEmail,
      contactPhone: listing.contactPhone ?? undefined,
    });
  } catch (error) {
    console.error("Failed to fetch listing contact:", error);
    return NextResponse.json({ error: "連絡先の取得に失敗しました" }, { status: 500 });
  }
}
