import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ lists: [] });

  const lists = await prisma.userList.findMany({
    where: { userId: user.id, isPublic: true },
    include: { items: { take: 4, orderBy: { position: "asc" } }, _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    lists: lists.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      itemCount: l._count.items,
      preview: l.items.map((i) => i.itemImageUrl).filter(Boolean),
    })),
  });
}
