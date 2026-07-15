import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("players")
    .select("x_username, wallet_address, best_score, updated_at")
    .order("best_score", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  return NextResponse.json({ players: data ?? [] });
}
