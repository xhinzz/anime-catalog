import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: "Email inválido." }, { status: 400 });
  }

  const userId = Number((session.user as Record<string, unknown>).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ success: false }, { status: 404 });

  if (user.emailVerified) {
    return NextResponse.json({ success: false, message: "Não é possível trocar email já verificado." }, { status: 400 });
  }

  // Check if email is taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return NextResponse.json({ success: false, message: "Este email já está em uso." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email, emailVerified: false, verificationCode: null, verificationExpiry: null },
  });

  return NextResponse.json({ success: true, message: "Email atualizado!" });
}
