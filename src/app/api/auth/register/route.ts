import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Campos obrigatórios." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      const msg = existingUser.email === email ? "Email já cadastrado." : "Nome de usuário já existe.";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { username, email, passwordHash: hash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
