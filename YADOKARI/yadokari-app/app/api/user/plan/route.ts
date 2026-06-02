import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ plan: "free" });

  if (isAdminEmail(email)) {
    return NextResponse.json({ plan: "pro" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { plan: true },
    });
    const plan = user?.plan?.toLowerCase() ?? "free";
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ plan: "free" });
  }
}
