import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase";

async function getEmailFromToken(request: NextRequest): Promise<string | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const supabase = getSupabaseServerClient();
  const { data } = (await supabase?.auth.getUser(token)) ?? { data: { user: null } };
  return data.user?.email ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "決済サービスが未設定です" }, { status: 503 });
    }

    const email = await getEmailFromToken(request);
    if (!email) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "データベースが未設定です" }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Stripeカスタマー情報が見つかりません" },
        { status: 404 },
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yadokari-minpaku.jp";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${siteUrl}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create billing portal session:", error);
    return NextResponse.json({ error: "課金管理ページの作成に失敗しました" }, { status: 500 });
  }
}
