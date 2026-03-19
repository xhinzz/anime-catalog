import { NextResponse } from "next/server";

export async function GET() {
  try {
    await new Promise((r) => setTimeout(r, 300));
    const res = await fetch("https://api.jikan.moe/v4/top/anime?filter=airing&limit=6", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ items: [] });
    const data = await res.json();
    const items = (data.data || []).map((d: Record<string, unknown>) => ({
      mal_id: d.mal_id,
      title: (d as Record<string, string>).title_english || d.title,
      cover_url: ((d.images as Record<string, Record<string, string>>)?.jpg?.large_image_url) || "",
      score: d.score || null,
      episodes: d.episodes || null,
    }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
