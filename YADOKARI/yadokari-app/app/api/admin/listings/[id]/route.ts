import { NextRequest, NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Params = {
  params: Promise<{ id: string }>;
};

const ALLOWED_STATUSES = new Set<string>(Object.values(ListingStatus));

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "データベースが未設定です" }, { status: 503 });
  }

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = typeof payload?.status === "string" ? payload.status.toUpperCase() : "";

  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "不正なステータスです" }, { status: 400 });
  }

  try {
    const listing = await prisma.propertyListing.update({
      where: { id },
      data: { status: status as ListingStatus },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            plan: true,
          },
        },
      },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Failed to update admin listing:", error);
    return NextResponse.json({ error: "掲載申請の更新に失敗しました" }, { status: 500 });
  }
}
