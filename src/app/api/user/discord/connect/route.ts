import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "Discord not configured" }, { status: 500 });

  const redirectUri = encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/user/discord/callback`);
  const scope = encodeURIComponent("identify");
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  return NextResponse.redirect(url);
}
