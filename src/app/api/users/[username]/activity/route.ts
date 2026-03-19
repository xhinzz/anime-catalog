import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ activities: [] });

  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    activities: activities.map((a) => ({
      id: a.id,
      action: a.action,
      itemMalId: a.itemMalId,
      itemType: a.itemType,
      itemTitle: a.itemTitle,
      itemImageUrl: a.itemImageUrl,
      extra: a.extra ? JSON.parse(a.extra) : null,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
