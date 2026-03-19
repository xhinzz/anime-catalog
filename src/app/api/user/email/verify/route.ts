import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ success: false, message: "Código obrigatório." }, { status: 400 });

  const userId = Number((session.user as Record<string, unknown>).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ success: false }, { status: 404 });

  if (user.emailVerified) {
    return NextResponse.json({ success: true, message: "Email já verificado." });
  }

  if (!user.verificationCode || !user.verificationExpiry) {
    return NextResponse.json({ success: false, message: "Solicite um novo código." }, { status: 400 });
  }

  if (new Date() > user.verificationExpiry) {
    return NextResponse.json({ success: false, message: "Código expirado. Solicite um novo." }, { status: 400 });
  }

  if (user.verificationCode !== code.trim()) {
    return NextResponse.json({ success: false, message: "Código incorreto." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, verificationCode: null, verificationExpiry: null },
  });

  return NextResponse.json({ success: true, message: "Email verificado!" });
}
