import { NextRequest, NextResponse } from "next/server";
import { getAuthedPlayer } from "@/lib/privy-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const player = await getAuthedPlayer(req);

  if (!player) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("players")
    .select("x_username, wallet_address, best_score, updated_at")
    .eq("privy_user_id", player.privyUserId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  return NextResponse.json({
    profile: data ?? {
      x_username: player.xUsername,
      wallet_address: player.walletAddress,
      best_score: 0,
      updated_at: null,
    },
  });
}
