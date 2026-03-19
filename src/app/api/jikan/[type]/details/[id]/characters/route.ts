import { NextRequest, NextResponse } from "next/server";
import { getCharacters } from "@/lib/jikan";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const t = type === "manga" ? "manga" : "anime";
  const data = await getCharacters(t, Number(id));
  return NextResponse.json(data);
}
