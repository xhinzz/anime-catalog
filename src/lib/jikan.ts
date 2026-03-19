const BASE = "https://api.jikan.moe/v4";

async function jikanFetch(url: string) {
  await new Promise((r) => setTimeout(r, 350));
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function getPopular(type: "anime" | "manga", page = 1, limit = 14, orderBy = "score", sort = "desc") {
  const data = await jikanFetch(`${BASE}/${type}?page=${page}&limit=${limit}&order_by=${orderBy}&sort=${sort}`);
  if (!data) return { items: [], pagination: null };
  return {
    items: data.data.map(mapItem),
    pagination: data.pagination,
  };
}

export async function getByGenre(type: "anime" | "manga", genreId: number, page = 1, limit = 14, orderBy = "score", sort = "desc") {
  const data = await jikanFetch(`${BASE}/${type}?genres=${genreId}&page=${page}&limit=${limit}&order_by=${orderBy}&sort=${sort}`);
  if (!data) return { items: [], pagination: null };
  return {
    items: data.data.map(mapItem),
    pagination: data.pagination,
  };
}

export async function searchItems(type: "anime" | "manga", query: string, page = 1, limit = 14) {
  const data = await jikanFetch(`${BASE}/${type}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  if (!data) return { items: [], pagination: null };
  return {
    items: data.data.map(mapItem),
    pagination: data.pagination,
  };
}

export async function getGenres(type: "anime" | "manga") {
  const data = await jikanFetch(`${BASE}/genres/${type}`);
  if (!data) return [];
  return data.data.map((g: { mal_id: number; name: string }) => ({
    id: g.mal_id,
    name: g.name,
  }));
}

export async function getItemDetails(type: "anime" | "manga", id: number) {
  const data = await jikanFetch(`${BASE}/${type}/${id}/full`);
  if (!data?.data) return null;
  const d = data.data;
  const isAnime = type === "anime";
  return {
    mal_id: d.mal_id,
    title: d.title_english || d.title,
    title_japanese: d.title_japanese,
    cover_url: d.images?.jpg?.large_image_url || d.images?.jpg?.image_url,
    score: d.score,
    scored_by: d.scored_by,
    rank: d.rank,
    popularity: d.popularity,
    synopsis: d.synopsis || "Sinopse não disponível.",
    type: d.type,
    source: d.source,
    status: d.status,
    episodes: isAnime ? d.episodes : d.chapters,
    duration: isAnime ? d.duration : `${d.volumes} volumes`,
    rating: isAnime ? d.rating : null,
    year: isAnime ? d.year : d.published?.prop?.from?.year,
    season: isAnime ? d.season : null,
    genres: d.genres?.map((g: { mal_id: number; name: string }) => ({ id: g.mal_id, name: g.name })) || [],
    studios: isAnime ? d.studios?.map((s: { name: string }) => s.name) || [] : d.authors?.map((a: { name: string }) => a.name) || [],
    trailer_url: isAnime && d.trailer?.youtube_id ? `https://www.youtube.com/embed/${d.trailer.youtube_id}` : null,
    // Extra data from /full endpoint
    relations: d.relations?.map((r: Record<string, unknown>) => ({
      relation: r.relation,
      entries: (r.entry as { mal_id: number; type: string; name: string }[])?.map((e) => ({
        mal_id: e.mal_id,
        type: e.type,
        name: e.name,
      })) || [],
    })) || [],
    themes: {
      openings: d.theme?.openings || [],
      endings: d.theme?.endings || [],
    },
    statistics: null as { watching: number; completed: number; on_hold: number; dropped: number; plan_to_watch: number; scores: { score: number; votes: number; percentage: number }[] } | null,
  };
}

export async function getCharacters(type: "anime" | "manga", id: number) {
  const data = await jikanFetch(`${BASE}/${type}/${id}/characters`);
  if (!data?.data) return [];
  return data.data.slice(0, 12).map((c: Record<string, unknown>) => {
    const character = c.character as Record<string, unknown>;
    const images = character?.images as Record<string, Record<string, string>>;
    const voiceActors = (c.voice_actors as Record<string, unknown>[])?.filter(
      (va: Record<string, unknown>) => va.language === "Japanese"
    ) || [];
    const va = voiceActors[0] as Record<string, unknown> | undefined;
    const vaImages = (va?.person as Record<string, unknown>)?.images as Record<string, Record<string, string>>;
    return {
      id: (character?.mal_id as number) || 0,
      name: (character?.name as string) || "",
      image: images?.jpg?.image_url || "",
      role: (c.role as string) || "",
      voiceActor: va ? {
        name: ((va.person as Record<string, unknown>)?.name as string) || "",
        image: vaImages?.jpg?.image_url || "",
        language: (va.language as string) || "",
      } : null,
    };
  });
}

export async function getStaff(id: number) {
  const data = await jikanFetch(`${BASE}/anime/${id}/staff`);
  if (!data?.data) return [];
  return data.data.slice(0, 6).map((s: Record<string, unknown>) => {
    const person = s.person as Record<string, unknown>;
    const images = person?.images as Record<string, Record<string, string>>;
    return {
      id: (person?.mal_id as number) || 0,
      name: (person?.name as string) || "",
      image: images?.jpg?.image_url || "",
      positions: (s.positions as string[]) || [],
    };
  });
}

export async function getStatistics(type: "anime" | "manga", id: number) {
  const data = await jikanFetch(`${BASE}/${type}/${id}/statistics`);
  if (!data?.data) return null;
  const d = data.data;
  return {
    watching: d.watching || d.reading || 0,
    completed: d.completed || 0,
    on_hold: d.on_hold || 0,
    dropped: d.dropped || 0,
    plan_to_watch: d.plan_to_watch || d.plan_to_read || 0,
    scores: (d.scores as { score: number; votes: number; percentage: number }[])?.map((s) => ({
      score: s.score,
      votes: s.votes,
      percentage: s.percentage,
    })) || [],
  };
}

export async function getItemBasic(type: "anime" | "manga", id: number) {
  const data = await jikanFetch(`${BASE}/${type}/${id}`);
  if (!data?.data) return null;
  const d = data.data;
  return {
    mal_id: d.mal_id,
    title: d.title_english || d.title,
    cover_url: d.images?.jpg?.large_image_url || d.images?.jpg?.image_url,
    score: d.score,
  };
}

function mapItem(d: Record<string, unknown>): {
  mal_id: number;
  title: string;
  cover_url: string;
  score: number | null;
  episodes: number | null;
  type: string;
} {
  const images = d.images as Record<string, Record<string, string>> | undefined;
  return {
    mal_id: d.mal_id as number,
    title: (d.title_english as string) || (d.title as string),
    cover_url: images?.jpg?.large_image_url || images?.jpg?.image_url || "",
    score: (d.score as number) || null,
    episodes: (d.episodes as number) || (d.chapters as number) || null,
    type: (d.type as string) || "",
  };
}
