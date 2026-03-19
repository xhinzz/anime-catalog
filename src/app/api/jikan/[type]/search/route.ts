import { NextRequest, NextResponse } from "next/server";
import { searchItems } from "@/lib/jikan";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = type === "manga" ? "manga" : "anime";
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") || "";
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 14);

  if (!q) return NextResponse.json({ items: [], pagination: null });
  const data = await searchItems(t, q, page, limit);
  return NextResponse.json(data);
}
