import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;
  const list = await prisma.userList.findUnique({
    where: { id: Number(listId) },
    include: { items: { orderBy: { position: "asc" } }, user: { select: { username: true } } },
  });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: list.id,
    name: list.name,
    description: list.description,
    isPublic: list.isPublic,
    username: list.user.username,
    items: list.items.map((i) => ({
      malId: i.itemMalId,
      type: i.itemType,
      title: i.itemTitle,
      imageUrl: i.itemImageUrl,
    })),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ listId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const userId = Number((session.user as Record<string, unknown>).id);
  const { listId } = await params;

  const list = await prisma.userList.findUnique({ where: { id: Number(listId) } });
  if (!list || list.userId !== userId) return NextResponse.json({ success: false }, { status: 403 });

  await prisma.userList.delete({ where: { id: Number(listId) } });
  return NextResponse.json({ success: true });
}
