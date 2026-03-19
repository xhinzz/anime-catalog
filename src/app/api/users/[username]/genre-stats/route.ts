import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ genres: [] });

  // Get all watched items
  const watched = await prisma.watchedItem.findMany({
    where: { userId: user.id },
    select: { itemMalId: true, itemType: true },
  });

  if (watched.length === 0) return NextResponse.json({ genres: [], totalWatched: 0 });

  // Fetch genres for up to 15 items from Jikan (with delays)
  const genreCount: Record<string, number> = {};
  const toFetch = watched.slice(0, 15);

  for (const item of toFetch) {
    try {
      await new Promise((r) => setTimeout(r, 350));
      const res = await fetch(`https://api.jikan.moe/v4/${item.itemType}/${item.itemMalId}`);
      if (!res.ok) continue;
      const data = await res.json();
      const genres = data.data?.genres || [];
      for (const g of genres) {
        genreCount[g.name] = (genreCount[g.name] || 0) + 1;
      }
    } catch {
      continue;
    }
  }

  const genres = Object.entries(genreCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return NextResponse.json({ genres, totalWatched: watched.length });
}
