import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const userId = Number((session.user as Record<string, unknown>).id);
  const formData = await req.formData();
  const file = formData.get("banner") as File | null;
  if (!file) return NextResponse.json({ success: false, message: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `banner_${userId}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "banners");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  await prisma.user.update({ where: { id: userId }, data: { bannerImageFile: filename } });

  return NextResponse.json({ success: true, url: `/uploads/banners/${filename}?t=${Date.now()}` });
}
