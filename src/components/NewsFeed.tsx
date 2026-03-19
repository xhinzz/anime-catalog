"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import SectionIcon from "./SectionIcon";

interface NewsItem {
  mal_id: number;
  url: string;
  title: string;
  date: string;
  author_username: string;
  images: { jpg: { image_url: string } };
  excerpt: string;
  // translated fields
  _title?: string;
  _excerpt?: string;
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale, t } = useLocale();

  useEffect(() => {
    fetch(`/api/news?lang=${locale}`)
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => { setNews(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (news.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2.5">
        <SectionIcon color="#7C3AED" variant="bar" />
        <h2 className="text-base font-bold text-[#E8E4F4]">{t("ultimasNoticias")}</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {news.slice(0, 6).map((item, i) => (
          <a
            key={`${item.mal_id}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-3 rounded-xl border border-[#1E1A2B] bg-[#161320] p-3 transition-all hover:border-[#7C3AED]/40 hover:bg-[#1E1A2B]"
          >
            {item.images?.jpg?.image_url && (
              <img
                src={item.images.jpg.image_url}
                alt=""
                className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-2 text-[13px] font-semibold text-[#E8E4F4] leading-tight group-hover:text-[#7C3AED] transition-colors">
                {item._title || item.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#6B6580]">
                {item._excerpt || item.excerpt}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-[#6B6580]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.date).toLocaleDateString(locale === "ja" ? "ja-JP" : locale === "es" ? "es-ES" : locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short" })}
                </span>
                <span className="flex items-center gap-1 text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("lerMais")} <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
