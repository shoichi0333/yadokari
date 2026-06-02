import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const result = await requireAdmin(request);
    return NextResponse.json({ isAdmin: result.ok });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
