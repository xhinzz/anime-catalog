import { NextRequest, NextResponse } from "next/server";
import { getStatistics } from "@/lib/jikan";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const t = type === "manga" ? "manga" : "anime";
  const data = await getStatistics(t, Number(id));
  return NextResponse.json(data);
}
