import { NextRequest, NextResponse } from "next/server";
import { getItemDetails } from "@/lib/jikan";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const t = type === "manga" ? "manga" : "anime";
  const data = await getItemDetails(t, Number(id));
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
