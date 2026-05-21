import { NextResponse } from "next/server";
import { getPropertyById } from "@/lib/properties-service";
import { isPropertyMarketplaceEnabled } from "@/lib/property-marketplace";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isPropertyMarketplaceEnabled()) {
      return NextResponse.json({ error: "Property marketplace is not published yet" }, { status: 404 });
    }

    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
      return NextResponse.json({ error: "物件が見つかりません" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ error: "物件の取得に失敗しました" }, { status: 500 });
  }
}
