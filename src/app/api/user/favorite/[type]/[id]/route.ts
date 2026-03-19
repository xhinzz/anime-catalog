import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ favorited: false });
  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  const item = await prisma.favoriteItem.findUnique({
    where: { userId_itemMalId_itemType: { userId, itemMalId: Number(id), itemType: type === "manga" ? "manga" : "anime" } },
  });
  return NextResponse.json({ favorited: !!item });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  const itemType = type === "manga" ? "manga" : "anime";
  const body = await req.json().catch(() => ({}));

  const count = await prisma.favoriteItem.count({ where: { userId } });
  if (count >= 5) return NextResponse.json({ success: false, message: "Limite de 5 favoritos." }, { status: 400 });

  await prisma.favoriteItem.upsert({
    where: { userId_itemMalId_itemType: { userId, itemMalId: Number(id), itemType } },
    create: { userId, itemMalId: Number(id), itemType, itemTitle: body.title, itemImageUrl: body.image_url, position: count },
    update: {},
  });
  await logActivity(userId, "favorited", { itemMalId: Number(id), itemType, itemTitle: body.title, itemImageUrl: body.image_url });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });
  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  await prisma.favoriteItem.deleteMany({ where: { userId, itemMalId: Number(id), itemType: type === "manga" ? "manga" : "anime" } });
  return NextResponse.json({ success: true });
}
