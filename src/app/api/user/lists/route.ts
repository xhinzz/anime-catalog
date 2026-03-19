import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ lists: [] });
  const userId = Number((session.user as Record<string, unknown>).id);

  const lists = await prisma.userList.findMany({
    where: { userId },
    include: { items: { take: 4, orderBy: { position: "asc" } }, _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    lists: lists.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      isPublic: l.isPublic,
      itemCount: l._count.items,
      preview: l.items.map((i) => i.itemImageUrl).filter(Boolean),
      updatedAt: l.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const userId = Number((session.user as Record<string, unknown>).id);
  const { name, description } = await req.json();

  if (!name?.trim()) return NextResponse.json({ success: false, message: "Nome obrigatório." }, { status: 400 });

  const list = await prisma.userList.create({
    data: { userId, name: name.trim(), description: description?.trim() || "" },
  });

  return NextResponse.json({ success: true, list: { id: list.id, name: list.name } });
}
