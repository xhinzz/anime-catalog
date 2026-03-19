import { NextRequest, NextResponse } from "next/server";

// Simple translation via Google Translate (free, unofficial)
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === "en") return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    // Response format: [[["translated text","original text",...],...],...]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((seg: string[]) => seg[0]).join("");
    }
    return text;
  } catch {
    return text;
  }
}

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  try {
    const res = await fetch("https://api.jikan.moe/v4/anime/1/news", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return NextResponse.json({ items: [] });
    const data = await res.json();
    let items = (data.data || []).slice(0, 6);

    // Translate if not English
    if (lang !== "en" && items.length > 0) {
      const translated = await Promise.all(
        items.map(async (item: Record<string, unknown>) => {
          const [tTitle, tExcerpt] = await Promise.all([
            translateText(item.title as string, lang),
            translateText(
              ((item.excerpt as string) || "").slice(0, 200),
              lang
            ),
          ]);
          return { ...item, _title: tTitle, _excerpt: tExcerpt };
        })
      );
      items = translated;
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
