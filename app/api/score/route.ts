import { NextRequest, NextResponse } from "next/server";
import { getAuthedPlayer } from "@/lib/privy-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isRateLimited } from "@/lib/rate-limit";
import { ABSOLUTE_SCORE_CAP, maxPlausibleScore } from "@/lib/game-config";

export async function POST(req: NextRequest) {
  const player = await getAuthedPlayer(req);

  if (!player) {
    return NextResponse.json(
      { error: "Not authenticated. Log in with X first." },
      { status: 401 }
    );
  }

  // Rate limit: max 10 score submissions per minute per user.
  if (isRateLimited(`score:${player.privyUserId}`, { limit: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Slow down." },
      { status: 429 }
    );
  }

  let body: { score?: unknown; sessionDurationMs?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const score = body.score;
  const sessionDurationMs =
    typeof body.sessionDurationMs === "number" ? body.sessionDurationMs : 0;

  if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }

  const roundedScore = Math.floor(score);

  // Sanity cap: reject implausible jumps to reduce trivial spoofing.
  const plausibleCeiling = Math.min(
    ABSOLUTE_SCORE_CAP,
    Math.max(500, maxPlausibleScore(sessionDurationMs || 60_000))
  );

  if (roundedScore > plausibleCeiling) {
    return NextResponse.json(
      { error: "Score rejected: implausible for session length." },
      { status: 422 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await supabase
    .from("players")
    .select("best_score")
    .eq("privy_user_id", player.privyUserId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  const currentBest = existing?.best_score ?? 0;
  const newBest = Math.max(currentBest, roundedScore);
  const improved = roundedScore > currentBest;

  const { error: upsertError } = await supabase.from("players").upsert(
    {
      privy_user_id: player.privyUserId,
      x_username: player.xUsername,
      wallet_address: player.walletAddress,
      best_score: newBest,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "privy_user_id" }
  );

  if (upsertError) {
    return NextResponse.json({ error: "Failed to save score." }, { status: 500 });
  }

  return NextResponse.json({
    saved: true,
    improved,
    bestScore: newBest,
  });
}
