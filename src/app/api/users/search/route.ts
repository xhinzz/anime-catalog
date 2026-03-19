import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: { username: { contains: q } },
    take: 20,
    select: {
      id: true,
      username: true,
      profileImageFile: true,
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      profile_image_url: `/uploads/avatars/${u.profileImageFile || "default.jpg"}`,
    })),
  });
}
