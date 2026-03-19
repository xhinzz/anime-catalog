import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user ? Number((session.user as Record<string, unknown>).id) : null;
  const isOwn = currentUserId === user.id;

  const [watchedAnime, watchedManga, watchlaterAnime, watchlaterManga, ratingsCount, followersCount, followingCount, likesCount, favorites, currentlyWatching] = await Promise.all([
    prisma.watchedItem.count({ where: { userId: user.id, itemType: "anime" } }),
    prisma.watchedItem.count({ where: { userId: user.id, itemType: "manga" } }),
    prisma.watchLaterItem.count({ where: { userId: user.id, itemType: "anime" } }),
    prisma.watchLaterItem.count({ where: { userId: user.id, itemType: "manga" } }),
    prisma.userRating.count({ where: { userId: user.id } }),
    prisma.follow.count({ where: { followedId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.profileLike.count({ where: { profileUserId: user.id } }),
    prisma.favoriteItem.findMany({ where: { userId: user.id }, orderBy: { position: "asc" } }),
    prisma.currentlyWatching.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
  ]);

  let isFollowing = false;
  let hasLiked = false;
  if (currentUserId && !isOwn) {
    const [f, l] = await Promise.all([
      prisma.follow.findUnique({ where: { followerId_followedId: { followerId: currentUserId, followedId: user.id } } }),
      prisma.profileLike.findUnique({ where: { likerId_profileUserId: { likerId: currentUserId, profileUserId: user.id } } }),
    ]);
    isFollowing = !!f;
    hasLiked = !!l;
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName || null,
    bio: user.bio || "",
    accentColor: user.accentColor || "#7C3AED",
    borderColor: user.borderColor || null,
    colorBackground: user.colorBackground,
    colorCard: user.colorCard,
    colorText: user.colorText,
    colorTextSecondary: user.colorTextSecondary,
    profileImageUrl: `/uploads/avatars/${user.profileImageFile || "default.jpg"}`,
    bannerUrl: user.bannerImageFile ? `/uploads/banners/${user.bannerImageFile}` : null,
    bannerPositionY: user.bannerPositionY ?? 50,
    createdAt: user.createdAt.toISOString(),
    emailVerified: user.emailVerified,
    discord: user.discordId ? {
      id: user.discordId,
      username: user.discordUsername,
      avatar: user.discordAvatar,
    } : null,
    stats: {
      watchedAnime, watchedManga, watchlaterAnime, watchlaterManga,
      ratings: ratingsCount,
      currentlyWatching: currentlyWatching.length,
      followers: followersCount, following: followingCount,
      likes: likesCount,
    },
    isOwn, isFollowing, hasLiked,
    favorites: favorites.map((f) => ({
      malId: f.itemMalId, type: f.itemType, title: f.itemTitle, imageUrl: f.itemImageUrl,
    })),
    currentlyWatching: currentlyWatching.map((c) => ({
      malId: c.itemMalId, type: c.itemType, title: c.itemTitle, imageUrl: c.itemImageUrl,
      currentEpisode: c.currentEpisode, totalEpisodes: c.totalEpisodes,
    })),
  });
}
