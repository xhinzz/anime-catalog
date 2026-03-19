import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, getStorageUrl } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const userId = Number((session.user as Record<string, unknown>).id);
  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return NextResponse.json({ success: false, message: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `avatars/user_${userId}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("uploads")
    .upload(filename, buffer, { contentType: file.type, upsert: true });

  if (error) {
    console.error("Supabase upload error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }

  await prisma.user.update({ where: { id: userId }, data: { profileImageFile: filename } });

  const url = getStorageUrl("uploads", filename);
  return NextResponse.json({ success: true, url: `${url}?t=${Date.now()}` });
}
