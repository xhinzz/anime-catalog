import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { username } = await params;
  const currentUserId = Number((session.user as Record<string, unknown>).id);
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ success: false }, { status: 404 });

  await prisma.follow.deleteMany({ where: { followerId: currentUserId, followedId: target.id } });

  const followersCount = await prisma.follow.count({ where: { followedId: target.id } });
  return NextResponse.json({ success: true, followersCount });
}
