import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ listId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const userId = Number((session.user as Record<string, unknown>).id);
  const { listId } = await params;

  const list = await prisma.userList.findUnique({ where: { id: Number(listId) } });
  if (!list || list.userId !== userId) return NextResponse.json({ success: false }, { status: 403 });

  const { malId, type, title, imageUrl } = await req.json();
  const count = await prisma.listItem.count({ where: { listId: Number(listId) } });

  await prisma.listItem.upsert({
    where: { listId_itemMalId_itemType: { listId: Number(listId), itemMalId: malId, itemType: type } },
    create: { listId: Number(listId), itemMalId: malId, itemType: type, itemTitle: title, itemImageUrl: imageUrl, position: count },
    update: {},
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ listId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const userId = Number((session.user as Record<string, unknown>).id);
  const { listId } = await params;

  const list = await prisma.userList.findUnique({ where: { id: Number(listId) } });
  if (!list || list.userId !== userId) return NextResponse.json({ success: false }, { status: 403 });

  const { malId, type } = await req.json();
  await prisma.listItem.deleteMany({ where: { listId: Number(listId), itemMalId: malId, itemType: type } });

  return NextResponse.json({ success: true });
}
