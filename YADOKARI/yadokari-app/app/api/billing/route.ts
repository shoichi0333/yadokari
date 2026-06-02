import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase";

async function getEmailFromToken(request: NextRequest): Promise<string | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const supabase = getSupabaseServerClient();
  const { data } = (await supabase?.auth.getUser(token)) ?? { data: { user: null } };
  return data.user?.email ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const email = await getEmailFromToken(request);
    if (!email) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ plan: "free", subscription: null });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        plan: true,
        subscription: {
          select: {
            status: true,
            plan: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    return NextResponse.json({
      plan: user?.plan?.toLowerCase() ?? "free",
      subscription: user?.subscription ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch billing info:", error);
    return NextResponse.json({ error: "課金情報の取得に失敗しました" }, { status: 500 });
  }
}
