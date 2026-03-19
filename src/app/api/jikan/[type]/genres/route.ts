import { NextRequest, NextResponse } from "next/server";
import { getGenres } from "@/lib/jikan";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = type === "manga" ? "manga" : "anime";
  const genres = await getGenres(t);
  return NextResponse.json(genres);
}
