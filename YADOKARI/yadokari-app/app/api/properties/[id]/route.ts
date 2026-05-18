import { NextResponse } from "next/server";
import { getPropertyById } from "@/lib/properties-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
