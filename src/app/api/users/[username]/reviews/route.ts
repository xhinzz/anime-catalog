import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ reviews: [] });

  const sp = req.nextUrl.searchParams;
  const page = Number(sp.get("page") || 1);
  const limit = 10;

  const [ratings, total] = await Promise.all([
    prisma.userRating.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userRating.count({ where: { userId: user.id } }),
  ]);

  // Get titles from watched items
  const malIds = ratings.map((r) => ({ malId: r.itemMalId, type: r.itemType }));
  const watchedItems = await prisma.watchedItem.findMany({
    where: { userId: user.id, OR: malIds.map((m) => ({ itemMalId: m.malId, itemType: m.type })) },
  });

  const titleMap = new Map(watchedItems.map((w) => [`${w.itemType}_${w.itemMalId}`, { title: w.itemTitle, imageUrl: w.itemImageUrl }]));

  return NextResponse.json({
    reviews: ratings.map((r) => {
      const info = titleMap.get(`${r.itemType}_${r.itemMalId}`);
      return {
        malId: r.itemMalId,
        type: r.itemType,
        stars: r.stars,
        comment: r.comment,
        updatedAt: r.updatedAt.toISOString(),
        title: info?.title || `${r.itemType} #${r.itemMalId}`,
        imageUrl: info?.imageUrl || null,
      };
    }),
    total,
    totalPages: Math.ceil(total / limit),
    page,
  });
}
