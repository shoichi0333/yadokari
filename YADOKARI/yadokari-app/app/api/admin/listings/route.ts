import { NextRequest, NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const STATUS_FILTERS = new Set<string>(Object.values(ListingStatus));

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "データベースが未設定です" }, { status: 503 });
  }

  const requestedStatus = request.nextUrl.searchParams.get("status")?.toUpperCase();
  const status = requestedStatus && STATUS_FILTERS.has(requestedStatus)
    ? (requestedStatus as ListingStatus)
    : undefined;

  try {
    const [listings, pendingCount, activeCount, rejectedCount, expiredCount] = await prisma.$transaction([
      prisma.propertyListing.findMany({
        where: status ? { status } : undefined,
        include: {
          user: {
            select: {
              email: true,
              name: true,
              plan: true,
            },
          },
        },
        orderBy: [
          { status: "asc" },
          { createdAt: "desc" },
        ],
        take: 100,
      }),
      prisma.propertyListing.count({ where: { status: "PENDING" } }),
      prisma.propertyListing.count({ where: { status: "ACTIVE" } }),
      prisma.propertyListing.count({ where: { status: "REJECTED" } }),
      prisma.propertyListing.count({ where: { status: "EXPIRED" } }),
    ]);

    return NextResponse.json({
      listings,
      counts: {
        PENDING: pendingCount,
        ACTIVE: activeCount,
        REJECTED: rejectedCount,
        EXPIRED: expiredCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin listings:", error);
    return NextResponse.json({ error: "掲載申請の取得に失敗しました" }, { status: 500 });
  }
}
