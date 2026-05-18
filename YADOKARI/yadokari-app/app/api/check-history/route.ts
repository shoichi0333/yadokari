import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CheckHistoryBody = {
  email?: unknown;
  address?: unknown;
  prefecture?: unknown;
  ward?: unknown;
  juutaku?: unknown;
  tokku?: unknown;
  ryokan?: unknown;
  checkedAt?: unknown;
};

function isDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

export async function GET(request: NextRequest) {
  if (!isDbEnabled()) {
    return NextResponse.json({ history: [], fallback: true });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      checkHistories: {
        orderBy: { checkedAt: "desc" },
        take: 30,
      },
    },
  });

  return NextResponse.json({ history: user?.checkHistories ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isDbEnabled()) {
    return NextResponse.json({ ok: true, fallback: true });
  }

  let body: CheckHistoryBody;
  try {
    body = (await request.json()) as CheckHistoryBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = getString(body.email);
  const address = getString(body.address);

  if (!email.includes("@") || !address) {
    return NextResponse.json({ error: "email and address are required" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: email.split("@")[0] || "YADOKARI User",
    },
  });

  const checkedAt = getString(body.checkedAt);
  const history = await prisma.checkHistory.upsert({
    where: {
      userId_address: {
        userId: user.id,
        address,
      },
    },
    create: {
      userId: user.id,
      address,
      prefecture: getString(body.prefecture) || null,
      ward: getString(body.ward) || null,
      juutaku: getBoolean(body.juutaku),
      tokku: getBoolean(body.tokku),
      ryokan: getBoolean(body.ryokan),
      checkedAt: checkedAt ? new Date(checkedAt) : new Date(),
    },
    update: {
      prefecture: getString(body.prefecture) || null,
      ward: getString(body.ward) || null,
      juutaku: getBoolean(body.juutaku),
      tokku: getBoolean(body.tokku),
      ryokan: getBoolean(body.ryokan),
      checkedAt: checkedAt ? new Date(checkedAt) : new Date(),
    },
  });

  return NextResponse.json({ ok: true, history });
}
