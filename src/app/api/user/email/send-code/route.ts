import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 });

  const userId = Number((session.user as Record<string, unknown>).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ success: false }, { status: 404 });

  if (user.emailVerified) {
    return NextResponse.json({ success: false, message: "Email já verificado." });
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await prisma.user.update({
    where: { id: userId },
    data: { verificationCode: code, verificationExpiry: expiry },
  });

  try {
    await sendVerificationEmail(user.email, code, user.username);
    return NextResponse.json({ success: true, message: "Código enviado!" });
  } catch {
    return NextResponse.json({ success: false, message: "Erro ao enviar email." }, { status: 500 });
  }
}
