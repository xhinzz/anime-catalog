"use client";

import { useEffect, useState } from "react";

interface GenreStat {
  name: string;
  count: number;
}

const COLORS = ["#7C3AED", "#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#EC4899"];

export default function GenreChart({ username }: { username: string }) {
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${username}/genre-stats`)
      .then((r) => r.json())
      .then((d) => {
        setGenres(d.genres || []);
        setTotal(d.totalWatched || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
      </div>
    );
  }

  if (genres.length === 0) {
    return <p className="py-4 text-center text-[11px] text-[#6B6580]">Sem dados ainda.</p>;
  }

  // Build donut chart with conic-gradient
  const totalGenreCount = genres.reduce((sum, g) => sum + g.count, 0);
  let cumPercent = 0;
  const gradientStops: string[] = [];

  genres.forEach((g, i) => {
    const percent = (g.count / totalGenreCount) * 100;
    const color = COLORS[i % COLORS.length];
    gradientStops.push(`${color} ${cumPercent}% ${cumPercent + percent}%`);
    cumPercent += percent;
  });

  // Fill remaining with dark
  if (cumPercent < 100) {
    gradientStops.push(`#1E1A2B ${cumPercent}% 100%`);
  }

  return (
    <div>
      {/* Donut */}
      <div className="flex items-center justify-center py-3">
        <div className="relative">
          <div
            className="h-[120px] w-[120px] rounded-full"
            style={{
              background: `conic-gradient(${gradientStops.join(", ")})`,
            }}
          />
          {/* Inner circle (donut hole) */}
          <div className="absolute inset-[20px] rounded-full bg-[#110F1A] flex items-center justify-center flex-col">
            <span className="text-lg font-black text-[#E8E4F4]">{total}</span>
            <span className="text-[9px] text-[#6B6580]">Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 space-y-1.5">
        {genres.map((g, i) => {
          const percent = Math.round((g.count / totalGenreCount) * 100);
          return (
            <div key={g.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 text-[11px] text-[#A8A0B8] truncate">{g.name}</span>
              <span className="text-[11px] font-semibold text-[#E8E4F4]">{percent}%</span>
              <span className="text-[10px] text-[#6B6580]">({g.count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
