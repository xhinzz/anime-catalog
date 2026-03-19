"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye, BookOpen, PlayCircle, Bookmark, Star, Heart, X,
  Calendar, UserPlus, UserMinus, Edit3, Trophy, Users, Loader2,
  Camera, Save, RotateCcw, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GenreChart from "@/components/GenreChart";

interface ProfileData {
  id: number; username: string; displayName: string | null; bio: string; accentColor: string;
  borderColor: string | null;
  profileImageUrl: string; bannerUrl: string | null; bannerPositionY: number;
  createdAt: string;
  colorBackground: string | null; colorCard: string | null;
  colorText: string | null; colorTextSecondary: string | null;
  discord: { id: string; username: string | null; avatar: string | null } | null;
  stats: {
    watchedAnime: number; watchedManga: number; watchlaterAnime: number;
    watchlaterManga: number; ratings: number; currentlyWatching: number;
    followers: number; following: number; likes: number;
  };
  isOwn: boolean; isFollowing: boolean; hasLiked: boolean;
  favorites: { malId: number; type: string; title: string | null; imageUrl: string | null }[];
  currentlyWatching: {
    malId: number; type: string; title: string | null; imageUrl: string | null;
    currentEpisode: number; totalEpisodes: number | null;
  }[];
}

interface ActivityItem {
  id: number; action: string; itemMalId: number | null; itemType: string | null;
  itemTitle: string | null; itemImageUrl: string | null;
  extra: Record<string, unknown> | null; createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  watched: "marcou como assistido",
  rated: "avaliou",
  favorited: "adicionou aos favoritos",
  watching: "começou a assistir",
  watchlater: "adicionou para ver depois",
};

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280'%3E%3Crect fill='%23161320' width='200' height='280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B6580' font-family='sans-serif' font-size='13'%3ESem Imagem%3C/text%3E%3C/svg%3E";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getBadge(total: number) {
  if (total >= 200) return { label: "Diamante", image: "/diamante.png", color: "#B9F2FF" };
  if (total >= 100) return { label: "Ouro", image: "/ouro.png", color: "#FFD700" };
  if (total >= 50) return { label: "Prata", image: "/prata.png", color: "#C0C0C0" };
  if (total >= 10) return { label: "Bronze", image: "/bronze.png", color: "#CD7F32" };
  return { label: "Novato", image: null, color: "#6B6580" };
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState("favoritos");
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  // Library
  const [libItems, setLibItems] = useState<{ malId: number; type: string; title: string | null; imageUrl: string | null; score: number | null }[]>([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const [libFilter, setLibFilter] = useState("all");
  const [libPage, setLibPage] = useState(1);
  const [libTotalPages, setLibTotalPages] = useState(1);

  // Reviews
  const [reviews, setReviews] = useState<{ malId: number; type: string; stars: number; comment: string | null; title: string; imageUrl: string | null; updatedAt: string }[]>([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  // Lists
  const [userLists, setUserLists] = useState<{ id: number; name: string; description: string; itemCount: number; preview: string[] }[]>([]);
  const [listsLoaded, setListsLoaded] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAccent, setEditAccent] = useState("#7C3AED");
  const [editBorderColor, setEditBorderColor] = useState("");
  const [saving, setSaving] = useState(false);

  // Preview images inside edit modal only (not applied until save)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingBannerBlob, setPendingBannerBlob] = useState<Blob | null>(null);

  // File inputs
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/users/${username}/profile`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (activeTab === "atividade" && !activitiesLoaded) {
      fetch(`/api/users/${username}/activity`)
        .then((r) => r.json())
        .then((d) => { setActivities(d.activities || []); setActivitiesLoaded(true); })
        .catch(() => setActivitiesLoaded(true));
    }
    if (activeTab === "biblioteca" && !libLoaded) {
      loadLibrary(1, "all");
    }
    if (activeTab === "avaliacoes" && !reviewsLoaded) {
      fetch(`/api/users/${username}/reviews`)
        .then((r) => r.json())
        .then((d) => { setReviews(d.reviews || []); setReviewsLoaded(true); })
        .catch(() => setReviewsLoaded(true));
    }
    if (activeTab === "listas" && !listsLoaded) {
      fetch(`/api/users/${username}/lists`)
        .then((r) => r.json())
        .then((d) => { setUserLists(d.lists || []); setListsLoaded(true); })
        .catch(() => setListsLoaded(true));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, username]);

  const loadLibrary = (page: number, type: string) => {
    setLibLoaded(false);
    fetch(`/api/users/${username}/library?type=${type}&page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        setLibItems(d.items || []);
        setLibPage(d.page || 1);
        setLibTotalPages(d.totalPages || 1);
        setLibFilter(type);
        setLibLoaded(true);
      })
      .catch(() => setLibLoaded(true));
  };

  // Cache buster to force image refresh
  const [imgTs, setImgTs] = useState(Date.now());
  const bustCache = () => setImgTs(Date.now());

  const reload = () => {
    bustCache();
    fetch(`/api/users/${username}/profile`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setProfile(d); });
  };

  // Append cache buster to image URLs (skip for blob/data URLs)
  const addTs = (url: string) => url.startsWith("blob:") || url.startsWith("data:") ? url : `${url}${url.includes("?") ? "&" : "?"}t=${imgTs}`;
  const avatarUrl = profile ? addTs(profile.profileImageUrl) : "";
  const bannerUrl = profile?.bannerUrl ? addTs(profile.bannerUrl) : null;

  const openEdit = () => {
    if (!profile) return;
    setEditDisplayName(profile.displayName || "");
    setEditBio(profile.bio);
    setEditAccent(profile.accentColor || "#7C3AED");
    setEditBorderColor(profile.borderColor || profile.accentColor || "#7C3AED");
    setEditAvatarPreview(null);
    setEditBannerPreview(null);
    setPendingAvatarFile(null);
    setPendingBannerBlob(null);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setSaving(true);

    // Upload pending avatar
    if (pendingAvatarFile) {
      const fd = new FormData();
      fd.append("avatar", pendingAvatarFile);
      await fetch("/api/user/profile/avatar", { method: "POST", body: fd });
    }

    // Upload pending banner
    if (pendingBannerBlob) {
      const fd = new FormData();
      fd.append("banner", pendingBannerBlob, "banner.jpg");
      await fetch("/api/user/profile/banner", { method: "POST", body: fd });
    }

    // Save profile data
    await fetch("/api/user/profile/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: editBio, displayName: editDisplayName || null, accentColor: editAccent, borderColor: editBorderColor }),
    });

    setSaving(false);
    setEditOpen(false);
    reload();
  };

  const uploadAvatar = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setEditAvatarPreview(previewUrl);
    setPendingAvatarFile(file);
  };

  // Banner crop modal - image displayed full, crop area as overlay
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImgSrc, setCropImgSrc] = useState("");
  const [cropScale, setCropScale] = useState(100);
  const [cropOffsetY, setCropOffsetY] = useState(50); // percentage 0-100 of where crop area sits
  const [cropDragging, setCropDragging] = useState(false);
  const [cropDragStartY, setCropDragStartY] = useState(0);
  const [cropDragStartOffset, setCropDragStartOffset] = useState(50);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const [cropSending, setCropSending] = useState(false);
  const [cropNatural, setCropNatural] = useState({ w: 1, h: 1 });

  const openCrop = (file: File) => {
    setCropImgSrc(URL.createObjectURL(file));
    setCropScale(100);
    setCropOffsetY(50);
    setCropOpen(true);
  };

  const cancelCrop = () => {
    setCropOpen(false);
    if (cropImgSrc.startsWith("blob:")) URL.revokeObjectURL(cropImgSrc);
    if (bannerInput.current) bannerInput.current.value = "";
  };

  const confirmCrop = async () => {
    if (!cropImgRef.current) return;
    setCropSending(true);

    const img = cropImgRef.current;
    const scale = cropScale / 100;
    const scaledW = img.naturalWidth * scale;
    const scaledH = img.naturalHeight * scale;

    // Banner aspect ratio
    const bannerRatio = 1200 / 220;
    const cropH = scaledW / bannerRatio;
    const maxOffsetPx = scaledH - cropH;
    const cropY = (cropOffsetY / 100) * maxOffsetPx;

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 220;
    const ctx = canvas.getContext("2d")!;

    // Source rect in natural image coords
    const sx = 0;
    const sy = cropY / scale;
    const sw = img.naturalWidth;
    const sh = cropH / scale;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1200, 220);

    // Preview only - upload happens on save
    const previewDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setEditBannerPreview(previewDataUrl);

    canvas.toBlob((blob) => {
      if (blob) setPendingBannerBlob(blob);
      setCropSending(false);
      setCropOpen(false);
      if (cropImgSrc.startsWith("blob:")) URL.revokeObjectURL(cropImgSrc);
      if (bannerInput.current) bannerInput.current.value = "";
    }, "image/jpeg", 0.92);
  };

  const handleFollow = async () => {
    if (!profile) return;
    const endpoint = profile.isFollowing ? "unfollow" : "follow";
    const res = await fetch(`/api/users/${username}/${endpoint}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setProfile((p) => p ? { ...p, isFollowing: !p.isFollowing, stats: { ...p.stats, followers: data.followersCount ?? p.stats.followers } } : p);
    }
  };

  const handleLike = async () => {
    if (!profile) return;
    const endpoint = profile.hasLiked ? "unlike" : "like";
    const res = await fetch(`/api/users/${username}/${endpoint}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setProfile((p) => p ? { ...p, hasLiked: !p.hasLiked, stats: { ...p.stats, likes: data.likesCount ?? p.stats.likes } } : p);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" /></div>;
  if (!profile) return <div className="flex h-screen items-center justify-center text-[#6B6580]">Usuário não encontrado.</div>;

  const badge = getBadge(profile.stats.watchedAnime + profile.stats.watchedManga);
  const accent = profile.accentColor || "#7C3AED";

  const tabs = [
    { key: "favoritos", label: "Favoritos", icon: Star },
    { key: "atividade", label: "Atividade", icon: PlayCircle },
  ];

  return (
    <div className="h-screen overflow-y-auto" style={{ "--accent": accent } as React.CSSProperties}>
      {/* Hidden file inputs */}
      <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]); }} />
      <input ref={bannerInput} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) openCrop(e.target.files[0]); }} />

      {/* Banner */}
      <div
        className="relative h-[220px] bg-cover"
        style={{
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : `linear-gradient(135deg, ${accent}30, #0D0B14, ${accent}20)`,
          backgroundPosition: `center ${profile.bannerPositionY}%`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0D0B14]" />
        {/* Accent color tint on banner */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundColor: accent }} />

        {/* Banner edit button */}
        {profile.isOwn && (
          <button
            onClick={() => bannerInput.current?.click()}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <Camera className="h-3.5 w-3.5" /> Alterar banner
          </button>
        )}

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-5 px-8 pb-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0 group">
            <img
              src={avatarUrl}
              alt={profile.username}
              className="h-[100px] w-[100px] rounded-full border-[3px] object-cover shadow-xl bg-[#161320]"
              style={{ borderColor: profile.borderColor || accent }}
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
            />
            {profile.isOwn && (
              <button
                onClick={() => avatarInput.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">{profile.displayName || profile.username}</h1>
                {profile.displayName && <p className="text-[12px] text-white/50">@{profile.username}</p>}
              </div>
              <span className="flex items-center gap-1.5 rounded-md bg-black/40 backdrop-blur-sm px-2 py-1">
                {badge.image && <img src={badge.image} alt={badge.label} className="h-4 w-4 object-contain" />}
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: badge.color }}>{badge.label}</span>
              </span>
            </div>
            {profile.bio && <p className="mt-1 text-sm text-white/70 line-clamp-2">{profile.bio}</p>}
            {/* Connected accounts */}
            {profile.discord && (
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={`https://discord.com/users/${profile.discord.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md bg-[#5865F2]/20 px-2 py-1 hover:bg-[#5865F2]/30 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
                  </svg>
                  <span className="text-[11px] font-semibold text-[#5865F2]">{profile.discord.username}</span>
                </a>
              </div>
            )}
            <div className="mt-2 flex items-center gap-5 text-[13px] text-white/60">
              <span><strong className="text-white">{profile.stats.following}</strong> Seguindo</span>
              <span><strong className="text-white">{profile.stats.followers}</strong> Seguidores</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Desde {new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-1 flex-shrink-0">
            {profile.isOwn ? (
              <button onClick={openEdit} className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Edit3 className="h-4 w-4" /> Editar Perfil
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all",
                  profile.isFollowing ? "border border-white/30 text-white hover:border-red-400 hover:text-red-400" : "text-white hover:opacity-90"
                )}
                style={!profile.isFollowing ? { backgroundColor: accent } : undefined}
              >
                {profile.isFollowing ? <><UserMinus className="h-4 w-4" /> Seguindo</> : <><UserPlus className="h-4 w-4" /> Seguir</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center border-b border-[#1E1A2B] bg-[#110F1A] overflow-x-auto">
        {[
          { value: profile.stats.watchedAnime, label: "Assistidos" },
          { value: profile.stats.watchedManga, label: "Lidos" },
          { value: profile.stats.ratings, label: "Avaliados" },
          { value: profile.stats.currentlyWatching, label: "Assistindo" },
          { value: profile.stats.watchlaterAnime + profile.stats.watchlaterManga, label: "Pendentes" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 border-r border-[#1E1A2B] px-6 py-3.5 last:border-r-0">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-[15px] font-black text-[#E8E4F4]">{s.value}</span>
            <span className="text-[12px] text-[#6B6580]">{s.label}</span>
          </div>
        ))}
        <button onClick={handleLike} className="flex items-center gap-2 px-6 py-3.5 text-[#6B6580] hover:text-red-400 ml-auto">
          <Heart className={cn("h-4 w-4", profile.hasLiked && "fill-red-500 text-red-500")} />
          <span className="text-[15px] font-black text-[#E8E4F4]">{profile.stats.likes}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#1E1A2B] bg-[#110F1A] overflow-x-auto">
        {[
          { key: "favoritos", label: "Favoritos", icon: Star, count: profile.favorites.length },
          { key: "biblioteca", label: "Biblioteca", icon: BookOpen, count: profile.stats.watchedAnime + profile.stats.watchedManga },
          { key: "listas", label: "Listas", icon: Bookmark, count: null },
          { key: "avaliacoes", label: "Reviews", icon: Star, count: profile.stats.ratings },
          { key: "atividade", label: "Atividade", icon: PlayCircle, count: null },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
              activeTab === tab.key ? "text-[#E8E4F4]" : "text-[#6B6580] hover:text-[#A8A0B8]"
            )}
          >
            <tab.icon className="h-4 w-4" style={activeTab === tab.key ? { color: accent } : undefined} />
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] text-center",
                activeTab === tab.key ? "text-white" : "bg-[#1E1A2B] text-[#6B6580]"
              )} style={activeTab === tab.key ? { backgroundColor: accent } : undefined}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t" style={{ backgroundColor: accent }} />}
          </button>
        ))}
      </div>

      {/* Content + Sidebar */}
      <div className="grid grid-cols-[1fr_300px]">
        <div className="px-8 py-6">
          {activeTab === "favoritos" && (
            <div>
              <h2 className="mb-5 text-base font-bold text-[#E8E4F4]">Favoritos</h2>
              {profile.favorites.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#6B6580]">Nenhum favorito adicionado.</p>
              ) : (
                <div className="flex gap-4 flex-wrap">
                  {profile.favorites.map((fav) => (
                    <a
                      key={`${fav.type}-${fav.malId}`}
                      href={`/details/${fav.type}/${fav.malId}`}
                      className="group relative w-[200px] overflow-hidden rounded-2xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                      style={{ boxShadow: `0 4px 20px ${accent}15` }}
                    >
                      <div className="relative">
                        <img src={fav.imageUrl || PLACEHOLDER} alt={fav.title || ""} className="h-[280px] w-full object-cover" />
                        {/* Color tint overlay based on accent */}
                        <div className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity" style={{ backgroundColor: accent }} />
                        {/* Gradient bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                        {/* Border glow on hover */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-current transition-colors" style={{ color: `${accent}60` }} />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3.5">
                        <p className="text-[13px] font-bold text-white line-clamp-2 drop-shadow-lg">{fav.title}</p>
                        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: `${accent}cc` }}>{fav.type === "manga" ? "Mangá" : "Anime"}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "biblioteca" && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#E8E4F4]">Biblioteca</h2>
                <div className="flex gap-1">
                  {[
                    { key: "all", label: "Todos" },
                    { key: "anime", label: "Animes" },
                    { key: "manga", label: "Mangás" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => { loadLibrary(1, f.key); }}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                        libFilter === f.key ? "text-white" : "border border-[#1E1A2B] text-[#6B6580] hover:text-[#A8A0B8]"
                      )}
                      style={libFilter === f.key ? { backgroundColor: accent } : undefined}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {!libLoaded ? (
                <div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" /></div>
              ) : libItems.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#6B6580]">Nenhum item na biblioteca.</p>
              ) : (
                <>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
                    {libItems.map((item) => (
                      <a key={`${item.type}-${item.malId}`} href={`/details/${item.type}/${item.malId}`} className="group overflow-hidden rounded-xl border border-[#1E1A2B] bg-[#161320] transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="aspect-[3/4.2] overflow-hidden">
                          <img src={item.imageUrl || PLACEHOLDER} alt={item.title || ""} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                        </div>
                        <div className="p-2.5">
                          <p className="line-clamp-2 text-[11px] font-semibold text-[#E8E4F4] leading-tight">{item.title}</p>
                          {item.score && <p className="mt-1 text-[10px] text-[#6B6580]">Nota: {item.score.toFixed(1)}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                  {libTotalPages > 1 && (
                    <div className="mt-5 flex items-center justify-center gap-2">
                      <button onClick={() => loadLibrary(libPage - 1, libFilter)} disabled={libPage <= 1} className="rounded-lg border border-[#1E1A2B] px-3 py-1.5 text-[11px] font-medium text-[#6B6580] hover:text-white disabled:opacity-30">Anterior</button>
                      <span className="text-[12px] text-[#6B6580]">{libPage} / {libTotalPages}</span>
                      <button onClick={() => loadLibrary(libPage + 1, libFilter)} disabled={libPage >= libTotalPages} className="rounded-lg border border-[#1E1A2B] px-3 py-1.5 text-[11px] font-medium text-[#6B6580] hover:text-white disabled:opacity-30">Próximo</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "listas" && (
            <div>
              <h2 className="mb-5 text-base font-bold text-[#E8E4F4]">Listas</h2>
              {!listsLoaded ? (
                <div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" /></div>
              ) : userLists.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#6B6580]">Nenhuma lista criada.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {userLists.map((list) => (
                    <a key={list.id} href={`/listas/${list.id}`} className="rounded-xl border border-[#1E1A2B] bg-[#161320] p-4 hover:border-[#7C3AED]/40 transition-colors">
                      <h3 className="text-[14px] font-bold text-[#E8E4F4]">{list.name}</h3>
                      {list.description && <p className="mt-1 text-[12px] text-[#6B6580] line-clamp-2">{list.description}</p>}
                      <div className="mt-3 flex items-center gap-2">
                        {list.preview.slice(0, 4).map((img, i) => (
                          <img key={i} src={img} alt="" className="h-12 w-8 rounded object-cover" loading="lazy" />
                        ))}
                        {list.itemCount > 4 && <span className="text-[11px] text-[#6B6580]">+{list.itemCount - 4}</span>}
                      </div>
                      <p className="mt-2 text-[11px] text-[#6B6580]">{list.itemCount} itens</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "avaliacoes" && (
            <div>
              <h2 className="mb-5 text-base font-bold text-[#E8E4F4]">Reviews</h2>
              {!reviewsLoaded ? (
                <div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" /></div>
              ) : reviews.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#6B6580]">Nenhuma avaliação ainda.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <a key={`${r.type}-${r.malId}`} href={`/details/${r.type}/${r.malId}`} className="flex gap-3 rounded-xl border border-[#1E1A2B] bg-[#161320] p-4 hover:border-[#7C3AED]/40 transition-colors">
                      {r.imageUrl && <img src={r.imageUrl} alt="" className="h-20 w-14 flex-shrink-0 rounded-lg object-cover" loading="lazy" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-bold text-[#E8E4F4]">{r.title}</h3>
                        <div className="mt-1 flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("h-4 w-4", s <= r.stars ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#2A2538]")} />
                          ))}
                        </div>
                        {r.comment && <p className="mt-2 text-[12px] text-[#A8A0B8] line-clamp-3">{r.comment}</p>}
                        <p className="mt-1 text-[10px] text-[#6B6580]">{timeAgo(r.updatedAt)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "atividade" && (
            <div>
              <h2 className="mb-5 text-base font-bold text-[#E8E4F4]">Atividade Recente</h2>
              {!activitiesLoaded ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
                </div>
              ) : activities.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#6B6580]">Sem atividade recente.</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((a) => (
                    <div key={a.id} className="flex gap-3 rounded-xl border border-[#1E1A2B] bg-[#161320] p-3">
                      {a.itemImageUrl && (
                        <img src={a.itemImageUrl} alt="" className="h-16 w-11 flex-shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#E8E4F4]">
                          <span className="font-semibold">{profile?.username}</span>
                          {" "}
                          <span className="text-[#6B6580]">{ACTION_LABELS[a.action] || a.action}</span>
                        </p>
                        {a.itemTitle && (
                          <p className="mt-0.5 text-[13px] font-medium text-[#A8A0B8] line-clamp-1">{a.itemTitle}</p>
                        )}
                        {a.extra?.stars && (
                          <div className="mt-1 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn("h-3.5 w-3.5", (a.extra?.stars as number) >= s ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#2A2538]")} />
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-[10px] text-[#6B6580]">
                          {timeAgo(a.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="border-l border-[#1E1A2B] bg-[#110F1A] px-5 py-6">
          <div className="mb-8">
            <h3 className="mb-4 border-b border-[#1E1A2B] pb-2 text-[13px] font-bold text-[#E8E4F4]">Assistindo Agora</h3>
            {profile.currentlyWatching.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-[#6B6580]">Nenhum em andamento.</p>
            ) : (
              <div className="space-y-2.5">
                {profile.currentlyWatching.map((cw) => {
                  const progress = cw.totalEpisodes ? Math.round((cw.currentEpisode / cw.totalEpisodes) * 100) : 0;
                  return (
                    <div key={`${cw.type}-${cw.malId}`} className="flex gap-2.5 rounded-lg bg-[#161320] p-2.5 border border-[#1E1A2B]">
                      <img src={cw.imageUrl || PLACEHOLDER} alt="" className="h-16 w-11 rounded object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-semibold text-[#E8E4F4] line-clamp-2 leading-tight">{cw.title}</h4>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1 flex-1 rounded-full bg-[#1E1A2B] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: accent }} />
                          </div>
                          <span className="text-[10px] text-[#6B6580]">{cw.currentEpisode}/{cw.totalEpisodes || "?"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="mb-4 border-b border-[#1E1A2B] pb-2 text-[13px] font-bold text-[#E8E4F4]">Insígnias</h3>
            <div className="space-y-4">
              {(() => {
                const badges = [
                  { name: "Otaku", desc: "Animes e mangás assistidos", value: profile.stats.watchedAnime + profile.stats.watchedManga, thresholds: [10, 50, 100, 200] },
                  { name: "Crítico", desc: "Avaliações feitas", value: profile.stats.ratings, thresholds: [5, 20, 50, 100] },
                  { name: "Social", desc: "Seguidores", value: profile.stats.followers, thresholds: [10, 25, 50, 100] },
                ];
                const tierNames = ["Bronze", "Prata", "Ouro", "Diamante"];
                const tierImages = ["/bronze.png", "/prata.png", "/ouro.png", "/diamante.png"];
                const tierBarColors = ["#CD7F32", "#C0C0C0", "#FFD700", "#B9F2FF"];

                return badges.map((b) => {
                  let tierIdx = -1;
                  let nextThreshold = b.thresholds[0];
                  for (let i = 0; i < b.thresholds.length; i++) {
                    if (b.value >= b.thresholds[i]) {
                      tierIdx = i;
                      nextThreshold = b.thresholds[i + 1] || b.thresholds[i];
                    }
                  }
                  const hasTier = tierIdx >= 0;
                  const progress = hasTier
                    ? (tierIdx < b.thresholds.length - 1 ? Math.min(100, ((b.value - b.thresholds[tierIdx]) / (nextThreshold - b.thresholds[tierIdx])) * 100) : 100)
                    : Math.min(100, (b.value / b.thresholds[0]) * 100);
                  const barColor = hasTier ? tierBarColors[tierIdx] : "#2A2538";
                  const currentTierName = hasTier ? tierNames[tierIdx] : "";
                  const currentTierImg = hasTier ? tierImages[tierIdx] : null;

                  return (
                    <div key={b.name} className="flex items-center gap-3">
                      {/* Badge image */}
                      <div className="flex-shrink-0 relative">
                        {currentTierImg ? (
                          <img src={currentTierImg} alt={currentTierName} className="h-10 w-10 object-contain drop-shadow-lg" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-[#1E1A2B] flex items-center justify-center">
                            <span className="text-[16px] text-[#2A2538]">?</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[12px] font-bold text-[#E8E4F4]">{b.name}</span>
                            {hasTier && (
                              <span className="ml-2 text-[10px] font-bold" style={{ color: tierBarColors[tierIdx] }}>
                                {currentTierName}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6B6580]">{b.value}/{nextThreshold}</span>
                        </div>
                        <p className="text-[10px] text-[#6B6580] mt-0.5">{b.desc}</p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-[#1E1A2B] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: barColor }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Genre chart */}
          <div className="mb-8">
            <h3 className="mb-4 border-b border-[#1E1A2B] pb-2 text-[13px] font-bold text-[#E8E4F4]">Gêneros</h3>
            <GenreChart username={username} />
          </div>

          <div>
            <h3 className="mb-4 border-b border-[#1E1A2B] pb-2 text-[13px] font-bold text-[#E8E4F4]">Destaques</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] font-black" style={{ backgroundColor: `${accent}20`, color: accent }}>{profile.stats.watchedAnime + profile.stats.watchedManga}</span>
                <div><span className="text-[12px] font-semibold text-[#E8E4F4]">Total Assistidos</span><br /><span className="text-[10px] text-[#6B6580]">Animes + Mangás</span></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] font-black bg-[#F59E0B]/15 text-[#F59E0B]">{profile.stats.ratings}</span>
                <div><span className="text-[12px] font-semibold text-[#E8E4F4]">Avaliações</span><br /><span className="text-[10px] text-[#6B6580]">Reviews feitas</span></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] font-black bg-[#22C55E]/15 text-[#22C55E]">{profile.stats.currentlyWatching}</span>
                <div><span className="text-[12px] font-semibold text-[#E8E4F4]">Assistindo</span><br /><span className="text-[10px] text-[#6B6580]">Em andamento</span></div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ===== CROP BANNER MODAL ===== */}
      {cropOpen && (() => {
        // Calculate crop area position
        const scale = cropScale / 100;
        const displayW = 450; // display width of the image area
        const displayH = cropNatural.h > 0 ? (displayW / cropNatural.w) * cropNatural.h * scale : 400;
        const bannerRatio = 1200 / 220;
        const cropAreaH = displayW / bannerRatio; // height of the crop rectangle
        const maxDrag = Math.max(0, displayH - cropAreaH);
        const cropAreaTop = (cropOffsetY / 100) * maxDrag;

        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => { if (e.target === e.currentTarget) cancelCrop(); }}>
            <div className="w-full max-w-[500px] rounded-2xl border border-[#1E1A2B] bg-[#161320] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1A2B]">
                <h2 className="text-[15px] font-bold text-[#E8E4F4]">Editar imagem</h2>
                <button onClick={cancelCrop} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 text-[#6B6580]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Image with crop overlay */}
              <div className="px-5 py-4">
                <div
                  ref={cropContainerRef}
                  className="relative overflow-hidden rounded-lg bg-black select-none cursor-ns-resize"
                  style={{ width: displayW, height: displayH, margin: "0 auto", maxHeight: "60vh" }}
                  onMouseDown={(e) => {
                    setCropDragging(true);
                    setCropDragStartY(e.clientY);
                    setCropDragStartOffset(cropOffsetY);
                    e.preventDefault();
                  }}
                  onMouseMove={(e) => {
                    if (!cropDragging || maxDrag === 0) return;
                    const deltaY = e.clientY - cropDragStartY;
                    const deltaPct = (deltaY / maxDrag) * 100;
                    setCropOffsetY(Math.max(0, Math.min(100, cropDragStartOffset + deltaPct)));
                  }}
                  onMouseUp={() => setCropDragging(false)}
                  onMouseLeave={() => setCropDragging(false)}
                  onTouchStart={(e) => {
                    setCropDragging(true);
                    setCropDragStartY(e.touches[0].clientY);
                    setCropDragStartOffset(cropOffsetY);
                  }}
                  onTouchMove={(e) => {
                    if (!cropDragging || maxDrag === 0) return;
                    const deltaY = e.touches[0].clientY - cropDragStartY;
                    const deltaPct = (deltaY / maxDrag) * 100;
                    setCropOffsetY(Math.max(0, Math.min(100, cropDragStartOffset + deltaPct)));
                  }}
                  onTouchEnd={() => setCropDragging(false)}
                >
                  {/* The image */}
                  <img
                    ref={cropImgRef}
                    src={cropImgSrc}
                    alt="Preview"
                    draggable={false}
                    onLoad={() => {
                      if (cropImgRef.current) setCropNatural({ w: cropImgRef.current.naturalWidth, h: cropImgRef.current.naturalHeight });
                    }}
                    className="w-full select-none pointer-events-none"
                    style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: displayW }}
                  />

                  {/* Dark overlay - top */}
                  <div className="absolute top-0 left-0 right-0 bg-black/60 pointer-events-none" style={{ height: cropAreaTop }} />

                  {/* Crop area border */}
                  <div
                    className="absolute left-0 right-0 border-2 border-white/80 pointer-events-none"
                    style={{ top: cropAreaTop, height: cropAreaH }}
                  />

                  {/* Dark overlay - bottom */}
                  <div className="absolute left-0 right-0 bottom-0 bg-black/60 pointer-events-none" style={{ top: cropAreaTop + cropAreaH }} />
                </div>

                {/* Zoom slider */}
                <div className="mt-4 flex items-center gap-3" style={{ width: displayW, margin: "0 auto" }}>
                  <span className="text-[14px] text-[#6B6580]">🖼</span>
                  <input
                    type="range"
                    min={100}
                    max={300}
                    value={cropScale}
                    onChange={(e) => setCropScale(Number(e.target.value))}
                    className="flex-1 accent-[#7C3AED]"
                  />
                  <span className="text-[14px] text-[#6B6580]">🖼</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-[#1E1A2B]">
                <button onClick={() => { setCropScale(100); setCropOffsetY(50); }} className="text-[13px] font-medium text-[#7C3AED] hover:underline">
                  Redefinir
                </button>
                <div className="flex gap-3">
                  <button onClick={cancelCrop} className="rounded-xl border border-[#2A2538] px-5 py-2 text-[13px] font-medium text-[#A8A0B8] hover:bg-white/5">
                    Cancelar
                  </button>
                  <button
                    onClick={confirmCrop}
                    disabled={cropSending}
                    className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-2 text-[13px] font-semibold text-white hover:bg-[#9B5CFF] disabled:opacity-50"
                  >
                    {cropSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== EDIT PROFILE MODAL ===== */}
      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-[#1E1A2B] bg-[#110F1A] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1A2B]">
              <h2 className="text-base font-bold text-[#E8E4F4]">Editar Perfil</h2>
              <button onClick={() => setEditOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 text-[#6B6580]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">

              {/* Avatar & Banner uploads */}
              <div>
                <label className="mb-3 block text-[12px] font-semibold uppercase tracking-wider text-[#7C3AED]">Imagens</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => avatarInput.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-xl border border-[#1E1A2B] bg-[#0D0B14] px-5 py-4 hover:border-[#7C3AED] transition-colors flex-1"
                  >
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2" style={{ borderColor: editAvatarPreview ? "#22C55E" : "#1E1A2B" }}>
                      <img src={editAvatarPreview || avatarUrl || ""} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.jpg"; }} />
                    </div>
                    <span className="text-[11px] font-medium text-[#A8A0B8]">{editAvatarPreview ? "Avatar selecionado" : "Alterar avatar"}</span>
                  </button>
                  <button
                    onClick={() => bannerInput.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-xl border border-[#1E1A2B] bg-[#0D0B14] px-5 py-4 hover:border-[#7C3AED] transition-colors flex-1"
                  >
                    <div className="h-14 w-24 rounded-lg overflow-hidden border" style={{ borderColor: editBannerPreview ? "#22C55E" : "#1E1A2B", background: editBannerPreview ? `url(${editBannerPreview}) center/cover` : bannerUrl ? `url(${bannerUrl}) center/cover` : `linear-gradient(135deg, ${editAccent}40, #0D0B14)` }} />
                    <span className="text-[11px] font-medium text-[#A8A0B8]">{editBannerPreview ? "Banner selecionado" : "Alterar banner"}</span>
                  </button>
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#7C3AED]">Apelido</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder={profile?.username || "Seu apelido..."}
                  className="w-full rounded-xl border border-[#1E1A2B] bg-[#0D0B14] px-4 py-3 text-[13px] text-[#E8E4F4] outline-none placeholder:text-[#6B6580] focus:border-[#7C3AED]"
                />
                <p className="mt-1 text-[10px] text-[#6B6580]">Exibido no perfil em vez do username. Deixe vazio para usar @{profile?.username}</p>
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#7C3AED]">Sobre</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Escreva algo sobre você..."
                  className="w-full rounded-xl border border-[#1E1A2B] bg-[#0D0B14] px-4 py-3 text-[13px] text-[#E8E4F4] outline-none placeholder:text-[#6B6580] focus:border-[#7C3AED] resize-none"
                />
                <p className="mt-1 text-right text-[10px] text-[#6B6580]">{editBio.length}/300</p>
              </div>

              {/* Discord */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[#5865F2]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.373-.292a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>
                  Conta Discord
                </label>
                {profile?.discord ? (
                  <div className="flex items-center justify-between rounded-xl border border-[#1E1A2B] bg-[#0D0B14] p-3">
                    <div className="flex items-center gap-3">
                      {profile.discord.avatar && <img src={profile.discord.avatar} alt="" className="h-8 w-8 rounded-full" />}
                      <div>
                        <p className="text-[13px] font-semibold text-[#5865F2]">{profile.discord.username}</p>
                        <p className="text-[10px] text-[#6B6580]">Conectado</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch("/api/user/discord/disconnect", { method: "POST" });
                        reload();
                      }}
                      className="text-[11px] font-medium text-red-400 hover:underline"
                    >
                      Desconectar
                    </button>
                  </div>
                ) : (
                  <a
                    href="/api/user/discord/connect"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#4752C4] transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.373-.292a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>
                    Conectar Discord
                  </a>
                )}
              </div>

              {/* Accent color */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[#7C3AED]">
                  <Palette className="h-3.5 w-3.5" /> Cor do Perfil
                </label>
                <p className="mb-3 text-[11px] text-[#6B6580]">Aplicada em todo o perfil: banner, cards, barras, botões e destaques.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editAccent}
                    onChange={(e) => setEditAccent(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-[#1E1A2B] bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={editAccent}
                    onChange={(e) => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setEditAccent(v); }}
                    maxLength={7}
                    className="w-24 rounded-lg border border-[#1E1A2B] bg-[#0D0B14] px-3 py-2 font-mono text-[13px] text-[#E8E4F4] outline-none focus:border-[#7C3AED]"
                    placeholder="#7C3AED"
                  />
                  <div className="h-8 w-8 rounded-lg flex-shrink-0" style={{ backgroundColor: editAccent }} />
                </div>
                {/* Presets */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {[
                    { color: "#7C3AED", name: "Roxo" },
                    { color: "#2D6BFF", name: "Azul" },
                    { color: "#EF4444", name: "Vermelho" },
                    { color: "#22C55E", name: "Verde" },
                    { color: "#F59E0B", name: "Amarelo" },
                    { color: "#EC4899", name: "Rosa" },
                    { color: "#06B6D4", name: "Ciano" },
                    { color: "#F97316", name: "Laranja" },
                    { color: "#8B5CF6", name: "Violeta" },
                    { color: "#FFFFFF", name: "Branco" },
                  ].map((p) => (
                    <button
                      key={p.color}
                      onClick={() => setEditAccent(p.color)}
                      className={cn(
                        "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                        editAccent === p.color ? "border-white scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    />
                  ))}
                </div>
                <button onClick={() => setEditAccent("#7C3AED")} className="mt-3 flex items-center gap-1.5 text-[11px] text-[#6B6580] hover:text-red-400 transition-colors">
                  <RotateCcw className="h-3 w-3" /> Resetar para roxo padrão
                </button>
              </div>

              {/* Border color */}
              <div>
                <label className="mb-3 block text-[12px] font-semibold uppercase tracking-wider text-[#7C3AED]">Cor da borda do avatar</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editBorderColor}
                    onChange={(e) => setEditBorderColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-[#1E1A2B] bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={editBorderColor}
                    onChange={(e) => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setEditBorderColor(v); }}
                    maxLength={7}
                    className="w-24 rounded-lg border border-[#1E1A2B] bg-[#0D0B14] px-3 py-2 font-mono text-[13px] text-[#E8E4F4] outline-none focus:border-[#7C3AED]"
                    placeholder="#7C3AED"
                  />
                  {/* Preview */}
                  <div className="ml-auto h-12 w-12 rounded-full border-[3px] bg-[#161320] overflow-hidden" style={{ borderColor: editBorderColor }}>
                    <img src={avatarUrl || ""} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.jpg"; }} />
                  </div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap items-center">
                  {[
                    { color: editAccent, name: "Igual destaque" },
                    { color: "#FFD700", name: "Dourado" },
                    { color: "#C0C0C0", name: "Prata" },
                    { color: "#FF6B6B", name: "Coral" },
                    { color: "#00FFAA", name: "Neon" },
                    { color: "#FFFFFF", name: "Branco" },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setEditBorderColor(p.color)}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                        editBorderColor === p.color ? "border-white scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    />
                  ))}
                  {/* Extract from banner */}
                  {profile?.bannerUrl && (
                    <button
                      onClick={() => {
                        // Extract dominant color from banner image using canvas
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          canvas.width = 50;
                          canvas.height = 50;
                          const ctx = canvas.getContext("2d")!;
                          // Sample from bottom-left area where avatar sits
                          const sx = 0;
                          const sy = img.naturalHeight * 0.6;
                          const sw = img.naturalWidth * 0.3;
                          const sh = img.naturalHeight * 0.4;
                          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 50, 50);
                          const data = ctx.getImageData(0, 0, 50, 50).data;
                          let r = 0, g = 0, b = 0, count = 0;
                          for (let i = 0; i < data.length; i += 16) {
                            // Skip very dark/very bright pixels
                            const brightness = data[i] + data[i+1] + data[i+2];
                            if (brightness > 60 && brightness < 700) {
                              r += data[i]; g += data[i+1]; b += data[i+2]; count++;
                            }
                          }
                          if (count > 0) {
                            r = Math.round(r / count);
                            g = Math.round(g / count);
                            b = Math.round(b / count);
                            // Boost saturation a bit
                            const max = Math.max(r, g, b);
                            const factor = Math.min(1.3, 255 / (max || 1));
                            r = Math.min(255, Math.round(r * factor));
                            g = Math.min(255, Math.round(g * factor));
                            b = Math.min(255, Math.round(b * factor));
                            const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                            setEditBorderColor(hex);
                          }
                        };
                        img.src = bannerUrl!;
                      }}
                      className="ml-1 rounded-lg border border-[#1E1A2B] bg-[#0D0B14] px-3 py-1.5 text-[10px] font-medium text-[#A8A0B8] hover:border-[#7C3AED] hover:text-[#E8E4F4] transition-colors"
                    >
                      Combinar com banner
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#1E1A2B]">
              <button onClick={() => setEditOpen(false)} className="rounded-xl border border-[#1E1A2B] px-5 py-2.5 text-[13px] font-medium text-[#6B6580] hover:bg-white/5">
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#7C3AED" }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
