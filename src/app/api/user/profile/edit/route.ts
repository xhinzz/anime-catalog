import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const userId = Number((session.user as Record<string, unknown>).id);
  const data = await req.json();

  const isHex = (c: unknown) => typeof c === "string" && c.length === 7 && c.startsWith("#");

  const update: Record<string, unknown> = {};
  if ("bio" in data) update.bio = String(data.bio).slice(0, 300);
  if ("displayName" in data) update.displayName = data.displayName ? String(data.displayName).slice(0, 50) : null;
  if ("accentColor" in data && isHex(data.accentColor)) update.accentColor = data.accentColor;
  if ("borderColor" in data) update.borderColor = data.borderColor && isHex(data.borderColor) ? data.borderColor : null;

  await prisma.user.update({ where: { id: userId }, data: update });
  return NextResponse.json({ success: true });
}
