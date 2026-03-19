import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const userId = Number((session.user as Record<string, unknown>).id);
  await prisma.user.update({
    where: { id: userId },
    data: { discordId: null, discordUsername: null, discordAvatar: null },
  });

  return NextResponse.json({ success: true });
}
