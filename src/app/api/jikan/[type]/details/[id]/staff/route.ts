import { NextRequest, NextResponse } from "next/server";
import { getStaff } from "@/lib/jikan";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { id } = await params;
  const data = await getStaff(Number(id));
  return NextResponse.json(data);
}
