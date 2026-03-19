import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ items: [] });

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") || "anime"; // anime, manga, all
  const page = Number(sp.get("page") || 1);
  const limit = 12;

  const where: Record<string, unknown> = { userId: user.id };
  if (type !== "all") where.itemType = type;

  const [items, total] = await Promise.all([
    prisma.watchedItem.findMany({
      where,
      orderBy: { watchedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.watchedItem.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((i) => ({
      malId: i.itemMalId,
      type: i.itemType,
      title: i.itemTitle,
      imageUrl: i.itemImageUrl,
      score: i.itemScore,
      watchedAt: i.watchedAt.toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / limit),
    page,
  });
}
