import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ rating: null });

  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  const itemType = type === "manga" ? "manga" : "anime";

  const rating = await prisma.userRating.findUnique({
    where: { userId_itemMalId_itemType: { userId, itemMalId: Number(id), itemType } },
  });

  if (!rating) return NextResponse.json({ rating: null });
  return NextResponse.json({
    rating: { stars: rating.stars, comment: rating.comment, updatedAt: rating.updatedAt.toISOString() },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 });

  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  const itemType = type === "manga" ? "manga" : "anime";
  const { stars, comment } = await req.json();

  if (!stars || stars < 1 || stars > 5) {
    return NextResponse.json({ success: false, message: "Estrelas inválidas." }, { status: 400 });
  }

  await prisma.userRating.upsert({
    where: { userId_itemMalId_itemType: { userId, itemMalId: Number(id), itemType } },
    create: { userId, itemMalId: Number(id), itemType, stars, comment: comment || "" },
    update: { stars, comment: comment || "" },
  });
  await logActivity(userId, "rated", { itemMalId: Number(id), itemType, extra: { stars } });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const { type, id } = await params;
  const userId = Number((session.user as Record<string, unknown>).id);
  const itemType = type === "manga" ? "manga" : "anime";

  await prisma.userRating.deleteMany({
    where: { userId, itemMalId: Number(id), itemType },
  });

  return NextResponse.json({ success: true });
}
