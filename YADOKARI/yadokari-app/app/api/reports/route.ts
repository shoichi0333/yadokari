import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SavedReportBody = {
  email?: unknown;
  address?: unknown;
  prefecture?: unknown;
  ward?: unknown;
  recommendedType?: unknown;
  score?: unknown;
  monthlyRevenueMin?: unknown;
  monthlyRevenueMax?: unknown;
  snapshot?: unknown;
};

function isDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function parseNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getSnapshot(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;

  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  if (!isDbEnabled()) {
    return NextResponse.json({ reports: [], fallback: true });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      savedReports: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  return NextResponse.json({ reports: user?.savedReports ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isDbEnabled()) {
    return NextResponse.json({ ok: true, fallback: true });
  }

  let body: SavedReportBody;
  try {
    body = (await request.json()) as SavedReportBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = getString(body.email);
  const address = getString(body.address);
  const recommendedType = getString(body.recommendedType);
  const score = parseNumber(body.score);
  const snapshot = getSnapshot(body.snapshot);

  if (!email.includes("@") || !address || !recommendedType || score === null) {
    return NextResponse.json({ error: "email, address, recommendedType, and score are required" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: email.split("@")[0] || "YADOKARI User",
    },
  });

  const report = await prisma.savedReport.upsert({
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
      recommendedType,
      score,
      monthlyRevenueMin: parseNumber(body.monthlyRevenueMin),
      monthlyRevenueMax: parseNumber(body.monthlyRevenueMax),
      snapshot,
    },
    update: {
      prefecture: getString(body.prefecture) || null,
      ward: getString(body.ward) || null,
      recommendedType,
      score,
      monthlyRevenueMin: parseNumber(body.monthlyRevenueMin),
      monthlyRevenueMax: parseNumber(body.monthlyRevenueMax),
      snapshot,
    },
  });

  return NextResponse.json({ ok: true, report });
}

export async function DELETE(request: NextRequest) {
  if (!isDbEnabled()) {
    return NextResponse.json({ ok: true, fallback: true });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim();
  const address = request.nextUrl.searchParams.get("address")?.trim();

  if (!email || !email.includes("@") || !address) {
    return NextResponse.json({ error: "email and address are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  await prisma.savedReport.deleteMany({
    where: {
      userId: user.id,
      address,
    },
  });

  return NextResponse.json({ ok: true });
}
