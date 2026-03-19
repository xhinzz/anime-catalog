import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ watching: false });
  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  const item = await prisma.currentlyWatching.findUnique({
    where: { userId_itemMalId_itemType: { userId, itemMalId: Number(id), itemType: type === "manga" ? "manga" : "anime" } },
  });
  return NextResponse.json({
    watching: !!item,
    currentEpisode: item?.currentEpisode ?? 0,
    totalEpisodes: item?.totalEpisodes ?? null,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  const itemType = type === "manga" ? "manga" : "anime";
  const body = await req.json().catch(() => ({}));

  await prisma.currentlyWatching.upsert({
    where: { userId_itemMalId_itemType: { userId, itemMalId: Number(id), itemType } },
    create: {
      userId, itemMalId: Number(id), itemType,
      itemTitle: body.title, itemImageUrl: body.image_url,
      totalEpisodes: body.totalEpisodes ?? null,
      currentEpisode: body.currentEpisode ?? 0,
    },
    update: {
      currentEpisode: body.currentEpisode ?? undefined,
      totalEpisodes: body.totalEpisodes ?? undefined,
    },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  await prisma.currentlyWatching.deleteMany({
    where: { userId, itemMalId: Number(id), itemType: type === "manga" ? "manga" : "anime" },
  });
  return NextResponse.json({ success: true });
}
