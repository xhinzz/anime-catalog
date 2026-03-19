import { NextRequest, NextResponse } from "next/server";
import { getPopular } from "@/lib/jikan";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = type === "manga" ? "manga" : "anime";
  const sp = req.nextUrl.searchParams;
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 14);
  const orderBy = sp.get("order_by") || "score";
  const sort = sp.get("sort") || "desc";

  const data = await getPopular(t, page, limit, orderBy, sort);
  return NextResponse.json(data);
}
